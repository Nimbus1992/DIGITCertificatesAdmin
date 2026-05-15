## Goal

Make the **Notifications Manager**, **Workflow Designer**, and **Preview** share a single source of truth so that:

1. Every notification configured in the Manager (or inline in Workflow Designer) fires in Preview at the matching workflow state, on the configured channel, addressed to the configured role.
2. Every notification the preview already sends (today driven by the hardcoded `NOTIFICATION_MATRIX`) is visible — and editable — inside the Notifications Manager and the Workflow Designer's per-state notifications panel.

## Current gap

- `NOTIFICATION_MATRIX` (in `src/components/preview/notifications/notificationMatrix.ts`) is the only thing the preview reads. It is keyed by **trigger ids** like `application_submitted`, not workflow state names.
- `NotificationsManager` and `WorkflowDesigner` write to `useModuleState("notifications", serviceId, moduleName)`. The preview never reads it.
- Result: edits in the Manager are invisible to Preview, and the matrix entries (e.g. citizen "Application submitted" SMS+Email+Push, document-verifier "New application to verify") never appear in the Manager.

## Solution — one shared store

### 1. Migrate `NOTIFICATION_MATRIX` into the seed

Rewrite `buildDefaultNotifications` (used by `useModuleState` in `NotificationsManager.tsx`) so the seed is the **union** of:

- The existing template-specific seeds in `tradeLicenseTemplate.ts` / `renewalTemplate.ts`, plus
- One row per `(triggerId, channel, recipientRole)` from `NOTIFICATION_MATRIX`, mapped onto a workflow **state name** via a fixed `TRIGGER_TO_STATE` table:

```text
application_submitted   → "Submitted"
document_verified       → "Under Document Verification"
application_verified    → "Inspection Pending"
inspection_completed    → "Under Approval"
application_approved    → "Payment Pending"
application_sent_back   → "Sent Back"
application_rejected    → "Rejected"
payment_successful      → "Paid"
license_issued          → "License Issued"
document_rejected       → "Under Document Verification"
renewal_submitted       → "Submitted"          (renewal module)
renewal_completed       → "License Renewed"    (renewal module)
```

Each generated row carries `id` (deterministic, e.g. `seed-${triggerId}-${channel}-${role}`), `channel` (lower-cased from matrix), `recipientRole` (mapped to a service role id; `documentVerifier`→`document_verifier`, `fieldInspector`→`field_inspector`, others 1:1), `subject` (matrix `title`), `message` (matrix `message`, `{{var}}` syntax preserved), and `tag` = state name. Deterministic ids let the deduper drop true duplicates if the user resets.

After this change, opening the Manager on a fresh service shows every preview notification, grouped under the right channel/state. Editing or deleting them is just normal CRUD — they're stored in the same `useModuleState` array.

### 2. Preview reads the shared store

Add `src/lib/useServiceNotifications.ts`:

```ts
useServiceNotifications(serviceId) → {
  forStateName(stateName: string, type: "NEW"|"RENEWAL"): Notification[]
}
```

Reads both `notifications:<serviceId>:Issuance` and `notifications:<serviceId>:Renewal` from `localStorage`, falls back to `buildDefaultNotifications`, and re-reads on a custom `notifications-updated` event + native `storage` event (mirrors `FORM_UPDATED_EVENT`).

In `PreviewContext.tsx`:

- Replace `emitEvent(triggerId, app, meta)` internals with `dispatchUserNotifications(app, stateName, meta)`. Resolve current state name via `workflowStates.find(s => s.id === app.currentStateId)?.name`.
- For each matched record:
  - Resolve `{{applicationNumber}}`, `{{applicantName}}`, `{{businessName}}`, `{{amount}}`, `{{licenseNumber}}`, `{{validTill}}`, etc. — same variable set the matrix already uses (move `resolveTemplate` into a shared `templateEngine` call that accepts a record).
  - `channel === "push"` → `pushNotification(subject, message, app.id, recipientRole)`.
  - `channel === "email" | "sms"` → append `SimulatedMessage`; render floating toast only when `recipientRole` resolves to citizen AND active preview role is citizen (preserves current UX).
- Map custom role ids (anything outside the four built-in preview roles) → leave `recipientRole` undefined, so the bell shows it to all roles. Use `canonicalRoleId` for legacy mappings.
- Call `dispatchUserNotifications` at every state change: `submitApplication`, `submitRenewal`, `transitionApplication` (after computing `nextState`), `payApplication`, `issueLicense`, `completeRenewal`. Removes the per-trigger emit calls and relies purely on state names.

### 3. Workflow Designer parity

`WorkflowDesigner.tsx` already reads/writes the same `useModuleState("notifications", …)` array, so once seeding is unified, every preview notification automatically appears in the per-state side panel. Keep its inline editor; just add `window.dispatchEvent(new CustomEvent("notifications-updated", { detail: { serviceId } }))` after save/delete so the preview hook live-refreshes.

### 4. Manager change events

In `NotificationsManager.tsx`, dispatch the same `notifications-updated` event after Create / Edit / Duplicate / Delete.

### 5. Retire the duplicate matrix path

`NOTIFICATION_MATRIX` becomes a build-time seed only — exported, imported by `buildDefaultNotifications`, but no longer read at runtime by `PreviewContext`. `templateEngine.resolveTemplate` is generalised to accept either shape.

## Files touched

- `src/data/tradeLicenseTemplate.ts`, `src/data/renewalTemplate.ts` — extend `TRADE_NOTIFICATIONS` / `RENEWAL_NOTIFICATIONS` seeds with the matrix-derived rows (or compute the union inside `buildDefaultNotifications`).
- `src/components/service-config/NotificationsManager.tsx` — share `buildDefaultNotifications`, dispatch `notifications-updated`.
- `src/components/service-config/WorkflowDesigner.tsx` — dispatch `notifications-updated`.
- `src/lib/useServiceNotifications.ts` *(new)* — shared reader hook.
- `src/components/preview/PreviewContext.tsx` — replace `emitEvent` with state-name dispatcher; consume the hook.
- `src/components/preview/notifications/templateEngine.ts` — accept the shared `Notification` shape.
- `src/components/preview/notifications/notificationMatrix.ts` — keep as the seed source; add `TRIGGER_TO_STATE` map and role-id mapping helpers.

## Out of scope

- No backend persistence beyond the existing `localStorage` layer.
- No UI changes to `NotificationsPanel` or `MessagesDrawer`.
- No new notification triggers — preview still fires only at real state changes the simulator already performs.
