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

/**
 * Governed Content – extensible base table for every record that follows the
 * CMS lifecycle (Draft → Published → Retired, effective dating, copy-on-revise).
 *
 *   x_2317791_cms2_governed
 *     ├─ x_2317791_cms2_comp_group     Competency Group
 *     ├─ x_2317791_cms2_domain         Domain
 *     ├─ x_2317791_cms2_element        Element
 *     ├─ x_2317791_cms2_pl_descriptor  Element PL Descriptor
 *     └─ x_2317791_cms2_role_profile   Role Profile
 *
 * Shared columns, lifecycle business rules and Publish / Retire / New Version
 * UI actions are defined once here and inherited by every child (the same
 * pattern as task → incident). Children add only their own columns.
 * `sys_class_name` (Type) tells the kinds apart in base-table lists.
 */
export const x_2317791_cms2_governed = Table({
    name: 'x_2317791_cms2_governed',
    label: 'Governed Content',
    display: 'name',
    extensible: true,
    audit: true,
    textIndex: true,
    allowWebServiceAccess: true,
    accessibleFrom: 'public',
    actions: { read: true, create: false, update: false, delete: false },
    schema: {
        code: StringColumn({ label: 'Code', maxLength: 60 }),
        name: StringColumn({ label: 'Name', maxLength: 200 }),
        description: MultiLineTextColumn({ label: 'Description', maxLength: 4000 }),
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
            referenceTable: 'x_2317791_cms2_governed',
            readOnly: true,
            hint: 'The earlier version this record replaces (always the same type).',
        }),
    },
    index: [
        { name: 'cms2_gov_code_fwv', unique: false, element: ['code', 'framework_version'] },
        { name: 'cms2_gov_status_dates', unique: false, element: ['status', 'effective_from', 'effective_to'] },
    ],
})
