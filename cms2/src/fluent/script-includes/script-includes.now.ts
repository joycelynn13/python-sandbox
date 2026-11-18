import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

// Bridges required by platform features that call Script Includes by name
// (Service Portal widget server scripts, UI Actions). Logic stays in src/server.

ScriptInclude({
    $id: Now.ID['si_cms_catalog_api'],
    name: 'CmsCatalogApi',
    description: 'Read-only CMS 2.0 catalog API for the employee experience (bridge to src/server/cms-catalog.ts).',
    script: Now.include('../../script-includes/CmsCatalogApi.js'),
    accessibleFrom: 'package_private',
})

ScriptInclude({
    $id: Now.ID['si_cms_admin_actions'],
    name: 'CmsAdminActions',
    description: 'Publish / retire / new-version / validate actions for CMS 2.0 administrators (bridge to src/server/cms-rules.ts).',
    script: Now.include('../../script-includes/CmsAdminActions.js'),
    accessibleFrom: 'package_private',
})
