Three fixes, all aligned around making the preview consume what the Workflow Designer actually configures.

## 1. Workflow ↔ Preview two-way sync

Today `PreviewContext` ships with hardcoded `DEFAULT_WORKFLOW_STATES` / `DEFAULT_TRANSITIONS`. The Workflow Designer writes its real states/transitions to `workflow-states-v3:<service>:<module>` and `workflow-transitions-v3:<service>:<module>` via `useModuleState`, but the preview never reads them. Result: edits in the Designer don't change what the preview shows or which actions appear in `ApplicationReview`.

### Add `src/lib/useServiceWorkflow.ts` (new)

Mirrors the `useServiceNotifications` pattern:

```ts
useServiceWorkflow(serviceId) → {
  issuance: { states: WorkflowState[]; transitions: WorkflowTransition[] };
  renewal:  { states: WorkflowState[]; transitions: WorkflowTransition[] };
  forType:  (type: "NEW" | "RENEWAL") => { states; transitions };
}
```

- Reads both module keys from `localStorage`.
- Seeds with `buildSeedStates` / `buildSeedTransitions` (extract these from `WorkflowDesigner.tsx` into `src/data/workflowSeeds.ts` so both files share them).
- Re-reads on a new `WORKFLOW_UPDATED_EVENT` and on native `storage` events.

### Wire it into `PreviewContext.tsx`

- Replace `DEFAULT_WORKFLOW_STATES` / `DEFAULT_TRANSITIONS` everywhere with the values from `useServiceWorkflow(routeServiceId).forType(app.type)`.
- `transitionApplication` resolves the transition + target state from the active workflow (per app type), not the constant.
- `toggleChecklist` uses the active workflow's transition list to seed checklist items.
- For lifecycle actions whose state-id is currently hardcoded (`s1` on submit, `s5` on pay, `s6` on issue, `s9` on renewal complete), look up by **type/name** in the active workflow:
  - submit → `states.find(s => s.type === "start") ?? states[0]`.
  - pay → state named `"Paid"` (fall back to first state after Payment Pending if missing).
  - issue → `"License Issued"`.
  - renewal complete → `"License Renewed"`.

  This keeps preview working when names change and degrades gracefully if a state was deleted (skips the transition with a console warning).
- The `workflowStates` / `workflowTransitions` exposed on the context become the **issuance** workflow by default but switch to renewal whenever the active screen is for a renewal application (`ApplicationReview` already filters by `app.currentStateId`, so this just needs `workflowStates`/`workflowTransitions` to be the union of both modules so both kinds of apps render correctly).

### Emit `WORKFLOW_UPDATED_EVENT` from Workflow Designer

In `src/components/service-config/WorkflowDesigner.tsx`, dispatch `window.dispatchEvent(new CustomEvent("workflow-updated", { detail: { serviceId } }))` after every state CRUD (`addState`, `updateState`, `deleteState`, drag end), every transition CRUD, and notification/payment-stage attachment changes that affect state metadata. Wrap the `setStates` / `setTransitions` callers with a small helper to centralise this.

## 2. Allow deleting workflow states

`deleteState` in `WorkflowDesigner.tsx` currently refuses when any transition references the state. Behaviour change:

- Replace the hard refusal with a confirm dialog: "Delete '{name}'? This will also remove N action(s) connected to it."
- On confirm: cascade — `setTransitions(prev => prev.filter(t => t.fromStateId !== id && t.toStateId !== id))`, then remove the state.
- Keep the "Cannot delete the only Start state" guard.
- After deletion, also strip the state's `notificationIds` references from any orphaned notifications (notifications themselves stay; they just stop being routed via this state).
- Surface the `notifications-updated` and new `workflow-updated` events so the preview's bell/action list refreshes immediately.

## 3. Remove "License Renewed" from the Issuance workflow

`s9 — License Renewed` is a renewal-only end state but currently appears in:

- `src/data/tradeLicenseTemplate.ts` → `TRADE_WORKFLOW_STATES` (line 178), and the `"License Renewed"` entry in `TRADE_STATE_TAG_COLORS`.
- `src/components/service-config/WorkflowDesigner.tsx` → `ISSUANCE_STATE_LAYOUT.s9` (line 139).
- `src/components/preview/PreviewContext.tsx` → `DEFAULT_WORKFLOW_STATES` (line 336) and the `completeRenewal` flow that sets `currentStateId: "s9"` on a renewal app.

Plan:

- Drop `s9` from `TRADE_WORKFLOW_STATES`, the layout map, and `TRADE_STATE_TAG_COLORS` (move/keep only in renewal). The renewal template (`RENEWAL_WORKFLOW_STATES`) already owns `License Renewed` and stays untouched.
- Drop `s9` from `DEFAULT_WORKFLOW_STATES` once the workflow comes from `useServiceWorkflow`. `completeRenewal` then resolves the License Renewed state from the **renewal** workflow only (matches its name there).
- Existing user services that already persisted `workflow-states-v3:*:Issuance` with s9 in `localStorage` will keep showing it (we don't migrate persisted state). New services and any "Reset to defaults" path will get the cleaned seed.

## Files touched

- `src/data/workflowSeeds.ts` *(new)* — extracted `buildSeedStates` / `buildSeedTransitions` so the new hook and `WorkflowDesigner` share them.
- `src/lib/useServiceWorkflow.ts` *(new)* — shared reader hook + `WORKFLOW_UPDATED_EVENT` + `emitWorkflowUpdated` helper.
- `src/components/service-config/WorkflowDesigner.tsx` — cascade-delete in `deleteState`, dispatch `workflow-updated` from CRUD, import shared seed helpers, drop `s9` layout entry.
- `src/components/preview/PreviewContext.tsx` — consume `useServiceWorkflow`; replace `DEFAULT_*` lookups; resolve lifecycle states by name/type; expose merged states/transitions on the context.
- `src/data/tradeLicenseTemplate.ts` — remove the `s9 / License Renewed` row and tag color (issuance only).

## Out of scope

- No backend persistence beyond existing `localStorage`.
- No data migration for already-persisted Issuance workflows that include `s9`; users can delete the state via the new cascade-delete flow.
- No changes to renewal workflow (it correctly owns License Renewed).
- No new transitions added to preview — preview still drives lifecycle from its existing helpers (`pay`, `issue`, `completeRenewal`); it just resolves target states from the live workflow store.
