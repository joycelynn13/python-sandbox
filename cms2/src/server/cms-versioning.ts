import { gs, GlideRecord, GlideDateTime } from '@servicenow/glide'
import { T, STATUS, LOCKED_FIELDS } from './cms-config.ts'
import { addDays, today } from './cms-dates.ts'

/*
 * Copy-on-revise versioning.
 *  - Published rows are never edited in place (enforced in cms-validation).
 *  - "Create New Version" clones a row into Draft with `supersedes` → original.
 *  - Publishing the new row end-dates its predecessor, which stays Published
 *    for its historical period, so old Role Profiles / awards keep resolving.
 */

const v = (gr: any, f: string): string => (gr.getValue(f) || '') as string

/** Columns copied into a new version: the frozen content columns minus lifecycle ones. */
function copyColumns(table: string): string[] {
    return (LOCKED_FIELDS[table] || []).filter(
        (f) => ['effective_from', 'supersedes', 'version'].indexOf(f) < 0
    )
}

function cloneAsDraft(src: any, overrides: { [f: string]: string }): string {
    const table: string = src.getRecordClassName()
    const gr: any = new GlideRecord(table)
    gr.initialize()
    copyColumns(table).forEach((f) => gr.setValue(f, src.getValue(f)))
    gr.setValue('status', STATUS.draft)
    gr.setValue('active', true)
    if (table !== T.fwVersion) gr.setValue('supersedes', src.getUniqueValue())
    Object.keys(overrides).forEach((f) => gr.setValue(f, overrides[f]))
    return gr.insert() || ''
}

// ------------------------------------------------------------------ before/after rule helpers

/** Before-rule housekeeping: calculated display names and retirement end-date. */
export function applyLifecycleDefaults(current: any, previous: any): void {
    const table: string = current.getRecordClassName()
    if (table === T.descriptor) {
        // code and name are calculated, e.g. "EL-APPDEV – PL3"
        const owner = current.getValue('domain') ? current.domain : current.element
        const label = `${owner.code || ''} – ${current.proficiency_level.code || ''}`.trim()
        current.setValue('code', label)
        current.setValue('name', label)
    }
    const retiring = v(current, 'status') === STATUS.retired && (!previous || v(previous, 'status') !== STATUS.retired)
    if (retiring && !v(current, 'effective_to')) {
        const from = v(current, 'effective_from')
        const t = today()
        current.setValue('effective_to', from && from > t ? from : t)
    }
}

export function applyLevelDisplayName(current: any): void {
    current.setValue('display_name', `${v(current, 'code')} – ${v(current, 'label')}`)
}

/** After a record becomes Published: end-date the record(s) it replaces. */
export function closePredecessors(current: any): void {
    const table: string = current.getRecordClassName()
    const from = v(current, 'effective_from')
    if (!from) return
    const dayBefore = addDays(from, -1)

    const gr: any = new GlideRecord(table)
    gr.addQuery('status', STATUS.published)
    gr.addQuery('sys_id', '!=', current.getUniqueValue())
    gr.addQuery('effective_from', '<', from)
    if (table === T.fwVersion) {
        gr.addNullQuery('effective_to')
    } else {
        const supersedes = v(current, 'supersedes')
        if (!supersedes) return
        gr.addQuery('sys_id', supersedes)
    }
    gr.query()
    while (gr.next()) {
        const to = v(gr, 'effective_to')
        if (!to || to >= from) {
            gr.setValue('effective_to', dayBefore)
            gr.update()
        }
    }
}

/**
 * After an Element or a Domain is Published: publish the Draft PL descriptors it owns
 * (Element-level, or Domain-level for CCC-style Domains) in the same Framework Version.
 */
export function cascadePublishDescriptors(owner: any): void {
    const ownerField = owner.getRecordClassName() === T.domain ? 'domain' : 'element'
    const d: any = new GlideRecord(T.descriptor)
    d.addQuery(ownerField, owner.getUniqueValue())
    d.addQuery('framework_version', owner.getValue('framework_version'))
    d.addQuery('status', STATUS.draft)
    d.addQuery('active', true)
    d.query()
    while (d.next()) {
        if (!v(d, 'effective_from')) d.setValue('effective_from', owner.getValue('effective_from'))
        d.setValue('status', STATUS.published)
        if (!d.update()) gs.addErrorMessage(`Descriptor ${d.getDisplayValue()} could not be published.`)
    }
}

// ------------------------------------------------------------------ actions

export function publish(current: any): boolean {
    current.setValue('status', STATUS.published)
    return !!current.update()
}

export function retire(current: any): boolean {
    current.setValue('status', STATUS.retired)
    return !!current.update()
}

/** Creates a Draft revision of any versioned record; returns the new sys_id. */
export function createNewVersion(current: any): string {
    const table: string = current.getRecordClassName()
    if (table === T.fwVersion) return createNextFrameworkVersion(current)

    const overrides: { [f: string]: string } = {}
    if (table === T.roleProfile) overrides.version = String(parseInt(v(current, 'version') || '1', 10) + 1)
    const newId = cloneAsDraft(current, overrides)
    if (!newId) return ''

    if (table === T.element || table === T.domain) {
        // carry the descriptors this Element / Domain owns into the new Draft version
        const ownerField = table === T.domain ? 'domain' : 'element'
        const d: any = new GlideRecord(T.descriptor)
        d.addQuery(ownerField, current.getUniqueValue())
        d.addQuery('status', '!=', STATUS.retired)
        d.addQuery('active', true)
        d.query()
        while (d.next()) cloneAsDraft(d, { [ownerField]: newId })
    }
    if (table === T.roleProfile) {
        const r: any = new GlideRecord(T.requirement)
        r.addQuery('role_profile', current.getUniqueValue())
        r.addQuery('active', true)
        r.query()
        while (r.next()) {
            const n: any = new GlideRecord(T.requirement)
            n.initialize()
            ;['element', 'requirement_type', 'target_level', 'sequence'].forEach((f) => n.setValue(f, r.getValue(f)))
            n.setValue('role_profile', newId)
            n.setValue('active', true)
            n.insert()
        }
    }
    return newId
}

/**
 * Creates a Draft Framework Version and copies all non-retired content of the
 * source version into it (Groups → Domains → Elements → PL descriptors),
 * re-pointing references to the copies. Role Profiles are not copied: new
 * Role Profile versions are created deliberately by Role Profile Administrators.
 */
export function createNextFrameworkVersion(src: any): string {
    const stamp = new GlideDateTime().getValue().replace(/[^0-9]/g, '').substring(0, 12)
    const fw: any = new GlideRecord(T.fwVersion)
    fw.initialize()
    fw.setValue('name', `${v(src, 'name')} – next draft`)
    fw.setValue('version_number', `${v(src, 'version_number')}-next-${stamp}`)
    fw.setValue('description', `Draft copy of ${v(src, 'name')}. Update name, number and dates before publishing.`)
    fw.setValue('status', STATUS.draft)
    fw.setValue('active', true)
    const newFw = fw.insert()
    if (!newFw) return ''

    const map: { [oldId: string]: string } = {}
    const copyTable = (table: string, parentFields: string[]) => {
        const gr: any = new GlideRecord(table)
        gr.addQuery('framework_version', src.getUniqueValue())
        gr.addQuery('status', '!=', STATUS.retired)
        gr.addQuery('active', true)
        gr.query()
        while (gr.next()) {
            const overrides: { [f: string]: string } = { framework_version: newFw }
            let orphan = false
            parentFields.forEach((f) => {
                if (!v(gr, f)) return // e.g. a Domain-level descriptor has no element
                const mapped = map[v(gr, f)]
                if (mapped) overrides[f] = mapped
                else orphan = true
            })
            if (orphan) continue
            const id = cloneAsDraft(gr, overrides)
            if (id) map[gr.getUniqueValue()] = id
        }
    }
    copyTable(T.group, [])
    copyTable(T.domain, ['competency_group'])
    copyTable(T.element, ['domain'])
    copyTable(T.descriptor, ['domain', 'element'])
    gs.addInfoMessage(`Created Draft Framework Version with ${Object.keys(map).length} copied records.`)
    return newFw
}

