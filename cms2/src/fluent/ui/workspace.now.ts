import '@servicenow/sdk/global'
import { Workspace, UxListMenuConfig, Applicability, Dashboard, Acl } from '@servicenow/sdk/core'
import { cmsContentAdmin, cmsRoleProfileAdmin, cmsAdmin } from '../security/roles.now'

/*
 * CMS Administration Workspace – one configurable workspace for all CMS
 * content management (not one per module). URL: /now/cms-admin/home
 */

const adminAudience = Applicability({
    $id: Now.ID['cms2_ws_applicability_admins'],
    name: 'CMS 2.0 Administrators',
    roles: [cmsContentAdmin, cmsRoleProfileAdmin, cmsAdmin],
})

const roleProfileAudience = Applicability({
    $id: Now.ID['cms2_ws_applicability_rp'],
    name: 'CMS 2.0 Role Profile Administrators',
    roles: [cmsRoleProfileAdmin, cmsAdmin],
})

const listConfig = UxListMenuConfig({
    $id: Now.ID['cms2_ws_list_config'],
    name: 'CMS Administration Workspace Lists',
    description: 'Navigation for the CMS Administration Workspace',
    categories: [
        {
            $id: Now.ID['cms2_ws_cat_library'],
            title: 'Competency Library',
            order: 10,
            lists: [
                {
                    $id: Now.ID['cms2_ws_list_groups'],
                    title: 'Competency Groups',
                    order: 10,
                    table: 'x_2317791_cms2_comp_group',
                    condition: 'active=true^ORDERBYsequence',
                    columns: 'code,name,status,framework_version,effective_from,effective_to',
                    applicabilities: [{ $id: Now.ID['cms2_ws_list_groups_app'], applicability: adminAudience }],
                },
                {
                    $id: Now.ID['cms2_ws_list_domains'],
                    title: 'Domains',
                    order: 20,
                    table: 'x_2317791_cms2_domain',
                    condition: 'active=true^ORDERBYcompetency_group^ORDERBYsequence',
                    columns: 'code,name,competency_group,owner,sme,status,framework_version,effective_from',
                    applicabilities: [{ $id: Now.ID['cms2_ws_list_domains_app'], applicability: adminAudience }],
                },
                {
                    $id: Now.ID['cms2_ws_list_elements'],
                    title: 'Elements',
                    order: 30,
                    table: 'x_2317791_cms2_element',
                    condition: 'active=true^ORDERBYdomain^ORDERBYsequence',
                    columns: 'code,name,domain,status,framework_version,effective_from,effective_to',
                    applicabilities: [{ $id: Now.ID['cms2_ws_list_elements_app'], applicability: adminAudience }],
                },
                {
                    $id: Now.ID['cms2_ws_list_descriptors'],
                    title: 'PL Descriptors',
                    order: 40,
                    table: 'x_2317791_cms2_pl_descriptor',
                    condition: 'active=true^ORDERBYelement^ORDERBYproficiency_level',
                    columns: 'element,proficiency_level,description,status,framework_version,effective_from',
                    applicabilities: [{ $id: Now.ID['cms2_ws_list_descriptors_app'], applicability: adminAudience }],
                },
                {
                    $id: Now.ID['cms2_ws_list_draft_content'],
                    title: 'All Draft Content',
                    order: 50,
                    table: 'x_2317791_cms2_governed',
                    condition: 'status=draft^active=true^ORDERBYsys_class_name',
                    columns: 'sys_class_name,code,name,framework_version,supersedes,sys_updated_on',
                    applicabilities: [{ $id: Now.ID['cms2_ws_list_draft_content_app'], applicability: adminAudience }],
                },
            ],
        },
        {
            $id: Now.ID['cms2_ws_cat_rp'],
            title: 'Role Profiles',
            order: 20,
            lists: [
                {
                    $id: Now.ID['cms2_ws_list_rp_draft'],
                    title: 'Draft Role Profiles',
                    order: 10,
                    table: 'x_2317791_cms2_role_profile',
                    condition: 'status=draft^active=true',
                    columns: 'code,name,business_function,job_family,framework_version,version,owner',
                    applicabilities: [{ $id: Now.ID['cms2_ws_list_rp_draft_app'], applicability: roleProfileAudience }],
                },
                {
                    $id: Now.ID['cms2_ws_list_rp_published'],
                    title: 'Published Role Profiles',
                    order: 20,
                    table: 'x_2317791_cms2_role_profile',
                    condition: 'status=published^active=true',
                    columns: 'code,name,business_function,job_family,version,effective_from,effective_to',
                    applicabilities: [{ $id: Now.ID['cms2_ws_list_rp_published_app'], applicability: adminAudience }],
                },
                {
                    $id: Now.ID['cms2_ws_list_rp_all'],
                    title: 'All Role Profiles',
                    order: 30,
                    table: 'x_2317791_cms2_role_profile',
                    condition: '',
                    columns: 'code,name,status,business_function,version,effective_from,effective_to',
                    applicabilities: [{ $id: Now.ID['cms2_ws_list_rp_all_app'], applicability: adminAudience }],
                },
                {
                    $id: Now.ID['cms2_ws_list_requirements'],
                    title: 'Element Requirements',
                    order: 40,
                    table: 'x_2317791_cms2_requirement',
                    condition: 'active=true^ORDERBYrole_profile^ORDERBYsequence',
                    columns: 'role_profile,element,element.domain,requirement_type,target_level,role_profile.status',
                    applicabilities: [{ $id: Now.ID['cms2_ws_list_requirements_app'], applicability: adminAudience }],
                },
                {
                    $id: Now.ID['cms2_ws_list_impact'],
                    title: 'Affected Role Profiles (by Element)',
                    order: 50,
                    table: 'x_2317791_cms2_requirement',
                    condition: 'active=true^role_profile.status=published^ORDERBYelement',
                    columns: 'element,element.status,role_profile,requirement_type,target_level',
                    applicabilities: [{ $id: Now.ID['cms2_ws_list_impact_app'], applicability: adminAudience }],
                },
            ],
        },
        {
            $id: Now.ID['cms2_ws_cat_framework'],
            title: 'Framework Administration',
            order: 30,
            lists: [
                {
                    $id: Now.ID['cms2_ws_list_fw'],
                    title: 'Framework Versions',
                    order: 10,
                    table: 'x_2317791_cms2_fw_version',
                    condition: '',
                    columns: 'name,version_number,status,effective_from,effective_to',
                    applicabilities: [{ $id: Now.ID['cms2_ws_list_fw_app'], applicability: adminAudience }],
                },
                {
                    $id: Now.ID['cms2_ws_list_levels'],
                    title: 'Proficiency Levels',
                    order: 20,
                    table: 'x_2317791_cms2_prof_level',
                    condition: 'ORDERBYlevel',
                    columns: 'level,code,label,active',
                    applicabilities: [{ $id: Now.ID['cms2_ws_list_levels_app'], applicability: adminAudience }],
                },
            ],
        },
    ],
})

export const cmsAdminWorkspace = Workspace({
    $id: Now.ID['cms2_admin_workspace'],
    title: 'CMS Administration Workspace',
    path: 'cms-admin',
    tables: [
        'x_2317791_cms2_governed',
        'x_2317791_cms2_fw_version',
        'x_2317791_cms2_comp_group',
        'x_2317791_cms2_domain',
        'x_2317791_cms2_element',
        'x_2317791_cms2_pl_descriptor',
        'x_2317791_cms2_role_profile',
        'x_2317791_cms2_requirement',
        'x_2317791_cms2_prof_level',
    ],
    listConfig: listConfig,
})

Acl({
    $id: Now.ID['cms2_admin_workspace_acl'],
    localOrExisting: 'Existing',
    type: 'ux_route',
    operation: 'read',
    roles: [cmsContentAdmin, cmsRoleProfileAdmin, cmsAdmin],
    name: 'now.cms-admin.*', // ux_route ACL names are now.<workspace path>.*
    description: 'Only CMS administrators can open the CMS Administration Workspace.',
})

Dashboard({
    $id: Now.ID['cms2_admin_dashboard'],
    name: 'CMS Administration Overview',
    tabs: [
        {
            $id: Now.ID['cms2_dash_tab_overview'],
            name: 'Overview',
            widgets: [
                {
                    $id: Now.ID['cms2_dash_w_draft_elements'],
                    component: 'single-score',
                    componentProps: {
                        dataSources: [
                            { label: 'Element', sourceType: 'table', tableOrViewName: 'x_2317791_cms2_element', filterQuery: 'status=draft^active=true', id: 'ds_draft_elements' },
                        ],
                        headerTitle: 'Draft Elements',
                        metrics: [{ dataSource: 'ds_draft_elements', id: 'm_draft_elements', aggregateFunction: 'COUNT', axisId: 'primary' }],
                    },
                    height: 12,
                    width: 16,
                    position: { x: 0, y: 0 },
                },
                {
                    $id: Now.ID['cms2_dash_w_draft_rps'],
                    component: 'single-score',
                    componentProps: {
                        dataSources: [
                            { label: 'Role Profile', sourceType: 'table', tableOrViewName: 'x_2317791_cms2_role_profile', filterQuery: 'status=draft^active=true', id: 'ds_draft_rps' },
                        ],
                        headerTitle: 'Draft Role Profiles',
                        metrics: [{ dataSource: 'ds_draft_rps', id: 'm_draft_rps', aggregateFunction: 'COUNT', axisId: 'primary' }],
                    },
                    height: 12,
                    width: 16,
                    position: { x: 16, y: 0 },
                },
                {
                    $id: Now.ID['cms2_dash_w_published_rps'],
                    component: 'single-score',
                    componentProps: {
                        dataSources: [
                            { label: 'Role Profile', sourceType: 'table', tableOrViewName: 'x_2317791_cms2_role_profile', filterQuery: 'status=published^active=true', id: 'ds_pub_rps' },
                        ],
                        headerTitle: 'Published Role Profiles',
                        metrics: [{ dataSource: 'ds_pub_rps', id: 'm_pub_rps', aggregateFunction: 'COUNT', axisId: 'primary' }],
                    },
                    height: 12,
                    width: 16,
                    position: { x: 32, y: 0 },
                },
                {
                    $id: Now.ID['cms2_dash_w_elements_by_status'],
                    component: 'vertical-bar',
                    componentProps: {
                        dataSources: [
                            { label: 'Element', sourceType: 'table', tableOrViewName: 'x_2317791_cms2_element', filterQuery: 'active=true', id: 'ds_elements' },
                        ],
                        headerTitle: 'Elements by Status',
                        metrics: [{ dataSource: 'ds_elements', id: 'm_elements', aggregateFunction: 'COUNT', axisId: 'primary' }],
                        groupBy: [{ groupBy: [{ dataSource: 'ds_elements', groupByField: 'status' }], maxNumberOfGroups: 5, showOthers: false }],
                        sortBy: 'value',
                    },
                    height: 16,
                    width: 24,
                    position: { x: 0, y: 12 },
                },
                {
                    $id: Now.ID['cms2_dash_w_req_by_type'],
                    component: 'donut',
                    componentProps: {
                        dataSources: [
                            { label: 'Requirement', sourceType: 'table', tableOrViewName: 'x_2317791_cms2_requirement', filterQuery: 'active=true^role_profile.status=published', id: 'ds_reqs' },
                        ],
                        headerTitle: 'Published Requirements: Essential vs Complementary',
                        metrics: [{ dataSource: 'ds_reqs', id: 'm_reqs', aggregateFunction: 'COUNT', axisId: 'primary' }],
                        groupBy: [{ groupBy: [{ dataSource: 'ds_reqs', groupByField: 'requirement_type' }], maxNumberOfGroups: 5, showOthers: false }],
                    },
                    height: 16,
                    width: 24,
                    position: { x: 24, y: 12 },
                },
            ],
        },
    ],
    visibilities: [{ $id: Now.ID['cms2_dash_visibility'], experience: cmsAdminWorkspace }],
    permissions: [],
})
