import { gs } from '@servicenow/glide'

/** Shared constants for CMS 2.0 server modules. No PL labels live here – they are data. */

export const SCOPE = 'x_2317791_cms2'

export const T = {
    governed: 'x_2317791_cms2_governed',
    fwVersion: 'x_2317791_cms2_fw_version',
    group: 'x_2317791_cms2_comp_group',
    domain: 'x_2317791_cms2_domain',
    element: 'x_2317791_cms2_element',
    level: 'x_2317791_cms2_prof_level',
    descriptor: 'x_2317791_cms2_pl_descriptor',
    roleProfile: 'x_2317791_cms2_role_profile',
    requirement: 'x_2317791_cms2_requirement',
    assignment: 'x_2317791_cms2_rp_assignment',
} as const

export const STATUS = { draft: 'draft', published: 'published', retired: 'retired' } as const

export const REQUIREMENT_TYPE = { essential: 'essential', complementary: 'complementary' } as const

export const ROLES = {
    user: `${SCOPE}.user`,
    contentAdmin: `${SCOPE}.content_admin`,
    roleProfileAdmin: `${SCOPE}.role_profile_admin`,
    admin: `${SCOPE}.admin`,
} as const

export const PROPS = {
    essentialMin: `${SCOPE}.requirements.essential.min_recommended`,
    essentialMax: `${SCOPE}.requirements.essential.max_recommended`,
    totalMax: `${SCOPE}.requirements.total.max_recommended`,
    enforceLimits: `${SCOPE}.requirements.enforce_limits_on_publish`,
    portalSuffix: `${SCOPE}.portal.url_suffix`,
} as const

/**
 * Versioned tables and the "content" columns that are frozen once a record is
 * Published. Lifecycle columns that may still change on a Published record
 * (status → retired, effective_to, active) are deliberately not listed.
 */
export const LOCKED_FIELDS: { [table: string]: string[] } = {
    [T.fwVersion]: ['name', 'version_number', 'description', 'effective_from'],
    [T.group]: ['code', 'name', 'description', 'sequence', 'framework_version', 'effective_from', 'supersedes'],
    [T.domain]: [
        'code', 'name', 'description', 'competency_group', 'owner', 'sme', 'sequence',
        'pl_structure', 'domain_levels_to', 'framework_version', 'effective_from', 'supersedes',
    ],
    [T.element]: ['code', 'name', 'domain', 'description', 'sequence', 'framework_version', 'effective_from', 'supersedes'],
    [T.descriptor]: ['applies_to', 'domain', 'element', 'proficiency_level', 'description', 'framework_version', 'effective_from', 'supersedes'],
    [T.roleProfile]: [
        'code', 'name', 'job_title', 'job_family', 'business_function', 'description', 'owner',
        'framework_version', 'version', 'effective_from', 'supersedes',
    ],
}

/**
 * Columns that identify "the same thing" across versions; two Published rows
 * with the same key must not have overlapping effective periods.
 */
export const VERSION_KEY: { [table: string]: string[] } = {
    [T.fwVersion]: [],
    [T.group]: ['code', 'framework_version'],
    [T.domain]: ['code', 'framework_version'],
    [T.element]: ['code', 'framework_version'],
    [T.descriptor]: ['domain', 'element', 'proficiency_level', 'framework_version'],
    [T.roleProfile]: ['code'],
}

export function intProperty(name: string, fallback: number): number {
    const raw = gs.getProperty(name, String(fallback))
    const n = parseInt(raw, 10)
    return isNaN(n) ? fallback : n
}

export function boolProperty(name: string, fallback: boolean): boolean {
    return String(gs.getProperty(name, String(fallback))) === 'true'
}
