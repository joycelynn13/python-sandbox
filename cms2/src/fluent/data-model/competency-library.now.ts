import '@servicenow/sdk/global'
import {
    Table,
    StringColumn,
    MultiLineTextColumn,
    BooleanColumn,
    IntegerColumn,
    ReferenceColumn,
    OverrideColumn,
    Record,
} from '@servicenow/sdk/core'

/*
 * Competency Library: Competency Group → Domain → Element → Element PL Descriptor.
 * Each table extends Governed Content (governed-content.now.ts) and adds only
 * its own columns; typed references keep the hierarchy strict.
 */

// ---------------------------------------------------------------- Competency Group
export const x_2317791_cms2_comp_group = Table({
    name: 'x_2317791_cms2_comp_group',
    label: 'Competency Group',
    extends: 'x_2317791_cms2_governed',
    display: 'name',
    audit: true,
    allowWebServiceAccess: true,
    accessibleFrom: 'public',
    actions: { read: true, create: false, update: false, delete: false },
    schema: {
        code: OverrideColumn({ baseTable: 'x_2317791_cms2_governed', mandatory: true }),
        name: OverrideColumn({ baseTable: 'x_2317791_cms2_governed', mandatory: true }),
    },
})

// ---------------------------------------------------------------- Domain
export const x_2317791_cms2_domain = Table({
    name: 'x_2317791_cms2_domain',
    label: 'Domain',
    extends: 'x_2317791_cms2_governed',
    display: 'name',
    audit: true,
    allowWebServiceAccess: true,
    accessibleFrom: 'public',
    actions: { read: true, create: false, update: false, delete: false },
    schema: {
        code: OverrideColumn({ baseTable: 'x_2317791_cms2_governed', mandatory: true }),
        name: OverrideColumn({ baseTable: 'x_2317791_cms2_governed', mandatory: true }),
        competency_group: ReferenceColumn({
            label: 'Competency Group',
            referenceTable: 'x_2317791_cms2_comp_group',
            mandatory: true,
            referenceQual: 'status!=retired^active=true',
        }),
        owner: ReferenceColumn({ label: 'Domain Owner', referenceTable: 'sys_user' }),
        sme: ReferenceColumn({ label: 'SME', referenceTable: 'sys_user' }),
    },
    index: [{ name: 'cms2_dom_group', unique: false, element: 'competency_group' }],
})

// ---------------------------------------------------------------- Element
export const x_2317791_cms2_element = Table({
    name: 'x_2317791_cms2_element',
    label: 'Element',
    extends: 'x_2317791_cms2_governed',
    display: 'name',
    audit: true,
    allowWebServiceAccess: true,
    accessibleFrom: 'public',
    actions: { read: true, create: false, update: false, delete: false },
    schema: {
        code: OverrideColumn({ baseTable: 'x_2317791_cms2_governed', mandatory: true }),
        name: OverrideColumn({ baseTable: 'x_2317791_cms2_governed', mandatory: true }),
        domain: ReferenceColumn({
            label: 'Domain',
            referenceTable: 'x_2317791_cms2_domain',
            mandatory: true,
            referenceQual: 'status!=retired^active=true',
        }),
    },
    index: [{ name: 'cms2_elm_domain', unique: false, element: 'domain' }],
})

// ---------------------------------------------------------------- Proficiency Level (configurable scale – not governed content)
export const x_2317791_cms2_prof_level = Table({
    name: 'x_2317791_cms2_prof_level',
    label: 'Proficiency Level',
    display: 'display_name',
    audit: true,
    allowWebServiceAccess: true,
    accessibleFrom: 'public',
    actions: { read: true, create: false, update: false, delete: false },
    schema: {
        level: IntegerColumn({ label: 'Level', mandatory: true, unique: true }),
        code: StringColumn({ label: 'PL', mandatory: true, maxLength: 10, unique: true }),
        label: StringColumn({ label: 'Label', mandatory: true, maxLength: 60 }),
        display_name: StringColumn({
            label: 'Display Name',
            maxLength: 80,
            readOnly: true,
            hint: 'Calculated as "<PL> – <Label>", e.g. "PL3 – Accomplish".',
        }),
        description: MultiLineTextColumn({ label: 'Generic Level Description', maxLength: 4000 }),
        active: BooleanColumn({ label: 'Active', default: 'true' }),
    },
})

// ---------------------------------------------------------------- Element PL Descriptor
// code / name are calculated ("EL-APPDEV – PL3"); the descriptor text is the
// inherited description column, labelled "PL Descriptor" on this table.
export const x_2317791_cms2_pl_descriptor = Table({
    name: 'x_2317791_cms2_pl_descriptor',
    label: 'Element PL Descriptor',
    extends: 'x_2317791_cms2_governed',
    display: 'name',
    audit: true,
    allowWebServiceAccess: true,
    accessibleFrom: 'public',
    actions: { read: true, create: false, update: false, delete: false },
    schema: {
        description: OverrideColumn({ baseTable: 'x_2317791_cms2_governed', mandatory: true }),
        element: ReferenceColumn({
            label: 'Element',
            referenceTable: 'x_2317791_cms2_element',
            mandatory: true,
            referenceQual: 'status!=retired^active=true',
        }),
        proficiency_level: ReferenceColumn({
            label: 'Proficiency Level',
            referenceTable: 'x_2317791_cms2_prof_level',
            mandatory: true,
            referenceQual: 'active=true',
        }),
    },
    index: [{ name: 'cms2_pld_elem_pl', unique: false, element: ['element', 'proficiency_level'] }],
})

// ---------------------------------------------------------------- per-table labels for inherited columns
// sys_documentation is the platform mechanism for relabelling an inherited field on one child table.
Record({
    $id: Now.ID['doc_element_description'],
    table: 'sys_documentation',
    data: { name: 'x_2317791_cms2_element', element: 'description', language: 'en', label: 'Element Descriptor', plural: 'Element Descriptors' },
})
Record({
    $id: Now.ID['doc_pl_descriptor_description'],
    table: 'sys_documentation',
    data: { name: 'x_2317791_cms2_pl_descriptor', element: 'description', language: 'en', label: 'PL Descriptor', plural: 'PL Descriptors' },
})
Record({
    $id: Now.ID['doc_role_profile_code'],
    table: 'sys_documentation',
    data: { name: 'x_2317791_cms2_role_profile', element: 'code', language: 'en', label: 'Role Profile Code', plural: 'Role Profile Codes' },
})
Record({
    $id: Now.ID['doc_role_profile_name'],
    table: 'sys_documentation',
    data: { name: 'x_2317791_cms2_role_profile', element: 'name', language: 'en', label: 'Role Profile Name', plural: 'Role Profile Names' },
})
Record({
    $id: Now.ID['doc_domain_code'],
    table: 'sys_documentation',
    data: { name: 'x_2317791_cms2_domain', element: 'code', language: 'en', label: 'Domain Code', plural: 'Domain Codes' },
})
Record({
    $id: Now.ID['doc_domain_name'],
    table: 'sys_documentation',
    data: { name: 'x_2317791_cms2_domain', element: 'name', language: 'en', label: 'Domain Name', plural: 'Domain Names' },
})
Record({
    $id: Now.ID['doc_element_code'],
    table: 'sys_documentation',
    data: { name: 'x_2317791_cms2_element', element: 'code', language: 'en', label: 'Element Code', plural: 'Element Codes' },
})
Record({
    $id: Now.ID['doc_element_name'],
    table: 'sys_documentation',
    data: { name: 'x_2317791_cms2_element', element: 'name', language: 'en', label: 'Element Name', plural: 'Element Names' },
})
