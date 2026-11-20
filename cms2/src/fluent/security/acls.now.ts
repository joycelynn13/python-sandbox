import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { cmsUser, cmsContentAdmin, cmsRoleProfileAdmin, cmsAdmin } from './roles.now'

/*
 * Record ACLs (least privilege). Multiple "allow" ACLs on the same object are
 * OR-ed by the platform, so each role gets its own rule.
 *
 * CMS User read rule: status=published^active=true. Historical (end-dated)
 * Published rows stay readable so a still-effective Role Profile can show the
 * Element version it references; "currently effective" filtering for browse
 * and search is applied in src/server/cms-catalog.ts. Draft and Retired rows
 * are never readable by CMS Users.
 *
 * Delete is restricted to CMS Administrators (retire instead of delete).
 * Requirement deletes on Draft Role Profiles are allowed to Role Profile
 * Administrators; the delete guard rule blocks them on Published versions.
 */

const PUBLISHED = 'status=published^active=true'

// ---------------------------------------------------------------- content tables

// Competency Group
Acl({ $id: Now.ID['acl_grp_read_user'], type: 'record', table: 'x_2317791_cms2_comp_group', operation: 'read', roles: [cmsUser], condition: PUBLISHED, description: 'CMS Users read Published Competency Groups.' })
Acl({ $id: Now.ID['acl_grp_read_admin'], type: 'record', table: 'x_2317791_cms2_comp_group', operation: 'read', roles: [cmsContentAdmin, cmsRoleProfileAdmin], description: 'Administrators read all Competency Groups including Draft.' })
Acl({ $id: Now.ID['acl_grp_create'], type: 'record', table: 'x_2317791_cms2_comp_group', operation: 'create', roles: [cmsContentAdmin] })
Acl({ $id: Now.ID['acl_grp_write'], type: 'record', table: 'x_2317791_cms2_comp_group', operation: 'write', roles: [cmsContentAdmin] })
Acl({ $id: Now.ID['acl_grp_delete'], type: 'record', table: 'x_2317791_cms2_comp_group', operation: 'delete', roles: [cmsAdmin] })

// Domain
Acl({ $id: Now.ID['acl_dom_read_user'], type: 'record', table: 'x_2317791_cms2_domain', operation: 'read', roles: [cmsUser], condition: PUBLISHED, description: 'CMS Users read Published Domains.' })
Acl({ $id: Now.ID['acl_dom_read_admin'], type: 'record', table: 'x_2317791_cms2_domain', operation: 'read', roles: [cmsContentAdmin, cmsRoleProfileAdmin] })
Acl({ $id: Now.ID['acl_dom_create'], type: 'record', table: 'x_2317791_cms2_domain', operation: 'create', roles: [cmsContentAdmin] })
Acl({ $id: Now.ID['acl_dom_write'], type: 'record', table: 'x_2317791_cms2_domain', operation: 'write', roles: [cmsContentAdmin] })
Acl({ $id: Now.ID['acl_dom_delete'], type: 'record', table: 'x_2317791_cms2_domain', operation: 'delete', roles: [cmsAdmin] })

// Element
Acl({ $id: Now.ID['acl_elm_read_user'], type: 'record', table: 'x_2317791_cms2_element', operation: 'read', roles: [cmsUser], condition: PUBLISHED, description: 'CMS Users read Published Elements.' })
Acl({ $id: Now.ID['acl_elm_read_admin'], type: 'record', table: 'x_2317791_cms2_element', operation: 'read', roles: [cmsContentAdmin, cmsRoleProfileAdmin] })
Acl({ $id: Now.ID['acl_elm_create'], type: 'record', table: 'x_2317791_cms2_element', operation: 'create', roles: [cmsContentAdmin] })
Acl({ $id: Now.ID['acl_elm_write'], type: 'record', table: 'x_2317791_cms2_element', operation: 'write', roles: [cmsContentAdmin] })
Acl({ $id: Now.ID['acl_elm_delete'], type: 'record', table: 'x_2317791_cms2_element', operation: 'delete', roles: [cmsAdmin] })

// Element PL Descriptor
Acl({ $id: Now.ID['acl_pld_read_user'], type: 'record', table: 'x_2317791_cms2_pl_descriptor', operation: 'read', roles: [cmsUser], condition: PUBLISHED, description: 'CMS Users read Published PL descriptors.' })
Acl({ $id: Now.ID['acl_pld_read_admin'], type: 'record', table: 'x_2317791_cms2_pl_descriptor', operation: 'read', roles: [cmsContentAdmin, cmsRoleProfileAdmin] })
Acl({ $id: Now.ID['acl_pld_create'], type: 'record', table: 'x_2317791_cms2_pl_descriptor', operation: 'create', roles: [cmsContentAdmin] })
Acl({ $id: Now.ID['acl_pld_write'], type: 'record', table: 'x_2317791_cms2_pl_descriptor', operation: 'write', roles: [cmsContentAdmin] })
Acl({ $id: Now.ID['acl_pld_delete'], type: 'record', table: 'x_2317791_cms2_pl_descriptor', operation: 'delete', roles: [cmsAdmin] })

// ---------------------------------------------------------------- Governed Content (base table)
// Cross-type lists ("Draft Content", "Published Content") query the base table.
// Editing always happens on the child record's own form, where the child
// table's ACLs above apply, so the base table only grants read (plus admin).
Acl({ $id: Now.ID['acl_gov_read_user'], type: 'record', table: 'x_2317791_cms2_governed', operation: 'read', roles: [cmsUser], condition: PUBLISHED, description: 'CMS Users read Published content in cross-type lists.' })
Acl({ $id: Now.ID['acl_gov_read_admin'], type: 'record', table: 'x_2317791_cms2_governed', operation: 'read', roles: [cmsContentAdmin, cmsRoleProfileAdmin] })
Acl({ $id: Now.ID['acl_gov_create'], type: 'record', table: 'x_2317791_cms2_governed', operation: 'create', roles: [cmsAdmin] })
Acl({ $id: Now.ID['acl_gov_write'], type: 'record', table: 'x_2317791_cms2_governed', operation: 'write', roles: [cmsAdmin] })
Acl({ $id: Now.ID['acl_gov_delete'], type: 'record', table: 'x_2317791_cms2_governed', operation: 'delete', roles: [cmsAdmin] })

// ---------------------------------------------------------------- framework version (CMS Admin owns versions)
Acl({ $id: Now.ID['acl_fwv_read_user'], type: 'record', table: 'x_2317791_cms2_fw_version', operation: 'read', roles: [cmsUser], condition: PUBLISHED })
Acl({ $id: Now.ID['acl_fwv_read_admin'], type: 'record', table: 'x_2317791_cms2_fw_version', operation: 'read', roles: [cmsContentAdmin, cmsRoleProfileAdmin] })
Acl({ $id: Now.ID['acl_fwv_create'], type: 'record', table: 'x_2317791_cms2_fw_version', operation: 'create', roles: [cmsAdmin] })
Acl({ $id: Now.ID['acl_fwv_write'], type: 'record', table: 'x_2317791_cms2_fw_version', operation: 'write', roles: [cmsAdmin] })
Acl({ $id: Now.ID['acl_fwv_delete'], type: 'record', table: 'x_2317791_cms2_fw_version', operation: 'delete', roles: [cmsAdmin] })

// ---------------------------------------------------------------- proficiency scale (configuration)
Acl({ $id: Now.ID['acl_pl_read'], type: 'record', table: 'x_2317791_cms2_prof_level', operation: 'read', roles: [cmsUser] })
Acl({ $id: Now.ID['acl_pl_create'], type: 'record', table: 'x_2317791_cms2_prof_level', operation: 'create', roles: [cmsAdmin] })
Acl({ $id: Now.ID['acl_pl_write'], type: 'record', table: 'x_2317791_cms2_prof_level', operation: 'write', roles: [cmsAdmin] })
Acl({ $id: Now.ID['acl_pl_delete'], type: 'record', table: 'x_2317791_cms2_prof_level', operation: 'delete', roles: [cmsAdmin] })

// ---------------------------------------------------------------- role profile
Acl({ $id: Now.ID['acl_rp_read_user'], type: 'record', table: 'x_2317791_cms2_role_profile', operation: 'read', roles: [cmsUser], condition: PUBLISHED, description: 'CMS Users read Published Role Profiles.' })
Acl({ $id: Now.ID['acl_rp_read_admin'], type: 'record', table: 'x_2317791_cms2_role_profile', operation: 'read', roles: [cmsRoleProfileAdmin, cmsContentAdmin], description: 'Content Admins see Draft Role Profiles to assess the impact of content changes.' })
Acl({ $id: Now.ID['acl_rp_create'], type: 'record', table: 'x_2317791_cms2_role_profile', operation: 'create', roles: [cmsRoleProfileAdmin] })
Acl({ $id: Now.ID['acl_rp_write'], type: 'record', table: 'x_2317791_cms2_role_profile', operation: 'write', roles: [cmsRoleProfileAdmin] })
Acl({ $id: Now.ID['acl_rp_delete'], type: 'record', table: 'x_2317791_cms2_role_profile', operation: 'delete', roles: [cmsAdmin] })

// ---------------------------------------------------------------- role profile element requirement
Acl({
    $id: Now.ID['acl_req_read_user'],
    type: 'record',
    table: 'x_2317791_cms2_requirement',
    operation: 'read',
    roles: [cmsUser],
    condition: 'active=true^role_profile.status=published^role_profile.active=true',
    description: 'CMS Users read requirements of Published Role Profiles.',
})
Acl({ $id: Now.ID['acl_req_read_admin'], type: 'record', table: 'x_2317791_cms2_requirement', operation: 'read', roles: [cmsRoleProfileAdmin, cmsContentAdmin] })
Acl({ $id: Now.ID['acl_req_create'], type: 'record', table: 'x_2317791_cms2_requirement', operation: 'create', roles: [cmsRoleProfileAdmin] })
Acl({ $id: Now.ID['acl_req_write'], type: 'record', table: 'x_2317791_cms2_requirement', operation: 'write', roles: [cmsRoleProfileAdmin] })
Acl({ $id: Now.ID['acl_req_delete'], type: 'record', table: 'x_2317791_cms2_requirement', operation: 'delete', roles: [cmsRoleProfileAdmin] })

// ---------------------------------------------------------------- prototype assignment
Acl({
    $id: Now.ID['acl_rpa_read_own'],
    type: 'record',
    table: 'x_2317791_cms2_rp_assignment',
    operation: 'read',
    roles: [cmsUser],
    script: `var u = current.getValue('user'); answer = u == gs.getUserName() || u == gs.getUserID();`,
    description: 'Employees read only their own prototype Role Profile assignment.',
})
Acl({ $id: Now.ID['acl_rpa_read_admin'], type: 'record', table: 'x_2317791_cms2_rp_assignment', operation: 'read', roles: [cmsRoleProfileAdmin] })
Acl({ $id: Now.ID['acl_rpa_create'], type: 'record', table: 'x_2317791_cms2_rp_assignment', operation: 'create', roles: [cmsRoleProfileAdmin] })
Acl({ $id: Now.ID['acl_rpa_write'], type: 'record', table: 'x_2317791_cms2_rp_assignment', operation: 'write', roles: [cmsRoleProfileAdmin] })
Acl({ $id: Now.ID['acl_rpa_delete'], type: 'record', table: 'x_2317791_cms2_rp_assignment', operation: 'delete', roles: [cmsRoleProfileAdmin] })

// ---------------------------------------------------------------- prototype employee proficiency (personal data)
Acl({
    $id: Now.ID['acl_prof_read_own'],
    type: 'record',
    table: 'x_2317791_cms2_proficiency',
    operation: 'read',
    roles: [cmsUser],
    script: `var u = current.getValue('user'); answer = u == gs.getUserName() || u == gs.getUserID();`,
    description: 'Employees read only their own current proficiency.',
})
Acl({ $id: Now.ID['acl_prof_read_admin'], type: 'record', table: 'x_2317791_cms2_proficiency', operation: 'read', roles: [cmsAdmin] })
Acl({ $id: Now.ID['acl_prof_create'], type: 'record', table: 'x_2317791_cms2_proficiency', operation: 'create', roles: [cmsAdmin] })
Acl({ $id: Now.ID['acl_prof_write'], type: 'record', table: 'x_2317791_cms2_proficiency', operation: 'write', roles: [cmsAdmin] })
Acl({ $id: Now.ID['acl_prof_delete'], type: 'record', table: 'x_2317791_cms2_proficiency', operation: 'delete', roles: [cmsAdmin] })
