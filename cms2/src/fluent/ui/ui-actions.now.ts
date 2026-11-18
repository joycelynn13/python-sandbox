import '@servicenow/sdk/global'
import { UiAction } from '@servicenow/sdk/core'
import { cmsAdmin, cmsContentAdmin, cmsRoleProfileAdmin } from '../security/roles.now'

/*
 * Lifecycle UI actions (classic form + configurable workspace). Each script is a
 * one-line call into the CmsAdminActions bridge; validation happens in the
 * business rules, so a rejected publish shows the rule's error messages.
 */

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
    script: `if (new x_2317791_cms2.CmsAdminActions().publish(current)) gs.addInfoMessage('Framework Version published.');
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
    action.setRedirectURL(current.getTableName() + '.do?sys_id=' + newId);
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
    condition: "current.status == 'published' || current.status == 'draft'",
    roles: [cmsAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'destructive' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 300,
    script: `if (new x_2317791_cms2.CmsAdminActions().retire(current)) gs.addInfoMessage('Framework Version retired.');
action.setRedirectURL(current);`,
})

// ---------------------------------------------------------------- Competency Group
UiAction({
    $id: Now.ID['ua_grp_publish'],
    table: 'x_2317791_cms2_comp_group',
    name: 'Publish',
    actionName: 'x_cms2_publish_grp',
    hint: 'Validate and publish this record. Effective From is required.',
    condition: "current.status == 'draft'",
    roles: [cmsContentAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'primary' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 100,
    script: `if (new x_2317791_cms2.CmsAdminActions().publish(current)) gs.addInfoMessage('Competency Group published.');
action.setRedirectURL(current);`,
})

UiAction({
    $id: Now.ID['ua_grp_new_version'],
    table: 'x_2317791_cms2_comp_group',
    name: 'Create New Version',
    actionName: 'x_cms2_new_version_grp',
    hint: 'Copy this Published record into a new Draft revision (copy-on-revise).',
    condition: "current.status == 'published'",
    roles: [cmsContentAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'unstyled' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 200,
    script: `var newId = new x_2317791_cms2.CmsAdminActions().createNewVersion(current);
if (newId) {
    gs.addInfoMessage('Draft version created. The Published version is unchanged.');
    action.setRedirectURL(current.getTableName() + '.do?sys_id=' + newId);
} else {
    action.setRedirectURL(current);
}`,
})

UiAction({
    $id: Now.ID['ua_grp_retire'],
    table: 'x_2317791_cms2_comp_group',
    name: 'Retire',
    actionName: 'x_cms2_retire_grp',
    hint: 'Retire this record. Retired content is hidden from employees and cannot be reinstated.',
    condition: "current.status == 'published' || current.status == 'draft'",
    roles: [cmsContentAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'destructive' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 300,
    script: `if (new x_2317791_cms2.CmsAdminActions().retire(current)) gs.addInfoMessage('Competency Group retired.');
action.setRedirectURL(current);`,
})

// ---------------------------------------------------------------- Domain
UiAction({
    $id: Now.ID['ua_dom_publish'],
    table: 'x_2317791_cms2_domain',
    name: 'Publish',
    actionName: 'x_cms2_publish_dom',
    hint: 'Validate and publish this record. Effective From is required.',
    condition: "current.status == 'draft'",
    roles: [cmsContentAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'primary' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 100,
    script: `if (new x_2317791_cms2.CmsAdminActions().publish(current)) gs.addInfoMessage('Domain published.');
action.setRedirectURL(current);`,
})

UiAction({
    $id: Now.ID['ua_dom_new_version'],
    table: 'x_2317791_cms2_domain',
    name: 'Create New Version',
    actionName: 'x_cms2_new_version_dom',
    hint: 'Copy this Published record into a new Draft revision (copy-on-revise).',
    condition: "current.status == 'published'",
    roles: [cmsContentAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'unstyled' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 200,
    script: `var newId = new x_2317791_cms2.CmsAdminActions().createNewVersion(current);
if (newId) {
    gs.addInfoMessage('Draft version created. The Published version is unchanged.');
    action.setRedirectURL(current.getTableName() + '.do?sys_id=' + newId);
} else {
    action.setRedirectURL(current);
}`,
})

UiAction({
    $id: Now.ID['ua_dom_retire'],
    table: 'x_2317791_cms2_domain',
    name: 'Retire',
    actionName: 'x_cms2_retire_dom',
    hint: 'Retire this record. Retired content is hidden from employees and cannot be reinstated.',
    condition: "current.status == 'published' || current.status == 'draft'",
    roles: [cmsContentAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'destructive' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 300,
    script: `if (new x_2317791_cms2.CmsAdminActions().retire(current)) gs.addInfoMessage('Domain retired.');
action.setRedirectURL(current);`,
})

// ---------------------------------------------------------------- Element
UiAction({
    $id: Now.ID['ua_elm_publish'],
    table: 'x_2317791_cms2_element',
    name: 'Publish',
    actionName: 'x_cms2_publish_elm',
    hint: 'Validate and publish this record. Effective From is required.',
    condition: "current.status == 'draft'",
    roles: [cmsContentAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'primary' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 100,
    script: `if (new x_2317791_cms2.CmsAdminActions().publish(current)) gs.addInfoMessage('Element published.');
action.setRedirectURL(current);`,
})

UiAction({
    $id: Now.ID['ua_elm_new_version'],
    table: 'x_2317791_cms2_element',
    name: 'Create New Version',
    actionName: 'x_cms2_new_version_elm',
    hint: 'Copy this Published record into a new Draft revision (copy-on-revise).',
    condition: "current.status == 'published'",
    roles: [cmsContentAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'unstyled' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 200,
    script: `var newId = new x_2317791_cms2.CmsAdminActions().createNewVersion(current);
if (newId) {
    gs.addInfoMessage('Draft version created. The Published version is unchanged.');
    action.setRedirectURL(current.getTableName() + '.do?sys_id=' + newId);
} else {
    action.setRedirectURL(current);
}`,
})

UiAction({
    $id: Now.ID['ua_elm_retire'],
    table: 'x_2317791_cms2_element',
    name: 'Retire',
    actionName: 'x_cms2_retire_elm',
    hint: 'Retire this record. Retired content is hidden from employees and cannot be reinstated.',
    condition: "current.status == 'published' || current.status == 'draft'",
    roles: [cmsContentAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'destructive' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 300,
    script: `if (new x_2317791_cms2.CmsAdminActions().retire(current)) gs.addInfoMessage('Element retired.');
action.setRedirectURL(current);`,
})

// ---------------------------------------------------------------- PL Descriptor
UiAction({
    $id: Now.ID['ua_pld_publish'],
    table: 'x_2317791_cms2_pl_descriptor',
    name: 'Publish',
    actionName: 'x_cms2_publish_pld',
    hint: 'Validate and publish this record. Effective From is required.',
    condition: "current.status == 'draft'",
    roles: [cmsContentAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'primary' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 100,
    script: `if (new x_2317791_cms2.CmsAdminActions().publish(current)) gs.addInfoMessage('PL Descriptor published.');
action.setRedirectURL(current);`,
})

UiAction({
    $id: Now.ID['ua_pld_new_version'],
    table: 'x_2317791_cms2_pl_descriptor',
    name: 'Create New Version',
    actionName: 'x_cms2_new_version_pld',
    hint: 'Copy this Published record into a new Draft revision (copy-on-revise).',
    condition: "current.status == 'published'",
    roles: [cmsContentAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'unstyled' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 200,
    script: `var newId = new x_2317791_cms2.CmsAdminActions().createNewVersion(current);
if (newId) {
    gs.addInfoMessage('Draft version created. The Published version is unchanged.');
    action.setRedirectURL(current.getTableName() + '.do?sys_id=' + newId);
} else {
    action.setRedirectURL(current);
}`,
})

UiAction({
    $id: Now.ID['ua_pld_retire'],
    table: 'x_2317791_cms2_pl_descriptor',
    name: 'Retire',
    actionName: 'x_cms2_retire_pld',
    hint: 'Retire this record. Retired content is hidden from employees and cannot be reinstated.',
    condition: "current.status == 'published' || current.status == 'draft'",
    roles: [cmsContentAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'destructive' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 300,
    script: `if (new x_2317791_cms2.CmsAdminActions().retire(current)) gs.addInfoMessage('PL Descriptor retired.');
action.setRedirectURL(current);`,
})

// ---------------------------------------------------------------- Role Profile
UiAction({
    $id: Now.ID['ua_rp_publish'],
    table: 'x_2317791_cms2_role_profile',
    name: 'Publish',
    actionName: 'x_cms2_publish_rp',
    hint: 'Validate and publish this record. Effective From is required.',
    condition: "current.status == 'draft'",
    roles: [cmsRoleProfileAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'primary' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 100,
    script: `if (new x_2317791_cms2.CmsAdminActions().publish(current)) gs.addInfoMessage('Role Profile published.');
action.setRedirectURL(current);`,
})

UiAction({
    $id: Now.ID['ua_rp_new_version'],
    table: 'x_2317791_cms2_role_profile',
    name: 'Create New Version',
    actionName: 'x_cms2_new_version_rp',
    hint: 'Copy this Published record into a new Draft revision (copy-on-revise).',
    condition: "current.status == 'published'",
    roles: [cmsRoleProfileAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'unstyled' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 200,
    script: `var newId = new x_2317791_cms2.CmsAdminActions().createNewVersion(current);
if (newId) {
    gs.addInfoMessage('Draft version created. The Published version is unchanged.');
    action.setRedirectURL(current.getTableName() + '.do?sys_id=' + newId);
} else {
    action.setRedirectURL(current);
}`,
})

UiAction({
    $id: Now.ID['ua_rp_retire'],
    table: 'x_2317791_cms2_role_profile',
    name: 'Retire',
    actionName: 'x_cms2_retire_rp',
    hint: 'Retire this record. Retired content is hidden from employees and cannot be reinstated.',
    condition: "current.status == 'published' || current.status == 'draft'",
    roles: [cmsRoleProfileAdmin],
    active: true,
    showUpdate: true,
    showInsert: false,
    form: { showButton: true, style: 'destructive' },
    workspace: { isConfigurableWorkspace: true, showFormButtonV2: true },
    order: 300,
    script: `if (new x_2317791_cms2.CmsAdminActions().retire(current)) gs.addInfoMessage('Role Profile retired.');
action.setRedirectURL(current);`,
})

// ---------------------------------------------------------------- Role Profile validate
UiAction({
    $id: Now.ID['ua_rp_validate'],
    table: 'x_2317791_cms2_role_profile',
    name: 'Validate',
    actionName: 'x_cms2_validate_rp',
    hint: 'Check publish readiness and recommended limits without publishing.',
    condition: "current.status == 'draft'",
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
