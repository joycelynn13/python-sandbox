# CMS 2.0 brief – replacement text for the data model sections

Paste this over sections **4 (Recommended hybrid mapping)** and **5 (Minimum data model)** of the Claude
Code brief. It reflects the decisions taken so far and the Cross-Cutting Competency (CCC) structure.

---

## 4. Data model approach

Use a dedicated scoped application, `x_2317791_cms2`. Do not reuse Skills Management tables for Groups,
Domains or Elements: they are global and have no status, version or effective dating. A read-only link to
`cmn_skill` may be added later for the assessment phase.

Model all governed content with **table extension**:

- Create one extensible base table, **Governed Content** (`x_2317791_cms2_governed`), holding the fields
  every governed record shares: code, name, description, sequence, Framework Version, status
  (Draft / Published / Retired), Effective From, Effective To, active and supersedes.
- **Competency Group, Domain, Element, PL Descriptor and Role Profile extend it** and add only their own
  fields. Use typed references between them so the hierarchy cannot be broken.
- Define lifecycle business rules and the Publish / Retire / Create New Version actions **once, on the base
  table**. Gate the actions with `current.canWrite()` so each role only acts on what its ACLs allow.
- Framework Version, Proficiency Level, Role Profile Element Requirement and the prototype Role Profile
  Assignment are separate tables, not extensions.

## 5. Competency Library structure

The library has two descriptor patterns. **Do not assume every Proficiency Level descriptor belongs to an
Element.**

**Specialised Competencies (SPC)** – every level is described per Element:

```
Domain
└── Element
    ├── PL1 Descriptor
    ├── PL2 Descriptor
    ├── PL3 Descriptor
    ├── PL4 Descriptor
    └── PL5 Descriptor
```

**Cross-Cutting Competencies (CCC)** – the lower levels are described once for the whole Domain, the higher
levels per Element:

```
Domain
├── PL1 Domain Descriptor
├── PL2 Domain Descriptor
└── Elements
    ├── Element 1
    │   ├── PL3 Descriptor
    │   ├── PL4 Descriptor
    │   └── PL5 Descriptor
    ├── Element 2
    └── ...
```

Requirements:

1. **Domain** has a **Proficiency Structure** field: *Element levels only* (SPC, default) or *Domain levels,
   then Element levels* (CCC). It also has **Domain Levels Up To**, a reference to the highest PL described at
   Domain level (PL2 in the current framework). The split is configured per Domain, never hard-coded to "CCC".
2. A single **PL Descriptor** table holds both kinds. It references **either a Domain or an Element**, never
   both, plus a Proficiency Level. An **Applies To** field (Domain / Element) records which.
3. Server-side validation:
   - exactly one of Domain / Element is set;
   - a Domain-level descriptor is only allowed on a Domain with the CCC structure, at or below Domain Levels Up To;
   - an Element-level descriptor in a CCC Domain must be above Domain Levels Up To;
   - no two active Drafts, and no overlapping Published rows, for the same owner, PL and Framework Version.
4. **An Element's levels = its Domain's descriptors + its own.** A Role Profile requirement for a CCC Element
   may target a Domain-level PL (e.g. PL2). Publishing checks that the Target PL has a Published descriptor
   on the Element or its Domain.
5. Publishing a Domain publishes its Draft Domain-level descriptors; a new Domain version copies them; a new
   Framework Version copies descriptors of both kinds.
6. Not every Element or Domain supports every PL. Never create or show an empty descriptor.

Employee experience:

- A CCC Domain page shows the Domain-level ladder (e.g. PL1–PL2) first, then the Elements.
- An Element's proficiency ladder shows inherited Domain-level levels tagged "Domain level", then its own.
- Domain cards on the Library landing page show which levels are described at Domain level.

Testing: add an ATF test proving the CCC rules above, the inherited levels on the Element page, and a Role
Profile targeting a Domain-level PL.

### Open question for the business

Should a Role Profile be able to require a **CCC Domain as a whole** at PL1–PL2, rather than one of its
Elements? The prototype keeps the brief's rule that requirements sit at Element level, with lower CCC levels
inherited from the Domain.
