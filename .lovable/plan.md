# Redesign Roles Designer + propagate roles everywhere

## 1. Visual redesign (RolesDesigner.tsx)

Match the uploaded reference:

- Grid of role cards (3 per row on desktop), instead of full-width stacked cards.
- Each card:
  - Top: tinted banner block with a centered avatar/user icon tile. Banner color cycles through a small palette (peach, mint, sky, lavender) by role index so cards feel distinct.
  - Body: role name + "Default" pill (only for default roles), one-line description.
  - Bottom: permission chips (light tinted badges).
- Header: "Roles Designer" title (no subtitle), search box on left, "+ Create New Role" button on right (accent color, matches current style).
- Remove the "Actions:" row entirely (no action tags anywhere).
- Empty-state hint when search returns nothing.

## 2. Permission model — reduced to 6

Replace `ALL_PERMISSIONS` (currently 17 items) with exactly:

1. Create Application
2. Edit Application
3. View Application
4. Fill Checklist
5. Edit Checklist
6. View Checklist

Update `TRADE_ROLES` and `RENEWAL_ROLES` seeds in `src/data/tradeLicenseTemplate.ts` and `src/data/renewalTemplate.ts` so each default role maps onto the new set:

- Citizen → Create Application, Edit Application, View Application
- Document Verifier → View Application, Fill Checklist, Edit Checklist, View Checklist
- Field Inspector → View Application, Fill Checklist, View Checklist
- Approver → View Application, Edit Application, View Checklist

Drop the `actions: string[]` field from the `TradeRole` type and all seed data; remove all UI rendering of it.

## 3. Editable roles + create flow

Same `Create New Role` dialog gets reused as an Edit dialog:

- Click pencil on a card → opens dialog prefilled with that role's name, description, permissions.
- Save updates in place; for default roles, name stays editable but `isDefault` flag is preserved and the role cannot be deleted (keep current behavior).
- Validation: name required, at least one permission selected.
- Deletion already works — keep it, but add a confirm dialog and a guard: if the role is referenced by any workflow transition, block deletion and show a toast listing the transitions; offer a "Reassign to…" picker.

Roles continue to persist via the existing `useModuleState("roles", serviceId, "__shared__", …)` so changes survive reloads and are shared across modules of a service.

## 4. Propagate roles to Workflow Designer

`WorkflowDesigner.tsx` currently hard-codes:

```ts
type RoleId = "citizen" | "documentVerifier" | "fieldInspector" | "approver";
const ROLE_OPTIONS = [...4 hard-coded entries]
```

Changes:

- Read roles from the same shared store via a small helper `useServiceRoles(serviceId)` (new file `src/lib/useServiceRoles.ts`) that returns `[{id, name, isDefault}]`.
- Replace `ROLE_OPTIONS` and `roleName()` with values derived from that hook.
- `RoleId` becomes `string`. Existing seeded transitions already use the same ids (`citizen`, `document_verifier` etc.) — add a tiny migration map for the legacy camelCase ids (`documentVerifier` → `document_verifier`, `fieldInspector` → `field_inspector`) when loading older saved workflows.
- New roles created in Roles Designer immediately appear in every "Performed by (Role)" dropdown (new transition dialog + selected-transition properties panel + table view).

## 5. Propagate to Preview

`PreviewContext.tsx` exposes `role: PreviewRole` with two fixed values today (`"citizen" | "employee"`). Two-part change:

- Keep the citizen/employee top-level toggle (the preview UI is built around that split).
- Add a sub-role picker in the employee mode: dropdown listing all non-citizen roles from the shared store. Default to the first non-citizen role.
- Filter the inbox / available actions in `EmployeeHome` and `ApplicationReview` by the selected employee role's permissions:
  - "View Application" → can open an application card.
  - "Edit Application" / "Fill Checklist" / "Edit Checklist" → action buttons enabled.
  - Otherwise the relevant button is hidden or shown disabled with a tooltip.
- Citizen role keeps the existing citizen permission semantics.

This makes the role system observable in the preview without rebuilding the whole employee shell.

## 6. Propagate to related configurators

- **Checklist Builder** — when assigning ownership of a checklist, source the role list from the same hook (right now ownership is implicit via workflow transitions; nothing extra to do here unless an owner selector exists, in which case swap its source).
- **Notifications Manager** — `recipientRole` selector reads from the shared role list.
- **Documents / Fees / Payments** — no role coupling today, leave untouched.

## 7. Suggestions (open questions for the user)

These are not in scope unless approved:

a. **Per-state visibility of citizen role** — should "Citizen" be hideable from employee dropdowns automatically? (Currently every role appears everywhere.)

b. **Role color tag** — let users pick a color when creating a role; reuse that color for the card banner and for the role badge shown on workflow nodes/transitions. Improves visual scanability across configurators.

c. **Duplicate role** — quick action on a card to clone an existing role's permissions as a starting point for a new one.

d. **Role usage panel** — on a role card, show "Used in N transitions, M notifications" with a link that filters Workflow Designer to those transitions. Helps before deleting.

e. **Bulk import roles** — paste a list of role names to scaffold multiple roles at once during initial setup.

f. **System vs. custom roles** — visually separate the default (system) roles from user-created ones with a small section header.

## Files touched

- `src/components/service-config/RolesDesigner.tsx` — full redesign + edit dialog + delete guard
- `src/data/tradeLicenseTemplate.ts`, `src/data/renewalTemplate.ts` — new permission ids, drop `actions`
- `src/lib/serviceRoles.ts` — drop the static fallback or update to new permission ids
- `src/lib/useServiceRoles.ts` (new) — shared hook reading from `useModuleState`
- `src/components/service-config/WorkflowDesigner.tsx` — dynamic role list + legacy id migration
- `src/components/service-config/NotificationsManager.tsx` — role dropdown source
- `src/components/preview/PreviewContext.tsx` + `EmployeeHome.tsx` + `ApplicationReview.tsx` — sub-role picker and permission gating
