import '@servicenow/sdk/global'
import { SPWidget } from '@servicenow/sdk/core'
import { cmsUser } from '../../security/roles.now'

// Employee-facing widgets. Server scripts call the CmsCatalogApi bridge only;
// data access is ACL-enforced (GlideRecordSecure) inside src/server/cms-catalog.ts.

export const navWidget = SPWidget({
    $id: Now.ID['spw_nav'],
    id: 'x_2317791_cms2_nav',
    name: 'CMS 2.0 – Navigation',
    htmlTemplate: Now.include('./widgets/nav/template.html'),
    clientScript: Now.include('./widgets/nav/client.js'),
    customCss: Now.include('./widgets/nav/styles.scss'),
    roles: [cmsUser],
    hasPreview: false,
})

export const landingWidget = SPWidget({
    $id: Now.ID['spw_landing'],
    id: 'x_2317791_cms2_landing',
    name: 'CMS 2.0 – Landing',
    htmlTemplate: Now.include('./widgets/landing/template.html'),
    serverScript: Now.include('./widgets/landing/server.js'),
    clientScript: Now.include('./widgets/landing/client.js'),
    customCss: Now.include('./widgets/landing/styles.scss'),
    roles: [cmsUser],
    hasPreview: false,
})

export const rpBrowseWidget = SPWidget({
    $id: Now.ID['spw_rp_browse'],
    id: 'x_2317791_cms2_rp_browse',
    name: 'CMS 2.0 – Browse Role Profiles',
    htmlTemplate: Now.include('./widgets/rp-browse/template.html'),
    serverScript: Now.include('./widgets/rp-browse/server.js'),
    clientScript: Now.include('./widgets/rp-browse/client.js'),
    customCss: Now.include('./widgets/rp-browse/styles.scss'),
    roles: [cmsUser],
    hasPreview: false,
})

export const rpDetailWidget = SPWidget({
    $id: Now.ID['spw_rp_detail'],
    id: 'x_2317791_cms2_rp_detail',
    name: 'CMS 2.0 – Role Profile Detail',
    htmlTemplate: Now.include('./widgets/rp-detail/template.html'),
    serverScript: Now.include('./widgets/rp-detail/server.js'),
    clientScript: Now.include('./widgets/rp-detail/client.js'),
    customCss: Now.include('./widgets/rp-detail/styles.scss'),
    roles: [cmsUser],
    hasPreview: false,
})

export const libraryWidget = SPWidget({
    $id: Now.ID['spw_library'],
    id: 'x_2317791_cms2_library',
    name: 'CMS 2.0 – Competency Library',
    htmlTemplate: Now.include('./widgets/library/template.html'),
    serverScript: Now.include('./widgets/library/server.js'),
    clientScript: Now.include('./widgets/library/client.js'),
    customCss: Now.include('./widgets/library/styles.scss'),
    roles: [cmsUser],
    hasPreview: false,
})

export const elementDetailWidget = SPWidget({
    $id: Now.ID['spw_element_detail'],
    id: 'x_2317791_cms2_element_detail',
    name: 'CMS 2.0 – Element Detail',
    htmlTemplate: Now.include('./widgets/element-detail/template.html'),
    serverScript: Now.include('./widgets/element-detail/server.js'),
    clientScript: Now.include('./widgets/element-detail/client.js'),
    customCss: Now.include('./widgets/element-detail/styles.scss'),
    roles: [cmsUser],
    hasPreview: false,
})
