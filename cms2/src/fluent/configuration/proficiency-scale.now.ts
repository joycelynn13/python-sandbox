import '@servicenow/sdk/global'
import { Record } from '@servicenow/sdk/core'

/*
 * Proficiency scale (configurable). Loaded on first install only so later label changes
 * made by a CMS Administrator are not overwritten. Labels to be confirmed against the
 * approved HTX framework source (see docs/assumptions.md).
 */

export const pl1 = Record({
    $id: Now.ID['pl_level_1'],
    $meta: { installMethod: 'first install' },
    table: 'x_2317791_cms2_prof_level',
    data: {
        level: 1,
        code: 'PL1',
        label: 'Apply',
        display_name: 'PL1 – Apply',
        description: 'Applies established practices to well-defined tasks with guidance.',
        active: true,
    },
})

export const pl2 = Record({
    $id: Now.ID['pl_level_2'],
    $meta: { installMethod: 'first install' },
    table: 'x_2317791_cms2_prof_level',
    data: {
        level: 2,
        code: 'PL2',
        label: 'Proficient',
        display_name: 'PL2 – Proficient',
        description: 'Works independently and consistently on typical tasks and resolves common issues.',
        active: true,
    },
})

export const pl3 = Record({
    $id: Now.ID['pl_level_3'],
    $meta: { installMethod: 'first install' },
    table: 'x_2317791_cms2_prof_level',
    data: {
        level: 3,
        code: 'PL3',
        label: 'Accomplish',
        display_name: 'PL3 – Accomplish',
        description: 'Delivers complex work end-to-end, adapts practices and guides others.',
        active: true,
    },
})

export const pl4 = Record({
    $id: Now.ID['pl_level_4'],
    $meta: { installMethod: 'first install' },
    table: 'x_2317791_cms2_prof_level',
    data: {
        level: 4,
        code: 'PL4',
        label: 'Master',
        display_name: 'PL4 – Master',
        description: 'Recognised expert who sets standards and solves novel problems across teams.',
        active: true,
    },
})

export const pl5 = Record({
    $id: Now.ID['pl_level_5'],
    $meta: { installMethod: 'first install' },
    table: 'x_2317791_cms2_prof_level',
    data: {
        level: 5,
        code: 'PL5',
        label: 'Influence',
        display_name: 'PL5 – Influence',
        description: 'Shapes direction and practice at organisational or national level.',
        active: true,
    },
})
