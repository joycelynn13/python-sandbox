# CMS 2.0 – Assumptions, Open Questions and Known Issues

## Assumptions

| # | Assumption | Impact if wrong |
|---|---|---|
| A1 | PL labels are PL1 Apply, PL2 Proficient, PL3 Accomplish, PL4 Master, PL5 Influence. **Not yet confirmed against an approved HTX source document** | Edit the 5 `Proficiency Level` rows (CMS Admin); no code change |
| A2 | Essential 3–5 and total ≤ 12 are recommendations, not rules | Set `x_2317791_cms2.requirements.enforce_limits_on_publish=true` to make them blocking |
| A3 | A Published Role Profile references Elements of its **own** Framework Version only | Relax the check in `roleProfileIssues()` |
| A4 | Content Administrators may see Draft Role Profiles (impact analysis) | Remove them from the read-admin ACL |
| A5 | Employees receive `x_2317791_cms2.user` through a group | A group or HR-criteria assignment needs to be set up |
| A6 | Employee Center is the employee channel. Pages are Service Portal pages opened inside `/esc` | Pages are portal-independent and can be moved to another portal |
| A7 | EMPOWER MSS is out of scope. Prototype assignments link `sys_user.user_name` → Role Profile code | Replace `x_2317791_cms2_rp_assignment` with the authorised source; `getMyRoleProfile()` is the only consumer |
| A8 | All demo content is **synthetic** and is not approved HTX competency policy | Demo rows are in `unload.demo` and can be excluded from installs |
| A10 | Competency Group names follow the *Refreshed Technical Competency Framework* slide ("Specialised Competencies"), not the earlier brief ("Specialist Professional Competencies") | Rename the 4 group records |
| A9 | Skills Management is not used yet; Elements may later link read-only to `cmn_skill` for the assessment phase | See ADR §6.3 |

## Open questions for the business

0. In Cross-Cutting Domains, should a Role Profile be able to require the **whole Domain** at PL1–PL2 instead of one of its Elements? Today requirements stay at Element level and the lower levels are inherited from the Domain.

1. Confirm the PL labels and whether every framework uses five levels.
2. Should a Role Profile be allowed to mix Elements from different Framework Versions during a transition?
3. Should publishing be blocked when the Essential/total recommendations are exceeded?
4. What is the authoritative employee → Role Profile source (EMPOWER MSS, Employee Profile, HR job code)?
5. Who approves publication? A governance approval step (Flow) could be added before Publish.

## Known issues

| Issue | Status | Workaround |
|---|---|---|
| **CMS Administration Workspace** (`/now/cms-admin/home`) returns "Page not found" on dev485488. All workspace records install correctly (page registry, app config, routes, screens, list menu, dashboard), as does the route ACL `now.cms-admin.*`, and they match a working OOTB workspace. A cache flush and re-activating the registry did not help | Open | Use the classic **CMS 2.0 – Competency Management** application menu: all modules, forms, related lists ("Affected Role Profiles") and Publish / Validate / New Version / Retire actions work there. Next step: open the experience in UI Builder (`/now/builder/ui/experience/7295a1f6820b439ea5ee332dabf0daf5`) and save it once, or raise it as an SDK 4.14.2 / Brazil Workspace issue |
| The server module path contains the package version (`x_2317791_cms2/cms2/0.0.1/...`) in the two Script Include bridges | By design of SDK modules | When `package.json` version changes, update `src/script-includes/*.js` |
| The previous app `x_2317791_cms_2_0` ("CMS 2.0 – Competency Management") is still installed, so two menus with the same name exist | Decision: build alongside | Retire or uninstall `x_2317791_cms_2_0` when ready (product owner decision) |
| A user reference stored by REST/integrations may hold the sys_id instead of `user_name` (referenceKey) | Handled | The "own assignment" ACL and `getMyRoleProfile()` accept either form |
| Business rules do not run when demo data loads from XML | Expected | Demo rows set calculated fields (`display_name`) explicitly |
