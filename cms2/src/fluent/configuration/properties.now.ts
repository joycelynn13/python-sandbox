import '@servicenow/sdk/global'
import { Property } from '@servicenow/sdk/core'
import { cmsAdmin, cmsRoleProfileAdmin } from '../security/roles.now'

/*
 * CMS Settings. The requirement counts are current business assumptions
 * (≈3–5 Essential, ≤≈12 total). They drive warnings only, unless
 * enforce_limits_on_publish is switched on by a documented decision.
 */

Property({
    $id: Now.ID['prop_essential_min'],
    name: 'x_2317791_cms2.requirements.essential.min_recommended',
    type: 'integer',
    value: 3,
    description: 'Minimum recommended number of Essential Element requirements per Role Profile (warning only).',
    roles: { read: [cmsRoleProfileAdmin], write: [cmsAdmin] },
})

Property({
    $id: Now.ID['prop_essential_max'],
    name: 'x_2317791_cms2.requirements.essential.max_recommended',
    type: 'integer',
    value: 5,
    description: 'Maximum recommended number of Essential Element requirements per Role Profile (warning only).',
    roles: { read: [cmsRoleProfileAdmin], write: [cmsAdmin] },
})

Property({
    $id: Now.ID['prop_total_max'],
    name: 'x_2317791_cms2.requirements.total.max_recommended',
    type: 'integer',
    value: 12,
    description: 'Maximum recommended total number of Element requirements per Role Profile (warning only).',
    roles: { read: [cmsRoleProfileAdmin], write: [cmsAdmin] },
})

Property({
    $id: Now.ID['prop_enforce_limits'],
    name: 'x_2317791_cms2.requirements.enforce_limits_on_publish',
    type: 'boolean',
    value: 'false',
    description:
        'When true, the recommended requirement limits block publishing. Keep false until a documented requirement makes the limits mandatory.',
    roles: { read: [cmsRoleProfileAdmin], write: [cmsAdmin] },
})

Property({
    $id: Now.ID['prop_portal_suffix'],
    name: 'x_2317791_cms2.portal.url_suffix',
    type: 'string',
    value: 'esc',
    description: 'URL suffix of the Employee Center portal that hosts the CMS 2.0 employee pages.',
    roles: { read: [cmsRoleProfileAdmin], write: [cmsAdmin] },
})
