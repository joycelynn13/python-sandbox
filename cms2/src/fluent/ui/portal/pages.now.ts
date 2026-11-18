import '@servicenow/sdk/global'
import { SPPage } from '@servicenow/sdk/core'
import { cmsUser } from '../../security/roles.now'
import { navWidget, landingWidget, rpBrowseWidget, rpDetailWidget, libraryWidget, elementDetailWidget } from './widgets.now'

// Pages are portal-independent; they are opened inside Employee Center (/esc?id=<pageId>)
// so employees get the standard EC header, theme and navigation.

export const page_home = SPPage({
    pageId: 'x_2317791_cms2_home',
    title: 'CMS 2.0 – Competency Management',
    shortDescription: 'CMS landing page',
    category: 'custom',
    roles: [cmsUser],
    containers: [
        {
            $id: Now.ID['spp_home_container'],
            name: 'CMS 2.0 – Competency Management – main',
            width: 'container',
            semanticTag: 'main',
            order: 1,
            rows: [
                {
                    $id: Now.ID['spp_home_row'],
                    order: 1,
                    columns: [
                        {
                            $id: Now.ID['spp_home_col'],
                            size: 12,
                            order: 1,
                            instances: [
                                { $id: Now.ID['spp_home_nav'], widget: navWidget, order: 1 },
                                { $id: Now.ID['spp_home_main'], widget: landingWidget, order: 2 },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
})

export const page_role_profiles = SPPage({
    pageId: 'x_2317791_cms2_role_profiles',
    title: 'CMS 2.0 – Role Profiles',
    shortDescription: 'Browse Role Profiles',
    category: 'custom',
    roles: [cmsUser],
    containers: [
        {
            $id: Now.ID['spp_role_profiles_container'],
            name: 'CMS 2.0 – Role Profiles – main',
            width: 'container',
            semanticTag: 'main',
            order: 1,
            rows: [
                {
                    $id: Now.ID['spp_role_profiles_row'],
                    order: 1,
                    columns: [
                        {
                            $id: Now.ID['spp_role_profiles_col'],
                            size: 12,
                            order: 1,
                            instances: [
                                { $id: Now.ID['spp_role_profiles_nav'], widget: navWidget, order: 1 },
                                { $id: Now.ID['spp_role_profiles_main'], widget: rpBrowseWidget, order: 2 },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
})

export const page_role_profile = SPPage({
    pageId: 'x_2317791_cms2_role_profile',
    title: 'CMS 2.0 – Role Profile',
    shortDescription: 'Role Profile detail (?sys_id=)',
    category: 'custom',
    roles: [cmsUser],
    containers: [
        {
            $id: Now.ID['spp_role_profile_container'],
            name: 'CMS 2.0 – Role Profile – main',
            width: 'container',
            semanticTag: 'main',
            order: 1,
            rows: [
                {
                    $id: Now.ID['spp_role_profile_row'],
                    order: 1,
                    columns: [
                        {
                            $id: Now.ID['spp_role_profile_col'],
                            size: 12,
                            order: 1,
                            instances: [
                                { $id: Now.ID['spp_role_profile_nav'], widget: navWidget, order: 1 },
                                { $id: Now.ID['spp_role_profile_main'], widget: rpDetailWidget, order: 2 },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
})

export const page_library = SPPage({
    pageId: 'x_2317791_cms2_library',
    title: 'CMS 2.0 – Competency Library',
    shortDescription: 'Competency Library',
    category: 'custom',
    roles: [cmsUser],
    containers: [
        {
            $id: Now.ID['spp_library_container'],
            name: 'CMS 2.0 – Competency Library – main',
            width: 'container',
            semanticTag: 'main',
            order: 1,
            rows: [
                {
                    $id: Now.ID['spp_library_row'],
                    order: 1,
                    columns: [
                        {
                            $id: Now.ID['spp_library_col'],
                            size: 12,
                            order: 1,
                            instances: [
                                { $id: Now.ID['spp_library_nav'], widget: navWidget, order: 1 },
                                { $id: Now.ID['spp_library_main'], widget: libraryWidget, order: 2 },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
})

export const page_element = SPPage({
    pageId: 'x_2317791_cms2_element',
    title: 'CMS 2.0 – Element',
    shortDescription: 'Element detail (?sys_id=)',
    category: 'custom',
    roles: [cmsUser],
    containers: [
        {
            $id: Now.ID['spp_element_container'],
            name: 'CMS 2.0 – Element – main',
            width: 'container',
            semanticTag: 'main',
            order: 1,
            rows: [
                {
                    $id: Now.ID['spp_element_row'],
                    order: 1,
                    columns: [
                        {
                            $id: Now.ID['spp_element_col'],
                            size: 12,
                            order: 1,
                            instances: [
                                { $id: Now.ID['spp_element_nav'], widget: navWidget, order: 1 },
                                { $id: Now.ID['spp_element_main'], widget: elementDetailWidget, order: 2 },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
})
