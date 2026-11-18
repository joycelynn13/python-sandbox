import '@servicenow/sdk/global'
import { Role } from '@servicenow/sdk/core'

/**
 * CMS 2.0 scoped roles (least privilege).
 *
 *   admin ─┬─ content_admin ──────┐
 *          └─ role_profile_admin ─┴─ user
 *
 * Employees receive `user` (normally through a group); it only grants read
 * access to Published, currently effective content.
 */
export const cmsUser = Role({
    name: 'x_2317791_cms2.user',
    description:
        'CMS 2.0 User – browse Published, currently effective Role Profiles and the Competency Library.',
})

export const cmsContentAdmin = Role({
    name: 'x_2317791_cms2.content_admin',
    description:
        'CMS 2.0 Content Administrator – maintain Competency Groups, Domains, Elements and Element PL Descriptors (draft framework content).',
    containsRoles: [cmsUser, 'canvas_user'],
})

export const cmsRoleProfileAdmin = Role({
    name: 'x_2317791_cms2.role_profile_admin',
    description:
        'CMS 2.0 Role Profile Administrator / Function Lead – create Role Profiles, map Elements, classify Essential/Complementary, set Target PL and publish.',
    containsRoles: [cmsUser, 'canvas_user'],
})

export const cmsAdmin = Role({
    name: 'x_2317791_cms2.admin',
    description:
        'CMS 2.0 Administrator – full administration of the CMS 2.0 application, Framework Versions, PL scale and settings.',
    containsRoles: [cmsContentAdmin, cmsRoleProfileAdmin],
})
