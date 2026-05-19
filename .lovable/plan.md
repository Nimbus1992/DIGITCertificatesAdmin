## What's actually broken (root cause)

I traced the three gaps end-to-end:

### 1. Hazard Surcharge never appears
- Seed is correct: `fee_haz` is conditional on `isHazardous = "Yes"`, mapped into the `License Payment` stage (entered on **Payment Pending**).
- `evalConditional` in `usePreviewConfig.ts` reads `formData.isHazardous` correctly.
- BUT `PaymentScreen.tsx` only renders `fee` total + flat "License Fee" label — it ignores `demand.lines`. So even when the surcharge IS added, the user can't see it.
- Also `License Fee` is `type: "formula"` and the evaluator is a placeholder returning a flat `1000`, so the demand totals look static regardless of inputs.

### 2. "Application Payment" stage (Submitted) not reflected
- Stage `pay_app` is mapped to workflow state **Submitted**, but the citizen wizard goes Draft → Submitted via `submitApplication`, NOT via `transitionApplication`. The demand-from-stage code only fires inside `transitionApplication`, so the Submitted-stage payment is silently skipped.
- After submit, the citizen is also not routed to the PaymentScreen even when `paymentStatus === "pending"`.

### 3. Documents don't match the configured PDF
- Auto-generated docs use `applicationPdf / demandNoticePdf / invoicePdf / licensePdf` keyed by `doc.kind`. Custom documents created in the Document Designer (which carry a template HTML, not a known `kind`) fall through and render a generic blank PDF, so the file the citizen downloads doesn't match the designer preview.
- `attachedDocumentIds` on a state references docs by id, but the generator only honors `generateWhen` matching the state name — id-based attachment isn't wired.

## Fixes (small, surgical)

1. **PaymentScreen** — render `demand.lines` as a table (name + amount), keep tax + total below. Also fall back gracefully when `lines` is empty.
2. **License Fee formula** — evaluate as `shopArea * 10` (₹10/sq ft) so it actually varies; document the rule next to the seed.
3. **submitApplication** — after moving to Submitted, run the same `findPaymentStageForState` + `computeDemandForStage` block already used in `transitionApplication`, and if `paymentStatus === "pending"` push the citizen to the PaymentScreen.
4. **Document generation** — in `dispatchByState`/state-entry hook:
   - Resolve both `state.attachedDocumentIds` and any `doc.generateWhen === state.name`.
   - For docs with no matching `kind`, render the designer's HTML template through a generic html→pdf helper (reuse jspdf `.html()` already in `licensePdf`) so the file matches the preview.

## Preview QA Harness — how to test thoroughly

A one-off "test by clicking" approach won't scale. I'll add an internal **`/service/:sid/preview-qa`** route (dev-only link from the configure page) that runs a scripted matrix and reports pass/fail per cell. This becomes the single source of truth for "does every configurator still wire into preview".

### Architecture
- Reuses the existing `PreviewProvider` in headless mode (mounted off-screen).
- A new `runPreviewQA(serviceId)` helper drives the provider via its public actions (`createApplication`, `submitApplication`, `transitionApplication`, `payApplication`, `uploadDocument`, …) and asserts on the resulting state snapshot.
- Each test mutates a configurator via `useModuleState` writers, runs the scenario, then restores.
- Results render as a table: ✅ / ❌ / ⏭, with expected vs actual diffs.

### Test matrix (35 automated cases)

**Form Builder (5)**
- F1 New required field on step 1 → wizard blocks submit until filled.
- F2 Mark field optional → submit succeeds without it.
- F3 Delete a step → existing draft loads, new draft has one fewer step.
- F4 Dependent dropdown (category by tradeType) → child options change with parent.
- F5 `showIf` field hides when condition false, included in formData when true.

**Roles (4)**
- R1 Rename canonical role → label updates in PreviewSidebar + inbox header.
- R2 Add custom role with workflow permission → appears in persona switcher, can act on transitions assigned to it.
- R3 Remove a role used by a transition → transition shows "Unassigned" badge, button disabled.
- R4 Toggle `isCitizen` flag → role appears under citizen tab only.

**Workflow (5)**
- W1 Add new state + transition → state appears in inbox filters; transition button visible to the right role.
- W2 Change `actingRole` → only that persona sees actionable button.
- W3 Re-point transition `toState` → app lands in new state after action.
- W4 Mark state `end` → no further transitions offered; status frozen.
- W5 Remove a state referenced by a payment stage → demand skipped, no crash.

**Checklists (3)**
- C1 Add item to checklist on "Verify Application" → dialog shows item, action blocked until checked.
- C2 Remove checklist from transition's `checklistIds` → dialog skipped, transition fires.
- C3 Mark item optional → action allowed without checking it.

**Notifications (3)**
- N1 Add citizen-SMS on "Payment Pending" → SMS toast + Messages drawer entry on entry.
- N2 Change recipient citizen → approver → only approver persona gets bell entry.
- N3 Edit template token `{{amount}}` → resolves to current demand total.

**Documents (4)**
- D1 Add custom doc with `generateWhen: License Issued` → appears in My Documents after issuance; rendered PDF matches designer template (hash compare on first 500 chars).
- D2 Attach existing doc to a state via `attachedDocumentIds` → generated on entry even without matching `generateWhen`.
- D3 Delete Demand Notice doc → entering Payment Pending no longer adds it; demand object still exists.
- D4 Rename doc → label in My Documents updates without reload.

**Fees (4)**
- Fe1 Change Application Fee base → next demand reflects new amount.
- Fe2 Slab fee tied to `shopArea` → app with area=50 vs 600 produces different totals.
- Fe3 **Hazard Surcharge — isHazardous=Yes adds 1500; =No does not.** ← directly covers the reported bug.
- Fe4 Add tax rate to a fee → `tax` line updates accordingly.

**Payments (3)**
- P1 **Application Payment stage triggers on Submitted entry, PaymentScreen reachable.** ← covers reported bug.
- P2 Move stage from Payment Pending → custom state → demand auto-generates only on the new state.
- P3 Two stages with separate fees → two PaymentScreens in sequence; receipts generated per stage.

**Cross-cutting (4)**
- X1 Renewal-scoped change does not affect Issuance apps.
- X2 `workflowScope: by_category` → only matching-category apps see edited workflow.
- X3 Hard refresh → all preview state restored from localStorage.
- X4 Reset Demo clears apps but keeps configuration.

### Output

```
Preview QA — Trade License (service: trade-license-mp6c297v)

Form Builder    5/5  ✅
Roles           4/4  ✅
Workflow        4/5  ❌  W5: crash when stage references removed state
Checklists      3/3  ✅
Notifications   3/3  ✅
Documents       3/4  ❌  D1: PDF body mismatch (custom template not rendered)
Fees            3/4  ❌  Fe3: Hazard Surcharge not in demand.lines
Payments        2/3  ❌  P1: PaymentScreen never opened after Submitted
Cross-cutting   4/4  ✅
                ───
                31/35 — 4 regressions
```

Click any failing row to expand → expected vs actual JSON + a "Reproduce" button that leaves the harness pre-seeded for manual inspection.

## Files touched

- `src/components/preview/citizen/PaymentScreen.tsx` — render `demand.lines`.
- `src/components/preview/PreviewContext.tsx` — `submitApplication` runs payment-stage demand; doc generator honors `attachedDocumentIds` + custom html templates; route to PaymentScreen on pending demand.
- `src/lib/usePreviewConfig.ts` — formula evaluator for `Area * Rate`.
- `src/lib/previewPdf.ts` (new) — generic html→pdf for custom documents.
- `src/pages/PreviewQA.tsx` (new) + `src/lib/previewQa/*.ts` (new) — harness + 35 test cases.
- `src/App.tsx` — route `/service/:sid/preview-qa`.
- `src/pages/ServiceConfig.tsx` — small "Run Preview QA" link next to the Preview button.

No backend changes. No schema changes.