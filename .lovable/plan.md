## Goal

Align Document Designer + Workflow state attachments with what the citizen/employee preview actually generates, and stop generating a Demand Notice for the Application-Fee payment at "Submitted".

## Context

Preview generates these documents during a Trade License application:

| Preview document        | Workflow state when it appears |
| ----------------------- | ------------------------------ |
| Application PDF         | Submitted                      |
| Acknowledgement         | Submitted                      |
| Application Receipt     | Submitted (after app-fee paid) |
| Inspection Report       | Inspection Pending             |
| Demand Notice           | Payment Pending                |
| License Payment Receipt | Paid                           |
| License Certificate     | License Issued                 |

Currently:
- `PreviewContext` auto-creates a Demand Notice the moment the application is submitted, because the "Submitted" state has an Application Payment stage. The Application-Fee payment is a small upfront fee — no formal demand notice document exists at that stage.
- `DocumentDesigner` has 5 hardcoded templates (License Certificate, Application PDF, Acknowledgement, Inspection Report, Payment Receipt). It has **no Demand Notice template**.
- `WorkflowDesigner.ISSUANCE_DOC_BY_STATE` maps docs to states but is missing the new Demand Notice mapping and has no entry for "Payment Pending".

## Changes

### 1. Stop generating a Demand Notice at the Application Payment step

File: `src/components/preview/PreviewContext.tsx`

- In `submitNewApplication` and `submitRenewalApplication` (and the matching state-transition demand-recompute block ~line 870–883), do **not** call `computeInitialDemand` / set `app.demand` for the "Submitted" state.
- The application fee at "Submitted" remains payable through the payment screen, but it is treated as a quick checkout (no Demand Notice document). Citizen still sees a Payment Receipt afterwards (already configured at "Paid").
- Demand Notice is only generated when the workflow advances to "Payment Pending" (License Payment) — this branch already exists and stays.
- In `citizenDocuments` builder (~line 259), keep the Demand Notice entry but it will now only appear once the Payment Pending demand exists.

### 2. Add a Demand Notice template to Document Designer

File: `src/components/service-config/DocumentDesigner.tsx`

- Add a new template (`doc-6` / id `Demand Notice`) to `createTemplateDocuments()` with `generateWhen: "Payment Pending"`, `type: "custom"`. Elements should mirror `DemandNoticeView`: header (Govt. logo + dept name), Application ID, Applicant, Business, Issued On, fee breakdown table, Total Amount Payable, footer note.
- Add the equivalent renewal entry (`rdoc-5` "Renewal Demand Notice", `generateWhen: "Payment Pending"`) in `createRenewalDocuments()`.
- Add `"Demand Notice"` to `DOCUMENT_TEMPLATE_NAMES` in `src/data/documentTemplates.ts` so PaymentsConfigurator's receipt-template dropdown lists it (kept consistent).
- Add matching seed entries (`doc-demand` / `rdoc-demand`) to `TRADE_DOCUMENTS` and `RENEWAL_DOCUMENTS` in the template files for parity with usePreviewConfig.

### 3. Attach documents to workflow states (match preview)

File: `src/components/service-config/WorkflowDesigner.tsx`

Update `ISSUANCE_DOC_BY_STATE` and `RENEWAL_DOC_BY_STATE` to reflect the table above:

```ts
ISSUANCE_DOC_BY_STATE = {
  "Submitted":          ["doc-2", "doc-3"],         // Application PDF, Acknowledgement
  "Inspection Pending": ["doc-4"],                  // Inspection Report
  "Payment Pending":    ["doc-6"],                  // Demand Notice  ← NEW
  "Paid":               ["doc-5"],                  // Payment Receipt
  "License Issued":     ["doc-1"],                  // License Certificate
};
RENEWAL_DOC_BY_STATE = {
  "Submitted":          ["rdoc-2", "rdoc-3"],
  "Payment Pending":    ["rdoc-5"],                 // Renewal Demand Notice ← NEW
  "Paid":               ["rdoc-4"],
  "License Renewed":    ["rdoc-1"],
};
```

Because the seed only applies when no saved workflow exists in localStorage, also add a one-shot migration in `buildSeedStates` (or inside the workflow loader) that merges any missing `attachedDocumentIds` from the seed map into existing saved states — so users who already opened Workflow Designer get the new Demand Notice attachment without manual re-seeding.

### 4. Verification

- Configure → Document Designer: Demand Notice card appears with `Generate When = Payment Pending`.
- Configure → Workflow Designer → click "Payment Pending" state: Attached documents shows Demand Notice. Other states show the documents from the table.
- Preview → submit a new application → pay the application fee → My Documents shows only Application Form / Acknowledgement / Application Receipt (no Demand Notice yet). After the workflow reaches Payment Pending, Demand Notice appears.

## Out of scope

- No changes to citizen DemandNoticeView UI, fee math, role logic, or the existing PaymentScreen.
- No backend / schema changes.
