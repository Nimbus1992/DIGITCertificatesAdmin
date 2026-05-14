# Workflow Designer Overhaul

The Workflow Designer becomes the canonical place where every state and every action is captured and configured end-to-end. Forms are removed from the workflow (one form per module lives only in the Form Builder). Roles move onto actions. Notifications, Payment requirement, and Checklists are first-class properties of the right place (state vs. action). The right-hand inspector becomes collapsible.

## What changes for the user

1. **States** capture lifecycle status only.
   - Editable: name, type (Start / In Progress / End), description, **notifications fired on entry**, **"Payment required at this state"** toggle.
   - Removed: Forms section (form lives in Form Builder).

2. **Actions (transitions)** capture who acts and what they must complete.
   - Editable: action name, From state, To state, **Role allowed to perform action** (single-select from project roles), **Checklist** items (existing builder), Conditions toggle.
   - Visible on canvas labels, table view, and inspector.

3. **Full edit** across both views.
   - Visual canvas: drag nodes, click to edit, delete state/transition (new trash button in inspector), add state, add transition.
   - Table view: every row's From / To / Action / Role / Checklist count is clickable to open the inspector for that transition; states get their own table tab so all states are also editable in tabular form.

4. **Collapsible inspector sidebar.**
   - A chevron button on the inspector's left edge collapses it to a thin rail (icon-only) and re-expands. Selection state is preserved.
   - Default: expanded. Persisted per service in `localStorage`.

5. **Notifications, Payments, Checklists clarification (placement contract):**
   - **Notifications** → attached to a **state** (fired when workflow enters that state). Existing seed already maps notifications by state name.
   - **Checklists** → attached to an **action** (must be completed before the transition is taken). Already modelled per transition.
   - **Payments** → a boolean flag on a **state** ("Payment is collected at this state"). Used by the Payments configurator and citizen preview to know which state triggers the pay screen. Seeded `true` for the existing "Payment Pending" state.

## Out of scope

- No backend changes. All persistence stays in `localStorage` via existing `useModuleState`.
- No changes to Form Builder, Notifications Manager, Checklist Builder, Fees, Payments, Roles screens beyond reading the new role/payment fields where already supported.
- No new visual theme / animation work.

## Technical changes

All changes confined to `src/components/service-config/WorkflowDesigner.tsx` plus tiny seed additions.

### Types
- `WorkflowState`: drop `forms`. Add `paymentRequired: boolean`.
- `WorkflowTransition`: add `roleId: string` (one of the project's role ids; default from seed `role` field on `TRADE_WORKFLOW_TRANSITIONS` / `RENEWAL_WORKFLOW_TRANSITIONS`).
- Add `ROLE_OPTIONS` derived from `TRADE_ROLES` (id + name) — imported from `@/data/tradeLicenseTemplate`.

### Seed
- `buildSeedStates`: stop attaching `forms`; set `paymentRequired = (state.name === "Payment Pending")`.
- `buildSeedTransitions`: copy `role` from source data into `roleId`.
- Bump storage prefix to `workflow-states-v2` / `workflow-transitions-v2` so old localStorage records don't collide with the new shape.

### Inspector — State panel
- Remove the entire Forms block.
- Keep Notifications block as-is.
- Add a single `Switch` row: "Payment collected at this state" bound to `paymentRequired`.
- Add destructive "Delete State" button at the bottom (guards against deleting the only Start state and against deleting a state referenced by a transition; show toast).

### Inspector — Transition panel
- Add a `Select` for "Role" listing `ROLE_OPTIONS`, bound to `roleId`.
- Add From / To `Select`s so the transition endpoints are editable here too.
- Add destructive "Delete Transition" button.

### Canvas
- Replace the `FileText` form indicator on each state node with a small `Wallet`/`IndianRupee` icon when `paymentRequired`.
- On each transition's pill label, append a tiny role chip (e.g. "Approver") next to the action name.

### Table view
- Add a top tabs control "States | Actions". Existing transition table goes under "Actions" with a new **Role** column (shows role name; click row to edit).
- New "States" table: Name, Type, Payment, Notifications count, with row click selecting that state.

### Collapsible right panel
- Wrap the right inspector in a div whose width toggles between `w-[320px]` and `w-10`.
- Collapse button is a vertical strip with a `ChevronRight` / `ChevronLeft` icon at the top-left of the panel.
- Persist `workflow-inspector-collapsed:{serviceId}` in `localStorage`.

### Cleanup
- Remove `showAddForm`, `newFormName`, `addFormToState`, `removeFormFromState` and the Add-Form dialog.

```text
Header
ScopeBar
┌──────────────────────────── flex-1 ────────────────────────────┬─ inspector ─┐
│ Visual canvas / Table (States | Actions tabs)                  │ collapsible │
│   nodes show: type · name · 💰 if paymentRequired · 🔔 if any  │  state /    │
│   labels show: action name · role chip                         │  transition │
└────────────────────────────────────────────────────────────────┴─────────────┘
```

## Files touched
- `src/components/service-config/WorkflowDesigner.tsx` (single-file refactor)
