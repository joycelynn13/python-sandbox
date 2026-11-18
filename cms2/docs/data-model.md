# CMS 2.0 – Data Model

Scope `x_2317791_cms2`. Source: `src/fluent/data-model/`. Visual version: `docs/data-architecture.html`.

```
Framework Version  ◄──── every Governed Content record references one

Governed Content (extensible base: code, name, description, sequence, framework_version,
│                 status, effective_from, effective_to, active, supersedes)
├── Competency Group ──1:n── Domain ──1:n── Element
│                              │               │
│                              │ (CCC: PL1–PL2) │ (all other PLs)
├── PL Descriptor ◄────────────┴───────────────┘   ──n:1── Proficiency Level
└── Role Profile ──1:n── Role Profile Element Requirement ──► Element, Target PL

Role Profile Assignment (prototype: user_name → Role Profile code)
```

## Tables (10)

| Table | Label | Extends | Own columns |
|---|---|---|---|
| `x_2317791_cms2_governed` | Governed Content | – (extensible) | code, name, description, sequence, framework_version, status, effective_from, effective_to, active, supersedes |
| `x_2317791_cms2_comp_group` | Competency Group | Governed Content | – |
| `x_2317791_cms2_domain` | Domain | Governed Content | competency_group, owner, sme, **pl_structure** (*Element levels only* / *Domain levels, then Element levels*), **domain_levels_to** (Proficiency Level) |
| `x_2317791_cms2_element` | Element | Governed Content | domain. The inherited `description` is labelled *Element Descriptor* |
| `x_2317791_cms2_pl_descriptor` | PL Descriptor | Governed Content | **applies_to** (Domain / Element), **domain**, **element**, proficiency_level. The inherited `description` is labelled *PL Descriptor*; code and name are calculated |
| `x_2317791_cms2_role_profile` | Role Profile | Governed Content | job_title, job_family, business_function, owner, version |
| `x_2317791_cms2_fw_version` | Framework Version | – | name, version_number, description, status, effective dates, active |
| `x_2317791_cms2_prof_level` | Proficiency Level | – | level, code (PL1…), label, display_name, description, active |
| `x_2317791_cms2_requirement` | Role Profile Element Requirement | – | role_profile, element, requirement_type (Essential / Complementary), target_level, sequence, active |
| `x_2317791_cms2_rp_assignment` | Prototype Role Profile Assignment | – | user (stores `user_name`), role_profile_code, source, active |

## Why table extension

- Shared lifecycle columns, lifecycle business rules and the Publish / Retire / Create New Version actions
  are defined **once** on Governed Content and inherited by all five types (the task → incident pattern).
- Each child keeps its own fields and **typed references**, so the hierarchy can't be broken.
- A list on the base table gives cross-type views with a Type column: **Draft Content** and
  **Published Content**.
- Requirement, Proficiency Level, Framework Version and Assignment are different kinds of record, so they
  don't extend it.

## Two descriptor patterns

| Domain Proficiency Structure | Where PL descriptors live | Used by |
|---|---|---|
| *Element levels only* (default) | every PL on the Element | Specialised Competencies |
| *Domain levels, then Element levels* | PL1 … `domain_levels_to` on the Domain; higher PLs on each Element | Cross-Cutting Competencies (PL2 today) |

- **One descriptor table, two owners.** A PL Descriptor references exactly one Domain or one Element.
- **An Element's levels** = its Domain's descriptors + its own (`elementLevelMap()` in `cms-catalog.ts`).
  A requirement may target an inherited level, e.g. PL2 on a CCC Element.
- **Not every owner has every level.** A missing row means the level is not defined, so no empty PL5 is
  ever shown.

## Server-side rules (`src/server/cms-validation.ts`)

| Rule | Applies to |
|---|---|
| Publishing requires Effective From, a Published Framework Version and a Published parent | all Governed Content |
| Published content columns are frozen; revise with **Create New Version** (copy-on-revise) | all |
| No overlapping Published periods for the same version key | all |
| Exactly one of Domain / Element on a PL Descriptor | PL Descriptor |
| Domain-level descriptors only on *mixed* Domains, at or below Domain Levels Up To | PL Descriptor |
| Element descriptors in a *mixed* Domain must be above Domain Levels Up To | PL Descriptor |
| No two active Drafts for the same owner, PL and Framework Version | PL Descriptor |
| A *mixed* Domain needs Domain Levels Up To | Domain |
| Requirements change only on Draft Role Profiles; no duplicate Element; the Target PL must be defined on the Element or its Domain | Requirement |
| A Role Profile publishes only with Published Elements in its Framework Version, each with a Published descriptor (Element or Domain) at the Target PL | Role Profile |
| An Element used by a currently effective Role Profile cannot be retired | Element |
| Recommended limits (3–5 Essential, ≤ 12 total) | warnings only, unless the enforce property is on |

## Versioning

| Action | Effect |
|---|---|
| Create New Version | Clones to Draft with `supersedes`. A new Element or Domain version also copies the descriptors it owns; a new Role Profile version also copies its requirements |
| Publish | Validates, then end-dates the predecessor (it stays Published for its period). Publishing an Element or a Domain also publishes its Draft descriptors |
| Create Next Framework Version | Copies Groups, Domains, Elements and both kinds of descriptor into a new Draft version |
| Retire | Sets Effective To; cannot be reinstated |

## Demo data (synthetic, `installMethod: 'demo'`)

| Content | Count |
|---|---|
| Framework Versions | 2 (2026.1 Published, 2027.1 Draft) |
| Competency Groups | 4 |
| Domains | 37 (4 CCC with *Domain levels, then Element levels* up to PL2; 33 Specialised) |
| Elements | 12 (CCC Elements start at PL3) |
| PL Descriptors | 52 (8 Domain-level, 44 Element-level) |
| Role Profiles | 7 (5 current, 1 historical version, 1 Draft) |
| Requirements | 42 |
| Prototype assignments | 3 |

The PL scale (5 rows) is configuration, loaded on first install.
