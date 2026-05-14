# Align "Trade Type / Business Category" with template-setup uploads

Today the issuance form ships with two hardcoded dropdowns (`tradeType`, `businessCategory`) backed by `TRADE_CATEGORY_MAP`. They have nothing to do with the categories/subcategories the user uploads in Step 3 of template setup. We'll fix this so:

- "Trade Type" becomes **Business Category** (the parent — values come from uploaded `categoriesList`).
- "Business Category" becomes **Sub Category** (the child — values come from uploaded `subcategoriesList`, filtered by the chosen parent).
- If categories were **not** uploaded, both fields are removed from the seeded form entirely.
- If categories were uploaded but subcategories were not, only the parent field is seeded.

## Changes

1. **`src/data/issuanceFormTemplate.ts`**
   - Stop importing `TRADE_CATEGORY_MAP`.
   - Export a builder `buildIssuanceFormSteps({ categories, subcategories })` instead of a static const. It returns the same 5 wizard steps, but in step 2 / sub‑screen `s2-1` it conditionally inserts:
     - `businessCategory` (label "Business Category", options = `categories`) when `categories.length > 0`.
     - `subCategory` (label "Sub Category", `dependsOn: "businessCategory"`, `dependsValueMap` built from `subcategoriesList` grouped by `parent`) when `subcategories.length > 0`.
   - When neither is provided, sub‑screen `s2-1` falls back to just `businessName` (and we drop the screen's category fields). If that leaves the screen with only `businessName`, keep the screen — it's still meaningful.
   - Keep the existing `ISSUANCE_FORM_STEPS` export as `buildIssuanceFormSteps({categories: [], subcategories: []})` for any legacy import, but mark deprecated.

2. **`src/data/renewalFormTemplate.ts`**
   - Mirror: export `buildRenewalFormSteps(setup)` that clones `buildIssuanceFormSteps(setup)`.

3. **`src/lib/formStorage.ts`**
   - `seedFormSteps` and `loadFormSteps` take a new `setup: { categoriesList?: string[]; subcategoriesList?: { name: string; parent: string }[] }` arg and pass it to the builder.
   - Existing localStorage payloads remain untouched (only seeding changes); when nothing is stored, the seed reflects the uploaded data.

4. **Callers**
   - `src/components/service-config/FormBuilder.tsx`: read `service.templateSetup` from `OnboardingContext` (already available via `useOnboarding`) and pass `{ categoriesList, subcategoriesList }` into `loadFormSteps`.
   - `src/components/preview/PreviewContext.tsx`: same — pass the service's `templateSetup` into both `loadFormSteps` calls (Issuance + Renewal) and the storage‑event refresh.

5. **Cosmetic follow‑ups (labels only, no logic)**
   - `src/components/service-config/DocumentDesigner.tsx` and `document/VCScreenDesigner.tsx`: rename the `tradeType` mapping label to "Business Category" and add a new `subCategory` mapping option. The underlying field IDs stay (`tradeType` kept as alias to avoid breaking existing saved documents) — we just expose the new `subCategory` token.

## Out of scope

- No DB / backend changes.
- No changes to `TRADE_CATEGORY_MAP` consumers in `PreviewContext` defaults; once the seed is dynamic, those defaults are only used when a service has no `templateSetup` at all (legacy services). Keep them as a safety fallback.
- Workflow designer and other configurators are untouched.

## Risk

- Services already created before this change will have their stored form (in localStorage) untouched — they keep the old hardcoded fields until the user resets the form. That's acceptable; new services pick up the correct behaviour immediately.
