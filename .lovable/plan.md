## Goal

Every change made in a configurator (Form, Roles, Workflow, Checklists, Notifications, Documents, Fees, Payments) must be reflected immediately in the **Service Preview**, with no page reload. Today the wiring is partial — this plan closes the gaps and defines the test matrix to validate it.

---

## Current state — what's already wired vs not

| Configurator | Storage key | Read by preview? | Gap |
|---|---|---|---|
| Form Builder | `formbuilder:<sid>:<module>` (formStorage) | ✅ via `loadFormSteps` + `FORM_UPDATED_EVENT` + storage event | — |
| Workflow Designer | `workflow-states-v4:<sid>:<module>` / `workflow-transitions-v4:<sid>:<module>` | ✅ via `useServiceWorkflow` | Acting role + attached docs per state not read by preview |
| Notifications | `notifications:<sid>:<module>` | ✅ via `useServiceNotifications` (dispatched on state entry) | — |
| Roles | `roles:<sid>:<module>` | ⚠ Read by `PreviewSidebar` for role chooser only | Transitions still hard-mapped to 4 preview roles (`citizen / DV / FI / approver`); custom roles collapse to `"any"` and aren't actionable in employee inbox |
| Checklists | `checklists:<sid>:<module>` | ❌ Preview uses inline checklist items shipped on transition; ignores configured `checklistIds` | Need to resolve `transition.checklistIds` → checklist items at dispatch time |
| Documents | `documents:<sid>:<module>` | ❌ Preview hard-codes Application PDF, Demand Notice, Receipt, Certificate generation | Need to drive citizen "My Documents" + state-bound auto-generation from configured docs (`generateWhen` + `WorkflowState.attachedDocumentIds`) |
| Fees | `fees:<sid>:<module>` | ❌ Preview hard-codes `{ fee:1000, tax:100, total:1100 }` | Need to compute demand from configured fees (flat + slab + tax) |
| Payments | `payment-stages:<sid>:<module>` | ❌ Demand always triggers on entry to "Payment Pending" with a hard-coded amount | Need to use the stage mapped to the entered state, with that stage's fee list |

---

## Implementation plan

### 1. Single source of truth for "config → preview"

Create `src/lib/usePreviewConfig.ts` that returns, per service+module:
```ts
{ roles, workflow, checklists, notifications, documents, fees, paymentStages }
```
Each field is a memoized array sourced from the same `useModuleState` keys the configurators write to. This eliminates drift and gives the preview one hook to subscribe to.

### 2. Reactive subscription

`useModuleState` already persists to localStorage. Add a thin `MODULE_STATE_EVENT` custom event (mirroring `FORM_UPDATED_EVENT`) dispatched on every setter. `usePreviewConfig` listens to it + `storage` event, so changes propagate live to the preview even when the configurator is open in a different tab or panel.

### 3. Wire each configurator into the preview

**3a. Checklists** — In `PreviewContext.transitionApplication`, after resolving the transition, look up `transition.checklistIds` against `checklists` from `usePreviewConfig`, and use those items in `ChecklistDialog`. Fallback to the transition's inline checklist for legacy data.

**3b. Documents** — Replace hard-coded doc generation:
- On entering a state, walk `WorkflowState.attachedDocumentIds` + any doc whose `generateWhen === state.name`. Generate each via the existing pdf builders (`applicationPdf`, `demandNoticePdf`, `invoicePdf`, `licensePdf`) keyed by `doc.kind`.
- For custom documents from the Designer, render as a simple titled PDF using the document template HTML.
- Surface them in citizen "My Documents" via `getCitizenDocuments`.

**3c. Fees + Payments** — Replace the literal demand:
- When entering the state mapped by a payment stage, compute demand from that stage's `feeIds` resolved against `fees`. Sum base + tax per fee. Slab fees evaluate against form fields (`shopArea`, `employees`, `turnover`).
- If no payment stage is configured, skip demand generation (don't fake one).

**3d. Roles** — Extend `PreviewSidebar` so any role with `permissions` that include "act on workflow" appears as a switchable persona, not just the canonical four. In `exposedWorkflowTransitions`, keep `roleId` as-is (string), and gate transition buttons by `roleId === currentRoleId` instead of the hard-coded `PreviewRole` union. Citizen / officer split stays (citizen = role with `isCitizen` flag).

**3e. Form** — already wired; no change.

**3f. Workflow** — already wired; no change beyond 3a–3d above.

### 4. Reset / migration

Bump the preview's in-memory cache key when `usePreviewConfig` detects a schema change so stale demo applications don't reference missing states/fees.

---

## Test matrix

For each row: change in configurator → expected preview behavior. Cover Issuance and Renewal modules.

### Form Builder
1. Add a new field to step 1 → reload-free, citizen wizard shows new field with validation.
2. Mark an existing field optional → submit without filling it succeeds.
3. Delete a step → wizard collapses; existing draft apps don't break.
4. Add dependent dropdown (depends_on) → child resets when parent changes.

### Roles
5. Rename a role → label updates in PreviewSidebar persona switcher and Employee inbox header.
6. Add a custom role "Reviewer" with workflow permission → appears as persona; can act on a transition assigned to it.
7. Remove a role used by a transition → transition shows "Unassigned" badge and is blocked in preview.

### Workflow
8. Add a new state + transition → state appears in employee inbox filters; transition button shows for the right role.
9. Change `actingRole` of a state → only that role's persona sees actionable items for apps in that state.
10. Re-point a transition to a different `toState` → moving an app through it lands in the new state.
11. Mark a state as `end` → app status freezes; no further transitions offered.

### Checklists
12. Add an item to a checklist linked to "Verify Application" → ChecklistDialog for that transition shows the new item; the action is blocked until all checked.
13. Remove a checklist from a transition's `checklistIds` → dialog skipped; transition fires immediately.

### Notifications
14. Add a citizen-SMS notification on "Payment Pending" → entering that state pops the SMS alert + Messages drawer entry.
15. Change recipient from citizen to approver → entry now pushes to bell only when the approver persona is active.
16. Edit template tokens (`{{amount}}`) → resolved with the current app's demand total.

### Documents
17. Add a custom document with `generateWhen: License Issued` → appears in citizen My Documents after issuance.
18. Attach an existing document to a state via `attachedDocumentIds` → generated on entry even without `generateWhen`.
19. Delete the Demand Notice doc → entering Payment Pending no longer adds a demand PDF (but demand object still computed).

### Fees
20. Change Trade License Fee base amount → next demand reflects new total.
21. Add a slab fee tied to `shopArea` → demand varies with applicant's form value.
22. Add tax rate to a fee → demand `tax` line updates.

### Payments
23. Move the payment stage from "Payment Pending" to a custom "Awaiting Fee" state → demand auto-generates only when the new state is entered.
24. Add a second stage with its own fees → both stages trigger on their respective state entries; citizen sees two payment screens in sequence.

### Cross-cutting
25. With both Issuance and Renewal enabled, changes scoped to Renewal only affect Renewal apps.
26. With `workflowScope = by_category`, editing a category-scoped workflow only changes preview for apps of that category.
27. Hard refresh preserves everything (localStorage round-trip).
28. Reset Demo clears apps but keeps configuration.

---

## Files touched

- **new** `src/lib/usePreviewConfig.ts` — unified subscription hook
- `src/lib/moduleStorage.ts` — emit `MODULE_STATE_EVENT` on writes
- `src/components/preview/PreviewContext.tsx` — replace hard-coded checklist/doc/fee/payment logic; broaden role gating
- `src/components/preview/PreviewSidebar.tsx` — render all workflow-actor roles
- `src/components/preview/employee/ChecklistDialog.tsx` — resolve items from configured checklist
- `src/components/preview/citizen/PaymentScreen.tsx` + `DemandNoticeView.tsx` — show computed line items
- `src/components/preview/citizen/MyDocuments.tsx` — list configured documents

No backend changes. No schema changes — `WorkflowStateRecord.attachedDocumentIds` and `WorkflowTransitionRecord.checklistIds` already exist from the previous turn.
