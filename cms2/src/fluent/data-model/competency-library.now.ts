import '@servicenow/sdk/global'
import {
    Table,
    StringColumn,
    MultiLineTextColumn,
    ChoiceColumn,
    DateColumn,
    BooleanColumn,
    IntegerColumn,
    ReferenceColumn,
} from '@servicenow/sdk/core'

/*
 * Competency Library: Competency Group → Domain → Element → Element PL Descriptor.
 *
 * Every versioned content table carries the same lifecycle columns:
 *   status (draft | published | retired), framework_version, effective_from,
 *   effective_to, active, supersedes.
 * Published rows are never edited in place – a revision is a new Draft row
 * that `supersedes` the Published one (copy-on-revise, see cms-versioning.ts).
 */

// ---------------------------------------------------------------- Competency Group
export const x_2317791_cms2_comp_group = Table({
    name: 'x_2317791_cms2_comp_group',
    label: 'Competency Group',
    display: 'name',
    audit: true,
    allowWebServiceAccess: true,
    accessibleFrom: 'public',
    actions: { read: true, create: false, update: false, delete: false },
    schema: {
        code: StringColumn({ label: 'Code', mandatory: true, maxLength: 40 }),
        name: StringColumn({ label: 'Name', mandatory: true, maxLength: 160 }),
        description: MultiLineTextColumn({ label: 'Description', maxLength: 4000 }),
        sequence: IntegerColumn({ label: 'Sequence', default: '100' }),
        layout: ChoiceColumn({
            label: 'Library Layout',
            default: 'column',
            dropdown: 'dropdown_without_none',
            hint: 'How the group is shown on the Competency Library landing page.',
            choices: {
                row: { label: 'Tile row (full width)', sequence: 10 },
                column: { label: 'Column', sequence: 20 },
            },
        }),
        framework_version: ReferenceColumn({
            label: 'Framework Version',
            referenceTable: 'x_2317791_cms2_fw_version',
            mandatory: true,
        }),
        status: ChoiceColumn({
            label: 'Status',
            mandatory: true,
            default: 'draft',
            dropdown: 'dropdown_without_none',
            choices: {
                draft: { label: 'Draft', sequence: 10 },
                published: { label: 'Published', sequence: 20 },
                retired: { label: 'Retired', sequence: 30 },
            },
        }),
        effective_from: DateColumn({ label: 'Effective From' }),
        effective_to: DateColumn({ label: 'Effective To' }),
        active: BooleanColumn({ label: 'Active', default: 'true' }),
        supersedes: ReferenceColumn({
            label: 'Supersedes',
            referenceTable: 'x_2317791_cms2_comp_group',
            readOnly: true,
        }),
    },
    index: [
        { name: 'cms2_grp_code_fwv', unique: false, element: ['code', 'framework_version'] },
        { name: 'cms2_grp_status_dates', unique: false, element: ['status', 'effective_from', 'effective_to'] },
    ],
})

// ---------------------------------------------------------------- Domain
export const x_2317791_cms2_domain = Table({
    name: 'x_2317791_cms2_domain',
    label: 'Domain',
    display: 'name',
    audit: true,
    allowWebServiceAccess: true,
    accessibleFrom: 'public',
    actions: { read: true, create: false, update: false, delete: false },
    schema: {
        code: StringColumn({ label: 'Domain Code', mandatory: true, maxLength: 40 }),
        name: StringColumn({ label: 'Domain Name', mandatory: true, maxLength: 160 }),
        description: MultiLineTextColumn({ label: 'Description', maxLength: 4000 }),
        competency_group: ReferenceColumn({
            label: 'Competency Group',
            referenceTable: 'x_2317791_cms2_comp_group',
            mandatory: true,
            referenceQual: 'status!=retired^active=true',
        }),
        owner: ReferenceColumn({ label: 'Domain Owner', referenceTable: 'sys_user' }),
        sme: ReferenceColumn({ label: 'SME', referenceTable: 'sys_user' }),
        sequence: IntegerColumn({ label: 'Sequence', default: '100' }),
        framework_version: ReferenceColumn({
            label: 'Framework Version',
            referenceTable: 'x_2317791_cms2_fw_version',
            mandatory: true,
        }),
        status: ChoiceColumn({
            label: 'Status',
            mandatory: true,
            default: 'draft',
            dropdown: 'dropdown_without_none',
            choices: {
                draft: { label: 'Draft', sequence: 10 },
                published: { label: 'Published', sequence: 20 },
                retired: { label: 'Retired', sequence: 30 },
            },
        }),
        effective_from: DateColumn({ label: 'Effective From' }),
        effective_to: DateColumn({ label: 'Effective To' }),
        active: BooleanColumn({ label: 'Active', default: 'true' }),
        supersedes: ReferenceColumn({
            label: 'Supersedes',
            referenceTable: 'x_2317791_cms2_domain',
            readOnly: true,
        }),
    },
    index: [
        { name: 'cms2_dom_group', unique: false, element: 'competency_group' },
        { name: 'cms2_dom_code_fwv', unique: false, element: ['code', 'framework_version'] },
        { name: 'cms2_dom_status_dates', unique: false, element: ['status', 'effective_from', 'effective_to'] },
    ],
})

// ---------------------------------------------------------------- Element
export const x_2317791_cms2_element = Table({
    name: 'x_2317791_cms2_element',
    label: 'Element',
    display: 'name',
    audit: true,
    textIndex: true,
    allowWebServiceAccess: true,
    accessibleFrom: 'public',
    actions: { read: true, create: false, update: false, delete: false },
    schema: {
        code: StringColumn({ label: 'Element Code', mandatory: true, maxLength: 40 }),
        name: StringColumn({ label: 'Element Name', mandatory: true, maxLength: 160 }),
        domain: ReferenceColumn({
            label: 'Domain',
            referenceTable: 'x_2317791_cms2_domain',
            mandatory: true,
            referenceQual: 'status!=retired^active=true',
        }),
        descriptor: MultiLineTextColumn({ label: 'Element Descriptor', maxLength: 4000 }),
        sequence: IntegerColumn({ label: 'Sequence', default: '100' }),
        framework_version: ReferenceColumn({
            label: 'Framework Version',
            referenceTable: 'x_2317791_cms2_fw_version',
            mandatory: true,
        }),
        status: ChoiceColumn({
            label: 'Status',
            mandatory: true,
            default: 'draft',
            dropdown: 'dropdown_without_none',
            choices: {
                draft: { label: 'Draft', sequence: 10 },
                published: { label: 'Published', sequence: 20 },
                retired: { label: 'Retired', sequence: 30 },
            },
        }),
        effective_from: DateColumn({ label: 'Effective From' }),
        effective_to: DateColumn({ label: 'Effective To' }),
        active: BooleanColumn({ label: 'Active', default: 'true' }),
        supersedes: ReferenceColumn({
            label: 'Supersedes',
            referenceTable: 'x_2317791_cms2_element',
            readOnly: true,
        }),
    },
    index: [
        { name: 'cms2_elm_domain', unique: false, element: 'domain' },
        { name: 'cms2_elm_code_fwv', unique: false, element: ['code', 'framework_version'] },
        { name: 'cms2_elm_status_dates', unique: false, element: ['status', 'effective_from', 'effective_to'] },
    ],
})

// ---------------------------------------------------------------- Proficiency Level (configurable scale)
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
export const x_2317791_cms2_pl_descriptor = Table({
    name: 'x_2317791_cms2_pl_descriptor',
    label: 'Element PL Descriptor',
    display: 'display_name',
    audit: true,
    textIndex: true,
    allowWebServiceAccess: true,
    accessibleFrom: 'public',
    actions: { read: true, create: false, update: false, delete: false },
    schema: {
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
        descriptor: MultiLineTextColumn({ label: 'PL Descriptor', mandatory: true, maxLength: 4000 }),
        display_name: StringColumn({ label: 'Display Name', maxLength: 255, readOnly: true }),
        framework_version: ReferenceColumn({
            label: 'Framework Version',
            referenceTable: 'x_2317791_cms2_fw_version',
            mandatory: true,
        }),
        status: ChoiceColumn({
            label: 'Status',
            mandatory: true,
            default: 'draft',
            dropdown: 'dropdown_without_none',
            choices: {
                draft: { label: 'Draft', sequence: 10 },
                published: { label: 'Published', sequence: 20 },
                retired: { label: 'Retired', sequence: 30 },
            },
        }),
        effective_from: DateColumn({ label: 'Effective From' }),
        effective_to: DateColumn({ label: 'Effective To' }),
        active: BooleanColumn({ label: 'Active', default: 'true' }),
        supersedes: ReferenceColumn({
            label: 'Supersedes',
            referenceTable: 'x_2317791_cms2_pl_descriptor',
            readOnly: true,
        }),
    },
    index: [
        { name: 'cms2_pld_elem_pl_fwv', unique: false, element: ['element', 'proficiency_level', 'framework_version'] },
        { name: 'cms2_pld_status_dates', unique: false, element: ['status', 'effective_from', 'effective_to'] },
    ],
})
