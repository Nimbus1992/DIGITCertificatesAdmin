# Drafts section + restore old Details/Preview screens

## 1. Replace "Needs attention" with "Drafts"

In `src/pages/TemplatesDashboard.tsx`:

- Rename Section 1 from "Needs attention" to **"Drafts"** (icon: `FileText` or keep `Activity` → switch to `FileText`). Subtitle: *"Services in setup. Continue configuring or preview the experience."*
- Filter unchanged (`!s.isLive`), but the row is reshaped into a **draft card** (grid 1/2/3 cols, similar to LiveServiceCard) instead of the dense row, so it visually balances with the Live section.
- Drop the status pill logic ("Just created / Unassigned / Incomplete / Ready to go live"). Keep only:
  - Service name (clickable → details page)
  - Template label + "Updated X ago"
  - Setup progress bar (`done/total · pct%`)
  - Owner avatars (or "Unassigned" muted text if empty)
- Two primary CTAs on every draft card:
  - **Continue configuring** → `goConfigure(s)` (existing wizard resume URL)
  - **Preview** → `navigate('/service/' + s.id + '/preview')` (existing ServicePreview route)
- Overflow menu retains: Assign owner, Delete. Remove "View details" entry (Preview replaces it; service name link opens overview).
- "Just created" highlight (`isRecent`) stays as a subtle ring on the card.

## 2. Restore old full-page Details and Preview for templates

Currently template Details and Preview open right-side sheets (`TemplateDetailsSheet`, `TemplatePreviewSheet`). Replace with the old full-page screen `src/components/onboarding/TemplateIntroduction.tsx`.

- Add a new route in `src/App.tsx`: `/templates/:templateId` → new page `src/pages/TemplateDetailsPage.tsx`.
- `TemplateDetailsPage` looks up the template by id, renders `<TemplateIntroduction template={t} onBack={...} onUseTemplate={() => navigate('/templates/:id/activate')} onPreview={() => navigate('/templates/:id/preview')} />`.
- Add a separate route `/templates/:templateId/preview` → new page `src/pages/TemplatePreview.tsx` that wraps `ServicePreview` in a transient `OnboardingContext`/`ServiceConfigContext` seeded from the template (no draft service required). Simplest implementation: create a temporary in-memory `ServiceItem`-shaped object from the template's defaults and route through the existing `ServicePreview` using a `templateId` query param, OR reuse the citizen/employee preview shell with template seed data. Scope this MVP: spin up an ephemeral service via `addService` flagged `isPreviewOnly`, navigate to `/service/:id/preview`, and clean it up on unmount. (If that proves invasive, fall back to a lightweight wrapper that feeds template defaults into `PreviewProvider` directly without persisting a service.)
- In `TemplatesDashboard.tsx`:
  - Replace `onPreview={setPreviewTpl}` and `onDetails={setDetailsTpl}` on `TemplateCard`/`TemplateGroup` with `navigate('/templates/:id/preview')` and `navigate('/templates/:id')`.
  - Remove the `<TemplatePreviewSheet>` and `<TemplateDetailsSheet>` instances and related state (`previewTpl`, `detailsTpl`). The catalog dialog's internal sheets get the same treatment: clicking Preview/Details closes the dialog and navigates to the full-page screen.
- Same change inside `src/components/services/TemplateCatalogDialog.tsx`: drop the embedded sheets, accept `onPreview(t)` / `onDetails(t)` callbacks from the parent that navigate to the full-page routes.

## 3. Files touched

- `src/pages/TemplatesDashboard.tsx` — rewrite Section 1 as Drafts card grid; remove sheet state; navigate for preview/details.
- `src/components/services/TemplateCatalogDialog.tsx` — accept preview/details callbacks; drop inline sheets.
- `src/pages/TemplateDetailsPage.tsx` *(new)* — full-page wrapper around `TemplateIntroduction`.
- `src/pages/TemplatePreview.tsx` *(new)* — template-level preview using the existing ServicePreview shell.
- `src/App.tsx` — register `/templates/:templateId` and `/templates/:templateId/preview`.

## Out of scope

- Keeping the dense table row UX for drafts.
- Rewriting `TemplateIntroduction` itself (used as-is).
- Real persistence for the template preview sandbox; the ephemeral service approach is acceptable.
