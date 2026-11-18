#!/usr/bin/env python3
"""
Generates src/fluent/demo/demo-data.now.ts and src/fluent/configuration/proficiency-scale.now.ts.

Fluent files must be declarative (no loops), so the synthetic prototype data set is
generated here and committed. Re-run after editing:  python3 tools/generate-demo-data.py
All content is SYNTHETIC PROTOTYPE DATA – not approved HTX competency policy.
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FW = 'demo_fw_2026'
PL = {1: ('PL1', 'Apply'), 2: ('PL2', 'Proficient'), 3: ('PL3', 'Accomplish'), 4: ('PL4', 'Master'), 5: ('PL5', 'Influence')}
PL_DESC = {
    1: 'Applies established practices to well-defined tasks with guidance.',
    2: 'Works independently and consistently on typical tasks and resolves common issues.',
    3: 'Delivers complex work end-to-end, adapts practices and guides others.',
    4: 'Recognised expert who sets standards and solves novel problems across teams.',
    5: 'Shapes direction and practice at organisational or national level.',
}

def ident(s): return re.sub(r'[^a-z0-9]+', '_', s.lower()).strip('_')
def q(s): return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"

groups = [
    ('CCC', 'Cross-Cutting Competencies', 'Competencies applicable across all technical functions.', 10),
    ('SPC-D', 'Specialist Professional Competencies – Digital', 'Specialist competencies for digital and software disciplines.', 20),
    ('SPC-E', 'Specialist Professional Competencies – Engineering', 'Specialist competencies for engineering disciplines.', 30),
    ('SPC-S', 'Specialist Professional Competencies – Sciences', 'Specialist competencies for scientific disciplines.', 40),
]
domains = [  # code, name, group, description, seq
    ('CCC-PDM', 'Project and Delivery Management', 'CCC', 'Planning, documenting and delivering technical work.', 10),
    ('CCC-PSA', 'Problem Solving and Analysis', 'CCC', 'Structured analysis of technical problems.', 20),
    ('DIG-SWE', 'Software Engineering', 'SPC-D', 'Building, designing and assuring software.', 10),
    ('DIG-ARC', 'Architecture and Integration', 'SPC-D', 'Designing solutions and integrating systems.', 20),
    ('DIG-DAT', 'Data and Analytics', 'SPC-D', 'Turning data into insight.', 30),
    ('DIG-CYB', 'Cybersecurity', 'SPC-D', 'Protecting systems and information.', 40),
    ('ENG-SYS', 'Systems Engineering', 'SPC-E', 'Engineering complex systems across their lifecycle.', 10),
    ('SCI-RES', 'Scientific Research Methods', 'SPC-S', 'Designing and running scientific investigations.', 10),
]
# code, name, domain, descriptor, max PL (min PL = 1), focus phrase used in PL descriptors
elements = [
    ('EL-APPDEV', 'Application Development', 'DIG-SWE', 'Build, test and maintain software applications that meet functional and non-functional requirements.', 5, 'application code and components'),
    ('EL-SWDES', 'Software Design', 'DIG-SWE', 'Design software structures, interfaces and patterns that are maintainable and fit for purpose.', 5, 'software designs and interfaces'),
    ('EL-TESTQ', 'Testing and Quality', 'DIG-SWE', 'Plan and perform testing and quality assurance to verify software meets its requirements.', 4, 'test plans, automated tests and quality checks'),
    ('EL-SOLARC', 'Solution Architecture', 'DIG-ARC', 'Define end-to-end solution architectures that balance business needs, risk and technology constraints.', 5, 'solution architectures'),
    ('EL-SYSINT', 'Systems Integration', 'DIG-ARC', 'Integrate systems and services through APIs, messaging and data exchange.', 4, 'integrations, APIs and interfaces'),
    ('EL-DATAAN', 'Data Analytics', 'DIG-DAT', 'Collect, analyse and visualise data to produce evidence-based insights.', 5, 'analyses, dashboards and data models'),
    ('EL-CYBFUN', 'Cybersecurity Fundamentals', 'DIG-CYB', 'Apply security principles and controls to protect systems and data.', 3, 'security controls and secure practices'),
    ('EL-PROJPL', 'Project Planning', 'CCC-PDM', 'Plan scope, schedule, resources and risks for technical work.', 4, 'project plans, schedules and risk registers'),
    ('EL-TECHDOC', 'Technical Documentation', 'CCC-PDM', 'Produce clear, accurate technical documentation for different audiences.', 3, 'technical documents and specifications'),
    ('EL-TPS', 'Technical Problem Solving', 'CCC-PSA', 'Diagnose technical problems and develop effective, evidence-based solutions.', 5, 'root-cause analyses and solution options'),
    ('EL-SELIFE', 'Systems Engineering Lifecycle', 'ENG-SYS', 'Apply systems engineering processes from requirements to verification and validation.', 4, 'requirements, system models and V&V plans'),
    ('EL-EXPDES', 'Experimental Design', 'SCI-RES', 'Design experiments and studies that produce valid, reproducible results.', 4, 'experimental protocols and study designs'),
]
PL_TEMPLATES = {
    1: 'Applies standard methods to produce {f} for well-defined tasks under guidance.',
    2: 'Independently produces and reviews {f} for typical work and resolves common issues.',
    3: 'Leads the delivery of {f} for complex work, adapts methods to context and coaches others.',
    4: 'Sets standards for {f} across teams, resolves novel problems and is consulted as an expert.',
    5: 'Shapes organisational strategy and practice for {f} and influences beyond HTX.',
}
# Role profiles: key, code, name, title, family, function, description, version, from, to, status, supersedes, requirements
# requirement = (element code, 'E'|'C', target PL)
role_profiles = [
    ('rp_appdev_v1', 'RP-XD-APPDEV', 'Engineer – Application Development', 'Engineer', 'Software Engineering', 'xDigital',
     'Designs, builds and maintains digital applications. (Version 1 – historical.)', 1, '2026-01-01', '2026-06-30', 'published', None,
     [('EL-APPDEV', 'E', 2), ('EL-SWDES', 'E', 2), ('EL-TESTQ', 'E', 2), ('EL-TECHDOC', 'C', 1), ('EL-TPS', 'C', 2)]),
    ('rp_appdev_v2', 'RP-XD-APPDEV', 'Engineer – Application Development', 'Engineer', 'Software Engineering', 'xDigital',
     'Designs, builds, tests and maintains digital applications, working with architects and product teams.', 2, '2026-07-01', None, 'published', 'rp_appdev_v1',
     [('EL-APPDEV', 'E', 3), ('EL-SWDES', 'E', 3), ('EL-TESTQ', 'E', 2), ('EL-SYSINT', 'E', 2),
      ('EL-SOLARC', 'C', 2), ('EL-TECHDOC', 'C', 2), ('EL-TPS', 'C', 3), ('EL-CYBFUN', 'C', 2), ('EL-PROJPL', 'C', 1)]),
    ('rp_solarch', 'RP-XD-SOLARCH', 'Senior Engineer – Solution Architecture', 'Senior Engineer', 'Architecture', 'xDigital',
     'Defines solution architectures and technical direction for digital programmes.', 1, '2026-01-01', None, 'published', None,
     [('EL-SOLARC', 'E', 4), ('EL-SYSINT', 'E', 4), ('EL-SWDES', 'E', 4), ('EL-CYBFUN', 'E', 3),
      ('EL-APPDEV', 'C', 3), ('EL-TECHDOC', 'C', 3), ('EL-PROJPL', 'C', 3), ('EL-TPS', 'C', 4)]),
    ('rp_data', 'RP-XD-DATA', 'Data Analyst', 'Analyst', 'Data and AI', 'xDigital',
     'Analyses operational data and builds insight products for decision makers.', 1, '2026-01-01', None, 'published', None,
     [('EL-DATAAN', 'E', 3), ('EL-TPS', 'E', 3), ('EL-TECHDOC', 'E', 2),
      ('EL-APPDEV', 'C', 1), ('EL-CYBFUN', 'C', 1), ('EL-PROJPL', 'C', 2)]),
    ('rp_syseng', 'RP-XE-SYSENG', 'Engineer – Systems Engineering', 'Engineer', 'Systems Engineering', 'xEngineering',
     'Engineers complex systems from requirements through verification and validation.', 1, '2026-01-01', None, 'published', None,
     [('EL-SELIFE', 'E', 3), ('EL-SYSINT', 'E', 3), ('EL-TESTQ', 'E', 3),
      ('EL-PROJPL', 'C', 2), ('EL-TPS', 'C', 3), ('EL-TECHDOC', 'C', 2)]),
    ('rp_science', 'RP-XS-RES', 'Scientist – Research', 'Scientist', 'Research', 'xSciences',
     'Plans and conducts scientific investigations and communicates findings.', 1, '2026-01-01', None, 'published', None,
     [('EL-EXPDES', 'E', 3), ('EL-DATAAN', 'E', 3), ('EL-TPS', 'E', 3),
      ('EL-TECHDOC', 'C', 3), ('EL-PROJPL', 'C', 2)]),
    ('rp_qe_draft', 'RP-XD-QE', 'Engineer – Quality Engineering', 'Engineer', 'Software Engineering', 'xDigital',
     'DRAFT – not visible to employees until published.', 1, None, None, 'draft', None,
     [('EL-TESTQ', 'E', 3), ('EL-APPDEV', 'E', 2), ('EL-TPS', 'C', 2)]),
]
assignments = [('admin', 'RP-XD-APPDEV'), ('abel.tuter', 'RP-XD-APPDEV'), ('beth.anglin', 'RP-XD-DATA')]

out = []
w = out.append
w("import '@servicenow/sdk/global'")
w("import { Record } from '@servicenow/sdk/core'")
w("import { pl1, pl2, pl3, pl4, pl5 } from '../configuration/proficiency-scale.now'")
w('')
w('/*')
w(' * SYNTHETIC PROTOTYPE DATA – generated by tools/generate-demo-data.py. Do not edit by hand.')
w(' * Illustrates the CMS 2.0 model only; it is NOT approved HTX competency policy.')
w(" * Every row uses installMethod 'demo' (unload.demo) so it can be excluded from production installs.")
w(' */')
w('')
def rec(var, key, table, data):
    w(f"export const {var} = Record({{")
    w(f"    $id: Now.ID['{key}'],")
    w("    $meta: { installMethod: 'demo' },")
    w(f"    table: '{table}',")
    w('    data: {')
    for k, v in data.items():
        if v is None: continue
        if isinstance(v, bool): s = 'true' if v else 'false'
        elif isinstance(v, int): s = str(v)
        elif isinstance(v, tuple) and v[0] == 'ref': s = v[1]
        else: s = q(v)
        w(f'        {k}: {s},')
    w('    },')
    w('})')
    w('')
ref = lambda v: ('ref', v)
LC = {**{'published': 'published'}}
rec(FW, 'demo_fw_2026', 'x_2317791_cms2_fw_version', {
    'name': 'HTX Technical Competency Framework 2026 (Prototype)', 'version_number': '2026.1',
    'description': 'PROTOTYPE framework version with synthetic content for CMS 2.0 demonstration.',
    'status': 'published', 'effective_from': '2026-01-01', 'active': True})
rec('demo_fw_2027', 'demo_fw_2027', 'x_2317791_cms2_fw_version', {
    'name': 'HTX Technical Competency Framework 2027 (Prototype draft)', 'version_number': '2027.1',
    'description': 'PROTOTYPE draft of the next framework version. Not visible to employees.',
    'status': 'draft', 'active': True})
gvar = {}
for code, name, desc, seq in groups:
    v = 'demo_grp_' + ident(code); gvar[code] = v
    rec(v, v, 'x_2317791_cms2_comp_group', {'code': code, 'name': name, 'description': desc, 'sequence': seq,
        'framework_version': ref(FW), 'status': 'published', 'effective_from': '2026-01-01', 'active': True})
dvar = {}
for code, name, g, desc, seq in domains:
    v = 'demo_dom_' + ident(code); dvar[code] = v
    rec(v, v, 'x_2317791_cms2_domain', {'code': code, 'name': name, 'description': desc, 'competency_group': ref(gvar[g]),
        'sequence': seq, 'framework_version': ref(FW), 'status': 'published', 'effective_from': '2026-01-01', 'active': True})
evar = {}; emax = {}
for i, (code, name, dom, desc, maxpl, focus) in enumerate(elements):
    v = 'demo_el_' + ident(code); evar[code] = v; emax[code] = maxpl
    rec(v, v, 'x_2317791_cms2_element', {'code': code, 'name': name, 'domain': ref(dvar[dom]), 'descriptor': desc,
        'sequence': (i + 1) * 10, 'framework_version': ref(FW), 'status': 'published', 'effective_from': '2026-01-01', 'active': True})
    for lvl in range(1, maxpl + 1):
        dv_ = f'demo_pld_{ident(code)}_pl{lvl}'
        rec(dv_, dv_, 'x_2317791_cms2_pl_descriptor', {'element': ref(v), 'proficiency_level': ref(f'pl{lvl}'),
            'descriptor': PL_TEMPLATES[lvl].format(f=focus), 'display_name': f'{code} – PL{lvl}',
            'framework_version': ref(FW), 'status': 'published', 'effective_from': '2026-01-01', 'active': True})
for key, code, name, title, fam, fn, desc, ver, frm, to, status, sup, reqs in role_profiles:
    v = 'demo_' + key
    rec(v, v, 'x_2317791_cms2_role_profile', {'code': code, 'name': name, 'job_title': title, 'job_family': fam,
        'business_function': fn, 'description': desc, 'framework_version': ref(FW), 'version': ver,
        'status': status, 'effective_from': frm, 'effective_to': to, 'active': True,
        'supersedes': ref('demo_' + sup) if sup else None})
    for n, (ecode, t, lvl) in enumerate(reqs):
        assert lvl <= emax[ecode], f'{key}: {ecode} has no PL{lvl}'
        rv = f'demo_req_{key}_{ident(ecode)}'
        rec(rv, rv, 'x_2317791_cms2_requirement', {'role_profile': ref(v), 'element': ref(evar[ecode]),
            'requirement_type': 'essential' if t == 'E' else 'complementary', 'target_level': ref(f'pl{lvl}'),
            'sequence': (n + 1) * 10, 'active': True})
for user, code in assignments:
    v = 'demo_rpa_' + ident(user)
    rec(v, v, 'x_2317791_cms2_rp_assignment', {'user': user, 'role_profile_code': code,
        'source': 'Prototype – demo data', 'active': True})
open(os.path.join(ROOT, 'src/fluent/demo/demo-data.now.ts'), 'w').write('\n'.join(out))

# --- proficiency scale: configuration seed (first install), labels are data, not code
s = ["import '@servicenow/sdk/global'", "import { Record } from '@servicenow/sdk/core'", '',
     '/*', ' * Proficiency scale (configurable). Loaded on first install only so later label changes',
     ' * made by a CMS Administrator are not overwritten. Labels to be confirmed against the',
     ' * approved HTX framework source (see docs/assumptions.md).', ' */', '']
for lvl, (code, label) in PL.items():
    s += [f"export const pl{lvl} = Record({{", f"    $id: Now.ID['pl_level_{lvl}'],", "    $meta: { installMethod: 'first install' },",
          "    table: 'x_2317791_cms2_prof_level',", '    data: {', f'        level: {lvl},', f"        code: '{code}',",
          f"        label: '{label}',", f"        display_name: '{code} – {label}',", f'        description: {q(PL_DESC[lvl])},',
          '        active: true,', '    },', '})', '']
open(os.path.join(ROOT, 'src/fluent/configuration/proficiency-scale.now.ts'), 'w').write('\n'.join(s))
print('records:', sum(1 for l in out if 'Record({' in l))
