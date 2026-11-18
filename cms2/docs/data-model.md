# CMS 2.0 – Data Model

Scope `x_2317791_cms2`. Source: `src/fluent/data-model/`. Visual version: `docs/data-architecture.html`.

> **Restructured (not yet installed on dev485488):**
> - Competency Group, Domain, Element, PL Descriptor and Role Profile now **extend the Governed Content base table** (`x_2317791_cms2_governed`), which holds the shared lifecycle fields once.
> - PL Descriptors can belong to a **Domain** (lower levels of Cross-Cutting Domains) or an **Element**.
> - See `docs/prompt-data-model-update.md` for the full rules. The tables below describe the installed (previous) structure until the app is reinstalled.

```
Framework Version ◄─────────────── every versioned row references one
        │
Competency Group ──1:n── Domain ──1:n── Element ──1:n── Element PL Descriptor ──n:1── Proficiency Level
                                           ▲                                              ▲
Role Profile ──1:n── Role Profile Element Requirement ─────────── Target PL ─────────────┘
     ▲
Prototype Role Profile Assignment (user_name → Role Profile code)
```

## Tables

| Table | Label | Display | Key columns |
|---|---|---|---|
| `x_2317791_cms2_fw_version` | Framework Version | name | name, version_number (unique), description, status, effective_from/to, active |
| `x_2317791_cms2_comp_group` | Competency Group | name | code, name, description, sequence + lifecycle |
| `x_2317791_cms2_domain` | Domain | name | code, name, description, competency_group, owner, sme, sequence + lifecycle |
| `x_2317791_cms2_element` | Element | name | code, name, domain, descriptor (Element Descriptor), sequence + lifecycle |
| `x_2317791_cms2_prof_level` | Proficiency Level | display_name | level (unique), code `PL1`… (unique), label, display_name (calculated), description, active |
| `x_2317791_cms2_pl_descriptor` | Element PL Descriptor | display_name | element, proficiency_level, descriptor, display_name (calculated) + lifecycle |
| `x_2317791_cms2_role_profile` | Role Profile | name | code, name, job_title, job_family, business_function (Function), description, owner, version + lifecycle |
| `x_2317791_cms2_requirement` | Role Profile Element Requirement | element | role_profile, element, requirement_type (essential / complementary), target_level, sequence, active |
| `x_2317791_cms2_rp_assignment` | Prototype Role Profile Assignment | user | user (stores `user_name` via referenceKey), role_profile_code, source, active |

**Lifecycle columns** on every versioned table:

| Column | Notes |
|---|---|
| `status` | Draft / Published / Retired (default Draft) |
| `framework_version` | Mandatory. Must be Published before content can be Published |
| `effective_from` / `effective_to` | Dates. Empty `effective_to` means open-ended |
| `active` | Boolean |
| `supersedes` | Read-only reference to the record this version replaces |

## Modelling decisions

* **No PL columns on Element.** One `pl_descriptor` row per Element × PL. Missing rows mean the level
  is not defined: an Element with PL1–PL4 simply has no PL5 row, and no UI ever shows an empty PL5.
* **Target PL is on the requirement row**, so Elements in the same Domain can have different targets.
* **Domain and Framework Version of a requirement are derived** by dot-walking (`element.domain`,
  `role_profile.framework_version`), not stored redundantly.
* **PL labels are data** (`prof_level`). Code, UI and validation messages read them from the table.
* The **old "Area" layer is not modelled.**
* **Role Profile assignment is keyed by Role Profile code**, so it resolves at runtime to the currently
  effective Published version and needs no change when a new version is published.

## Indexes

* `fw_version.version_number` is a unique index.
* Composite `(status, effective_from, effective_to)` indexes on every versioned table support the
  "currently effective" queries.
* Composite `(code, framework_version)` indexes on group, domain and element.
* `(element, proficiency_level, framework_version)` on PL descriptors.
* `(role_profile, element)` and `(element)` on requirements, used for the "affected Role Profiles" view.

## Versioning (copy-on-revise)

| Step | What happens |
|---|---|
| Edit Published | Blocked server-side for content columns (see `LOCKED_FIELDS` in `src/server/cms-config.ts`). Only status → Retired, `effective_to` and `active` may change |
| **Create New Version** | Clones the row to Draft with `supersedes` set. An Element version also copies its PL descriptors; a Role Profile version (`version` + 1) also copies its requirements |
| **Publish** | Validation runs (below). On success the predecessor is end-dated to the day before the new `effective_from`. It stays **Published** for its historical period, so old Role Profiles and future award records still resolve to it |
| Publish Element | Also publishes that Element's Draft PL descriptors in the same Framework Version |
| **Create Next Framework Version** | Copies all non-retired groups, domains, elements and descriptors into a new Draft Framework Version, re-pointing references. Role Profiles are versioned deliberately by Role Profile Administrators |
| **Retire** | Sets `effective_to` to today if empty. A retired record cannot be reinstated. An Element used by a currently effective Published Role Profile cannot be retired |

## Server-side validation (`src/server/cms-validation.ts`)

| Rule | Where |
|---|---|
| Publishing requires Effective From | all versioned tables |
| Effective To ≥ Effective From | all |
| Framework Version must be Published, and content Effective From must fall inside its period | content, Role Profile |
| Parent must be Published (Group → Domain → Element → Descriptor) | domain, element, descriptor |
| No overlapping Published periods for the same version key (code + version; element + PL + version; RP code) | all |
| No two active Draft descriptors for the same Element + PL + version | descriptor |
| Published Role Profile references only Published, active Elements in the same Framework Version, each with a Published descriptor at the Target PL | Role Profile publish, "Validate" action |
| Requirements only change on Draft Role Profiles; no duplicate active Element; Target PL must be a level the Element defines | requirement |
| Recommended limits (Essential 3–5, total ≤ 12) | warnings only; `…enforce_limits_on_publish` property makes them blocking |

## Configuration (system properties)

| Property | Default |
|---|---|
| `x_2317791_cms2.requirements.essential.min_recommended` | 3 |
| `x_2317791_cms2.requirements.essential.max_recommended` | 5 |
| `x_2317791_cms2.requirements.total.max_recommended` | 12 |
| `x_2317791_cms2.requirements.enforce_limits_on_publish` | false |
| `x_2317791_cms2.portal.url_suffix` | esc |

## Demo data

Generated by `tools/generate-demo-data.py` into `src/fluent/demo/demo-data.now.ts`. All 158 rows use
`installMethod: 'demo'` (`unload.demo`), so they are excluded from a production install.

| Content | Count / detail |
|---|---|
| Framework Versions | 2: 2026.1 Published, 2027.1 Draft |
| Competency Groups | 4, named as in the *Refreshed Technical Competency Framework*: Cross-Cutting Competencies, Specialised Competencies – Engineering, – Digital, – Sciences |
| Domains | **37** = 4 CCC + 10 Engineering + 13 Digital + 10 Sciences, as on the framework slide. 25 have no sample Elements yet |
| Elements | 12 |
| PL descriptors | 51. Elements cover PL1–PL3, PL1–PL4 or PL1–PL5 |
| Role Profiles | 7: five current Published, one historical v1 of *Engineer – Application Development* (end-dated 2026-06-30, superseded by v2), and one Draft |
| Requirements | 42 |
| Prototype assignments | 3: `admin` and `abel.tuter` → RP-XD-APPDEV; `beth.anglin` → RP-XD-DATA |

The PL scale (5 rows) is configuration, not demo data. It is loaded on first install only.
