import '@servicenow/sdk/global'
import {
    Table,
    StringColumn,
    MultiLineTextColumn,
    ChoiceColumn,
    DateColumn,
    BooleanColumn,
} from '@servicenow/sdk/core'

/**
 * Framework Version – the container every Published Role Profile and every
 * piece of competency content resolves to. Published versions may not
 * overlap in time (enforced in src/server/cms-validation.ts).
 */
export const x_2317791_cms2_fw_version = Table({
    name: 'x_2317791_cms2_fw_version',
    label: 'Framework Version',
    display: 'name',
    audit: true,
    allowWebServiceAccess: true,
    accessibleFrom: 'public',
    actions: { read: true, create: false, update: false, delete: false },
    schema: {
        name: StringColumn({ label: 'Version Name', mandatory: true, maxLength: 100 }),
        version_number: StringColumn({ label: 'Version Number', mandatory: true, maxLength: 20 }),
        description: MultiLineTextColumn({ label: 'Description', maxLength: 4000 }),
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
    },
    index: [
        { name: 'cms2_fwv_number', unique: true, element: 'version_number' },
        { name: 'cms2_fwv_status_dates', unique: false, element: ['status', 'effective_from', 'effective_to'] },
    ],
})
