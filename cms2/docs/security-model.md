# CMS 2.0 – Security Model

Source: `src/fluent/security/`.

## Roles

| Role | Contains | Purpose |
|---|---|---|
| `x_2317791_cms2.user` | – | Employees: read Published content, browse Role Profiles and the Library |
| `x_2317791_cms2.content_admin` | user, canvas_user | Maintain Groups, Domains, Elements and PL descriptors (Draft content) |
| `x_2317791_cms2.role_profile_admin` | user, canvas_user | Function Leads: create Role Profiles, map Elements, set Essential/Complementary and Target PL, publish |
| `x_2317791_cms2.admin` | content_admin, role_profile_admin | Full CMS administration: Framework Versions, PL scale, settings, deletes |

Grant `x_2317791_cms2.user` to employees through a group, not individually.

## Record ACLs (55)

| Table | read | create / write | delete |
|---|---|---|---|
| comp_group, domain, element, pl_descriptor | user: `status=published^active=true`; content_admin and role_profile_admin: all | content_admin | admin |
| governed (base) | user: Published; both admin roles: all | admin | admin |
| fw_version | user: Published; both admin roles: all | admin | admin |
| prof_level | user | admin | admin |
| role_profile | user: Published; role_profile_admin and content_admin: all | role_profile_admin | admin |
| requirement | user: active rows of Published Role Profiles; both admin roles: all | role_profile_admin | role_profile_admin (the delete guard rule blocks it on Published) |
| proficiency (prototype) | user: **own rows only**; admin: all | admin | admin |
| rp_assignment | user: **own row only** (script `user == gs.getUserName()`); role_profile_admin: all | role_profile_admin | role_profile_admin |
| UX route `now.cms-admin.*` | the three admin roles | – | – |

Design notes:

* **Draft and Retired content is never readable by CMS Users.**
* **Historical Published rows stay readable**, so a still-effective Role Profile can show the Element
  version it was published against. The *employee listings* (browse, search, library) return only
  **currently effective** records. That filter is enforced in `src/server/cms-catalog.ts` with
  GlideRecordSecure, so ACLs still apply on top. ATF T12 tests it.
* **Server-side lifecycle rules** (business rules) enforce immutability of Published rows for every
  role, including administrators, so the ACLs are not the only line of defence.
* Every table sets `actions: { read: true, create: false, update: false, delete: false }`, so other
  scopes cannot write CMS data. Web service access is enabled for the REST API and ATF; ACLs still apply.
* Widgets require `x_2317791_cms2.user`. Pages require the same role, and the admin roles inherit it.
* Application menu and modules are limited to the admin roles (ATF T09).

## Cross-scope privileges

Declared in `src/fluent/security/cross-scope.now.ts`, with a table of reasons in that file and in
`architecture-decision.md` §7. Summary:

* **Table reads:** `sys_user` (display names) and `sys_app_application` / `sys_app_module` (ATF only).
* **Script-API execute** for platform APIs used by the app (properties, `gs.hasRole`, GlideRecord
  methods). These are runtime-access tracking records and grant no data access.
* **None** for create, write or delete on any table outside the scope.
* **None** on Skills Management tables.

## Least-privilege checks covered by ATF

| Test | Covers |
|---|---|
| T01 | Users read Published content but not Draft |
| T02 | Users cannot write or create content |
| T03 | Content admin can edit Drafts but not Published rows |
| T04 | Role Profile admin cannot create Elements |
| T08 | Requirements cannot be added to a Published Role Profile |
| T09 | Users see no admin modules and cannot create any CMS record |
