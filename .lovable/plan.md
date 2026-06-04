## Goal

Add a self-serve **Boundary Configuration** flow available from two entry points:

1. The **Go Live checklist** (new required item between Authentication and Branding).
2. The **Application Areas** entry in the sidebar (`/setup/deployment`) — which today is a placeholder.

The flow matches the attached PRD and screenshots: choose a hierarchy → choose data source → review/configure → confirm.

## Scope

Frontend-only, UI mocked with in-memory state on `OnboardingContext` (consistent with rest of app — no backend changes). Map visualization uses **react-leaflet + leaflet** (matches screenshots; lightweight, free OSM tiles).

## File changes

**New**
- `src/components/boundary/BoundaryEntry.tsx` — landing screen: "Use existing hierarchy" cards + "Create new hierarchy" CTA. Shows pre-seeded hierarchies (Administrative, Revenue, Service-specific) with badges (Default / Geographic / Limited Mode / Excel-based / "Used by N services").
- `src/components/boundary/BoundaryWizard.tsx` — 3-step stepper shell (Data source → Review & configure → Confirm), matching screenshot styling (numbered circles + connector lines, check on completed).
- `src/components/boundary/steps/StepDataSource.tsx` — three option cards: Pre-loaded (Recommended), Upload shapefile, Upload Excel (with amber "Limited mode" warning + Download template CSV link).
- `src/components/boundary/steps/StepReviewPreloaded.tsx` — sub-flow: (a) Confirm jurisdiction with map + jurisdiction card; (b) Review pre-loaded boundary data: left Leaflet map, right tabbed hierarchy explorer (Municipality/Sub-council/Ward) with search, rename labels section, operational level radio cards.
- `src/components/boundary/steps/StepReviewShapefile.tsx` — dropzone (.zip/.shp/.dbf/.shx), then reuses the same Review & Configure UI.
- `src/components/boundary/steps/StepReviewExcel.tsx` — persistent amber warning, .csv/.xlsx dropzone, tree view (no map), rename + operational level, 3 acknowledgement checkboxes gating Continue.
- `src/components/boundary/steps/StepConfirm.tsx` — summary card (Name, Source, Mode, Operational Level, Levels, Used By), inheritance info panel, "Save Boundary Configuration" CTA.
- `src/components/boundary/BoundaryMap.tsx` — small Leaflet wrapper (`MapContainer`, `TileLayer`, `Polygon`) with cape-town sample GeoJSON in `src/data/boundarySeeds.ts`.
- `src/data/boundarySeeds.ts` — seed hierarchies, jurisdictions, sample sub-council/ward polygons (simplified hand-authored coordinates around Cape Town for the demo).
- `src/pages/BoundaryConfiguration.tsx` — page wrapper used by both entry points; renders `BoundaryEntry` or `BoundaryWizard` based on internal step state.
- `src/pages/ApplicationAreas.tsx` — replaces the placeholder for `/setup/deployment`. Shows list of active hierarchies + "Configure boundary" CTA → opens `BoundaryConfiguration`. Also lists placeholder sections for the future Boundary Management page (Active Hierarchies, Version History, Add/Rename/Deactivate/Split Boundary — disabled tiles with "Available after a service goes live" copy).

**Edited**
- `src/contexts/OnboardingContext.tsx` — add `boundaryHierarchies` array + `activeBoundaryHierarchyId` per service + `setBoundaryHierarchy(serviceId, hierarchyId)` action.
- `src/pages/GoLive.tsx` — extend `checklist` to include all PRD items as required/optional rows with Not Started / In Progress / Completed status pill:
  - Authentication (existing `RoleAccessSetup`) — required
  - Users & Roles — required (new lightweight placeholder reusing `UsersAccess` flow as dialog or marking complete on visit)
  - **Boundary Configuration** — required, opens `BoundaryConfiguration` full-page flow
  - Branding & Theme — optional (existing route)
  - Languages — optional
  - Notifications — optional
  - Deployment — optional
  Completed Boundary item shows summary: hierarchy name + Mode + Operational level. Status uses three states (`not-started` / `in-progress` / `completed`) with the same Badge styling vocabulary already in `GoLive.tsx`.
- `src/App.tsx` — replace `/setup/deployment` placeholder with `<ApplicationAreas />`, and add `/service/:id/boundary` route → `BoundaryConfiguration`.
- `src/components/AppSidebar.tsx` — keep "Application Areas" label (now functional). No new nav row needed since the user said "in the Application Areas tab on the nav bar".

## Dependencies

- Add `leaflet`, `react-leaflet`, `@types/leaflet` via `bun add`. Import `leaflet/dist/leaflet.css` once in `BoundaryMap.tsx`.

## Status model (Go Live checklist)

Track per service in `OnboardingContext`:

```text
goLiveStatus: {
  authentication: 'not-started' | 'in-progress' | 'completed',
  boundary:      'not-started' | 'in-progress' | 'completed',
  ...
}
```

Boundary moves to `in-progress` when the wizard is opened, `completed` when Step 3 is saved.

## Visual conformance

- Stepper, card layouts, badges (Recommended / Default / Geographic / Limited Mode), amber warning banner, dropzones, rename rows with "N boundaries" pill, operational-level radio cards, and final summary card all mirror the attached screenshots using existing semantic tokens (`bg-accent`, `bg-secondary`, `border-border`, amber via `bg-warning/10 text-warning` if defined, else `bg-amber-50 text-amber-900` mapped to tokens).
- No custom colors in components — extend `index.css` with `--warning` token if missing.

## Out of scope

- Real shapefile/Excel parsing (uploads are simulated — show filename + success state).
- Versioning / Boundary Management write actions (placeholder tiles only).
- Backend persistence.
