import '@servicenow/sdk/global'
import { ApplicationMenu, Record } from '@servicenow/sdk/core'
import { cmsContentAdmin, cmsRoleProfileAdmin, cmsAdmin } from '../security/roles.now'

/*
 * One application menu for the whole bounded CMS 2.0 application. Visible to
 * administrators only – employees use the Employee Center pages, never forms.
 */


export const cmsMenu = ApplicationMenu({
    $id: Now.ID['cms2_menu'],
    title: 'CMS 2.0 – Competency Management',
    hint: 'HTX Competency Management System 2.0 – Competency Library and Role Profiles',
    description: 'Administration of the CMS 2.0 Competency Library, Role Profiles and Framework Versions.',
    roles: [cmsContentAdmin, cmsRoleProfileAdmin, cmsAdmin],
    active: true,
    order: 100,
})

Record({
    $id: Now.ID['mod_employee_view'],
    table: 'sys_app_module',
    data: {
        title: 'Employee View (Employee Center)',
        application: cmsMenu,
        link_type: 'DIRECT',
        query: 'esc?id=x_2317791_cms2_home',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 50,
    },
})

Record({
    $id: Now.ID['mod_workspace'],
    table: 'sys_app_module',
    data: {
        title: 'CMS Administration Workspace',
        application: cmsMenu,
        link_type: 'DIRECT',
        query: 'now/cms-admin/home',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 60,
    },
})

Record({
    $id: Now.ID['mod_sep_library'],
    table: 'sys_app_module',
    data: {
        title: 'Competency Library',
        application: cmsMenu,
        link_type: 'SEPARATOR',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 100,
    },
})

Record({
    $id: Now.ID['mod_groups'],
    table: 'sys_app_module',
    data: {
        title: 'Competency Groups',
        application: cmsMenu,
        link_type: 'LIST',
        name: 'x_2317791_cms2_comp_group',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 110,
    },
})

Record({
    $id: Now.ID['mod_domains'],
    table: 'sys_app_module',
    data: {
        title: 'Domains',
        application: cmsMenu,
        link_type: 'LIST',
        name: 'x_2317791_cms2_domain',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 120,
    },
})

Record({
    $id: Now.ID['mod_elements'],
    table: 'sys_app_module',
    data: {
        title: 'Elements',
        application: cmsMenu,
        link_type: 'LIST',
        name: 'x_2317791_cms2_element',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 130,
    },
})

Record({
    $id: Now.ID['mod_pl_descriptors'],
    table: 'sys_app_module',
    data: {
        title: 'PL Descriptors',
        application: cmsMenu,
        link_type: 'LIST',
        name: 'x_2317791_cms2_pl_descriptor',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 140,
    },
})

Record({
    $id: Now.ID['mod_sep_rp'],
    table: 'sys_app_module',
    data: {
        title: 'Role Profile Management',
        application: cmsMenu,
        link_type: 'SEPARATOR',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 200,
    },
})

Record({
    $id: Now.ID['mod_role_profiles'],
    table: 'sys_app_module',
    data: {
        title: 'Role Profiles',
        application: cmsMenu,
        link_type: 'LIST',
        name: 'x_2317791_cms2_role_profile',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 210,
    },
})

Record({
    $id: Now.ID['mod_requirements'],
    table: 'sys_app_module',
    data: {
        title: 'Element Requirements',
        application: cmsMenu,
        link_type: 'LIST',
        name: 'x_2317791_cms2_requirement',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 220,
    },
})

Record({
    $id: Now.ID['mod_assignments'],
    table: 'sys_app_module',
    data: {
        title: 'Prototype Role Profile Assignments',
        application: cmsMenu,
        link_type: 'LIST',
        name: 'x_2317791_cms2_rp_assignment',
        roles: ['x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 230,
    },
})

Record({
    $id: Now.ID['mod_sep_framework'],
    table: 'sys_app_module',
    data: {
        title: 'Framework Administration',
        application: cmsMenu,
        link_type: 'SEPARATOR',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 300,
    },
})

Record({
    $id: Now.ID['mod_fw_versions'],
    table: 'sys_app_module',
    data: {
        title: 'Framework Versions',
        application: cmsMenu,
        link_type: 'LIST',
        name: 'x_2317791_cms2_fw_version',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 310,
    },
})

Record({
    $id: Now.ID['mod_draft_elements'],
    table: 'sys_app_module',
    data: {
        title: 'Draft Content – Elements',
        application: cmsMenu,
        link_type: 'FILTER',
        name: 'x_2317791_cms2_element',
        filter: 'status=draft^active=true',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 320,
    },
})

Record({
    $id: Now.ID['mod_draft_descriptors'],
    table: 'sys_app_module',
    data: {
        title: 'Draft Content – PL Descriptors',
        application: cmsMenu,
        link_type: 'FILTER',
        name: 'x_2317791_cms2_pl_descriptor',
        filter: 'status=draft^active=true',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 330,
    },
})

Record({
    $id: Now.ID['mod_draft_rps'],
    table: 'sys_app_module',
    data: {
        title: 'Draft Content – Role Profiles',
        application: cmsMenu,
        link_type: 'FILTER',
        name: 'x_2317791_cms2_role_profile',
        filter: 'status=draft^active=true',
        roles: ['x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 340,
    },
})

Record({
    $id: Now.ID['mod_pub_elements'],
    table: 'sys_app_module',
    data: {
        title: 'Published Content – Elements (effective)',
        application: cmsMenu,
        link_type: 'FILTER',
        name: 'x_2317791_cms2_element',
        filter: 'status=published^active=true^effective_from<=javascript:gs.endOfToday()^effective_toISEMPTY^ORestive_to>=javascript:gs.beginningOfToday()',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 350,
    },
})

Record({
    $id: Now.ID['mod_pub_descriptors'],
    table: 'sys_app_module',
    data: {
        title: 'Published Content – PL Descriptors (effective)',
        application: cmsMenu,
        link_type: 'FILTER',
        name: 'x_2317791_cms2_pl_descriptor',
        filter: 'status=published^active=true^effective_from<=javascript:gs.endOfToday()^effective_toISEMPTY^ORestive_to>=javascript:gs.beginningOfToday()',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 360,
    },
})

Record({
    $id: Now.ID['mod_pub_rps'],
    table: 'sys_app_module',
    data: {
        title: 'Published Content – Role Profiles (effective)',
        application: cmsMenu,
        link_type: 'FILTER',
        name: 'x_2317791_cms2_role_profile',
        filter: 'status=published^active=true^effective_from<=javascript:gs.endOfToday()^effective_toISEMPTY^ORestive_to>=javascript:gs.beginningOfToday()',
        roles: ['x_2317791_cms2.content_admin', 'x_2317791_cms2.role_profile_admin', 'x_2317791_cms2.admin'],
        active: true,
        order: 370,
    },
})

Record({
    $id: Now.ID['mod_sep_config'],
    table: 'sys_app_module',
    data: {
        title: 'Configuration',
        application: cmsMenu,
        link_type: 'SEPARATOR',
        roles: ['x_2317791_cms2.admin'],
        active: true,
        order: 400,
    },
})

Record({
    $id: Now.ID['mod_settings'],
    table: 'sys_app_module',
    data: {
        title: 'CMS Settings',
        application: cmsMenu,
        link_type: 'FILTER',
        name: 'sys_properties',
        filter: 'nameSTARTSWITHx_2317791_cms2.',
        roles: ['x_2317791_cms2.admin'],
        active: true,
        order: 410,
    },
})

Record({
    $id: Now.ID['mod_levels'],
    table: 'sys_app_module',
    data: {
        title: 'Proficiency Levels',
        application: cmsMenu,
        link_type: 'LIST',
        name: 'x_2317791_cms2_prof_level',
        roles: ['x_2317791_cms2.admin'],
        active: true,
        order: 420,
    },
})
