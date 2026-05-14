# Reorder Service Setup Flow

New step sequence: **Identity → Structure → Modules → Renewal Policy → Initializing**.

Renewal Policy step appears only when Renewal is enabled. It reuses the categories/subcategories uploaded in Structure — no second upload.

---

## 1. Stepper update

`src/components/template-setup/SetupShell.tsx`

- Update `SetupStepKey` to: `"identity" | "structure" | "modules" | "renewal" | "initialize"`.
- Update `STEPS` labels: Identity, Structure, Modules, Renewal, Initializing.
- Renewal step is rendered in the progress bar only when renewal is enabled (pass an optional `visibleSteps` filter from `TemplateSetup` so the bar reflects the actual journey).

## 2. Structure step (now step 2)

`Step3Structure.tsx` → renamed `Step2Structure.tsx`.

Sample CSVs per spec:
- Categories sample: single column `Category Name`.
- Subcategories sample: two columns `Subcategory Name, Parent Category`.

Add a lightweight CSV parser (`src/lib/csvParse.ts`) returning `string[]` for categories and `{ name, parent }[]` for subcategories. Parsing happens on file drop; results stored in setup state.

## 3. Modules step (now step 3)

`Step2Modules.tsx` → renamed `Step3Modules.tsx`.

Add helper text below the Renewal card, visible only when renewal is enabled:
> "Renewal policies can later be configured separately for categories and subcategories."

## 4. NEW Renewal Policy step

`src/components/template-setup/Step4RenewalPolicy.tsx`.

Inputs: `categories: string[]`, `subcategories: { name: string; parent: string }[]`, plus current policy state and setters.

**Logic — only ask if categories exist:**

- **No categories uploaded** → no question. Show only a single global field: "How long should renewed licenses remain active?" (months number input, default 12). Mode is implicitly `global`.

- **Categories uploaded** → ask one question: **"How does renewal validity vary?"**
  - Always show option: **Does not vary** (global single value).
  - Show **By category** (categories are present whenever the question shows).
  - Show **By subcategory** only if subcategories were also uploaded.

Rendered table per selection:

- **Does not vary** → single months number input (default 12).
- **By category** → editable table `Category | Renewal Duration (Months)` from parsed categories. Inline number input per row + small "Apply to all" affordance.
- **By subcategory** → editable table `Subcategory | Parent Category | Renewal Duration (Months)` from parsed subcategories. Same inline edit + "Apply to all".

Continue disabled until the chosen mode has all required values.

## 5. Initializing step (unchanged behavior)

`Step4Initializing.tsx` → renamed `Step5Initializing.tsx`. The "Setting up renewals" task continues to appear only when renewal is enabled.

## 6. `TemplateSetup.tsx` orchestrator

- Update `step` state machine to the new order with conditional renewal step (skipped when renewal disabled).
- Hold new state:
  - `categoriesList: string[]`
  - `subcategoriesList: { name: string; parent: string }[]`
  - `renewalPolicy: { mode: "global" | "by_category" | "by_subcategory"; globalMonths: number; perCategory: Record<string, number>; perSubcategory: Record<string, number> }`
- Back navigation respects new order; skips Renewal when disabled.
- On finalize, persist `templateSetup` (existing) and `renewalPolicy` on the new service.

## 7. Persist renewal policy on the service

`src/contexts/OnboardingContext.tsx`:

- Extend `TemplateSetup` with `categoriesList?: string[]` and `subcategoriesList?: { name: string; parent: string }[]`.
- Add `RenewalPolicy` interface and `renewalPolicy?: RenewalPolicy` on `ServiceItem`.

Downstream configurators can read this later; no change to them in this task.

---

## Files touched

- `src/components/template-setup/SetupShell.tsx` — step keys, labels, conditional progress.
- `src/components/template-setup/Step1Identity.tsx` — no change.
- `src/components/template-setup/Step2Structure.tsx` — renamed; updated sample CSVs; emits parsed lists.
- `src/components/template-setup/Step3Modules.tsx` — renamed; helper text under Renewal.
- `src/components/template-setup/Step4RenewalPolicy.tsx` — NEW.
- `src/components/template-setup/Step5Initializing.tsx` — renamed.
- `src/lib/csvParse.ts` — NEW lightweight parser.
- `src/pages/TemplateSetup.tsx` — new state machine, back logic, finalize payload.
- `src/contexts/OnboardingContext.tsx` — extend `TemplateSetup`, add `RenewalPolicy` + field on `ServiceItem`.

No other screens or business logic change.