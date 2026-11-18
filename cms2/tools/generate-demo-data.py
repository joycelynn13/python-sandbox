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

# code, name, description, sequence
# Names follow the "Refreshed Technical Competency Framework" slide (4 CCCs + 33 SPCs = 37 Domains).
groups = [
    ('CCC', 'Cross-Cutting Competencies', 'Competencies that apply across all technical functions.', 10),
    ('SPC-E', 'Specialised Competencies – Engineering', 'Specialised competencies for engineering disciplines.', 20),
    ('SPC-D', 'Specialised Competencies – Digital', 'Specialised competencies for digital disciplines.', 30),
    ('SPC-S', 'Specialised Competencies – Sciences', 'Specialised competencies for scientific disciplines.', 40),
]
# key (stable Now.ID – the first 8 reuse the original demo keys so records update in place),
# code, name, group, description
domains = [
    ('ccc_pdm', 'CCC-PM', 'Project Management', 'CCC', 'Planning, delivering and controlling technical projects and programmes.'),
    (None, 'CCC-PMHD', 'Product Management & Human-centric Design', 'CCC', 'Shaping products around user needs, value and experience.'),
    ('sci_res', 'CCC-RTM', 'Research & Technology Management', 'CCC', 'Directing research, technology scouting and technology roadmaps.'),
    ('ccc_psa', 'CCC-SM', 'System Management', 'CCC', 'Managing systems and capabilities across their operational life.'),
    (None, 'ENG-LV', 'Land Vehicles', 'SPC-E', 'Engineering of land vehicle platforms and sub-systems.'),
    (None, 'ENG-MS', 'Marine Systems', 'SPC-E', 'Engineering of vessels and marine platforms.'),
    (None, 'ENG-US', 'Unmanned Systems', 'SPC-E', 'Engineering of unmanned and autonomous platforms.'),
    (None, 'ENG-WS', 'Weapon Systems', 'SPC-E', 'Engineering, integration and assurance of weapon systems.'),
    (None, 'ENG-SMIB', 'Structural, Marine Infrastructure and Blast Engineering', 'SPC-E', 'Design and protection of structures and marine infrastructure.'),
    (None, 'ENG-ARCH', 'Architecture', 'SPC-E', 'Architectural design of facilities and the built environment.'),
    (None, 'ENG-MEF', 'Mechanical, Electrical & Fire Safety Engineering', 'SPC-E', 'Building services, electrical systems and fire safety engineering.'),
    (None, 'ENG-QSFM', 'Quantity Surveying and Facility Management', 'SPC-E', 'Cost management of works and management of facilities.'),
    (None, 'ENG-PSE', 'Protective Systems & Equipment', 'SPC-E', 'Engineering of protective systems and equipment for responders.'),
    ('eng_sys', 'ENG-SE', 'Systems Engineering', 'SPC-E', 'Engineering complex systems across their lifecycle.'),
    ('dig_dat', 'DIG-DSE', 'Data Science and Engineering', 'SPC-D', 'Building data platforms and turning data into insight.'),
    ('dig_swe', 'DIG-SAIE', 'Software and AI Engineering', 'SPC-D', 'Designing, building and assuring software and AI-enabled systems.'),
    ('dig_cyb', 'DIG-CYB', 'Cybersecurity', 'SPC-D', 'Protecting systems, networks and information.'),
    (None, 'DIG-MS', 'Modelling & Simulation', 'SPC-D', 'Building models and simulations for analysis and training.'),
    (None, 'DIG-NC', 'Networking and Communications', 'SPC-D', 'Designing and operating networks and communication systems.'),
    (None, 'DIG-CDI', 'Cloud & Digital Infrastructure', 'SPC-D', 'Engineering and operating cloud and digital infrastructure.'),
    (None, 'DIG-AIRD', 'AI Applied R&D', 'SPC-D', 'Applied research and development of AI capabilities.'),
    (None, 'DIG-SIOT', 'Sensors and IOT', 'SPC-D', 'Designing and integrating sensors and Internet-of-Things solutions.'),
    (None, 'DIG-OS', 'Operational Systems', 'SPC-D', 'Engineering and sustaining mission-critical operational systems.'),
    ('dig_arc', 'DIG-EA', 'Enterprise Architecture', 'SPC-D', 'Defining enterprise, solution and integration architectures.'),
    (None, 'DIG-DCO', 'Data Centre Operations', 'SPC-D', 'Operating and maintaining data centre facilities.'),
    (None, 'DIG-QT', 'Quantum Technologies', 'SPC-D', 'Research and application of quantum technologies.'),
    (None, 'DIG-ST', 'Space Technologies', 'SPC-D', 'Application of space-based technologies and data.'),
    (None, 'SCI-MB', 'Molecular Biology', 'SPC-S', 'Molecular and biological analysis methods.'),
    (None, 'SCI-CPT', 'Chemistry, Pharmacology & Toxicology Sciences', 'SPC-S', 'Chemical analysis, pharmacology and toxicology.'),
    (None, 'SCI-EFR', 'Energetics, Fire and Radiological Sciences', 'SPC-S', 'Science of energetic materials, fire and radiation.'),
    (None, 'SCI-MTPE', 'Materials, Trace and Physical Evidence Science', 'SPC-S', 'Analysis of materials and trace and physical evidence.'),
    (None, 'SCI-BS', 'Biometric Science', 'SPC-S', 'Biometric identification science and technology.'),
    (None, 'SCI-CPB', 'Cognition, Psychology & Behavioural Sciences', 'SPC-S', 'Human cognition, psychology and behaviour.'),
    (None, 'SCI-BPS', 'Biomechanics & Physiological Science', 'SPC-S', 'Human biomechanics and physiological performance.'),
    (None, 'SCI-HSI', 'Human-Systems Interface & Interaction Sciences', 'SPC-S', 'Designing effective interaction between people and systems.'),
    (None, 'SCI-ASI', 'Advanced Sensing & Imaging Science', 'SPC-S', 'Advanced sensing, imaging and signal science.'),
    (None, 'SCI-CS', 'Computational Science', 'SPC-S', 'Computational methods for scientific problems.'),
]
assert len(domains) == 37, len(domains)
# code, name, domain, descriptor, max PL (min PL = 1), focus phrase used in PL descriptors
elements = [
    ('EL-APPDEV', 'Application Development', 'DIG-SAIE', 'Build, test and maintain software applications that meet functional and non-functional requirements.', 5, 'application code and components'),
    ('EL-SWDES', 'Software Design', 'DIG-SAIE', 'Design software structures, interfaces and patterns that are maintainable and fit for purpose.', 5, 'software designs and interfaces'),
    ('EL-TESTQ', 'Testing and Quality', 'DIG-SAIE', 'Plan and perform testing and quality assurance to verify software meets its requirements.', 4, 'test plans, automated tests and quality checks'),
    ('EL-SOLARC', 'Solution Architecture', 'DIG-EA', 'Define end-to-end solution architectures that balance business needs, risk and technology constraints.', 5, 'solution architectures'),
    ('EL-SYSINT', 'Systems Integration', 'DIG-EA', 'Integrate systems and services through APIs, messaging and data exchange.', 4, 'integrations, APIs and interfaces'),
    ('EL-DATAAN', 'Data Analytics', 'DIG-DSE', 'Collect, analyse and visualise data to produce evidence-based insights.', 5, 'analyses, dashboards and data models'),
    ('EL-CYBFUN', 'Cybersecurity Fundamentals', 'DIG-CYB', 'Apply security principles and controls to protect systems and data.', 3, 'security controls and secure practices'),
    ('EL-PROJPL', 'Project Planning', 'CCC-PM', 'Plan scope, schedule, resources and risks for technical work.', 4, 'project plans, schedules and risk registers'),
    ('EL-TECHDOC', 'Technical Documentation', 'CCC-PM', 'Produce clear, accurate technical documentation for different audiences.', 3, 'technical documents and specifications'),
    ('EL-TPS', 'Technical Problem Solving', 'CCC-SM', 'Diagnose technical problems and develop effective, evidence-based solutions.', 5, 'root-cause analyses and solution options'),
    ('EL-SELIFE', 'Systems Engineering Lifecycle', 'ENG-SE', 'Apply systems engineering processes from requirements to verification and validation.', 4, 'requirements, system models and V&V plans'),
    ('EL-EXPDES', 'Experimental Design', 'CCC-RTM', 'Design experiments and studies that produce valid, reproducible results.', 4, 'experimental protocols and study designs'),
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
seq_in_group = {}
for key, code, name, g, desc in domains:
    seq_in_group[g] = seq_in_group.get(g, 0) + 10; seq = seq_in_group[g]
    v = 'demo_dom_' + (key or ident(code)); dvar[code] = v
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
