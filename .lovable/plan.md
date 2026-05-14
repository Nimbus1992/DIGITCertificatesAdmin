## Goal

Make the FormBuilder and the Citizen Preview form share one source of truth so the builder's structure, fields, and sub-screens always render identically inside the preview, and any add/edit/remove/save action in the builder is immediately reflected when the citizen submits an application.

Both modules ("Issuance" and "Renewal") must seed from the **same** template (the existing `ISSUANCE_FORM_STEPS`), but be edited and stored independently per module.

The Forms screen header/back affordance must match other configurators (icon-only ghost back button, title row).

## Current state

- Builder edits `WizardStep[]` and persists to `localStorage["formbuilder:{serviceId}:{moduleName}"]` — but it pulls `serviceId` from `useParams().serviceId`, which is `undefined` (route param is `:id`), so every service writes to the same `formbuilder:service:{module}` bucket.
- Citizen Preview (`ApplicationForm.tsx`) ignores the builder entirely. It reads `formSections` from `PreviewContext.DEFAULT_SECTIONS` and renders a hardcoded `SUB_SCREENS` array. Builder edits never appear in the preview.
- Renewal seed already mirrors Issuance via `cloneSteps(ISSUANCE_FORM_STEPS)`.
- Other configurators (`RolesDesigner`, `WorkflowDesigner`, etc.) use a `Button variant="ghost" size="icon"` ArrowLeft inside a header row with title + subtitle. FormBuilder uses a custom text link "Back to Service Dashboard".

## Approach

### 1. Canonical form storage
- Introduce a small helper `src/lib/formStorage.ts`:
  - `formStorageKey(serviceId, moduleName)` → `formbuilder:{serviceId}:{moduleName}`
  - `loadFormSteps(serviceId, moduleName)` returns saved `WizardStep[]` or seeded `cloneSteps(ISSUANCE_FORM_STEPS)`
  - `saveFormSteps(serviceId, moduleName, steps)` persists + dispatches a `window` event (`formbuilder:updated`) so listeners refresh.
- Both Issuance and Renewal seed from `ISSUANCE_FORM_STEPS` (Renewal template file already does this).

### 2. FormBuilder fixes
File: `src/components/service-config/FormBuilder.tsx`
- Replace the broken `useParams().serviceId` with `useParams().id` (already read for module count).
- Switch reads/writes to `loadFormSteps` / `saveFormSteps` helpers.
- Header row: replace the text "Back to Service Dashboard" link with the same pattern used in `RolesDesigner` / `WorkflowDesigner`:
  - `Button variant="ghost" size="icon"` with `ArrowLeft`
  - Title `{moduleName} — Form` (or just `Form` when single module) and a one-line subtitle.
  - Help affordance stays on the right.
- Wire the existing Save button (footer) to call `saveFormSteps` explicitly and toast "Form saved" — autosave on every change continues, but explicit save also broadcasts the update event.

### 3. Preview reads from canonical storage
File: `src/components/preview/PreviewContext.tsx`
- `PreviewProvider` accepts a new `serviceId: string` prop.
- Replace `formSections: DEFAULT_SECTIONS` with state derived from per-module `WizardStep[]`:
  - `issuanceSteps` and `renewalSteps`, each loaded via `loadFormSteps(serviceId, "Issuance" | "Renewal")` with `DEFAULT_SECTIONS`-derived steps as fallback when no module name matches.
  - Expose `getFormSteps(applicationType: "NEW" | "RENEWAL"): WizardStep[]`.
  - Expose a derived `formSections: FormSectionConfig[]` (one section per step, fields flattened) so existing consumers (validation paths, field lookup elsewhere) keep working.
- Subscribe to `formbuilder:updated` and `storage` events to reload the relevant module's steps.

File: `src/components/preview/ServicePreview.tsx`
- Pass route `id` into `PreviewProvider serviceId={id}`.

### 4. Render preview from steps
File: `src/components/preview/citizen/ApplicationForm.tsx`
- Remove the hardcoded `SUB_SCREENS` constant.
- Pull `steps = getFormSteps(isRenewal ? "RENEWAL" : "NEW")`.
- Flatten into runtime sub-screens: `[{ stepIndex, stepName, sub }, ...]`. Last index remains the Review + Declaration screen.
- `WizardProgress` takes step names from `steps.map(s => s.name)`; current step computed from `sub.stepIndex`.
- Keep the existing field-render switch (`text/number/dropdown/radio/date/file/checkbox/textarea`) unchanged — `WizardField` and `FormFieldConfig` shapes are compatible. Add minimal mapping for `multiselect` (render as multi-checkbox or fall back to dropdown) so builder additions don't crash.
- `helperBanner`, `subtitle`, `optional`, `isMap` continue to drive the existing UI.

### 5. Visual parity
- Builder's preview "card" already mirrors the citizen card layout. Keep it. After the rendering refactor, both screens consume the same data, so changes propagate.
- No changes to other configurators.

## Out of scope

- No backend persistence — storage stays in `localStorage`.
- No new field types beyond what the builder palette already supports.
- No changes to workflow/roles/fees/etc.
- Map sub-screen (`isMap`) rendering stays as the existing placeholder; users can still add/remove it via the builder.

## Risks / notes

- `formSections` is also referenced in `ApplicationDetail.tsx` and possibly other preview screens for label lookup. The derived flattening keeps `id → field` resolution intact.
- Existing drafts in `sessionStorage["tl-draft-*"]` are keyed by application id and remain compatible since field ids are preserved across edits unless the user removes a field.
