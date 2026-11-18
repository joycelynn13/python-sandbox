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
 * Lifecycle rules. Framework Version and the Governed Content base table each
 * get one "before" rule (defaults + validation, aborts on error) and one
 * "after" rule (end-date predecessors, cascade-publish descriptors). Rules on
 * the base table are inherited by all five child tables. Logic is in src/server.
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

// One pair of rules on the base table runs for every Governed Content type
// (Competency Group, Domain, Element, Element PL Descriptor, Role Profile).
BusinessRule({
    $id: Now.ID['br_governed_before'],
    name: 'CMS2 – Governed Content lifecycle validation',
    table: 'x_2317791_cms2_governed',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    script: versionedBefore,
})
BusinessRule({
    $id: Now.ID['br_governed_after'],
    name: 'CMS2 – Governed Content end-date predecessors and publish descriptors',
    table: 'x_2317791_cms2_governed',
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

