# CMS 2.0 – Competency Management (Now SDK)

ServiceNow scoped application **`x_2317791_cms2`**: HTX Competency Library (Competency Group → Domain →
Element → PL descriptor), Role Profiles with Essential / Complementary Element requirements and Target
PLs, Framework Versions and effective dating. **Prototype – all demo content is synthetic.**

* Architecture: [`docs/architecture-decision.md`](docs/architecture-decision.md)
* Data model: [`docs/data-model.md`](docs/data-model.md)
* Security: [`docs/security-model.md`](docs/security-model.md)
* Tests: [`docs/test-plan.md`](docs/test-plan.md)
* Assumptions and known issues: [`docs/assumptions.md`](docs/assumptions.md)
* Showing My Role Profile on Xponent Hub: [`docs/xponent-hub-integration.md`](docs/xponent-hub-integration.md)

## Where things are on the instance

| What | URL |
|---|---|
| Employee landing (Employee Center) | `/esc?id=cms2_home` |
| Browse Role Profiles | `/esc?id=x_2317791_cms2_role_profiles` |
| Competency Library (37 Domains) | `/esc?id=x_2317791_cms2_library` |
| One Domain | `/esc?id=x_2317791_cms2_library&domain=<sys_id>` |
| Admin | Navigator → **CMS 2.0 – Competency Management** |
| Admin workspace (known issue) | `/now/cms-admin/home` |

## Source layout

```
src/fluent/
  application/menu.now.ts          application menu + 19 modules
  data-model/*.now.ts              10 tables (Governed Content base + 5 extending it + 4 others) + forms
  security/                        roles, 45 ACLs, cross-scope privileges
  business-rules/validation.now.ts lifecycle rules (logic in src/server)
  configuration/                   system properties, PL scale (first install)
  script-includes/                 CmsCatalogApi, CmsAdminActions (thin bridges)
  ui/ui-actions.now.ts             Publish / Validate / Create New Version / Retire
  ui/workspace.now.ts              CMS Administration Workspace + dashboard
  ui/portal/                       6 Service Portal widgets, 5 pages
  tests/cms-atf.now.ts             13 ATF tests + suite      (generated)
  demo/demo-data.now.ts            synthetic demo data       (generated)
src/server/                        TypeScript modules: config, dates, validation, versioning, catalog, rules
src/script-includes/               bridge JS for Script Includes
tools/                             generators for demo data and ATF; retarget-scope.py for another company code
```

`.now.ts` files must be declarative (no loops or interpolation), so the repetitive demo data and ATF
scripts are produced by Python generators in `tools/`. Edit the generators, then re-run them:

```bash
python3 tools/generate-demo-data.py
```

```bash
python3 tools/generate-atf.py
```

## Build and deploy

```bash
npm install
```

```bash
npm run build
```

```bash
npm run deploy
```

In a container without an OS keyring, store SDK credentials with `SN_SDK_KEY_SOURCE=env` and an
`SN_SDK_ENCRYPTION_KEY`; set `NO_TELEMETRY=1` when the telemetry host is unreachable.
