import { gs, GlideRecord } from '@servicenow/glide'
import {
    T,
    STATUS,
    LOCKED_FIELDS,
    VERSION_KEY,
    PROPS,
    REQUIREMENT_TYPE,
    intProperty,
    boolProperty,
} from './cms-config.ts'
import { isValidRange, periodsOverlap, today, addCurrentlyEffective } from './cms-dates.ts'

/*
 * Server-side validation for CMS 2.0. Single source of truth: business rules,
 * the "Validate" UI action and ATF tests all call these functions.
 * Functions return message arrays; callers decide whether to abort.
 */

const v = (gr: any, field: string): string => (gr.getValue(field) || '') as string
/** Boolean values arrive as '1'/'0' from getValue() and 'true'/'false' from GlideElement. */
export const isTrue = (x: any): boolean => ['1', 'true'].indexOf(String(x)) >= 0

// ------------------------------------------------------------------ lifecycle

/** Validates any versioned record (framework version, group, domain, element, PL descriptor, role profile). */
export function lifecycleErrors(current: any, previous: any): string[] {
    const table: string = current.getRecordClassName()
    const errors: string[] = []
    const status = v(current, 'status')
    const prevStatus = previous ? v(previous, 'status') : ''
    const isNew = current.isNewRecord() || !previous

    if (!isNew && (prevStatus === STATUS.published || prevStatus === STATUS.retired)) {
        const changed = (LOCKED_FIELDS[table] || []).filter((f) => current[f] && current[f].changes())
        if (changed.length) {
            errors.push(
                `This record is ${prevStatus} and cannot be edited in place (changed: ${changed.join(', ')}). ` +
                    'Use "Create New Version" to revise it.'
            )
        }
        if (prevStatus === STATUS.retired && status !== STATUS.retired) {
            errors.push('A Retired record cannot be reinstated. Create a new version instead.')
        }
        if (prevStatus === STATUS.published && status === STATUS.draft) {
            errors.push('A Published record cannot return to Draft. Create a new version instead.')
        }
    }

    if (!isValidRange(v(current, 'effective_from'), v(current, 'effective_to'))) {
        errors.push('Effective To must be on or after Effective From.')
    }

    const publishing = status === STATUS.published && (isNew || prevStatus !== STATUS.published)
    if (publishing) {
        errors.push(...publishGateErrors(current, table))
    }
    if (status === STATUS.published) {
        errors.push(...overlapErrors(current, table))
    }
    const retiring = status === STATUS.retired && prevStatus !== STATUS.retired
    if (retiring && table === T.element) {
        errors.push(...elementInUseErrors(current.getUniqueValue()))
    }
    if (table === T.descriptor && status === STATUS.draft && isTrue(current.getValue('active'))) {
        errors.push(...draftDescriptorDuplicateErrors(current))
    }
    return errors
}

function publishGateErrors(current: any, table: string): string[] {
    const errors: string[] = []
    const from = v(current, 'effective_from')
    if (!from) errors.push('Effective From is required before publishing.')

    if (table !== T.fwVersion) {
        const fw = current.framework_version
        const fwStatus = fw ? String(fw.status) : ''
        if (fwStatus !== STATUS.published) {
            errors.push(`Framework Version "${current.getDisplayValue('framework_version')}" must be Published first.`)
        } else {
            const fwFrom = String(fw.effective_from || '')
            const fwTo = String(fw.effective_to || '')
            if (from && ((fwFrom && from < fwFrom) || (fwTo && from > fwTo))) {
                errors.push('Effective From must fall within the Framework Version effective period.')
            }
        }
    }

    const parentRule: { [t: string]: [string, string] } = {
        [T.domain]: ['competency_group', 'Competency Group'],
        [T.element]: ['domain', 'Domain'],
        [T.descriptor]: ['element', 'Element'],
    }
    const rule = parentRule[table]
    if (rule) {
        const parent = current[rule[0]]
        if (!parent || String(parent.status) !== STATUS.published) {
            errors.push(`${rule[1]} "${current.getDisplayValue(rule[0])}" must be Published first.`)
        }
    }

    if (table === T.roleProfile) {
        const result = roleProfileIssues(current.getUniqueValue(), v(current, 'framework_version'))
        errors.push(...result.errors)
        if (boolProperty(PROPS.enforceLimits, false)) errors.push(...result.warnings)
    }
    return errors
}

/** Published rows sharing the version key must not overlap in time. */
function overlapErrors(current: any, table: string): string[] {
    const key = VERSION_KEY[table]
    if (!key) return []
    const from = v(current, 'effective_from')
    const to = v(current, 'effective_to')
    const supersedes = v(current, 'supersedes')

    const gr: any = new GlideRecord(table)
    gr.addQuery('status', STATUS.published)
    gr.addQuery('active', true)
    gr.addQuery('sys_id', '!=', current.getUniqueValue())
    key.forEach((f) => gr.addQuery(f, current.getValue(f)))
    gr.query()

    const clashes: string[] = []
    while (gr.next()) {
        const oFrom = v(gr, 'effective_from')
        const oTo = v(gr, 'effective_to')
        // Records this publication will end-date automatically (see cms-versioning.closePredecessors)
        const autoClosed =
            !!from &&
            oFrom < from &&
            (gr.getUniqueValue() === supersedes || (table === T.fwVersion && !oTo))
        if (autoClosed) continue
        if (periodsOverlap(from, to, oFrom, oTo)) clashes.push(gr.getDisplayValue())
    }
    return clashes.length
        ? [`The effective period overlaps another Published record: ${clashes.join(', ')}.`]
        : []
}

function draftDescriptorDuplicateErrors(current: any): string[] {
    const gr: any = new GlideRecord(T.descriptor)
    gr.addQuery('element', current.getValue('element'))
    gr.addQuery('proficiency_level', current.getValue('proficiency_level'))
    gr.addQuery('framework_version', current.getValue('framework_version'))
    gr.addQuery('status', STATUS.draft)
    gr.addQuery('active', true)
    gr.addQuery('sys_id', '!=', current.getUniqueValue())
    gr.setLimit(1)
    gr.query()
    return gr.hasNext()
        ? ['An active Draft descriptor already exists for this Element, PL and Framework Version.']
        : []
}

/** An Element referenced by a currently effective Published Role Profile cannot be retired. */
function elementInUseErrors(elementId: string): string[] {
    const r: any = new GlideRecord(T.requirement)
    r.addQuery('element', elementId)
    r.addQuery('active', true)
    addCurrentlyEffective(r, 'role_profile.')
    r.query()
    const names: string[] = []
    while (r.next()) names.push(r.getDisplayValue('role_profile'))
    return names.length
        ? [`Element is used by Published Role Profile(s): ${names.join(', ')}. Publish new Role Profile versions without it first.`]
        : []
}

// ------------------------------------------------------------------ requirements

export function requirementErrors(current: any): string[] {
    const errors: string[] = []
    const rp = current.role_profile
    if (rp && String(rp.status) !== STATUS.draft) {
        errors.push(
            `Role Profile "${current.getDisplayValue('role_profile')}" is ${rp.status}; ` +
                'requirements can only be changed on a Draft version.'
        )
    }
    const element = current.element
    if (element && String(element.status) === STATUS.retired) {
        errors.push(`Element "${current.getDisplayValue('element')}" is Retired.`)
    }

    if (isTrue(current.getValue('active'))) {
        const dup: any = new GlideRecord(T.requirement)
        dup.addQuery('role_profile', current.getValue('role_profile'))
        dup.addQuery('element', current.getValue('element'))
        dup.addQuery('active', true)
        dup.addQuery('sys_id', '!=', current.getUniqueValue())
        dup.setLimit(1)
        dup.query()
        if (dup.hasNext()) errors.push('This Element is already an active requirement of the Role Profile.')
    }

    // Target PL must be a level the Element actually defines (not every Element has PL5).
    const levels = definedLevels(current.getValue('element'))
    if (current.getValue('target_level') && levels.ids.indexOf(current.getValue('target_level')) < 0) {
        errors.push(
            `Element "${current.getDisplayValue('element')}" has no descriptor for ` +
                `${current.getDisplayValue('target_level')}. Available: ${levels.labels.join(', ') || 'none'}.`
        )
    }
    return errors
}

export function requirementDeleteErrors(current: any): string[] {
    const rp = current.role_profile
    return rp && String(rp.status) !== STATUS.draft
        ? ['Requirements of a Published or Retired Role Profile cannot be deleted. Create a new version instead.']
        : []
}

/** Proficiency levels with a non-retired, active descriptor for the Element. */
function definedLevels(elementId: string): { ids: string[]; labels: string[] } {
    const ids: string[] = []
    const labels: string[] = []
    if (!elementId) return { ids, labels }
    const gr: any = new GlideRecord(T.descriptor)
    gr.addQuery('element', elementId)
    gr.addQuery('status', '!=', STATUS.retired)
    gr.addQuery('active', true)
    gr.orderBy('proficiency_level.level')
    gr.query()
    while (gr.next()) {
        const id = v(gr, 'proficiency_level')
        if (ids.indexOf(id) < 0) {
            ids.push(id)
            labels.push(gr.getDisplayValue('proficiency_level'))
        }
    }
    return { ids, labels }
}

// ------------------------------------------------------------------ role profile

export type RoleProfileIssues = {
    errors: string[]
    warnings: string[]
    counts: { essential: number; complementary: number; total: number }
}

/** Full publish-readiness check for a Role Profile; also used by the "Validate" action. */
export function roleProfileIssues(roleProfileId: string, frameworkVersionId: string): RoleProfileIssues {
    const errors: string[] = []
    const counts = { essential: 0, complementary: 0, total: 0 }
    const needed: { element: string; level: string; label: string }[] = []

    const req: any = new GlideRecord(T.requirement)
    req.addQuery('role_profile', roleProfileId)
    req.addQuery('active', true)
    req.query()
    while (req.next()) {
        counts.total++
        if (v(req, 'requirement_type') === REQUIREMENT_TYPE.essential) counts.essential++
        else counts.complementary++
        needed.push({ element: v(req, 'element'), level: v(req, 'target_level'), label: req.getDisplayValue('element') })
    }

    // One query for all referenced Elements (no per-row dot-walking).
    if (needed.length) {
        const el: any = new GlideRecord(T.element)
        el.addQuery('sys_id', 'IN', needed.map((n) => n.element).join(','))
        el.query()
        const seen: { [id: string]: boolean } = {}
        while (el.next()) {
            seen[el.getUniqueValue()] = true
            const name = el.getDisplayValue()
            if (v(el, 'status') !== STATUS.published || !isTrue(v(el, 'active'))) {
                errors.push(`Element "${name}" is ${el.getDisplayValue('status')}; only Published Elements can be referenced.`)
            }
            if (frameworkVersionId && v(el, 'framework_version') !== frameworkVersionId) {
                errors.push(`Element "${name}" belongs to a different Framework Version.`)
            }
        }
        needed.filter((n) => !seen[n.element]).forEach((n) => errors.push(`Element "${n.label}" no longer exists.`))
    }
    if (counts.total === 0) errors.push('Add at least one Element requirement before publishing.')

    if (needed.length) {
        const published: { [k: string]: boolean } = {}
        const d: any = new GlideRecord(T.descriptor)
        d.addQuery('element', 'IN', needed.map((n) => n.element).join(','))
        d.addQuery('status', STATUS.published)
        d.addQuery('active', true)
        d.query()
        while (d.next()) published[v(d, 'element') + '|' + v(d, 'proficiency_level')] = true
        needed
            .filter((n) => !published[n.element + '|' + n.level])
            .forEach((n) => errors.push(`Element "${n.label}" has no Published descriptor for its Target PL.`))
    }

    return { errors, warnings: limitWarnings(counts), counts }
}

/** Recommended-limit warnings. Business assumptions → configurable properties, never hard rules. */
export function limitWarnings(counts: { essential: number; total: number }): string[] {
    const minE = intProperty(PROPS.essentialMin, 3)
    const maxE = intProperty(PROPS.essentialMax, 5)
    const maxT = intProperty(PROPS.totalMax, 12)
    const w: string[] = []
    if (counts.essential < minE) w.push(`Only ${counts.essential} Essential requirement(s); recommended minimum is ${minE}.`)
    if (counts.essential > maxE) w.push(`${counts.essential} Essential requirements exceed the recommended maximum of ${maxE}.`)
    if (counts.total > maxT) w.push(`${counts.total} requirements exceed the recommended maximum of ${maxT}.`)
    return w
}

export function countRequirements(roleProfileId: string): { essential: number; complementary: number; total: number } {
    const counts = { essential: 0, complementary: 0, total: 0 }
    const req: any = new GlideRecord(T.requirement)
    req.addQuery('role_profile', roleProfileId)
    req.addQuery('active', true)
    req.query()
    while (req.next()) {
        counts.total++
        if (v(req, 'requirement_type') === REQUIREMENT_TYPE.essential) counts.essential++
        else counts.complementary++
    }
    return counts
}

// ------------------------------------------------------------------ helpers for business rules

export function abortWith(current: any, errors: string[]): boolean {
    if (!errors.length) return false
    errors.forEach((e) => gs.addErrorMessage(e))
    current.setAbortAction(true)
    return true
}

export function todayValue(): string {
    return today()
}
