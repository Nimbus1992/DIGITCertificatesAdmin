# Plan

## 1. Configure CTA opens the Configure tab

**Problem:** In `PreviewTopBar.tsx`, the Configure button navigates to `/service/:id/configure`, but `ServiceConfig.tsx` always initializes `mode` to `"preview"`, so the user lands back on Preview instead of Configure.

**Fix:**
- In `PreviewTopBar.tsx`, pass router state when navigating:
  `navigate(\`/service/${id}/configure\`, { state: { mode: "configure" } })`
- In `ServiceConfig.tsx`:
  - Read `useLocation().state?.mode` to initialize `mode`. Default remains `"preview"` when no state is provided (preserving existing behavior for direct links from dashboards).
  - When the inbound state requests `"configure"`, also clear `activeTile` so the user lands on the configuration hub grid (the "Configure" tab landing screen), not a stale tile.

## 2. Mobile emulator preview in Form Builder

Add an in-editor mobile preview to `FormBuilder.tsx` so users can see how the form looks to a citizen as they edit.

**Approach:**
- Create `src/components/service-config/preview/FormPreview.tsx`:
  - Accepts `step: WizardStep` (the currently selected step) and renders its sub-screen heading + fields in a vertical scroll, styled like the citizen `ApplicationForm`.
  - Renders read-only inputs for every `WizardFieldType` (text/number/textarea/date/dropdown/radio/checkbox/multiselect/file). Mirrors styling/spacing used in `ApplicationForm.tsx` but stateless (no validation, no submit).
  - Shows required asterisks, help text, options, and placeholders so the preview matches citizen experience.
- In `FormBuilder.tsx`:
  - Add a right-side panel (or toggleable drawer) that wraps `<FormPreview>` inside `<EmulatorFrame device="mobile" label="Citizen view">`.
  - Add a "Preview" toggle button in the top toolbar (`Smartphone` icon) so users can hide/show the emulator to reclaim canvas width on smaller screens. Default: visible on ≥1280px viewports, collapsed below.
  - The emulator reflects the currently selected step/sub-screen so editing fields updates the preview live (since both read from the same `steps` state).

**Out of scope:** functional submission, conditional `showIf` evaluation, multi-step navigation inside the emulator (only the active step is shown — matches the Notifications/Checklist emulator pattern already in the app).

## Files touched
- `src/components/preview/PreviewTopBar.tsx` — pass nav state.
- `src/pages/ServiceConfig.tsx` — honor inbound mode state.
- `src/components/service-config/preview/FormPreview.tsx` — new.
- `src/components/service-config/FormBuilder.tsx` — mount emulator + toggle.
