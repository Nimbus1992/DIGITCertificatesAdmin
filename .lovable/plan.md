## Goal

Two things:
1. **Checklists on transitions become a dropdown multi-select** in the Workflow Designer (same Popover/Command pattern already used for notifications and attached documents on states).
2. **Pre-wire every workflow state and every action** with the correct role, checklist, notifications, payment stage and attached documents — matching the citizen+employee preview flow exactly. Auto-attach documents to states using each document's `generateWhen`.

No backend changes. All changes are in the seed templates + Workflow Designer UI.

---

## The canonical flow (preview = source of truth)

### Issuance

```text
Submitted ──Start Doc Verification──▶ Under Document Verification
                                       │
                              Verify Application ──▶ Inspection Pending
                              Send Back ──▶ Sent Back
                                       │
                                  Complete Inspection ──▶ Under Approval
                                  Send Back ──▶ Sent Back
                                                          │
                                                  Approve ──▶ Payment Pending ──Mark Paid──▶ Paid ──Issue License──▶ License Issued
                                                  Reject  ──▶ Rejected
Sent Back ──Resubmit──▶ Submitted
```

| State | Acting role | Out-actions (role · checklist) | Notifications on entry | Attached documents | Payment stage |
|---|---|---|---|---|---|
| Submitted (start) | Citizen | Start Doc Verification (Document Verifier · —) | Citizen email+SMS "Submitted"; Doc Verifier push | Application PDF, Acknowledgement | — |
| Under Document Verification | Document Verifier | Verify Application (DV · Doc Verification Checklist) • Send Back (DV · Send Back Checklist) | Citizen email "Under verification" | — | — |
| Inspection Pending | Field Inspector | Complete Inspection (FI · Inspection Checklist) • Send Back (FI · Send Back Checklist) | Citizen email+SMS+push; Inspector push | — | — |
| Under Approval | Approver | Approve (Approver · Approval Checklist) • Reject (Approver · Send Back Checklist as rejection-reason) | Citizen email+SMS+push; Approver push | — | — |
| Payment Pending | Citizen | Mark Paid (Citizen · —) | Citizen email+SMS "Fee due" | Demand Notice | **Trade License Fee (collected here)** |
| Paid | Approver | Issue License (Approver · —) | Citizen email+SMS "Paid" | Payment Receipt | — |
| License Issued (end) | — | — | Citizen email+SMS+push "Issued" | License Certificate (VC + QR) | — |
| Sent Back | Citizen | Resubmit (Citizen · —) | Citizen email+SMS "Action required" | — | — |
| Rejected (end) | — | — | Citizen email "Rejected" | — | — |

### Renewal

Same shape, minus Inspection Pending and minus the Field Inspector role. `Under Document Verification → Under Approval` directly. Renewal Fee collected at Payment Pending. License Certificate replaced with "Renewed License Certificate" on `License Renewed`.

---

## Implementation

### A. Checklist dropdown on transitions (Workflow Designer)

In `src/components/service-config/WorkflowDesigner.tsx`, in the **transition inspector** panel (selected edge), replace the existing checklist editor with a Popover + Command multi-select listing all checklists from `useModuleState("checklists:…")` for the current module. Persist `transition.checklistIds: string[]` (already the field used today). Trigger shows count, e.g. "2 checklists attached" or "None". Include a "+ New checklist" link that opens the existing checklist creation dialog or routes to the Checklist Builder tab.

This mirrors the dropdown UX added for notifications and attached documents on states. No schema change — `checklistIds` already exists on `WorkflowTransitionRecord`.

### B. Auto-wire seeds to match the preview flow

Edit the two template files so configurators seed every property correctly out of the box:

**`src/data/tradeLicenseTemplate.ts`**
- Confirm `TRADE_WORKFLOW_TRANSITIONS` has the table above (it already does, including `t_pay` and `t_issue` which the preview hides behind auto-advance). Keep them — Workflow Designer needs the edges.
- Confirm `TRADE_NOTIFICATIONS` covers every state in the table (it does).
- Confirm `TRADE_PAYMENT_STAGES` has one stage on `Payment Pending` carrying the Trade License Fee.
- Confirm `TRADE_DOCUMENTS` has `generateWhen` set to: Application PDF & Acknowledgement → `Submitted`; Demand Notice → `Payment Pending`; Payment Receipt → `Paid`; License Certificate → `License Issued`. Fix any drift.

**`src/data/renewalTemplate.ts`** — same audit for the renewal subset.

**`src/data/workflowSeeds.ts` → `buildSeedStates`**
- It already seeds `notificationIds` (by matching state name) and `paymentStageId` (by matching state name). Extend it to also seed `attachedDocumentIds` by reading the documents seed and matching each doc's `generateWhen === state.name`. Result: a fresh workflow has documents already attached to the right states.
- `buildSeedTransitions` already seeds `checklistIds` by matching the destination state's checklists. Keep as-is so the new dropdown shows the right preselections.

### C. UI polish in Workflow Designer

- In the state inspector, the inline "Acting role" field already exists per state — make sure the seed sets `actingRole` per the table (Submitted→citizen, Under Doc Verification→document_verifier, Inspection Pending→field_inspector, Under Approval→approver, Payment Pending→citizen, Paid→approver, Sent Back→citizen, License Issued/Rejected→none). If `actingRole` is not yet on the state record, add `actingRole?: string` to `WorkflowStateRecord` and render a single-select in the inspector (existing role list from `useServiceRoles`).
- Transitions already carry `roleId` — verify seed values use canonical role ids (`document_verifier`, `field_inspector`, `approver`, `citizen`) and not legacy camelCase. Use `canonicalRoleId()` from `useServiceRoles.ts` when reading.

---

## Out of scope

- Document Designer, Notifications dashboard, Fees, Payments configurators — unchanged.
- No change to how preview fires notifications or auto-advances payment/issuance.
- No backend changes; storage stays in localStorage via `useModuleState`.

## Files touched

- `src/components/service-config/WorkflowDesigner.tsx` (checklist dropdown, acting-role select, render attached docs/notifs/payment in state inspector from seeds)
- `src/data/workflowSeeds.ts` (seed `attachedDocumentIds` + `actingRole`; canonicalize role ids)
- `src/data/tradeLicenseTemplate.ts` (audit notifications/payment-stage/documents-`generateWhen` to match table)
- `src/data/renewalTemplate.ts` (same audit for renewal)
