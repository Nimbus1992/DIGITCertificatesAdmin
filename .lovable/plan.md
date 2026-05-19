# Preview fixes: personas, PDFs, and viewport fit

## 1. Two-persona preview model (Citizen + Employee)

**Problem.** Custom roles all fall back to "approver" persona, so Approver and any custom role (e.g. "Issuer") light up together and share the same queue.

**Approach.** Collapse `PreviewRole` to two personas — **Citizen** and **Employee** — and drive employee behavior entirely from the workflow. The "active role" is now the role's own id; queues, action buttons, and stats are computed from which transitions are assigned to that role id. Default roles keep working because their seeded ids already own transitions; a brand-new custom role automatically shows the right cases the moment the configurator assigns it a transition.

**Behavior**
- **Sidebar**: roles grouped into Citizen bucket (roles with `create_application` permission) and Employee bucket (everyone else). Active highlight bound to the role's own id — no more shared highlight.
- **Inbox**: pending list = applications whose `currentStateId` has an outgoing transition with `roleId === activeRoleId`. Empty state: "No cases assigned to {Role name}."
- **Employee Home**: pending count uses the same workflow-derived set; approved/rejected buckets stay state-driven.
- **Application Review**: action buttons filter by `t.roleId === activeRoleId || "any"`. State-specific gates (Issue License on `s5`, etc.) stay tied to state ids, not persona.
- **Notifications**: add a generic `Employee` recipient bucket so custom roles still receive notifications.

**Files**: `PreviewContext.tsx`, `PreviewSidebar.tsx`, `employee/InboxView.tsx`, `employee/EmployeeHome.tsx`, `employee/ApplicationReview.tsx`, `useServiceRoles.ts`, `notifications/notificationMatrix.ts`.

## 2. PDF overflow — all default PDFs

**Problem.** `licensePdf`, `demandNoticePdf`, `invoicePdf` advance `y` by a fixed amount and never call `addPage()`; `applicationPdf` has partial `ensureSpace`. Long values or many rows run off the page.

**Approach.** Add a shared helper module `src/lib/pdfUtils.ts` and refactor all four PDFs to use it.

- `makePager(doc)` → returns `{ ensureSpace(neededHeight), addPage(), y, resetY() }`. `ensureSpace` calls `addPage()` and redraws the header strip/footer when the remaining page space is less than `neededHeight`.
- `drawWrapped(doc, text, x, y, { maxWidth, lineHeight, font })` → uses `doc.splitTextToSize(text, maxWidth)`, returns the new `y` after drawing all wrapped lines. Replaces every hand-rolled `y += 16` block.
- `drawKeyValueRow(doc, label, value, ...)` and `drawTableRow(doc, cells, ...)` helpers built on top, both pager-aware so long values wrap and split across pages cleanly.
- Footer ("Page X of Y") drawn in a finalize pass via `doc.getNumberOfPages()`.

Apply to `applicationPdf.ts`, `licensePdf.ts`, `demandNoticePdf.ts`, `invoicePdf.ts`. Remove their fixed `y += N` patterns and the inconsistent margins.

## 3. Branding logo in default PDFs

**Problem.** Each PDF draws a 4-square emblem placeholder; no actual logo is pulled from branding & theming. User wants the real logo when present, an obvious upload placeholder when not.

**Approach.** New `src/lib/pdfBranding.ts`:

- `resolvePdfBranding()` reads from `localStorage` / `useBranding` source: `{ logoDataUrl?, portalName, primaryColorHsl }`. Logo is stored as a data URL (or fetched and converted to one once and cached) so `doc.addImage()` can render it without a network round-trip.
- `drawHeaderLogo(doc, x, y, w, h)` → if `logoDataUrl` exists, calls `doc.addImage(...)` inside a try/catch. On failure or absence, draws a dashed rounded rectangle with centered text "Upload logo in Branding & Theme" so the gap is obviously a placeholder, not a finished design.
- Replace the 4-square emblem block in all four PDFs with `drawHeaderLogo(...)`. Header strip color comes from `primaryColorHsl` so PDFs match the configured theme.

If Branding & Theme doesn't yet persist the logo as a data URL, add a small one-time conversion in the branding save path (no schema change — same `localStorage` key, just store the data URL alongside the existing field).

## 4. Viewport fit — every screen and CTA visible at 100%

**Problem.** Some screens require zoom-out to reach CTAs. Likely causes (to confirm during implementation): fixed-height containers without overflow, sticky footers hidden behind the preview chrome, `min-w` widths that exceed the mobile/tablet frame, modal/dialog footers cut off.

**Approach.** Apply a consistent layout shell pattern across all preview and configurator screens:

- **Page shell**: `flex flex-col h-full min-h-0` on the outermost container; scrollable body uses `flex-1 overflow-y-auto min-h-0`; primary action bar lives in a non-shrinking `shrink-0 border-t` footer so CTAs are always visible regardless of content height.
- **No fixed-height blocks** in scrollable regions — replace `h-[NNNpx]` with `min-h-0` + `flex-1` where appropriate.
- **Dialogs**: convert oversize forms to the pattern `DialogContent` → header (shrink-0) → scrollable body (`flex-1 overflow-y-auto`) → footer (shrink-0) so CTAs stay in view.
- **MobileFrame preview**: ensure the inner scroll container, not the frame, scrolls; the frame itself never grows beyond viewport.

**Files (initial audit pass)**: `components/preview/MobileFrame.tsx`, `ServicePreview.tsx`, `citizen/ApplicationForm.tsx`, `citizen/PaymentScreen.tsx`, `employee/ApplicationReview.tsx`, `service-config/WorkflowDesigner.tsx`, `service-config/DocumentDesigner.tsx`, `service-config/FeesConfigurator.tsx`. Add more during implementation only where the audit finds a hidden CTA.

I will sweep these screens, fix the layout pattern, and verify by checking the preview at 1280×720, 1024×768, and the mobile frame to confirm every primary CTA stays visible without zooming.

## Verification

1. Default Trade License — Document Verifier, Field Inspector, Approver each show their existing queues unchanged.
2. Add custom role "Issuer" with transition `s5 → s6` → Issuer shows only `s5` cases; Approver no longer co-highlights.
3. Reassign transition Approver → Issuer → case moves between queues without reload.
4. Long applicant names, many documents, many fee lines → all PDFs paginate cleanly with no clipping; "Page X of Y" footer correct.
5. Logo uploaded in Branding & Theme → appears in all four PDFs; logo cleared → dashed "Upload logo" placeholder appears.
6. At 1280×720 and inside the mobile preview frame, every screen's primary CTA is reachable without browser zoom-out.

No backend or schema changes.
