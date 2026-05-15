# Master Template drawer: full parity with template setup

## Problem
The Master Template side-drawer (`MasterTemplateConfigurator`) currently only edits service name, modules, and category/subcategory **toggles + filenames**. It does not:
1. **Parse** the uploaded category / subcategory files, so `templateSetup.categoriesList` / `subcategoriesList` stay empty and the dynamic Business Category / Sub Category form fields never appear.
2. Capture the **renewal policy** (global vs by-category vs by-subcategory + months) — which Step 4 of the wizard collects.
3. Capture the **workflow scope** (Shared vs Per-category) — which Step 5 of the wizard collects when categories exist.
4. Refresh dependent artifacts (form schema in localStorage) so changes are visible immediately.

We need the drawer to accommodate every condition the initial template-setup wizard handles, so that editing master template post-creation has full parity.

## Plan

### 1. Parse uploads in the drawer
`src/components/service-config/MasterTemplateConfigurator.tsx`
- Replace the filename-only `FilePicker` with a real `<input type="file">` that, on change:
  - Calls `parseCategoriesCsv(file)` / `parseSubcategoriesCsv(file)` from `@/lib/csvParse`.
  - Stores `{ categoriesFileName, categoriesList }` (or sub equivalents) in local `setup` state.
  - Shows the same chip-style "file uploaded" UI with size + clear (✕). Clearing also wipes the parsed list.
- Add a "Download sample file" affordance mirroring `Step3Structure` (reuse the same sample CSV strings).
- Keep previously-parsed lists when reopening the drawer without re-uploading.

### 2. Add Renewal Policy section (when Renewal is enabled)
- Reuse `Step4RenewalPolicy` directly inside the drawer (it already takes `categories`, `subcategories`, `policy`, `setPolicy`). Wrap it in a collapsible / titled block.
- Hide the section if Renewal toggle is off.
- If categories were just turned off, downgrade `mode` from `by_category`/`by_subcategory` back to `global` and clear the per-key maps so we don't carry stale state.
- Persist into `service.renewalPolicy` on save (already on `ServiceItem`).

### 3. Add Workflow Scope section (when categories enabled)
- Reuse `Step5WorkflowScope` (takes `value`, `onChange`, `categoryCount`).
- Show only when `setup.hasCategories === true` and `categoriesList.length > 0`.
- If categories get disabled, force-reset workflow scope to `"shared"`.
- Persist into `service.workflowScope` on save.

### 4. Drawer layout
Section order inside the existing `Sheet`:
1. Service Name
2. Modules (Issuance always-on, Renewal toggle)
3. Structure (Categories Yes/No → upload; Subcategories Yes/No → upload) ← parsed
4. Renewal Policy (only if Renewal enabled) ← reused Step4
5. Workflow Scope (only if Categories enabled) ← reused Step5

Long content → ensure `SheetContent` keeps `overflow-y-auto` (already set) and add a sticky footer for Save/Cancel.

### 5. Refresh form schema after save
The persisted form in `localStorage` (`formbuilder:<id>:<module>`) shadows the seed in `loadFormSteps`, so newly uploaded categories wouldn't appear until the form is reset.

On Save, when `categoriesList` or `subcategoriesList` actually changed (deep-compare against the previous `service.templateSetup`):
- `import { seedFormSteps, saveFormSteps } from "@/lib/formStorage"`.
- Re-seed and persist:
  - `saveFormSteps(service.id, "Issuance", seedFormSteps("Issuance", cleanSetup))`
  - `saveFormSteps(service.id, "Renewal", seedFormSteps("Renewal", cleanSetup))` (only if Renewal enabled).
- `saveFormSteps` already dispatches `FORM_UPDATED_EVENT`, so the FormBuilder and citizen Preview re-render automatically.

If the lists didn't change, **don't** reseed — preserve any per-field customizations the user made in FormBuilder.

### 6. Validation on Save
- Disabled until: name non-empty AND (if Categories=Yes then a categories list is present) AND (if Subcategories=Yes then a subcategories list is present).
- `globalMonths` (and any per-key months) must be > 0 — fall back to the shipped defaults if untouched.

## Out of scope
- No changes to `OnboardingContext`, `csvParse`, form template builders, FormBuilder, PreviewContext, or the wizard pages — they already support everything required.
- No DB / backend changes.
- Workflow Designer, Notifications, Fees, etc. are not touched (they consume `templateSetup` reactively where applicable).

## Files touched
- `src/components/service-config/MasterTemplateConfigurator.tsx` (only file modified)
