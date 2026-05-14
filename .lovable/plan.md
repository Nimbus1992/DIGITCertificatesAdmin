
# Workflow: complete the path & wire to existing configurations

## 1) Why workflow ends at "Payment Pending"

The Issuance seed (`TRADE_WORKFLOW_TRANSITIONS` in `src/data/tradeLicenseTemplate.ts`) only goes:
`Submitted → Under Doc Verification → Inspection → Under Approval → Approve → Payment Pending`. There is no transition out of `s4 (Payment Pending)`, `s5 (Paid)` or into `s6 (License Issued)`. Renewal already has `Mark Paid` and `Issue Renewal`, Issuance does not.

**Fix:** add two seed transitions to `TRADE_WORKFLOW_TRANSITIONS`:
- `t_pay`   `Mark Paid`        s4 → s5  role: `citizen`   (no checklist)
- `t_issue` `Issue License`    s5 → s6  role: `approver`  (checklist: "Certificate generated", "Citizen notified")

Bump workflow storage prefix to `workflow-states-v3` / `workflow-transitions-v3` so existing localStorage seeds get re-hydrated with the new transitions (otherwise users on v2 still see the broken flow).

## 2) Attach existing Notifications / Checklists / Payments / Fees from configured lists

Today the workflow inspector only reads notifications baked into the seed and shows checklist items as free text. Each configurator already persists its own canonical list via `useModuleState`:

| Resource      | Storage key                                  | Lives in                    |
|---------------|----------------------------------------------|-----------------------------|
| Notifications | `notifications:{serviceId}:{moduleName}`     | NotificationsManager        |
| Checklists    | `checklists:{serviceId}:{moduleName}`        | ChecklistBuilder            |
| Payments      | `payments:{serviceId}:{moduleName}`          | PaymentsConfigurator        |
| Fees          | `fees:{serviceId}:{moduleName}`              | FeesConfigurator            |

The Workflow Designer should treat these as the **source lists** and only store *attachments* (arrays of ids) on each state/action.

### State-level attachments
A `WorkflowState` gains:
- `notificationIds: string[]`  — fired on entry. Replaces the embedded `notifications` array.
- `paymentStageId: string | null` — replaces the bare `paymentRequired` boolean. When set, the citizen pays at this state using that configured payment stage; the canvas `₹` chip shows the stage name on hover.

Seed mapping: for each seed state, attach all notifications whose `workflowState === state.name`; for `Payment Pending`, attach the first payment stage whose `workflowState === "Payment Pending"`.

### Action-level attachments
A `WorkflowTransition` gains:
- `checklistIds: string[]`     — must be completed before transition. Replaces inline `checklist` items.
- (existing `roleId` and `conditionsEnabled` stay.)

Seed mapping: for each seed transition with checklist items, find the configured `Checklist` whose `workflowState === transition.toStateId`'s state name (or by id match where possible) and attach it.

### Inspector UI
**State inspector** — replace current Notifications block and Payment switch with two pickers:
- **Notifications fired on entry** — multi-select list of notification subjects from the source. Each row: checkbox to attach, "Edit" button (opens existing notification edit dialog inline), channel badges. "Add new" button opens the same dialog with a fresh notification (saved into the source list and auto-attached). Empty source state: link "No notifications yet — create one" opens the dialog.
- **Payment stage** — single Select listing payment stages from the source + "Manage stage" pencil button → opens stage edit dialog. "Create new stage" option at bottom of the Select.

**Action inspector** — replace inline checklist editor with:
- **Checklist** — multi-select of configured checklists. Each attached row shows name + question count + "Edit" pencil → opens the checklist edit dialog (questions, required, field types). "Create new checklist" button at bottom.

### Edit-in-popup dialogs
Extract the edit forms used by the four configurators into reusable dialog components so the workflow designer can mount them:
- `NotificationEditDialog` (subject, message + variable chips, channels, workflow state, tag)
- `ChecklistEditDialog` (name, workflow state, questions list with field type, required, options)
- `PaymentStageEditDialog` (name, workflow state, fees, payment type, methods, gateway, receipt template)

Each dialog accepts `value`, `onSave`, `open`, `onOpenChange`. Used both inside their owning configurator and inside the workflow inspector. Saving writes back to the same `useModuleState` key so the existing configurator screens immediately reflect changes (no duplicate state). The workflow designer reads source lists by calling `useModuleState` with the same keys — the hook already returns the latest value from localStorage on mount.

### Canvas updates
- Replace the `₹` icon with a small pill showing the attached payment stage's name when `paymentStageId` is set.
- Bell icon shows count: `🔔 ×n` when `notificationIds.length > 0`.
- Action label keeps role chip; add tiny `✓ ×n` chip when `checklistIds.length > 0`.

### Table view updates
- States table: replace "Payment" Y/— with stage name (or "—"); "Notifications" cell shows count linking to source.
- Actions table: "Checklist" cell shows attached checklist names (truncated) instead of free-text count.

## 3) Migration / cleanup

- Remove `paymentRequired`, embedded `notifications`, and inline `checklist` from `WorkflowState` / `WorkflowTransition` types.
- Bump storage prefix to `v3` (states + transitions) so the new shape is seeded freshly without merging stale v2 data.
- Delete unused checklist add/update/remove handlers in `WorkflowDesigner.tsx`.

## Files touched

- `src/data/tradeLicenseTemplate.ts` — add `t_pay`, `t_issue` to `TRADE_WORKFLOW_TRANSITIONS`.
- `src/components/service-config/WorkflowDesigner.tsx` — type changes, seed mapping, inspector rewrite, canvas/table updates, mount edit dialogs.
- New `src/components/service-config/dialogs/NotificationEditDialog.tsx`
- New `src/components/service-config/dialogs/ChecklistEditDialog.tsx`
- New `src/components/service-config/dialogs/PaymentStageEditDialog.tsx`
- `NotificationsManager.tsx`, `ChecklistBuilder.tsx`, `PaymentsConfigurator.tsx` — refactor existing inline edit forms to use the new dialog components (no behavior change for those screens).

## Out of scope

- No backend / database changes.
- No new visual/animation work; reuse existing dialog & form styling.
- Fees stay edited only inside FeesConfigurator (the workflow only references fees indirectly through a payment stage).
