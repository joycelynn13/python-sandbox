# ADR-001 – CMS 2.0 Role Profile and Competency Library: Application and Scope

| | |
|---|---|
| Status | **Accepted and implemented** – Option C+; build alongside `x_2317791_cms_2_0` (decided by the product owner, 2026-11-18) |
| Date | 2026-11-18 |
| Instance | `dev485488.service-now.com` (Personal Developer Instance) |
| Release | Brazil, Patch 2 (`glide-brazil-08-25-2026__patch2-10-22-2026`) |
| Now SDK | `@servicenow/sdk` 4.14.2, Node 22 |
| Company code | `2317791` (from `glide.appcreator.company.code`) |

---

## 1. Decision summary

**Selected approach: Option C+ — a dedicated CMS 2.0 scoped application that owns the
versioned competency framework, with targeted reuse of OOTB platform records.**

* Scope: **`x_2317791_cms2`** (14 chars, within the 18-char limit) – installed on the PDI
* Application name: **CMS 2.0 – Competency Management**
* CMS owns: Framework Version, Competency Group, Domain, Element, Proficiency Level
  (scale), Element PL Descriptor, Role Profile, Role Profile Element Requirement,
  prototype Role Profile Assignment, and CMS settings.
* CMS reuses: `sys_user` (owners, SMEs, employees), Employee Center for the employee
  experience, system properties for configurable thresholds, ATF for testing.
* Skills Management (`cmn_skill*`) is **not** used as the system of record for the
  framework in this prototype. An optional, read-only `Element → cmn_skill` link is
  reserved for the later assessment/skills-inventory phase (§6.3).

The starting hypothesis (Option D) was tested against the instance and rejected for
the reasons in §5. The deciding factor is that the HTX framework needs **status,
versioning and effective dating on Domains and Elements**. The OOTB skill tables are
global, carry none of these attributes, and cannot be given them without customising
OOTB global tables or building 1:1 shadow tables. Either route breaks the brief's own
rules.

---

## 2. Installed capabilities found (Phase 1 inspection)

| Capability | Plugin / scope | State | Relevance |
|---|---|---|---|
| Skills Management | `com.snc.skills_management` (global) | **Active** | Provides `cmn_skill`, `cmn_skill_category`, `cmn_skill_level`, `cmn_skill_level_type`, `cmn_skill_m2m_category`, `sys_user_has_skill` |
| Skills Library seed data | `com.snc.skills_management.seed_data` | Inactive | Not needed |
| Manage Skills Configurable Page | `sn_skill_cfg_page` 1.1.13 | Active | Admin UX for OOTB skills only |
| Skills Foundation / Talent Development / job architecture | — | **Not installed** | No extensible job-architecture table exists, so Role Profile must be custom |
| Employee Profile | `sn_employee` 14.1.0 | Active (11 profiles) | Candidate employee reference for later phases |
| Employee Center / Core | `sn_ex_sp` 44.2.3, `sn_hr_sp` 44.2.1 | Active | Target employee-facing channel |
| Employee Experience Foundation | `sn_ex_emp_fd` 30.0.3 | Active | |
| HR Service Delivery core | `com.sn_hr_core` | **Inactive** | No HR profile / job tables; EMPOWER-style data is not available on-instance |
| Next Experience / UI Builder | `sn_uxf*` 30.x | Active | Workspace / UIB available (user holds `next_experience_admin`) |

### Existing OOTB skills data (non-empty, created by hand)

| Table | Rows | Content |
|---|---|---|
| `cmn_skill_category` | 3 | `CCC`, `Project Management` (top-level) and `Project Management` (child of CCC) |
| `cmn_skill` | 3 | — |
| `cmn_skill_level_type` / `cmn_skill_level` | 1 / 1 | Type `PL1` with one level `Default` |
| `sys_user_has_skill` | 0 | |

These look like manual experiments with the hybrid mapping. This design does not touch them.

### Existing CMS application on the instance (significant)

| Attribute | Value |
|---|---|
| Scope | **`x_2317791_cms_2_0`** |
| Name | CMS 2.0 – Competency Management (v1.0.0) |
| Created | 2026-11-16 23:45 by `admin`; not linked to source control; no local SDK project in this repo |
| Metadata | 269 records: 7 tables, 28 ACLs, 4 roles, 7 modules, 1 menu, UI page `cms_portal` (SDK-built UX asset), 2 cross-scope privileges |
| Data | 7 domains, 12 competencies, 32 elements, 104 PL descriptors, 5 role profiles, 37 role–competency rows, 59 element targets |

Its model is **Domain → Competency → Element → PL descriptor** (`competency`,
`domain`, `comp_element`, `pl_desc`, `role_profile`, `role_comp`, `elem_target`). Compared with
the CMS 2.0 brief:

* it has an extra **Competency** layer between Domain and Element, the kind of
  intermediate layer the brief says CMS 2.0 does not need;
* it has **no Competency Group** and **no Framework Version** table;
* Proficiency Level and Target PL are **hard-coded choice lists**, not a configurable scale;
* it stores requirements at two grains (`role_comp` per competency *and* `elem_target`
  per element), which duplicates the classification;
* it holds two script-API cross-scope records (`GlideRecord.insert`,
  `GlideRecord.setValue`). *Correction:* these were first described as broad
  grants; they are runtime-access tracking records for global script APIs and
  give no data access. CMS 2.0 declares the equivalent records explicitly;
* the employee UI is a single UI Page (`cms_portal`) rather than an Employee Center
  experience.

This app is not CMS 1.0, but it is an existing CMS application with data. Under the
brief's stop rule ("modification of an existing … CMS application") I have **not changed
it**. §9 sets out the options.

---

## 3. Options considered

| Option | Description | Verdict |
|---|---|---|
| A | Use or extend Skills Management as the framework | Rejected: no status, version or effective dating; global tables; would need OOTB customisation |
| B | Skills Foundation / Talent Development | Not available: not installed, licensed product |
| **C+** | **Dedicated scoped app owning the versioned framework, reusing platform records where they fit** | **Selected** |
| D | Hybrid: Category = Group/Domain, Skill = Element, Skill Level = PL, plus CMS extension tables | Tested and rejected for this prototype (§5); a read-only link to `cmn_skill` is kept as a future seam |

---

## 4. Why Option C+ is preferred

1. **Versioning is a core requirement, not an add-on.** §10 of the brief lists Domain
   rename, Element retirement and Element descriptor change as versioned events that must
   not overwrite published history. Only tables the CMS scope owns can carry
   `framework_version`, `status`, `effective_from` and `effective_to` without
   customising OOTB tables.
2. **Clean isolation.** Every artifact sits in one scope, can be uninstalled cleanly, and
   has no global-scope customisation.
3. **No pollution of operational skills.** `cmn_skill` and `cmn_skill_category` are
   shared instance-wide (assignment routing, AWA, catalog). Loading 4 groups, about 40 domains and hundreds of
   versioned elements, with Draft and Retired copies, would surface them in every
   skills picker on the platform.
4. **Strict hierarchy.** The framework is strictly Group → Domain → Element. OOTB
   skill-to-category is many-to-many (`cmn_skill_m2m_category`), so a single parent
   would need extra enforcement.
5. **Least privilege.** C+ needs **no cross-scope write privileges**. Option D would
   need create/write on four global tables.
6. **Licensing.** Uses only platform capabilities and the Employee Center
   already installed.

---

## 5. Option D evaluation detail

| CMS concept | OOTB candidate | Fit | Gap |
|---|---|---|---|
| Competency Group | `cmn_skill_category` (top level) | Partial | No sequence, status, version or effective dates |
| Domain | child `cmn_skill_category` | Partial | Owner, SME, status, version and effective dates missing; renames would overwrite history |
| Element | `cmn_skill` | Partial | `description` is a single translated field; no status, version, code or sequence; M2M to category |
| PL1–PL5 | `cmn_skill_level` under one `cmn_skill_level_type` | **Good** | Labels configurable; this is the best-fitting OOTB object |
| Element PL descriptor | none | — | Extension table needed in both options |
| Role Profile | none (no job architecture installed) | — | Custom in both options |

To make Option D meet the versioning rules we would need either:

* **new columns on `cmn_skill` and `cmn_skill_category`**, which customises OOTB global
  tables and is prohibited by the brief; or
* **1:1 "element version" sidecar tables** in scope, which duplicates every
  Element and Domain. The brief prohibits that too ("do not create duplicate records in
  custom and OOTB tables merely for convenience").

The PL scale was the one good fit. I still recommend a small scoped
`proficiency_level` table for the prototype, for three reasons:
(a) it avoids cross-scope writes into a global table for seed data;
(b) it keeps the scale under CMS governance (HTX may version the PL labels);
(c) it can carry a reference to a `cmn_skill_level` later, when the assessment phase
writes `sys_user_has_skill`.

---

## 6. Physical model (summary; full detail in `data-model.md`)

### 6.1 Custom tables (scope `x_2317791_cms2`)

| Table | Purpose | Key rules |
|---|---|---|
Table names are limited to 30 characters, so the suggested names were shortened:

| Table | Purpose | Key rules |
|---|---|---|
| `x_2317791_cms2_fw_version` | Framework Version | One Published version effective at any date (no overlap) |
| `x_2317791_cms2_comp_group` | Competency Group: CCC, SPC – Digital / Engineering / Sciences | Unique code per version |
| `x_2317791_cms2_domain` | Domain under a group | Owner, SME (`sys_user`) |
| `x_2317791_cms2_element` | Element (assessable capability) | Element descriptor; no PL columns |
| `x_2317791_cms2_prof_level` | Configurable scale PL1–PL5 | Labels are data, never hard-coded |
| `x_2317791_cms2_pl_descriptor` | Element PL Descriptor, one row per Element × PL | No duplicate active Draft and no overlapping Published rows per Element + PL + version |
| `x_2317791_cms2_role_profile` | Role Profile | Must resolve to a Published Framework Version when Published |
| `x_2317791_cms2_requirement` | Role Profile Element Requirement | Essential/Complementary, Target PL; Domain derived via dot-walk |
| `x_2317791_cms2_rp_assignment` | **Prototype only** user → Role Profile code | Clearly labelled; replaced later by an EMPOWER or Employee Profile source |

Common lifecycle fields on versioned content: `status` (draft/published/retired),
`framework_version`, `effective_from`, `effective_to`, `active`, `sequence`.

Versioning pattern: **copy-on-revise**. A Published record is never edited in place. A
"Create new draft version" action clones it into Draft under the target Framework
Version and adds a `supersedes` reference back to the original, so old Role Profiles
and future award records stay linked to the definitions they used.

### 6.2 OOTB records reused

| Object | Use | Access |
|---|---|---|
| `sys_user` | Domain Owner, SME, Role Profile Owner, prototype assignment | Read (default) |
| Employee Center (`sn_ex_sp`) | Host for employee-facing pages | Configuration in scope |
| `sys_properties` | Essential/total thresholds (scoped properties) | Own scope |

### 6.3 Future seam (not built in the prototype)

* `element.skill` → `cmn_skill` (read-only) and `proficiency_level.skill_level` →
  `cmn_skill_level`, so the assessment phase can write awarded proficiency to
  `sys_user_has_skill` and appear in the platform's skills profile.
* `role_profile_assignment` replaced by Employee Profile (`sn_employee`) or the
  EMPOWER MSS feed once access is authorised.

---

## 7. Cross-scope access required

The instance runs runtime access in *tracking* mode, which auto-grants and records
cross-scope use. Every privilege observed during the ATF runs is declared explicitly in
`src/fluent/security/cross-scope.now.ts`. Two consecutive ATF runs then produced no new
auto-grants.

| Target (scope global) | Operation | Reason |
|---|---|---|
| `sys_user` (table) | read | Owner / SME / Role Profile Owner display names |
| `sys_app_application`, `sys_app_module` (tables) | read | ATF T09 only – verify admin menu is hidden from employees |
| Script APIs: properties, user roles and groups, GlideRecord.setValue/insert/update, GlideRecordSecure.getValue, ScopedGlideElement | execute | Platform script APIs used by the app's own logic; no data access |
| Script APIs: string utilities, StepResult.setOutputMessage | execute | ATF suite only |
| `cmn_skill`, `cmn_skill_level` | **none** | Only when §6.3 is built, then **read only** |

There are **no** cross-scope create, write or delete privileges on any table.

---

## 8. Licensing and plugin assumptions

* Skills Management is a platform plugin and needs no additional licence; the design
  does not depend on it.
* Employee Center is installed on the PDI. Production use assumes the customer is
  entitled to Employee Center (bundled with HRSD/ESC entitlements). If it is not, the
  fallback is a scoped Service Portal or UI Builder page.
* No plugin activation is required by this design.

---

## 9. Open decision – the existing `x_2317791_cms_2_0` application

The instance already holds a CMS 2.0 application with a different, older-shaped model
and broad cross-scope grants. Before deploying, one of these must be chosen:

**Decision: Choice 1 – build alongside.** `x_2317791_cms_2_0` was not modified.

| Choice | What happens | Risk |
|---|---|---|
| **1. Build alongside (selected)** | New `x_2317791_cms2` app; `x_2317791_cms_2_0` untouched. The old app's menu is relabelled or deactivated by its owner later | Two "CMS 2.0" menus until the old app is retired; no data loss |
| 2. Convert and rework the existing scope | `now-sdk init --from <sys_id>` into Fluent, then restructure (drop the Competency layer, add Group/Version, migrate 32 elements and 104 descriptors) | Destructive schema changes to an existing app; migration effort |
| 3. Uninstall the existing app first | Remove `x_2317791_cms_2_0`, build fresh | Irreversible loss of its data and metadata |

---

## 10. Risks and limitations

| Risk | Mitigation |
|---|---|
| Two CMS 2.0 apps on the instance cause confusion | Choice §9; distinct scope; menu ordering and labelling |
| Framework not visible in OOTB skills pickers | Intentional for the prototype; §6.3 seam for later |
| Copy-on-revise grows row counts | Indexed `status`, `framework_version` and `effective_*`; retired rows filtered by default list views |
| Prototype Role Profile assignment is not authoritative | Table labelled "Prototype"; documented in `assumptions.md` |
| PL labels (Apply/Proficient/Accomplish/Master/Influence) not confirmed against an HTX source document | Stored as data and editable by CMS Admin; flagged in `assumptions.md` |
| Recommended Essential/total limits are business assumptions | Scoped system properties; warnings only, never a publish block |
| Employee pages are Service Portal pages hosted in Employee Center (`/esc?id=cms2_home`), not EC Content Publishing | Portal-independent pages; can be added to EC taxonomy/menus later |
| **CMS Administration Workspace route not resolving** on this PDI (`/now/cms-admin` returns "Page not found") although all workspace records and the route ACL install correctly | Classic application menu, forms and UI actions provide the same administration. See `assumptions.md` → Known issues |
