## Goal
When the user clicks **Use template** on a template (currently jumps straight to configure), open a small two-step dialog that captures:
1. **Service name**
2. **Modules** to enable

Then create a draft service via `addService()` and navigate to `/service/{id}/configure`.

## Where this hooks in
- `src/pages/Services.tsx` → `handleUse` (and the same trigger inside `TemplateIntroduction`).
- Today `handleUse` just navigates. We replace it with: open dialog → on submit, create draft + navigate.

## New component
`src/components/onboarding/UseTemplateDialog.tsx` — a shadcn `Dialog` with two steps:

**Step 1 — Name your service**
- Single `Input` prefilled with `template.name` (e.g. "Business License"), editable.
- Helper text: "You can rename this later."
- Primary button: **Next** (disabled if empty / duplicate of existing service name).

**Step 2 — Choose modules**
- Checkbox list built from `template.modules`, normalized so the first item reads **Issuance** (mapped from the template's "Application" entry — see Notes).
- Behavior:
  - **Issuance** — checked, disabled (locked, always included). Small "Default" chip.
  - **Renewal** — checked by default, user can uncheck.
  - Any other modules in the template (e.g. Inspection, Plan Review) — unchecked by default, user can opt in.
- Primary button: **Create draft** (disabled while submitting).
- Secondary: **Back**.

On **Create draft**:
1. Build a new `ServiceItem`:
   ```ts
   {
     id: `${template.id}-${Date.now().toString(36)}`, // unique per draft
     name: <entered name>,
     templateId: template.id,
     status: "draft",
     customModules: <selected module names, Issuance first>,
     isPublished: false,
     isLive: false,
     deployment: { availabilityScope: "entire_state", selectedItems: [] },
     teamMembers: [],
     authMethod: "email",
   }
   ```
2. `addService(newService)` (this also sets it as active).
3. Close dialog, `navigate(`/service/${newService.id}/configure`)`.

## Wiring
- `Services.tsx`: replace `handleUse` body with `setPendingTemplate(template)`; render `<UseTemplateDialog template={pendingTemplate} onClose={...} />` when set. Pass the actual template object (not just `tradeTemplate`) so the same flow works for other templates later.
- `TemplateIntroduction.tsx`: keep its `onUseTemplate` prop; `Services.tsx` passes a handler that opens the dialog with the current `introTemplate`.
- `TemplateCard.tsx` `onSelect`: same — opens the dialog.

## Notes / decisions baked in
- **Issuance vs Application labeling**: the trade-license template currently lists modules as `["Application", "Renewal"]`. The dialog will display the first module as **Issuance** and store it as `"Issuance"` in `customModules`, so downstream `ServiceConfig` shows it as the Issuance flow. (We keep `serviceTemplates.ts` data file untouched; the rename is presentational + on save.)
- **Trade-license preconfig still works**: `ServiceConfig.tsx` keys preconfigured tile statuses off `id === "trade-license" || templateId === "trade-license"`. Since the new draft's `templateId` is `"trade-license"`, the seeded "completed" tile statuses still apply. The `id` becomes a unique draft id (e.g. `trade-license-lx9k2a`), so multiple drafts of the same template can coexist.
- **Existing direct trade-license id**: the old hardcoded `/service/trade-license/...` paths used in seeded data continue to resolve via `templateId` fallback.
- **Preview button** on the template intro stays as-is (jumps to the static template preview, no draft created).
- Out of scope: editing modules after creation (already possible from ServiceConfig), backend persistence (stays in OnboardingContext + localStorage).