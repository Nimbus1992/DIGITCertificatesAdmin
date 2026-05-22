# Make the preview honor the configured workflow (remove point-fixes)

## What's actually wrong

`payApplication` and `issueLicense` in `src/components/preview/PreviewContext.tsx` don't traverse the workflow — they hardcode state jumps by name:

- `payApplication`: `currentStateId = resolveStateId(type, "Paid", "s5")`
- `issueLicense`:   `currentStateId = resolveStateId(type, "License Issued", "s6")`

Meanwhile the configured workflow (in `tradeLicenseTemplate.ts` / `workflowSeeds.ts`) is fully data-driven:

```
Submitted ──t_claim_dv──▶ Under Doc Verification ──t_verify_app──▶ Inspection Pending
   ▲                                                                       │
   │t_resubmit                                                  t_complete_insp
   │                                                                       ▼
Sent Back ◀──t_send_back_*──                                       Under Approval
                                                                       │  │
                                                              t_approve│  │t_reject
                                                                       ▼  ▼
                                                            Payment Pending  Rejected
                                                                       │
                                                                 t_pay │ (citizen)
                                                                       ▼
                                                                     Paid
                                                                       │
                                                                t_issue│ (approver)
                                                                       ▼
                                                                License Issued
```

The workflow already encodes the citizen payment (`t_pay`: Payment Pending → Paid) and the issuance (`t_issue`: Paid → License Issued). But because `payApplication` does its own jump, paying the **application fee** from "Submitted" sends the app to `s5/"Paid"` and it falls off the Document Verifier inbox (no DV transition exists out of "Paid"). The flow appears frozen — not because of a missing branch, but because the imperative shortcut diverges from the configured graph.

## Direction: data-driven, no hardcoded jumps

### 1. Payment is a demand side-effect, not a state jump

Rewrite `payApplication` to do only:

- Set `paymentStatus = "paid"`, record `paymentDetails`, append a timeline entry.
- Look up a citizen transition out of the current state (`role === "citizen"` and `fromStateId === app.currentStateId`). If one exists (e.g. `t_pay` for license payment), execute it via the existing `transitionApplication` path so timeline, notifications, and state advance through configured workflow logic.
- If none exists (e.g. the application-fee payment at "Submitted" — no configured citizen transition out of Submitted), the app **stays in its current state**. The next configured transition (DV's `t_claim_dv` from "Submitted") becomes the legitimate next step.

Remove the `resolveStateId(..., "Paid", "s5")` hardcoded jump entirely.

### 2. Gate role-owned transitions on outstanding payment

A transition out of a state that has a `paymentStageId` (i.e. money is owed at that state) should not be executable while `paymentStatus !== "paid"`. Add a single helper `isTransitionGatedByPayment(app, transition, wfStates)` used by:

- `ApplicationReview` action buttons (disable + tooltip "Awaiting citizen payment").
- `InboxView` queue (still list the app, but mark it "Payment pending" so DV sees it's waiting).

This means DV sees the application in their queue immediately after submission but can only "Start Document Verification" once the citizen has paid the application fee. After payment, no extra wiring is needed — the same configured transition runs.

### 3. Rewrite `issueLicense` to run the configured transition

Replace the name-based jump with: find a transition where `role === "approver"` and `fromStateId === app.currentStateId` and `toStateId` maps to a state of type `"end"` (or whose name matches the license-issued state). Execute it via `transitionApplication`. License generation (number / validTill / qrSeed) becomes a side-effect attached to entering an end state, not part of the jump.

### 4. Drop the legacy `DEFAULT_WORKFLOW_STATES` / `DEFAULT_TRANSITIONS` constants in PreviewContext

They duplicate `workflowSeeds` and let stale defaults leak into the preview. The provider already pulls from `useServiceWorkflow`; remove the dead constants so there's a single source of truth.

## Files touched

- `src/components/preview/PreviewContext.tsx` — rewrite `payApplication`, `issueLicense`; remove `DEFAULT_WORKFLOW_*`; add `findCitizenTransitionFrom`, `findApproverTransitionFrom`, `isTransitionGatedByPayment` helpers.
- `src/components/preview/employee/ApplicationReview.tsx` — disable gated actions + "Awaiting payment" hint.
- `src/components/preview/employee/InboxView.tsx` — show a small "Payment pending" pill for items whose only outgoing transitions are payment-gated.
- `src/components/preview/citizen/PaymentScreen.tsx` — no behavior change; relies on the new `payApplication`.

## Verification

1. Citizen submits → state stays "Submitted", demand stage "application", `paymentStatus = pending`. DV inbox shows the application with a "Payment pending" pill; "Start Document Verification" is disabled.
2. Citizen pays application fee → `paymentStatus = paid`; state still "Submitted". DV's "Start Document Verification" becomes enabled.
3. DV proceeds through the configured workflow → … → Approver approves → state becomes "Payment Pending" with a fresh license-fee demand.
4. Citizen pays license fee → configured `t_pay` runs → state becomes "Paid". Issuer's "Issue License" runs `t_issue` → "License Issued"; license artifact is generated as a side-effect of entering the end state.
5. Renewal mirror runs through the renewal workflow without any name-based shortcuts.

## Out of scope

- No changes to fees, demand math, notification matrix, document templates, or workflow seed data.
- No backend/schema changes.
