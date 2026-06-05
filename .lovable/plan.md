## Goal

Convert the current `/templates` page from a "Templates Dashboard" into a unified **Services** workspace — the operational home of the platform. Templates become entry points; Services become the primary object with a clear Draft → Live → Operational lifecycle.

## Naming & routing

- Rename page to **Services** (sidebar label + page H1). Route stays `/templates` for now to avoid breaking links; add `/services` as canonical, keep `/templates` as alias (already aliased the other way today — flip the direction).
- Update sidebar nav label in `src/components/AppSidebar.tsx`.

## Page structure

```
┌─ Header ──────────────────────────────────────────────┐
│ Services                          [+ Create New Service]│
│ Manage the full lifecycle of your services             │
└────────────────────────────────────────────────────────┘

┌─ 1. Needs attention ──────────────────────────────────┐
│  (Drafts, unassigned, incomplete, not deployed)        │
│  Compact rows with progress bar + inline actions       │
└────────────────────────────────────────────────────────┘

┌─ 2. Live services ────────────────────────────────────┐
│  Cards: status, owner, last updated, app volume (mock) │
│  Quick actions: Open • Operations • Deployment         │
└────────────────────────────────────────────────────────┘

┌─ 3. Available templates  [collapsible] ───────────────┐
│  Live on SaaS / Coming soon — compact premium cards    │
│  Each: Preview • View details • Activate               │
└────────────────────────────────────────────────────────┘
```

### Section 1 — Needs attention
Filter: `status === "draft"` OR `assignedOwners` empty OR setup incomplete OR not live. Row layout (not card grid) for higher density:
- Service name + "from {Template}" subtitle
- Status pill (Draft / Unassigned / Incomplete)
- Setup progress bar with % (computed from completed config sections — derive from existing `templateSetup`, `roleAccess`, `deployment`, branding, etc.)
- Actions: **Continue setup**, Assign owner, View details

### Section 2 — Live services
Card grid. Each card:
- Title, status chip (Live), template lineage
- Assigned owner avatar + name
- Last updated (relative)
- Application volume (mocked deterministic number keyed off service id)
- Actions: **Open service**, View operations, View deployment

### Section 3 — Available templates
Collapsible, lower visual weight than sections 1–2. Group by `comingSoon`:
- **Live on SaaS** — ready templates
- **Coming soon** — disabled with badge

Each compact card has three explicit CTAs:
- **Preview template** → opens a sheet/drawer summarising citizen flow, employee flow, workflow steps, documents, generated outputs (use existing `howItWorks`, `flows`, `forms`, `notifications`, `payments` data from `serviceTemplates.ts`).
- **View details** → opens a sheet listing modules, generated roles, workflow summary, configuration scope, documents.
- **Activate template** → navigates to `/templates/:id/setup` (existing flow).

## Primary CTA — Create New Service

Header button opens a **Template Catalog dialog** (Option A): full-screen modal listing all templates grouped Live / Coming soon, with the same Preview / Details / Activate actions as section 3. Activating closes the dialog and routes to `/templates/:id/setup`. Section 3 remains for browsing without the modal.

## Template activation ≠ Service configuration

No change to existing `/templates/:id/setup` flow's depth — but ensure it surfaces an **Assign Service Owner (optional)** step that can be skipped, and that on completion the service lands in **Section 1 (Needs attention)** as a Draft with a "Continue setup" CTA resuming the wizard.

> Setup wizard resume logic is already present via `ServiceConfig` routing; no functional changes there. Plan limits work to the workspace page + a small "owner optional" affordance verification.

## Components to add

```
src/pages/ServicesWorkspace.tsx           // replaces TemplatesDashboard
src/components/services/AttentionRow.tsx
src/components/services/LiveServiceCard.tsx
src/components/services/TemplateCatalogDialog.tsx
src/components/services/TemplatePreviewSheet.tsx
src/components/services/TemplateDetailsSheet.tsx
src/components/services/computeSetupProgress.ts
```

Keep existing `AssignOwnerSheet`. Delete old `TemplatesDashboard.tsx` (or keep file, re-export new component) and update `App.tsx` route.

## Visual direction

Enterprise SaaS density (Linear / Stripe / Vercel):
- Section 1 = data rows, not card grid
- Section 2 = 3-up card grid, compact
- Section 3 = 3- or 4-up compact card grid, muted
- Single H1, consistent 12/14/16 px type scale, generous but not excessive spacing
- Reuse existing semantic tokens (`bg-card`, `text-muted-foreground`, `success`, `warning`, `border`) — no new colors
- One primary action per row/card; secondary actions in dropdown

## Out of scope

- Backend persistence (state stays in `OnboardingContext` + localStorage)
- Real application-volume metrics (mocked)
- Changes to the template setup wizard internals beyond confirming owner-assignment is skippable
- Changing the `/templates/:id/setup` route shape
