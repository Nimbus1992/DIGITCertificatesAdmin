## Plan: Simplify Payment Setup

### Changes to `src/components/service-config/PaymentsConfigurator.tsx`

1. **Remove Payment Type construct entirely**
   - Drop the `PaymentType` type, the `paymentType` field on `PaymentStage`, and the entire "Payment Type" radio group from the sheet.
   - Remove the `paymentType` badge from the stage card.

2. **Restrict Payment Method to Online + Counter**
   - Remove the `offline` option from the methods checklist (keep only `online` and `counter`).
   - Remove the offline indicator from the card display.
   - Default new stages to `{ online: true, counter: false }`.

3. **Conditional Payment Gateway**
   - Only render the Payment Gateway selector when `draft.methods.online` is true. If only `counter` is selected, hide the gateway field entirely (no gateway needed).

### Supporting data updates

4. **`src/data/tradeLicenseTemplate.ts` & `src/data/renewalTemplate.ts`**
   - Remove `paymentType` and the `offline` method from `TRADE_PAYMENT_STAGES` / `RENEWAL_PAYMENT_STAGES` seed entries and their TypeScript shape, so saved stages and new defaults stay consistent.

### Out of scope
- Preview/runtime payment behavior is not changed — only the setup UI and seed shapes.
- No migration for users with previously persisted `paymentType`/`offline` values; the field is simply ignored on load.
