## Plan

### a) Add role from Workflow Designer
In `WorkflowDesigner.tsx`, the role `Select` used inside the Add Transition dialog and the inspector for an action gets a sticky `+ Create new role…` item at the bottom of the dropdown. Clicking it opens a small inline dialog (Name, Description, Persona, 6-permission grid — same dialog as (b)) that writes into `useServiceRoles(serviceId, moduleName)` and immediately selects the new role on the transition.

### b) Restore the 6-permission model on role create/edit
In `RolesDesigner.tsx`, bring back the explicit checkbox grid for the six permissions from `PERMISSIONS` (Create / Edit / View Application + Fill / Edit / View Checklist). The Persona toggle stays as a *preset* that pre-checks the canonical set, but the user can override individual permissions. `personaPermissions` is removed; saving uses the actual selected ids. The same dialog component is reused by the new "create role" entry in (a).

Card UI keeps the Persona badge (derived from `isCitizenRole`) and the workflow-step count badge; raw permission tags stay hidden in the card.

### c) Paginate the Application PDF in Document Designer
`buildApplicationPdfElements` in `DocumentDesigner.tsx` stacks every form field on one canvas (`y` grows past `CANVAS_HEIGHT = 792`) so long forms overflow off-page. Fix:

1. Make the builder return multi-page output (introduce a `pages: DocumentElement[][]` concept on the doc, or split into sequential sibling pages).
2. Track `y`; when `y + rowH > CANVAS_HEIGHT - footerReserve`, flush current page, reset `y` to top margin, re-emit a compact "Application Form — Page N" header.
3. Render the canvas with a page tab strip (Page 1 / 2 / …) and "Add / Delete Page" controls, mirroring how multi-page works for the certificate.
4. Existing `src/lib/applicationPdf.ts` already paginates via `makePager`, so the downloaded PDF is fine; the designer canvas needs the multi-page visualization so what-you-see-is-what-you-get.

### d) Back CTA on "Ready to go live" actually goes back
In `GoLive.tsx` the Back button calls `navigate(-1)`, which lands on the same screen depending on history. Change Back to navigate explicitly to the originating config hub: `navigate(\`/service/\${activeService?.id ?? state.activeServiceId}/configure\`)`, with a fallback to `/services`.

### e) Configure CTA on the preview screen
Add a primary "Configure" button to `PreviewTopBar.tsx` (between Exit Preview and the device toggle) that routes to `/service/:id/configure`. For the embedded preview workspace (`ServicePreviewWorkspace`, which has no top bar), surface the same CTA on the embedded device toggle strip. Helper tooltip: "Edit forms, workflow, fees and more".

### f) Remove the "Active" tag from role cards in preview
In `PreviewSidebar.tsx` `RoleCard`, drop the `<Badge>Active</Badge>` element. Active state is communicated by the accent border + tinted background; add `aria-pressed` for accessibility.

### g) In-editor emulator for forms / checklists / notifications

Add a shared `<MobilePreviewPane>` (wraps existing `MobileFrame`) and a sibling `<DesktopPreviewPane>` (wraps the macOS-window chrome already used in `ServicePreview` desktop mode). Wired into three configurators only — Form Builder, Checklist Builder, Notifications Manager. **No device toggles.** Frame choice is decided automatically by audience:

- **Form Builder**: always mobile frame, fed by the current draft `formSteps`. Renders `ApplicationForm` in read-only mode.
- **Checklist Builder**: always desktop frame (checklists are employee-side), renders the `ChecklistDialog` body with the in-progress questions inside a mock inbox card.
- **Notifications Manager**: frame chosen per notification's `recipientRole` — citizen → mobile, employee → desktop. Render **both** the SMS bubble and an email card (subject + body) stacked, regardless of the saved `channel` field, so authors can see how each rendering looks. Tokens resolved through `templateEngine.resolveTemplate` against a sample application.

Layout: collapsible right-hand split pane, default open on viewports ≥ 1280px, toggled by a `Smartphone` / `Monitor` icon in each configurator's header. Below 1280px, the pane opens as a Sheet.

No data plumbing changes — previews read from the same `useModuleState` keys the configurators write to, so edits reflect live. **Payments / Fees** are out of scope for this iteration.

## Out of scope
- Backend or schema changes.
- Seed template edits.
- New dependencies.
- Emulator inside Payments / Fees configurators.

## Touched files
- `src/components/service-config/WorkflowDesigner.tsx` (inline create-role in role Select)
- `src/components/service-config/RolesDesigner.tsx` (6-permission grid; shared role-dialog component)
- `src/components/service-config/DocumentDesigner.tsx` (paginated Application PDF + canvas page tabs)
- `src/pages/GoLive.tsx` (Back target)
- `src/components/preview/PreviewTopBar.tsx` + `src/components/preview/ServicePreview.tsx` (Configure CTA)
- `src/components/preview/PreviewSidebar.tsx` (drop Active badge)
- New `src/components/preview/MobilePreviewPane.tsx` + `DesktopPreviewPane.tsx`
- `src/components/service-config/FormBuilder.tsx`, `ChecklistBuilder.tsx`, `NotificationsManager.tsx` (mount pane, header toggle)
