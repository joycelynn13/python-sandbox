#!/usr/bin/env python3
"""
Generates src/fluent/tests/cms-atf.now.ts – the CMS 2.0 ATF suite.

ATF step scripts must be literal strings in Fluent (no interpolation), so the shared
fixture is inlined by this generator. Re-run after editing: python3 tools/generate-atf.py

Design:
 * every test creates its own users with CMS roles (never impersonates an existing user);
 * fixture records are created through GlideRecordSecure as a CMS Administrator test user,
   so business rules and ACLs are exercised; ATF rolls everything back after each test;
 * fixture codes start with ATF- so they never collide with demo data;
 * all steps are server-side, so the suite runs headless via the CI/CD API.
"""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HELPERS = r"""
var P = 'x_2317791_cms2_';
var fails = [];
function check(ok, msg) { if (!ok) fails.push(msg); }
function today() { return new GlideDateTime().getLocalDate().getValue(); }
function plusDays(n) { var g = new GlideDateTime(); g.addDaysLocalTime(n); return g.getLocalDate().getValue(); }
function lvl(n) { var g = new GlideRecord(P + 'prof_level'); g.addQuery('level', n); g.query(); return g.next() ? g.getUniqueValue() : ''; }
function byCode(t, code) { var g = new GlideRecord(P + t); g.addQuery('code', code); g.orderByDesc('sys_created_on'); g.query(); return g.next() ? g.getUniqueValue() : ''; }
function ins(t, vals) {
    var g = new GlideRecordSecure(P + t); g.initialize();
    for (var k in vals) g.setValue(k, vals[k]);
    return g.insert() || '';
}
function upd(t, id, vals) {
    var g = new GlideRecordSecure(P + t);
    if (!g.get(id)) return false;
    for (var k in vals) g.setValue(k, vals[k]);
    return !!g.update();
}
function finish() {
    stepResult.setOutputMessage(fails.length ? 'FAILED: ' + fails.join(' | ') : 'All checks passed');
    return fails.length === 0;
}
"""

FIXTURE = r"""
// ---- fixture (runs as a CMS Administrator test user) ----
var t0 = today();
var fw = ins('fw_version', { name: 'ATF Framework', version_number: 'ATF-' + gs.generateGUID().substring(0, 8), status: 'draft' });
check(!!fw, 'fixture: framework version insert');
check(upd('fw_version', fw, { status: 'published', effective_from: t0 }), 'fixture: publish framework version');
var base = { framework_version: fw, status: 'published', effective_from: t0, active: true };
function pub(extra) { var o = {}; for (var a in base) o[a] = base[a]; for (var b in extra) o[b] = extra[b]; return o; }
var grp = ins('comp_group', pub({ code: 'ATF-GRP', name: 'ATF Group', sequence: 1 }));
var dom = ins('domain', pub({ code: 'ATF-DOM', name: 'ATF Domain', competency_group: grp }));
var el4 = ins('element', pub({ code: 'ATF-EL', name: 'ATF Element PL1-4', domain: dom, descriptor: 'ATF element without PL5' }));
var el5 = ins('element', pub({ code: 'ATF-EL5', name: 'ATF Element PL1-5', domain: dom, descriptor: 'ATF element with PL5' }));
for (var i = 1; i <= 5; i++) {
    if (i <= 4) check(!!ins('pl_descriptor', pub({ element: el4, proficiency_level: lvl(i), descriptor: 'ATF EL PL' + i })), 'fixture: EL PL' + i);
    check(!!ins('pl_descriptor', pub({ element: el5, proficiency_level: lvl(i), descriptor: 'ATF EL5 PL' + i })), 'fixture: EL5 PL' + i);
}
var elDraft = ins('element', { code: 'ATF-EL-D', name: 'ATF Draft Element', domain: dom, framework_version: fw, status: 'draft', active: true });
check(!!ins('pl_descriptor', { element: elDraft, proficiency_level: lvl(1), descriptor: 'ATF draft PL1', framework_version: fw, status: 'draft', active: true }), 'fixture: draft descriptor');
check(grp && dom && el4 && el5 && elDraft, 'fixture: content created');
"""

def script(body, fixture=False):
    inner = HELPERS + (FIXTURE if fixture else '') + body + '\nreturn finish();\n'
    assert '`' not in inner and '${' not in inner
    ind = '\n'.join('    ' + l if l.strip() else '' for l in inner.strip('\n').split('\n'))
    return '(function (outputs, steps, params, stepResult, assertEqual) {\n' + ind + '\n})(outputs, steps, params, stepResult, assertEqual);'

LOOKUP = r"""
var fw = (function () { var g = new GlideRecord(P + 'fw_version'); g.addQuery('version_number', 'STARTSWITH', 'ATF-'); g.orderByDesc('sys_created_on'); g.query(); return g.next() ? g.getUniqueValue() : ''; })();
var el4 = byCode('element', 'ATF-EL'), el5 = byCode('element', 'ATF-EL5'), elDraft = byCode('element', 'ATF-EL-D'), dom = byCode('domain', 'ATF-DOM');
check(fw && el4 && el5 && elDraft && dom, 'fixture records found');
"""

tests = []
def test(key, name, desc, steps):
    tests.append((key, name, desc, steps))

# steps: list of ('user', roleVar) or ('script', key, body, fixture)
test('t01_user_reads_published', 'CMS2 T01 – CMS User can read Published Competency Library content',
     'A CMS User can read Published Competency Groups, Domains, Elements and PL descriptors.',
     [('user', 'cmsAdmin'), ('script', 'fixture', '', True), ('user', 'cmsUser'), ('script', 'assert', LOOKUP + r"""
var checks = [['comp_group', byCode('comp_group', 'ATF-GRP')], ['domain', dom], ['element', el4]];
for (var i = 0; i < checks.length; i++) {
    var g = new GlideRecordSecure(P + checks[i][0]);
    check(g.get(checks[i][1]) && g.canRead(), 'CMS User can read Published ' + checks[i][0]);
}
var d = new GlideRecordSecure(P + 'pl_descriptor'); d.addQuery('element', el4); d.query();
check(d.getRowCount() === 4, 'CMS User reads 4 Published PL descriptors (got ' + d.getRowCount() + ')');
var dr = new GlideRecordSecure(P + 'element');
check(!dr.get(elDraft), 'CMS User cannot read Draft Element');
""", False)])

test('t02_user_cannot_edit', 'CMS2 T02 – CMS User cannot edit Domains, Elements or PL descriptors',
     'Write and create are denied to the CMS User role by ACL.',
     [('user', 'cmsAdmin'), ('script', 'fixture', '', True), ('user', 'cmsUser'), ('script', 'assert', LOOKUP + r"""
var tables = [['domain', dom], ['element', el4]];
for (var i = 0; i < tables.length; i++) {
    var g = new GlideRecordSecure(P + tables[i][0]); g.get(tables[i][1]);
    check(!g.canWrite(), 'canWrite false on ' + tables[i][0]);
    g.setValue('name', 'hacked'); check(!g.update(), 'update blocked on ' + tables[i][0]);
}
var d = new GlideRecordSecure(P + 'pl_descriptor'); d.addQuery('element', el4); d.query(); d.next();
check(!d.canWrite(), 'canWrite false on pl_descriptor');
var tbls = ['domain', 'element', 'pl_descriptor', 'comp_group'];
for (var j = 0; j < tbls.length; j++) { var n = new GlideRecordSecure(P + tbls[j]); n.initialize(); check(!n.canCreate(), 'canCreate false on ' + tbls[j]); }
check(!ins('domain', { code: 'ATF-X', name: 'x', competency_group: byCode('comp_group', 'ATF-GRP'), framework_version: fw, status: 'draft' }), 'insert Domain denied');
""", False)])

test('t03_content_admin_drafts', 'CMS2 T03 – Content Administrator can create and update draft competency content',
     'Content Administrator creates a Draft Domain, Element and PL descriptor and updates the Element.',
     [('user', 'cmsAdmin'), ('script', 'fixture', '', True), ('user', 'cmsContentAdmin'), ('script', 'assert', LOOKUP + r"""
var d = ins('domain', { code: 'ATF-DOM2', name: 'ATF Draft Domain', competency_group: byCode('comp_group', 'ATF-GRP'), framework_version: fw, status: 'draft' });
check(!!d, 'create Draft Domain');
var e = ins('element', { code: 'ATF-EL-NEW', name: 'ATF New Element', domain: d, framework_version: fw, status: 'draft' });
check(!!e, 'create Draft Element');
check(!!ins('pl_descriptor', { element: e, proficiency_level: lvl(2), descriptor: 'draft PL2', framework_version: fw, status: 'draft' }), 'create Draft PL descriptor');
check(upd('element', e, { name: 'ATF New Element (renamed)', descriptor: 'updated' }), 'update Draft Element');
var g = new GlideRecord(P + 'element'); g.get(e);
check(g.getValue('status') === 'draft' && g.getValue('name') === 'ATF New Element (renamed)', 'Element stored as Draft with new name');
check(!upd('element', el4, { descriptor: 'edit published in place' }), 'Published Element cannot be edited in place');
""", False)])

test('t04_rp_admin_creates_draft', 'CMS2 T04 – Role Profile Administrator can create a draft Role Profile',
     'Role Profile Administrator creates a Draft Role Profile.',
     [('user', 'cmsAdmin'), ('script', 'fixture', '', True), ('user', 'cmsRoleProfileAdmin'), ('script', 'assert', LOOKUP + r"""
var rp = ins('role_profile', { code: 'RP-ATF-1', name: 'ATF Role Profile', business_function: 'xDigital', job_family: 'ATF', framework_version: fw });
check(!!rp, 'create Role Profile');
var g = new GlideRecord(P + 'role_profile'); g.get(rp);
check(g.getValue('status') === 'draft', 'new Role Profile defaults to Draft');
var n = new GlideRecordSecure(P + 'element'); n.initialize(); check(!n.canCreate(), 'Role Profile Admin cannot create Elements');
""", False)])

test('t05_rp_admin_adds_requirements', 'CMS2 T05 – Role Profile Administrator can add Essential and Complementary requirements',
     'Requirements of both types are stored on a Draft Role Profile; duplicates are rejected.',
     [('user', 'cmsAdmin'), ('script', 'fixture', '', True), ('user', 'cmsRoleProfileAdmin'), ('script', 'assert', LOOKUP + r"""
var rp = ins('role_profile', { code: 'RP-ATF-2', name: 'ATF RP 2', business_function: 'xDigital', framework_version: fw });
check(!!ins('requirement', { role_profile: rp, element: el4, requirement_type: 'essential', target_level: lvl(3) }), 'add Essential requirement');
check(!!ins('requirement', { role_profile: rp, element: el5, requirement_type: 'complementary', target_level: lvl(2) }), 'add Complementary requirement');
check(!ins('requirement', { role_profile: rp, element: el4, requirement_type: 'complementary', target_level: lvl(1) }), 'duplicate active Element rejected');
var r = new GlideRecord(P + 'requirement'); r.addQuery('role_profile', rp); r.addQuery('requirement_type', 'essential'); r.query();
check(r.getRowCount() === 1, 'one Essential');
r = new GlideRecord(P + 'requirement'); r.addQuery('role_profile', rp); r.addQuery('requirement_type', 'complementary'); r.query();
check(r.getRowCount() === 1, 'one Complementary');
""", False)])

test('t06_target_pl_element_level', 'CMS2 T06 – Target PL is stored at Element level',
     'Each requirement row carries its own Target PL; Role Profile and Domain have no target PL column.',
     [('user', 'cmsAdmin'), ('script', 'fixture', '', True), ('user', 'cmsRoleProfileAdmin'), ('script', 'assert', LOOKUP + r"""
var rp = ins('role_profile', { code: 'RP-ATF-3', name: 'ATF RP 3', business_function: 'xDigital', framework_version: fw });
var a = ins('requirement', { role_profile: rp, element: el4, requirement_type: 'essential', target_level: lvl(4) });
var b = ins('requirement', { role_profile: rp, element: el5, requirement_type: 'essential', target_level: lvl(1) });
var ga = new GlideRecord(P + 'requirement'); ga.get(a);
var gb = new GlideRecord(P + 'requirement'); gb.get(b);
check(ga.getValue('target_level') === lvl(4) && gb.getValue('target_level') === lvl(1), 'different Target PL per Element in the same Domain');
check(!new GlideRecord(P + 'role_profile').isValidField('target_level'), 'Role Profile has no target PL column');
check(!new GlideRecord(P + 'domain').isValidField('target_level'), 'Domain has no target PL column');
""", False)])

test('t07_no_empty_pl5', 'CMS2 T07 – An Element without PL5 does not display PL5',
     'The employee API lists only levels with a Published descriptor, and PL5 cannot be targeted on a PL1–PL4 Element.',
     [('user', 'cmsAdmin'), ('script', 'fixture', '', True), ('user', 'cmsUser'), ('script', 'assert', LOOKUP + r"""
var api = new x_2317791_cms2.CmsCatalogApi();
var d = api.getElement(el4);
var codes = []; for (var i = 0; i < d.levels.length; i++) codes.push(d.levels[i].code);
check(codes.join(',') === 'PL1,PL2,PL3,PL4', 'Element detail levels are PL1-PL4 (got ' + codes.join(',') + ')');
var d5 = api.getElement(el5); check(d5.levels.length === 5, 'PL1-PL5 Element shows 5 levels');
""", False), ('user', 'cmsRoleProfileAdmin'), ('script', 'assert_pl5', LOOKUP + r"""
var rp = ins('role_profile', { code: 'RP-ATF-4', name: 'ATF RP 4', business_function: 'xDigital', framework_version: fw });
check(!ins('requirement', { role_profile: rp, element: el4, requirement_type: 'essential', target_level: lvl(5) }), 'PL5 target rejected for an Element without PL5');
""", False)])

test('t08_published_rp_no_draft_refs', 'CMS2 T08 – Published Role Profile cannot reference Draft competency content',
     'Publishing a Role Profile that references a Draft Element is rejected; a valid one publishes.',
     [('user', 'cmsAdmin'), ('script', 'fixture', '', True), ('user', 'cmsRoleProfileAdmin'), ('script', 'assert', LOOKUP + r"""
var bad = ins('role_profile', { code: 'RP-ATF-5', name: 'ATF RP draft ref', business_function: 'xDigital', framework_version: fw });
check(!!ins('requirement', { role_profile: bad, element: elDraft, requirement_type: 'essential', target_level: lvl(1) }), 'draft RP may reference Draft Element while in Draft');
check(!upd('role_profile', bad, { status: 'published', effective_from: today() }), 'publish rejected with Draft Element');
var g = new GlideRecord(P + 'role_profile'); g.get(bad); check(g.getValue('status') === 'draft', 'still Draft after rejected publish');
var ok = ins('role_profile', { code: 'RP-ATF-6', name: 'ATF RP ok', business_function: 'xDigital', framework_version: fw });
ins('requirement', { role_profile: ok, element: el4, requirement_type: 'essential', target_level: lvl(2) });
check(!upd('role_profile', ok, { status: 'published' }), 'publish rejected without Effective From');
check(upd('role_profile', ok, { status: 'published', effective_from: today() }), 'valid Role Profile publishes');
check(!ins('requirement', { role_profile: ok, element: el5, requirement_type: 'complementary', target_level: lvl(1) }), 'cannot add requirements to a Published Role Profile');
""", False)])

test('t09_employee_no_admin_modules', 'CMS2 T09 – Normal employee cannot access administration modules',
     'A CMS User holds none of the roles required by the CMS menu, modules or workspace, and cannot create admin records.',
     [('user', 'cmsUser'), ('script', 'assert', r"""
var menu = new GlideRecord('sys_app_application'); menu.addQuery('title', 'CMS 2.0 – Competency Management'); menu.query();
check(menu.next(), 'CMS menu exists');
function hasAny(roles) { var r = (roles || '').split(','); for (var i = 0; i < r.length; i++) if (r[i] && gs.hasRole(r[i])) return true; return false; }
check(!hasAny(menu.getValue('roles')), 'menu hidden from CMS User');
var m = new GlideRecord('sys_app_module'); m.addQuery('application', menu.getUniqueValue()); m.addActiveQuery(); m.query();
var visible = 0; while (m.next()) if (hasAny(m.getValue('roles'))) visible++;
check(visible === 0, 'no CMS module visible to CMS User (visible: ' + visible + ')');
var tbls = ['fw_version', 'comp_group', 'domain', 'element', 'pl_descriptor', 'role_profile', 'requirement', 'prof_level', 'rp_assignment'];
for (var j = 0; j < tbls.length; j++) { var n = new GlideRecordSecure(P + tbls[j]); n.initialize(); check(!n.canCreate(), 'cannot create ' + tbls[j]); }
check(!gs.hasRole('x_2317791_cms2.content_admin') && !gs.hasRole('x_2317791_cms2.role_profile_admin'), 'no admin roles');
""", False)])

test('t10_history_preserved', 'CMS2 T10 – Previously Published content remains available after a newer version is created',
     'Create New Version clones to Draft; publishing it end-dates (not overwrites) the old version, which stays Published and readable.',
     [('user', 'cmsAdmin'), ('script', 'fixture', '', True), ('user', 'cmsContentAdmin'), ('script', 'assert', LOOKUP + r"""
var newId = new x_2317791_cms2.CmsAdminActions().createNewVersion((function () { var g = new GlideRecord(P + 'element'); g.get(el4); return g; })());
check(!!newId && newId !== el4, 'new Draft version created');
var o = new GlideRecord(P + 'element'); o.get(el4);
check(o.getValue('status') === 'published' && o.getValue('descriptor') === 'ATF element without PL5', 'original unchanged while new version is Draft');
var n = new GlideRecord(P + 'element'); n.get(newId);
check(n.getValue('status') === 'draft' && n.getValue('supersedes') === el4, 'new version is Draft and supersedes original');
var nd = new GlideRecord(P + 'pl_descriptor'); nd.addQuery('element', newId); nd.query();
check(nd.getRowCount() === 4, 'descriptors copied to new version (got ' + nd.getRowCount() + ')');
check(upd('element', newId, { descriptor: 'ATF element v2', status: 'published', effective_from: plusDays(1) }), 'publish new version from tomorrow');
o = new GlideRecord(P + 'element'); o.get(el4);
check(o.getValue('status') === 'published' && o.getValue('effective_to') === today(), 'old version still Published, end-dated today (got ' + o.getValue('effective_to') + ')');
check(o.getValue('descriptor') === 'ATF element without PL5', 'old descriptor text preserved');
""", False), ('user', 'cmsUser'), ('script', 'assert_read', LOOKUP + r"""
var g = new GlideRecordSecure(P + 'element'); check(g.get(el4), 'CMS User can still read the historical Published version');
""", False)])

test('t11_duplicate_descriptor', 'CMS2 T11 – Duplicate active Element + PL descriptor combinations are prevented',
     'A second active Draft for the same Element/PL/version and an overlapping Published duplicate are both rejected.',
     [('user', 'cmsAdmin'), ('script', 'fixture', '', True), ('user', 'cmsContentAdmin'), ('script', 'assert', LOOKUP + r"""
check(!!ins('pl_descriptor', { element: elDraft, proficiency_level: lvl(2), descriptor: 'first', framework_version: fw, status: 'draft' }), 'first Draft PL2 descriptor');
check(!ins('pl_descriptor', { element: elDraft, proficiency_level: lvl(2), descriptor: 'second', framework_version: fw, status: 'draft' }), 'second active Draft PL2 rejected');
check(!ins('pl_descriptor', { element: el4, proficiency_level: lvl(1), descriptor: 'dup', framework_version: fw, status: 'published', effective_from: today() }), 'overlapping Published PL1 duplicate rejected');
""", False)])

test('t12_listing_published_effective', 'CMS2 T12 – Employee-facing listing only returns Published and currently effective records',
     'browseRoleProfiles for a CMS User excludes Draft and future-dated Role Profiles; Library excludes Draft Elements.',
     [('user', 'cmsAdmin'), ('script', 'fixture', '', True), ('script', 'rp_fixture', LOOKUP + r"""
function rp(code, extra) {
    var id = ins('role_profile', { code: code, name: 'ATF ' + code, business_function: 'ATF-Fn', framework_version: fw });
    ins('requirement', { role_profile: id, element: el4, requirement_type: 'essential', target_level: lvl(2) });
    if (extra) check(upd('role_profile', id, extra), 'publish ' + code);
    return id;
}
rp('RP-ATF-PUB', { status: 'published', effective_from: today() });
rp('RP-ATF-FUT', { status: 'published', effective_from: plusDays(30) });
rp('RP-ATF-DRAFT', null);
""", False), ('user', 'cmsUser'), ('script', 'assert', r"""
var api = new x_2317791_cms2.CmsCatalogApi();
var res = api.browseRoleProfiles({ text: 'RP-ATF' });
var codes = []; for (var i = 0; i < res.items.length; i++) codes.push(res.items[i].code);
check(codes.join(',') === 'RP-ATF-PUB', 'only RP-ATF-PUB returned (got ' + codes.join(',') + ')');
var lib = api.getLibrary({ text: 'ATF' }), names = [];
for (var g = 0; g < lib.groups.length; g++) for (var d = 0; d < lib.groups[g].domains.length; d++) for (var e = 0; e < lib.groups[g].domains[d].elements.length; e++) names.push(lib.groups[g].domains[d].elements[e].code);
check(names.indexOf('ATF-EL') >= 0 && names.indexOf('ATF-EL-D') < 0, 'library shows Published, hides Draft Elements (got ' + names.join(',') + ')');
""", False)])

roles_used = ['cmsUser', 'cmsContentAdmin', 'cmsRoleProfileAdmin', 'cmsAdmin']
out = ["import '@servicenow/sdk/global'", "import { Test, TestSuite } from '@servicenow/sdk/core'",
       "import { " + ', '.join(roles_used) + " } from '../security/roles.now'", '',
       '/*', ' * CMS 2.0 ATF suite – GENERATED by tools/generate-atf.py. Do not edit by hand.',
       ' * Server-side steps only, so the suite can run headless through the CI/CD API.', ' */', '']
names = []
for key, name, desc, steps in tests:
    var = 'atf_' + key; names.append(var)
    out.append(f"export const {var} = Test(")
    out.append(f"    {{ $id: Now.ID['{key}'], name: '{name}', description: '{desc}', active: true, failOnServerError: false }},")
    out.append('    (atf) => {')
    u = 0
    for s in steps:
        if s[0] == 'user':
            u += 1
            out.append(f"        atf.server.createUser({{ $id: Now.ID['{key}_user{u}'], firstName: 'ATF', lastName: '{s[1]} {u}', roles: [{s[1]}] }})")
        else:
            body = script(s[2], s[3])
            body = '\n'.join(('            ' + l) if l else '' for l in body.split('\n'))
            out.append(f"        atf.server.runServerSideScript({{\n            $id: Now.ID['{key}_{s[1]}'],\n            script: `\n{body}\n            `,\n        }})")
    out.append('    }')
    out.append(')')
    out.append('')
out.append("TestSuite({")
out.append("    $id: Now.ID['cms2_atf_suite'],")
out.append("    name: 'CMS 2.0 – Role Profile and Competency Library',")
out.append("    description: 'Security, versioning and employee-visibility tests for CMS 2.0.',")
out.append("    active: true,")
out.append("    tests: [" + ', '.join(names) + "],")
out.append("})")
open(os.path.join(ROOT, 'src/fluent/tests/cms-atf.now.ts'), 'w').write('\n'.join(out) + '\n')
print('tests:', len(tests))
