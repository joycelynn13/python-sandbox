import '@servicenow/sdk/global'
import {
    Table,
    StringColumn,
    ChoiceColumn,
    BooleanColumn,
    IntegerColumn,
    ReferenceColumn,
    OverrideColumn,
} from '@servicenow/sdk/core'

// ---------------------------------------------------------------- Role Profile
// Extends Governed Content (code, name, description, framework_version, status,
// effective dates, supersedes are inherited) and adds the job attributes.
export const x_2317791_cms2_role_profile = Table({
    name: 'x_2317791_cms2_role_profile',
    label: 'Role Profile',
    extends: 'x_2317791_cms2_governed',
    display: 'name',
    audit: true,
    allowWebServiceAccess: true,
    accessibleFrom: 'public',
    actions: { read: true, create: false, update: false, delete: false },
    schema: {
        code: OverrideColumn({ baseTable: 'x_2317791_cms2_governed', mandatory: true }),
        name: OverrideColumn({ baseTable: 'x_2317791_cms2_governed', mandatory: true }),
        job_title: StringColumn({ label: 'Job Title / Role', maxLength: 160 }),
        job_family: StringColumn({ label: 'Job Family', maxLength: 100 }),
        business_function: StringColumn({ label: 'Function', maxLength: 100 }),
        owner: ReferenceColumn({ label: 'Owner / Function Lead', referenceTable: 'sys_user' }),
        version: IntegerColumn({ label: 'Version', default: '1', readOnly: true }),
    },
})

// ---------------------------------------------------------------- Role Profile Element Requirement
// Domain and Framework Version are derived by dot-walking (element.domain,
// role_profile.framework_version) rather than stored redundantly.
export const x_2317791_cms2_requirement = Table({
    name: 'x_2317791_cms2_requirement',
    label: 'Role Profile Element Requirement',
    display: 'element',
    audit: true,
    allowWebServiceAccess: true,
    accessibleFrom: 'public',
    actions: { read: true, create: false, update: false, delete: false },
    schema: {
        role_profile: ReferenceColumn({
            label: 'Role Profile',
            referenceTable: 'x_2317791_cms2_role_profile',
            mandatory: true,
            cascadeRule: 'cascade',
        }),
        element: ReferenceColumn({
            label: 'Element',
            referenceTable: 'x_2317791_cms2_element',
            mandatory: true,
            referenceQual: 'status!=retired^active=true',
        }),
        requirement_type: ChoiceColumn({
            label: 'Requirement Type',
            mandatory: true,
            default: 'essential',
            dropdown: 'dropdown_without_none',
            choices: {
                essential: { label: 'Essential', sequence: 10 },
                complementary: { label: 'Complementary', sequence: 20 },
            },
        }),
        target_level: ReferenceColumn({
            label: 'Target PL',
            referenceTable: 'x_2317791_cms2_prof_level',
            mandatory: true,
            referenceQual: 'active=true',
        }),
        sequence: IntegerColumn({ label: 'Sequence', default: '100' }),
        active: BooleanColumn({ label: 'Active', default: 'true' }),
    },
    index: [
        { name: 'cms2_req_rp_element', unique: false, element: ['role_profile', 'element'] },
        { name: 'cms2_req_element', unique: false, element: 'element' },
    ],
})

// ---------------------------------------------------------------- PROTOTYPE user → Role Profile assignment
// Stand-in for the authoritative EMPOWER MSS / Employee Profile source, which
// is out of scope for the first prototype. Not a duplicate employee master:
// it only links an existing sys_user to a Role Profile code.
export const x_2317791_cms2_rp_assignment = Table({
    name: 'x_2317791_cms2_rp_assignment',
    label: 'Prototype Role Profile Assignment',
    display: 'user',
    audit: true,
    allowWebServiceAccess: true,
    accessibleFrom: 'public',
    actions: { read: true, create: false, update: false, delete: false },
    schema: {
        user: ReferenceColumn({
            label: 'Employee',
            referenceTable: 'sys_user',
            mandatory: true,
            referenceKey: 'user_name', // stores user_name so demo data needs no sys_ids
        }),
        role_profile_code: StringColumn({
            label: 'Role Profile Code',
            mandatory: true,
            maxLength: 40,
            hint: 'Resolved at runtime to the currently effective Published version of this Role Profile.',
        }),
        source: StringColumn({ label: 'Source', maxLength: 60, default: 'Prototype – manual', readOnly: true }),
        active: BooleanColumn({ label: 'Active', default: 'true' }),
    },
    index: [{ name: 'cms2_rpa_user', unique: false, element: 'user' }],
})
