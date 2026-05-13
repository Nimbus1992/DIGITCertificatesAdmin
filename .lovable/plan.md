## Goal
Add a Payments block to the template details infographic, sourced from real `tradeLicenseTemplate` data.

## Changes

**`src/data/serviceTemplates.ts`**
- Add optional field:
  ```ts
  payments?: {
    stage: string;       // e.g. "Application Payment"
    fees: string[];      // e.g. ["Application Fee"]
  }[];
  ```
- Populate for `tradeTemplate` by importing `TRADE_PAYMENT_STAGES` + `TRADE_FEES` and mapping to `{ stage: name, fees: fees }`. Result:
  - Application Payment → Application Fee
  - License Payment → Inspection Fee, Hazard Surcharge, License Fee
- Bump the "Forms" stat tile row to also surface payments count, and add a 5th stat — keep grid `md:grid-cols-5` (or keep 4 tiles and add Payments tile by replacing nothing; simpler: keep 4 stats unchanged, render Payments inside its own card).

**`src/components/onboarding/TemplateIntroduction.tsx`**
- Add a new "Payments" card alongside Notifications (move layout to a 3-column `md:grid-cols-3` row containing Forms / Payments / Notifications, OR keep the current 2-col grid and place Payments on its own row above Customize). Use the latter for clarity at md width.
- Card content: for each payment stage, render `stage name` as a small label + chip list of fee names, with a `CreditCard` icon header.
- Hide card when `template.payments` is empty.

No routing, state, or backend changes. Coming-soon templates remain stats-only.
