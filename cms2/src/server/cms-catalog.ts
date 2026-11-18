import { gs, GlideRecordSecure } from '@servicenow/glide'
import { T, STATUS, ROLES, REQUIREMENT_TYPE } from './cms-config.ts'
import { addCurrentlyEffective, isEffectiveOn, today } from './cms-dates.ts'

/*
 * Read-only API for the employee experience (Employee Center pages).
 * Every query uses GlideRecordSecure, so ACLs still apply on top of the
 * Published / currently-effective filters below. Returns plain JSON objects.
 */

const v = (gr: any, f: string): string => (gr.getValue(f) || '') as string
const dv = (gr: any, f: string): string => (gr.getDisplayValue(f) || '') as string

export function canSeeAllStatuses(): boolean {
    return gs.hasRole(ROLES.contentAdmin) || gs.hasRole(ROLES.roleProfileAdmin)
}

// ------------------------------------------------------------------ PL scale

export type Level = { id: string; level: number; code: string; label: string; display: string }

export function getScale(): Level[] {
    const out: Level[] = []
    const gr: any = new GlideRecordSecure(T.level)
    gr.addQuery('active', true)
    gr.orderBy('level')
    gr.query()
    while (gr.next()) {
        out.push({
            id: gr.getUniqueValue(),
            level: parseInt(v(gr, 'level'), 10),
            code: v(gr, 'code'),
            label: v(gr, 'label'),
            display: v(gr, 'display_name'),
        })
    }
    return out
}

// ------------------------------------------------------------------ role profiles

type Counts = { essential: number; complementary: number; total: number }

function countsFor(ids: string[]): { [rpId: string]: Counts } {
    const out: { [id: string]: Counts } = {}
    ids.forEach((id) => (out[id] = { essential: 0, complementary: 0, total: 0 }))
    if (!ids.length) return out
    const r: any = new GlideRecordSecure(T.requirement)
    r.addQuery('role_profile', 'IN', ids.join(','))
    r.addQuery('active', true)
    r.query()
    while (r.next()) {
        const c = out[v(r, 'role_profile')]
        if (!c) continue
        c.total++
        if (v(r, 'requirement_type') === REQUIREMENT_TYPE.essential) c.essential++
        else c.complementary++
    }
    return out
}

function rpSummary(gr: any) {
    return {
        id: gr.getUniqueValue(),
        code: v(gr, 'code'),
        name: v(gr, 'name'),
        jobTitle: v(gr, 'job_title'),
        jobFamily: v(gr, 'job_family'),
        businessFunction: v(gr, 'business_function'),
        description: v(gr, 'description'),
        status: v(gr, 'status'),
        statusLabel: dv(gr, 'status'),
        version: v(gr, 'version'),
        frameworkVersion: dv(gr, 'framework_version'),
        effectiveFrom: v(gr, 'effective_from'),
        effectiveTo: v(gr, 'effective_to'),
    }
}

/** Currently effective Published Role Profile with the given code. */
function currentRoleProfileByCode(code: string): any {
    const gr: any = new GlideRecordSecure(T.roleProfile)
    gr.addQuery('code', code)
    addCurrentlyEffective(gr)
    gr.orderByDesc('effective_from')
    gr.setLimit(1)
    gr.query()
    return gr.next() ? gr : null
}

/** @param userName sys_user.user_name (the assignment stores user_name via referenceKey) */
export function getMyRoleProfile(userName: string) {
    const a: any = new GlideRecordSecure(T.assignment)
    // user_name is stored via referenceKey; records created through some APIs hold the sys_id instead
    const q = a.addQuery('user', userName)
    if (userName === gs.getUserName()) q.addOrCondition('user', gs.getUserID())
    a.addQuery('active', true)
    a.setLimit(1)
    a.query()
    if (!a.next()) return null
    const rp = currentRoleProfileByCode(v(a, 'role_profile_code'))
    if (!rp) return { missing: true, code: v(a, 'role_profile_code') }
    const s = rpSummary(rp)
    return { ...s, counts: countsFor([s.id])[s.id], source: v(a, 'source') }
}

export type BrowseFilter = { text?: string; businessFunction?: string; jobFamily?: string; jobTitle?: string; status?: string }

export function browseRoleProfiles(f: BrowseFilter) {
    const gr: any = new GlideRecordSecure(T.roleProfile)
    const allStatuses = canSeeAllStatuses()
    if (allStatuses && f.status && f.status !== 'effective') {
        gr.addQuery('status', f.status)
        gr.addQuery('active', true)
    } else {
        addCurrentlyEffective(gr) // employees: Published + currently effective only
    }
    if (f.text) {
        const q = gr.addQuery('name', 'CONTAINS', f.text)
        q.addOrCondition('job_title', 'CONTAINS', f.text)
        q.addOrCondition('code', 'CONTAINS', f.text)
        q.addOrCondition('description', 'CONTAINS', f.text)
    }
    if (f.businessFunction) gr.addQuery('business_function', f.businessFunction)
    if (f.jobFamily) gr.addQuery('job_family', f.jobFamily)
    if (f.jobTitle) gr.addQuery('job_title', 'CONTAINS', f.jobTitle)
    gr.orderBy('business_function')
    gr.orderBy('name')
    gr.query()

    const items: any[] = []
    while (gr.next()) items.push(rpSummary(gr))
    const counts = countsFor(items.map((i) => i.id))
    items.forEach((i) => (i.counts = counts[i.id]))
    return { items, facets: roleProfileFacets(), canSeeAllStatuses: allStatuses }
}

/** Distinct Functions / Job Families of currently effective Role Profiles (for filter dropdowns). */
function roleProfileFacets() {
    const fn: { [k: string]: boolean } = {}
    const fam: { [k: string]: boolean } = {}
    const gr: any = new GlideRecordSecure(T.roleProfile)
    addCurrentlyEffective(gr)
    gr.query()
    while (gr.next()) {
        if (v(gr, 'business_function')) fn[v(gr, 'business_function')] = true
        if (v(gr, 'job_family')) fam[v(gr, 'job_family')] = true
    }
    return { functions: Object.keys(fn).sort(), jobFamilies: Object.keys(fam).sort() }
}

/** Published descriptors for the given Elements, one per PL (the one effective today, else the latest). */
type DescRow = { id: string; levelId: string; descriptor: string; effectiveFrom: string; effectiveTo: string; scope: 'domain' | 'element' }
type ByLevel = { [levelId: string]: DescRow }

/**
 * Published descriptors owned by the given Elements and/or Domains, one per PL per owner
 * (the one effective today, else the latest). Keyed by owner sys_id.
 */
function descriptorsFor(elementIds: string[], domainIds: string[] = []): { [ownerId: string]: ByLevel } {
    const out: { [o: string]: ByLevel } = {}
    if (!elementIds.length && !domainIds.length) return out
    const t = today()
    const d: any = new GlideRecordSecure(T.descriptor)
    if (elementIds.length) {
        const q = d.addQuery('element', 'IN', elementIds.join(','))
        if (domainIds.length) q.addOrCondition('domain', 'IN', domainIds.join(','))
    } else {
        d.addQuery('domain', 'IN', domainIds.join(','))
    }
    d.addQuery('status', STATUS.published)
    d.addQuery('active', true)
    d.orderBy('effective_from')
    d.query()
    while (d.next()) {
        const owner = v(d, 'element') || v(d, 'domain')
        const l = v(d, 'proficiency_level')
        const row: DescRow = {
            id: d.getUniqueValue(),
            levelId: l,
            descriptor: v(d, 'description'),
            effectiveFrom: v(d, 'effective_from'),
            effectiveTo: v(d, 'effective_to'),
            scope: v(d, 'element') ? 'element' : 'domain',
        }
        out[owner] = out[owner] || {}
        const existing = out[owner][l]
        // ordered by effective_from, so a later row wins unless the existing one is effective today
        if (!existing || !isEffectiveOn(existing.effectiveFrom, existing.effectiveTo, t)) out[owner][l] = row
    }
    return out
}

/**
 * Effective levels of each Element = levels described on its Domain (CCC-style Domains,
 * e.g. PL1–PL2) merged with the Element's own levels (e.g. PL3–PL5).
 */
function elementLevelMap(elements: { id: string; domainId: string }[]): { [elementId: string]: ByLevel } {
    const domainIds = elements.map((e) => e.domainId).filter((x, i, a) => x && a.indexOf(x) === i)
    const desc = descriptorsFor(elements.map((e) => e.id), domainIds)
    const out: { [e: string]: ByLevel } = {}
    elements.forEach((e) => (out[e.id] = { ...(desc[e.domainId] || {}), ...(desc[e.id] || {}) }))
    return out
}

function levelList(byLevel: ByLevel | undefined, scale: Level[]) {
    // only levels that actually have a descriptor – never an empty PL5
    return scale
        .filter((s) => byLevel && byLevel[s.id])
        .map((s) => ({ ...s, descriptor: byLevel![s.id].descriptor, scope: byLevel![s.id].scope }))
}

function elementRow(gr: any) {
    return {
        id: gr.getUniqueValue(),
        code: v(gr, 'code'),
        name: v(gr, 'name'),
        descriptor: v(gr, 'description'),
        domainId: v(gr, 'domain'),
        domain: dv(gr, 'domain'),
        group: dv(gr, 'domain.competency_group'),
        status: v(gr, 'status'),
        frameworkVersion: dv(gr, 'framework_version'),
    }
}

export function getRoleProfile(id: string) {
    const rp: any = new GlideRecordSecure(T.roleProfile)
    if (!rp.get(id)) return null
    const summary = rpSummary(rp)
    const effectiveNow =
        summary.status === STATUS.published && isEffectiveOn(summary.effectiveFrom, summary.effectiveTo, today())
    if (!effectiveNow && !canSeeAllStatuses()) return null

    const scale = getScale()
    const reqs: any[] = []
    const r: any = new GlideRecordSecure(T.requirement)
    r.addQuery('role_profile', id)
    r.addQuery('active', true)
    r.orderBy('sequence')
    r.query()
    while (r.next()) {
        reqs.push({
            id: r.getUniqueValue(),
            type: v(r, 'requirement_type'),
            typeLabel: dv(r, 'requirement_type'),
            elementId: v(r, 'element'),
            targetLevelId: v(r, 'target_level'),
            sequence: parseInt(v(r, 'sequence') || '0', 10),
        })
    }

    const elements: { [id: string]: any } = {}
    if (reqs.length) {
        const e: any = new GlideRecordSecure(T.element)
        e.addQuery('sys_id', 'IN', reqs.map((x) => x.elementId).join(','))
        e.query()
        while (e.next()) elements[e.getUniqueValue()] = elementRow(e)
    }
    const desc = elementLevelMap(Object.keys(elements).map((k) => elements[k]))

    const rows = reqs
        .filter((x) => elements[x.elementId])
        .map((x) => {
            const target = scale.filter((s) => s.id === x.targetLevelId)[0]
            const byLevel = desc[x.elementId] || {}
            return {
                ...x,
                element: elements[x.elementId],
                target: target || null,
                targetDescriptor: byLevel[x.targetLevelId] ? byLevel[x.targetLevelId].descriptor : '',
                levels: levelList(byLevel, scale),
            }
        })
    return {
        profile: summary,
        essential: rows.filter((x) => x.type === REQUIREMENT_TYPE.essential),
        complementary: rows.filter((x) => x.type === REQUIREMENT_TYPE.complementary),
        counts: countsFor([id])[id],
    }
}

// ------------------------------------------------------------------ competency library

/** "Specialised Competencies – Digital" → "Digital"; names without a dash are kept whole. */
function shortName(name: string): string {
    const i = name.lastIndexOf(' – ')
    return i > 0 ? name.substring(i + 3) : name
}

/** The viewer's own Role Profile targets, keyed by Element code (so any Element version matches). */
function myTargets(): { [elementCode: string]: { code: string; label: string; type: string; typeLabel: string; roleProfile: string } } {
    const out: { [c: string]: any } = {}
    const my: any = getMyRoleProfile(gs.getUserName())
    if (!my || my.missing) return out
    // collect rows first, then resolve Element codes and PL labels in batch (no dot-walked getValue)
    const rows: { element: string; level: string; type: string; typeLabel: string }[] = []
    const r: any = new GlideRecordSecure(T.requirement)
    r.addQuery('role_profile', my.id)
    r.addQuery('active', true)
    r.query()
    while (r.next()) {
        rows.push({ element: v(r, 'element'), level: v(r, 'target_level'), type: v(r, 'requirement_type'), typeLabel: dv(r, 'requirement_type') })
    }
    if (!rows.length) return out
    const codeById: { [id: string]: string } = {}
    const e: any = new GlideRecordSecure(T.element)
    e.addQuery('sys_id', 'IN', rows.map((x) => x.element).join(','))
    e.query()
    while (e.next()) codeById[e.getUniqueValue()] = v(e, 'code')
    const levelById: { [id: string]: Level } = {}
    getScale().forEach((l) => (levelById[l.id] = l))
    rows.forEach((x) => {
        const code = codeById[x.element]
        const lvl = levelById[x.level]
        if (code && lvl) out[code] = { code: lvl.code, label: lvl.label, type: x.type, typeLabel: x.typeLabel, roleProfile: my.name }
    })
    return out
}

/** Currently effective Role Profiles that use any Published version of the given Element codes. */
function roleProfilesByElementCode(codes: string[]): { [code: string]: any[] } {
    const out: { [c: string]: any[] } = {}
    codes.forEach((c) => (out[c] = []))
    if (!codes.length) return out
    const codeById: { [id: string]: string } = {}
    const e: any = new GlideRecordSecure(T.element)
    e.addQuery('code', 'IN', codes.join(','))
    e.addQuery('status', STATUS.published)
    e.query()
    while (e.next()) codeById[e.getUniqueValue()] = v(e, 'code')
    const ids = Object.keys(codeById)
    if (!ids.length) return out
    const r: any = new GlideRecordSecure(T.requirement)
    r.addQuery('element', 'IN', ids.join(','))
    r.addQuery('active', true)
    addCurrentlyEffective(r, 'role_profile.')
    r.orderBy('role_profile.name')
    r.query()
    while (r.next()) {
        out[codeById[v(r, 'element')]].push({
            id: v(r, 'role_profile'),
            name: dv(r, 'role_profile'),
            type: v(r, 'requirement_type'),
            typeLabel: dv(r, 'requirement_type'),
            target: dv(r, 'target_level').split(' – ')[0],
        })
    }
    return out
}

export type LibraryFilter = { text?: string; groupId?: string; levelId?: string }

export function getLibrary(f: LibraryFilter) {
    const scale = getScale()
    const text = (f.text || '').toLowerCase()
    const has = (s: string) => !text || (s || '').toLowerCase().indexOf(text) >= 0

    const groups: any[] = []
    const g: any = new GlideRecordSecure(T.group)
    addCurrentlyEffective(g)
    if (f.groupId) g.addQuery('sys_id', f.groupId)
    g.orderBy('sequence')
    g.query()
    while (g.next()) {
        groups.push({
            id: g.getUniqueValue(),
            code: v(g, 'code'),
            name: v(g, 'name'),
            description: v(g, 'description'),
            shortName: shortName(v(g, 'name')),
            domains: [],
        })
    }
    const groupById: { [id: string]: any } = {}
    groups.forEach((x) => (groupById[x.id] = x))

    const domainById: { [id: string]: any } = {}
    if (groups.length) {
        const d: any = new GlideRecordSecure(T.domain)
        addCurrentlyEffective(d)
        d.addQuery('competency_group', 'IN', groups.map((x) => x.id).join(','))
        d.orderBy('sequence')
        d.query()
        while (d.next()) {
            const dom = {
                id: d.getUniqueValue(),
                groupId: v(d, 'competency_group'),
                code: v(d, 'code'),
                name: v(d, 'name'),
                description: v(d, 'description'),
                owner: dv(d, 'owner'),
                sme: dv(d, 'sme'),
                elements: [] as any[],
            }
            domainById[dom.id] = dom
            groupById[v(d, 'competency_group')].domains.push(dom)
        }
    }

    const elements: any[] = []
    if (Object.keys(domainById).length) {
        const e: any = new GlideRecordSecure(T.element)
        addCurrentlyEffective(e)
        e.addQuery('domain', 'IN', Object.keys(domainById).join(','))
        e.orderBy('sequence')
        e.query()
        while (e.next()) elements.push(elementRow(e))
    }
    const desc = elementLevelMap(elements)
    const domainDesc = descriptorsFor([], Object.keys(domainById))
    Object.keys(domainById).forEach((id) => (domainById[id].levels = levelList(domainDesc[id], scale)))

    let elementCount = 0
    elements.forEach((el) => {
        const levels = levelList(desc[el.id], scale)
        if (f.levelId && !levels.some((l) => l.id === f.levelId)) return
        const dom = domainById[el.domainId]
        const grp = groupById[dom.groupId] || { name: '', code: '' }
        const matchedIn = !text
            ? ''
            : has(el.name) || has(el.code)
              ? 'Element name'
              : has(el.descriptor)
                ? 'Element descriptor'
                : has(dom.name) || has(dom.description)
                  ? 'Domain'
                  : has(grp.name) || has(grp.code)
                    ? 'Competency Group'
                    : levels.filter((l) => has(l.descriptor) || has(l.code) || has(l.label)).map((l) => l.code + ' descriptor')[0] || ''
        if (text && !matchedIn) return
        elementCount++
        dom.elements.push({ ...el, matchedIn, levels: levels.map((l) => ({ id: l.id, code: l.code, label: l.label })) })
    })

    // drop empty branches when a search/filter is active
    const filtering = !!(text || f.levelId)
    groups.forEach((x) => (x.domains = x.domains.filter((d: any) => !filtering || d.elements.length)))
    const visibleGroups = groups.filter((x) => !filtering || x.domains.length)
    const domainCount = groups.reduce((n, x) => n + x.domains.length, 0)
    return {
        groups: visibleGroups,
        scale,
        elementCount,
        domainCount,
        filtering,
        allGroups: groups.map((x) => ({ id: x.id, name: x.name, shortName: x.shortName })),
    }
}

export function getElement(id: string) {
    const e: any = new GlideRecordSecure(T.element)
    if (!e.get(id)) return null
    const el = elementRow(e)
    const effectiveNow =
        el.status === STATUS.published && isEffectiveOn(v(e, 'effective_from'), v(e, 'effective_to'), today())
    const scale = getScale()
    const levels = levelList(elementLevelMap([{ id, domainId: el.domainId }])[id], scale)

    // Role Profiles (currently effective) using this Element or another version of it (same code)
    const versionIds: string[] = []
    const same: any = new GlideRecordSecure(T.element)
    same.addQuery('code', el.code)
    same.addQuery('status', STATUS.published)
    same.query()
    while (same.next()) versionIds.push(same.getUniqueValue())

    const roleProfiles: any[] = []
    const r: any = new GlideRecordSecure(T.requirement)
    r.addQuery('element', 'IN', versionIds.join(','))
    r.addQuery('active', true)
    addCurrentlyEffective(r, 'role_profile.')
    r.orderBy('role_profile.name')
    r.query()
    while (r.next()) {
        roleProfiles.push({
            id: v(r, 'role_profile'),
            name: dv(r, 'role_profile'),
            businessFunction: dv(r, 'role_profile.business_function'),
            type: v(r, 'requirement_type'),
            typeLabel: dv(r, 'requirement_type'),
            target: dv(r, 'target_level'),
        })
    }
    return {
        myTarget: myTargets()[el.code] || null,
        element: { ...el, effectiveFrom: v(e, 'effective_from'), effectiveTo: v(e, 'effective_to'), effectiveNow },
        levels,
        roleProfiles,
    }
}

/**
 * One currently effective Domain with its Elements and, per Element, the
 * Published descriptor of every defined PL (only defined levels – never an empty PL5).
 */
export function getDomain(id: string) {
    const d: any = new GlideRecordSecure(T.domain)
    if (!d.get(id)) return null
    const scale = getScale()
    const domain = {
        id: d.getUniqueValue(),
        code: v(d, 'code'),
        name: v(d, 'name'),
        description: v(d, 'description'),
        owner: dv(d, 'owner'),
        sme: dv(d, 'sme'),
        groupId: v(d, 'competency_group'),
        group: dv(d, 'competency_group'),
        status: v(d, 'status'),
        effectiveNow:
            v(d, 'status') === STATUS.published && isEffectiveOn(v(d, 'effective_from'), v(d, 'effective_to'), today()),
    }
    const elements: any[] = []
    const e: any = new GlideRecordSecure(T.element)
    addCurrentlyEffective(e)
    e.addQuery('domain', id)
    e.orderBy('sequence')
    e.query()
    while (e.next()) elements.push(elementRow(e))
    const desc = elementLevelMap(elements)
    const domainLevels = levelList(descriptorsFor([], [id])[id], scale)
    const mine = myTargets()
    const usedBy = roleProfilesByElementCode(elements.map((x) => x.code))
    elements.forEach((x) => {
        x.levels = levelList(desc[x.id], scale)
        x.myTarget = mine[x.code] || null
        x.roleProfiles = usedBy[x.code] || []
    })

    // other Domains in the same group, for quick switching
    const siblings: any[] = []
    const s: any = new GlideRecordSecure(T.domain)
    addCurrentlyEffective(s)
    s.addQuery('competency_group', domain.groupId)
    s.orderBy('sequence')
    s.query()
    while (s.next()) siblings.push({ id: s.getUniqueValue(), name: v(s, 'name') })

    return { domain: { ...domain, levels: domainLevels }, elements, scale, siblings }
}
