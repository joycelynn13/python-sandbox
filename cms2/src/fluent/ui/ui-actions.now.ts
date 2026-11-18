import '@servicenow/sdk/global'
import { UiAction } from '@servicenow/sdk/core'
import { cmsAdmin, cmsContentAdmin, cmsRoleProfileAdmin } from '../security/roles.now'

/*
 * Lifecycle UI actions (classic form + configurable workspace).
 *
 * Governed Content actions are defined once on the base table and inherited by
 * Competency Group, Domain, Element, Element PL Descriptor and Role Profile.
 * `current.canWrite()` in the condition reuses the table ACLs, so a Role Profile
 * Administrator sees Publish on Role Profiles but not on Domains, and vice versa.
 * Each script is a one-line call into the CmsAdminActions bridge; validation is
 * in the business rules, so a rejected publish shows the rule's error messages.
 */

// ---------------------------------------------------------------- Record
UiAction({
    $id: Now.ID['ua_gov_publish'],
    table: 'x_2317791_cms2_governed',
    name: 'Publish',
    actionName: 'x_cms2_publish_gov',
    hint: 'Validate and publish this record. Effective From is required.',
    condition: "current.status == 'draft' && current.canWrite()",
    roles: [cmsContentAdmin, cmsRoleProfileAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'primary' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 100,
    script: `if (new x_2317791_cms2.CmsAdminActions().publish(current)) gs.addInfoMessage(current.getClassDisplayValue() + ' published.');
action.setRedirectURL(current);`,
})

UiAction({
    $id: Now.ID['ua_gov_new_version'],
    table: 'x_2317791_cms2_governed',
    name: 'Create New Version',
    actionName: 'x_cms2_new_version_gov',
    hint: 'Copy this Published record into a new Draft revision (copy-on-revise).',
    condition: "current.status == 'published' && current.canWrite()",
    roles: [cmsContentAdmin, cmsRoleProfileAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'unstyled' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 200,
    script: `var newId = new x_2317791_cms2.CmsAdminActions().createNewVersion(current);
if (newId) {
    gs.addInfoMessage('Draft version created. The Published version is unchanged.');
    action.setRedirectURL(current.getRecordClassName() + '.do?sys_id=' + newId);
} else {
    action.setRedirectURL(current);
}`,
})

UiAction({
    $id: Now.ID['ua_gov_retire'],
    table: 'x_2317791_cms2_governed',
    name: 'Retire',
    actionName: 'x_cms2_retire_gov',
    hint: 'Retire this record. Retired content is hidden from employees and cannot be reinstated.',
    condition: "(current.status == 'published' || current.status == 'draft') && current.canWrite()",
    roles: [cmsContentAdmin, cmsRoleProfileAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'destructive' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 300,
    script: `if (new x_2317791_cms2.CmsAdminActions().retire(current)) gs.addInfoMessage(current.getClassDisplayValue() + ' retired.');
action.setRedirectURL(current);`,
})

// ---------------------------------------------------------------- Framework Version
UiAction({
    $id: Now.ID['ua_fw_publish'],
    table: 'x_2317791_cms2_fw_version',
    name: 'Publish',
    actionName: 'x_cms2_publish_fw',
    hint: 'Validate and publish this record. Effective From is required.',
    condition: "current.status == 'draft'",
    roles: [cmsAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'primary' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 100,
    script: `if (new x_2317791_cms2.CmsAdminActions().publish(current)) gs.addInfoMessage(current.getClassDisplayValue() + ' published.');
action.setRedirectURL(current);`,
})

UiAction({
    $id: Now.ID['ua_fw_new_version'],
    table: 'x_2317791_cms2_fw_version',
    name: 'Create Next Framework Version (copy content)',
    actionName: 'x_cms2_new_version_fw',
    hint: 'Copy this Published record into a new Draft revision (copy-on-revise).',
    condition: "current.status == 'published'",
    roles: [cmsAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'unstyled' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 200,
    script: `var newId = new x_2317791_cms2.CmsAdminActions().createNewVersion(current);
if (newId) {
    gs.addInfoMessage('Draft version created. The Published version is unchanged.');
    action.setRedirectURL(current.getRecordClassName() + '.do?sys_id=' + newId);
} else {
    action.setRedirectURL(current);
}`,
})

UiAction({
    $id: Now.ID['ua_fw_retire'],
    table: 'x_2317791_cms2_fw_version',
    name: 'Retire',
    actionName: 'x_cms2_retire_fw',
    hint: 'Retire this record. Retired content is hidden from employees and cannot be reinstated.',
    condition: "(current.status == 'published' || current.status == 'draft')",
    roles: [cmsAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'destructive' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 300,
    script: `if (new x_2317791_cms2.CmsAdminActions().retire(current)) gs.addInfoMessage(current.getClassDisplayValue() + ' retired.');
action.setRedirectURL(current);`,
})

// ---------------------------------------------------------------- Role Profile validate
UiAction({
    $id: Now.ID['ua_rp_validate'],
    table: 'x_2317791_cms2_role_profile',
    name: 'Validate',
    actionName: 'x_cms2_validate_rp',
    hint: 'Check publish readiness and recommended limits without publishing.',
    condition: "current.status == 'draft' && current.canWrite()",
    roles: [cmsRoleProfileAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'unstyled' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 90,
    script: `new x_2317791_cms2.CmsAdminActions().validateRoleProfile(current);
action.setRedirectURL(current);`,
})
