# Forms Configuration — Issuance & Renewal

Restructure the FormBuilder so it mirrors **exactly** the 5-step conversational wizard the citizen sees in the preview, and give Issuance and Renewal independent, fully editable form definitions.

## What changes

### 1. New shared step model
Create `src/data/issuanceFormTemplate.ts` and `src/data/renewalFormTemplate.ts`. Both seed from the same 5 wizard steps the preview uses, but as independent copies so editing one does not affect the other.

The 5 steps (matching `SUB_SCREENS` in `ApplicationForm.tsx`):

```text
Step 1  Applicant Details      → fullName, mobile, email, idType, idNumber
Step 2  Business Details       → businessName, tradeType, businessCategory,
                                 ownershipType, employees, turnover
Step 3  Business Location      → [map sub-screen] + addr1, addr2, city, zone, pincode
Step 4  Operational Details    → startDate, shopArea, isHazardous, hazardType
Step 5  Documents              → docId, docAddr, docBusiness
```

Intra-step groupings (matching the preview's `splitGroups`) are preserved as named sub-screens within each step, e.g. Step 2 splits into "Who owns the business?" and "Add a few more details (optional)".

The Declaration checkbox stays out of the editable form — it's a fixed review-screen element in the preview, not a wizard step.

### 2. FormBuilder restructure
Rework `src/components/service-config/FormBuilder.tsx`:

- Replace the current 6 generic section tabs with **5 wizard step tabs** named exactly as the preview (`Applicant Details`, `Business Details`, `Business Location`, `Operational Details`, `Documents`).
- Each step shows its **sub-screens** stacked on the canvas (mirroring how the citizen scrolls through one or more cards per step), with the same titles ("Let's start with your name", "How can we reach you?", "Who owns the business?", etc.).
- The Business Location step shows the **map placeholder card** above the address fields, matching the preview.
- Optional sub-screens are flagged with a subtle "Optional" pill (matches the preview's Skip behaviour).
- Field palette, drag-to-add, validation editor, and Logic tab all remain unchanged.

### 3. Module-aware seeding
`FormBuilder` already receives `moduleName`. Use it to pick the seed:

```ts
const seed = moduleName === "Renewal" ? RENEWAL_FORM_STEPS : ISSUANCE_FORM_STEPS;
```

State is keyed per module so switching between Issuance and Renewal in the configurator preserves edits separately. Persist in `localStorage` under `formbuilder:<serviceId>:<module>` so refresh keeps both definitions independently.

### 4. Renewal defaults
Renewal seeds with the same 5 steps and the same fields as Issuance, but is fully editable from the start — the user can delete fields, add new ones (e.g. "Reason for renewal"), or restructure steps without affecting the Issuance form. No fields are forced read-only.

### 5. Preview decoupling (no changes to preview)
The citizen `ApplicationForm.tsx` and `PreviewContext.DEFAULT_SECTIONS` are **not** touched. The builder remains a configuration surface that visually matches the preview but does not feed it (per "Keep them separate"). A small note in the builder header clarifies: "Changes here will apply to the live service. Preview reflects the default template."

## Technical details

- New files
  - `src/data/issuanceFormTemplate.ts` — exports `ISSUANCE_FORM_STEPS: WizardStep[]`
  - `src/data/renewalFormTemplate.ts` — exports `RENEWAL_FORM_STEPS: WizardStep[]` (initially identical to issuance)
  - Shared `WizardStep` / `WizardSubScreen` / `WizardField` types in `src/data/wizardForm.ts`

- Modified
  - `src/components/service-config/FormBuilder.tsx`
    - Replace `FormSection` with `WizardStep` (step → sub-screens → fields)
    - Replace section tabs with step tabs
    - Render one card per sub-screen on the canvas, each with its own title/subtitle
    - Render map placeholder card for `isMap: true` sub-screens
    - Section-level "Add Section" becomes "Add sub-screen" within the active step
    - `localStorage` key includes `moduleName`

- Unchanged
  - `src/components/preview/citizen/ApplicationForm.tsx`
  - `src/components/preview/PreviewContext.tsx`
  - `src/data/tradeLicenseTemplate.ts` (kept for other configurators that already consume it — Roles, Workflow, Checklists, Notifications, Documents, Fees)

## Out of scope

- Other configuration tiles (Workflow, Roles, Checklists, Notifications, Documents, Fees, Payments) — addressed in follow-up requests.
- Changes to the citizen-side preview rendering.
- Wiring builder edits back into the live preview (explicitly opted out).
