import '@servicenow/sdk/global'
import { CrossScopePrivilege } from '@servicenow/sdk/core'

/*
 * Minimum cross-scope privileges for CMS 2.0, declared explicitly instead of
 * relying on runtime-access "tracking" auto-grants. Each one was observed in
 * the ATF run and is read/execute only – there are NO cross-scope create,
 * write or delete privileges, and nothing on Skills Management tables.
 *
 * | Target                     | Op      | Why                                                        |
 * |----------------------------|---------|------------------------------------------------------------|
 * | sys_user                   | read    | display Domain Owner / SME / Role Profile Owner names       |
 * | Glide API: properties      | execute | gs.getProperty() for the CMS requirement-limit settings     |
 * | GlideRecordSecure.getValue | execute | ACL-enforced reads in the employee catalog API              |
 * | ScopedGlideElement         | execute | dot-walked display values (Element → Domain → Group)        |
 * | GlideRecord.setValue/insert/update | execute | versioning: clone-to-draft, publish, end-date predecessors |
 * | Glide API: user roles and groups   | execute | gs.hasRole() – admin-only status filter in the catalog API |
 * | --- used by the ATF suite only ---                                                                     |
 * | Glide API: string utilities        | execute | gs.generateGUID() for unique fixture version numbers       |
 * | StepResult.setOutputMessage        | execute | ATF step result messages                                   |
 * | sys_app_application, sys_app_module | read   | T09 verifies the CMS menu/modules are hidden from employees |
 *
 * Script-API privileges (target type "scriptable") are how the platform's
 * runtime access tracking records use of global APIs from a scope; they grant
 * no data access.
 */

CrossScopePrivilege({
    $id: Now.ID['csp_sys_user_read'],
    operation: 'read',
    status: 'allowed',
    targetName: 'sys_user',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['csp_properties_execute'],
    operation: 'execute',
    status: 'allowed',
    targetName: 'Glide API: properties',
    targetScope: 'global',
    targetType: 'scriptable',
})

CrossScopePrivilege({
    $id: Now.ID['csp_grs_getvalue_execute'],
    operation: 'execute',
    status: 'allowed',
    targetName: 'GlideRecordSecure.getValue',
    targetScope: 'global',
    targetType: 'scriptable',
})

CrossScopePrivilege({
    $id: Now.ID['csp_scoped_element_execute'],
    operation: 'execute',
    status: 'allowed',
    targetName: 'ScopedGlideElement',
    targetScope: 'global',
    targetType: 'scriptable',
})

CrossScopePrivilege({
    $id: Now.ID['csp_gr_setvalue'],
    operation: 'execute',
    status: 'allowed',
    targetName: 'GlideRecord.setValue',
    targetScope: 'global',
    targetType: 'scriptable',
})

CrossScopePrivilege({
    $id: Now.ID['csp_gr_insert'],
    operation: 'execute',
    status: 'allowed',
    targetName: 'GlideRecord.insert',
    targetScope: 'global',
    targetType: 'scriptable',
})

CrossScopePrivilege({
    $id: Now.ID['csp_gr_update'],
    operation: 'execute',
    status: 'allowed',
    targetName: 'GlideRecord.update',
    targetScope: 'global',
    targetType: 'scriptable',
})

CrossScopePrivilege({
    $id: Now.ID['csp_user_roles'],
    operation: 'execute',
    status: 'allowed',
    targetName: 'Glide API: user roles and groups',
    targetScope: 'global',
    targetType: 'scriptable',
})

CrossScopePrivilege({
    $id: Now.ID['csp_string_utils'],
    operation: 'execute',
    status: 'allowed',
    targetName: 'Glide API: string utilities',
    targetScope: 'global',
    targetType: 'scriptable',
})

CrossScopePrivilege({
    $id: Now.ID['csp_step_result'],
    operation: 'execute',
    status: 'allowed',
    targetName: 'StepResult.setOutputMessage',
    targetScope: 'global',
    targetType: 'scriptable',
})

CrossScopePrivilege({
    $id: Now.ID['csp_app_menu_read'],
    operation: 'read',
    status: 'allowed',
    targetName: 'sys_app_application',
    targetScope: 'global',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['csp_app_module_read'],
    operation: 'read',
    status: 'allowed',
    targetName: 'sys_app_module',
    targetScope: 'global',
    targetType: 'sys_db_object',
})
