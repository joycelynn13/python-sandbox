# Showing My Role Profile on Xponent Hub

Goal: employees see their Role Profile on the Xponent Hub home page (`/hub?id=htx_home`) and can open
the CMS pages without leaving Xponent Hub.

## What CMS 2.0 provides

| Piece | Id | Notes |
|---|---|---|
| **My Role Profile card** (widget) | `x_2317791_cms2_my_rp_card` | Self-contained. Lays itself out by the width of its column: **compact** in a side column (Essential Elements with Target PLs, "Show more"), **full** in a main column (Essential and Complementary side by side) |
| CMS pages | `cms2_home`, `x_2317791_cms2_role_profiles`, `x_2317791_cms2_role_profile`, `x_2317791_cms2_library`, `x_2317791_cms2_element` | Portal-independent. Opened as `/hub?id=…` they render inside Xponent Hub with its header and theme |
| Preview page (admins) | `x_2317791_cms2_card_preview` | Shows the card at both widths, in any portal |

Card options (Page Designer → instance options):

| Option | Default | Use |
|---|---|---|
| `max_items` | 5 | Essential Elements shown before "Show more" |
| `hide_when_empty` | false | Hide the card for people with no Role Profile (recommended on Xponent Hub) |

All links in the card are relative (`?id=…`), so they stay in whichever portal hosts the card. This was
verified in Employee Center (`/esc`) and Service Portal (`/sp`).

## Steps on the company instance

1. **Use the company's scope code.** On the target instance, read `glide.appcreator.company.code`, then
   retarget the project:
   ```bash
   python3 tools/retarget-scope.py <company_code>
   ```
   ```bash
   python3 tools/retarget-scope.py <company_code> --apply
   ```
   Then:
   - give `now.config.json` a new `scopeId`;
   - delete `src/fluent/generated/keys.ts`;
   - re-run both generators;
   - build and deploy.

   Ids in this guide then read `x_<company_code>_cms2_…`. The home page id `cms2_home` has no scope prefix, so
   check it is still free on the target instance (Service Portal page ids are unique instance-wide).
2. **Decide on demo data.** Demo rows install as demo data. Install without them (`--demoData false`) once
   real framework content is loaded.
3. **Give employees access.** Grant `x_<company_code>_cms2.user` to all employees through a group (for
   example, the group Xponent Hub already uses for staff). The card and the CMS pages require it, and the
   ACLs only let it read Published content.
4. **Connect the authorised Role Profile source.** Replace the prototype `rp_assignment` table with the real
   employee → Role Profile mapping (EMPOWER MSS feed, Employee Profile or HR job code).
   `getMyRoleProfile()` in `src/server/cms-catalog.ts` is the only place that reads it. Then remove the
   "Prototype" tag from the card.
5. **Place the card (Xponent Hub owners).** In Service Portal → Page Designer, open `htx_home` and drag
   **CMS 2.0 – My Role Profile card** onto the page. Either:
   - into the **right column above "My favorites"** (compact), or
   - into the **main column under "Pending Actions"** (full).

   Set `hide_when_empty` to true. Xponent Hub's page belongs to its own application, so the Xponent Hub
   team makes this change; the CMS app does not edit their page.
6. **Point the existing "Competency Management" tile** in *Access Services* to `?id=cms2_home`,
   if that tile is meant to open CMS 2.0 rather than CMS 1.0.
7. **Test** with a real employee account: the card shows their Role Profile, the links open inside
   `/hub`, and people without a Role Profile do not see an empty card.

## Considerations

- **Performance:** the card makes two lightweight server calls per page view (assignment lookup and Role
  Profile detail). On a high-traffic home page, consider asynchronous loading (instance option
  *Load asynchronously → viewport*) so it never delays the rest of the page.
- **Look and feel:** the card uses a white surface, light border and inherited font to sit beside Xponent
  Hub cards. Its purple accent can be aligned to Xponent Hub's blue in `widgets/my-rp-card/styles.scss`.
- **CMS 1.0:** the existing "Competency Management" tile likely points to CMS 1.0. Agree on the cut-over
  before repointing it.
