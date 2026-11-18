import '@servicenow/sdk/global'
import { BusinessRule } from '@servicenow/sdk/core'
import {
    versionedBefore,
    versionedAfter,
    levelBefore,
    requirementBefore,
    requirementAfter,
    requirementBeforeDelete,
} from '../../server/cms-rules'

/*
 * Lifecycle rules. Each versioned table gets one "before" rule (defaults +
 * validation, aborts on error) and one "after" rule (end-date predecessors,
 * cascade-publish descriptors). All logic is in src/server.
 */


BusinessRule({
    $id: Now.ID['br_fw_version_before'],
    name: 'CMS2 – Framework Version lifecycle validation',
    table: 'x_2317791_cms2_fw_version',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: versionedBefore,
})
BusinessRule({
    $id: Now.ID['br_fw_version_after'],
    name: 'CMS2 – Framework Version end-date predecessors',
    table: 'x_2317791_cms2_fw_version',
    when: 'after',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: versionedAfter,
})

BusinessRule({
    $id: Now.ID['br_comp_group_before'],
    name: 'CMS2 – Competency Group lifecycle validation',
    table: 'x_2317791_cms2_comp_group',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: versionedBefore,
})
BusinessRule({
    $id: Now.ID['br_comp_group_after'],
    name: 'CMS2 – Competency Group end-date predecessors',
    table: 'x_2317791_cms2_comp_group',
    when: 'after',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: versionedAfter,
})

BusinessRule({
    $id: Now.ID['br_domain_before'],
    name: 'CMS2 – Domain lifecycle validation',
    table: 'x_2317791_cms2_domain',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: versionedBefore,
})
BusinessRule({
    $id: Now.ID['br_domain_after'],
    name: 'CMS2 – Domain end-date predecessors',
    table: 'x_2317791_cms2_domain',
    when: 'after',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: versionedAfter,
})

BusinessRule({
    $id: Now.ID['br_element_before'],
    name: 'CMS2 – Element lifecycle validation',
    table: 'x_2317791_cms2_element',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: versionedBefore,
})
BusinessRule({
    $id: Now.ID['br_element_after'],
    name: 'CMS2 – Element end-date predecessors and publish descriptors',
    table: 'x_2317791_cms2_element',
    when: 'after',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: versionedAfter,
})

BusinessRule({
    $id: Now.ID['br_pl_descriptor_before'],
    name: 'CMS2 – PL Descriptor lifecycle validation',
    table: 'x_2317791_cms2_pl_descriptor',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: versionedBefore,
})
BusinessRule({
    $id: Now.ID['br_pl_descriptor_after'],
    name: 'CMS2 – PL Descriptor end-date predecessors',
    table: 'x_2317791_cms2_pl_descriptor',
    when: 'after',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: versionedAfter,
})

BusinessRule({
    $id: Now.ID['br_role_profile_before'],
    name: 'CMS2 – Role Profile lifecycle validation',
    table: 'x_2317791_cms2_role_profile',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: versionedBefore,
})
BusinessRule({
    $id: Now.ID['br_role_profile_after'],
    name: 'CMS2 – Role Profile end-date predecessors',
    table: 'x_2317791_cms2_role_profile',
    when: 'after',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: versionedAfter,
})

BusinessRule({
    $id: Now.ID['br_prof_level_before'],
    name: 'CMS2 – Proficiency Level display name',
    table: 'x_2317791_cms2_prof_level',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: levelBefore,
})

BusinessRule({
    $id: Now.ID['br_requirement_before'],
    name: 'CMS2 – Element Requirement validation',
    table: 'x_2317791_cms2_requirement',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: requirementBefore,
})
BusinessRule({
    $id: Now.ID['br_requirement_before_delete'],
    name: 'CMS2 – Element Requirement delete guard',
    table: 'x_2317791_cms2_requirement',
    when: 'before',
    action: ['delete'],
    order: 100,
    active: true,
    script: requirementBeforeDelete,
})
BusinessRule({
    $id: Now.ID['br_requirement_after'],
    name: 'CMS2 – Element Requirement recommended-limit warnings',
    table: 'x_2317791_cms2_requirement',
    when: 'after',
    action: ['insert', 'update'],
    order: 200,
    active: true,
    script: requirementAfter,
})

