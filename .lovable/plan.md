## Goal

Refactor `ServiceConfig` (the configurator home at `/service/:id/configure`) into a workspace-oriented experience with two top-level modes (Configure / Preview), visible module navigation, and a clear Core / Additional setup hierarchy. Preserve all existing tile/module functionality and routing — only restructure the IA and UI.

## New Page Structure

```text
┌─ Header ─────────────────────────────────────────────────┐
│  ← Business License                                       │
│    Configure flows, experiences, and operational setup    │
│                                                           │
│  [ Configure ] [ Preview ]      (workspace mode tabs)     │
└───────────────────────────────────────────────────────────┘

CONFIGURE MODE
┌─ Modules ────────────────────────────────────────────────┐
│  [✓ Issuance]  [⚠ Renewal]               │
└───────────────────────────────────────────────────────────┘

┌─ Core Setup ─────────────────────────────────────────────┐
│  Foundational setup for your service journey              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ Application  │ │ Roles &      │ │ Workflow /   │       │
│  │ Forms        │ │ Permissions  │ │ Process Flow │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
└───────────────────────────────────────────────────────────┘

┌─ Additional Setup (compact utility row) ─────────────────┐
│  Checklists · Notifications · Documents ·                 │
│  Payments · Billing · Plugins                             │
└───────────────────────────────────────────────────────────┘

PREVIEW MODE
  Renders the existing ServicePreview workspace inline,
  with citizen/employee + role switching already supported.
```

## Implementation

All work in `src/pages/ServiceConfig.tsx` plus a thin reorganization of `src/data/serviceModules.ts`. No backend, routing, or tile-level component changes.

### 1. Header & workspace tabs

- Replace current header right-side cluster (module dropdown, Preview button, Go Live button).
- New header: back button + title (`serviceName`) + supporting line "Configure flows, experiences, and operational setup".
- Below header, a `Tabs` (shadcn) with two triggers: **Configure** (default) and **Preview**. Tab state local to the page.
- Remove the persistent `Go Live` button from the header. Keep Go Live reachable, but only as a contextual action surfaced from Preview mode (small `Publish` / `Go Live` button in the Preview tab's toolbar area). All existing `navigate("/go-live")` logic preserved.

### 2. Module navigation (replaces dropdown)

- In Configure mode, render a horizontal pill row of modules derived from the same `modules` array used today.
- Each pill shows: module name + a tiny status glyph (`✓` if all required tiles in `currentStatuses` are completed, `⚠` if any required tile is not completed). Active pill highlighted with `bg-accent text-accent-foreground`; others `bg-muted`.
- Trailing `+ Add Module` ghost button — wire to a no-op `toast` for now (out of scope to build the add-module flow); preserve placement so it's discoverable.
- Issuance always present; Renewal only renders if it exists in `service.customModules` (already the case via current derivation logic).
- Selecting a pill updates `selectedModule` exactly like the dropdown does today.

### 3. Core Setup section

- Section heading "Core Setup" + helper "Complete the foundational setup for your service journey."
- 3-column grid (`md:grid-cols-3`) of larger cards for tiles `forms`, `roles`, `workflow` (filtered from `configTiles`).
- Larger padding (`p-6`), bigger icon tile (`w-12 h-12`), `text-base` title, 2-line description, status badge in top-right, primary CTA at bottom. Visual weight clearly above Additional Setup.

### 4. Additional Setup section

- Section heading "Additional Setup" with smaller, muted styling.
- Compact utility cards (or list rows) for: `checklists`, `notifications`, `documents`, `payments`, `billing`, `plugins`. Use a 2- or 3-column grid of slim rows (`p-3`, icon + title + status dot, no big CTA button — the whole row is clickable and opens the same `setActiveTile`).
- No required dot here; just a subtle status indicator.

### 5. Progress + info banner

- Remove the current full-width info banner and the global progress bar from the top of the page.
- Replace with a single small inline summary inside the Modules row, e.g. `3 of 9 configured` muted text on the right, so progress is still visible without dominating the page.

### 6. Preview mode tab content

- When the Preview tab is active, render the existing `ServicePreview` experience inline so it feels like a workspace mode rather than a route jump.
- Approach: refactor `src/components/preview/ServicePreview.tsx` minimally to export an embeddable inner component (`ServicePreviewWorkspace`) that omits the outer `h-screen` wrapper and the `onExit -> navigate` top bar exit button (or makes that exit a no-op when embedded). The existing route `/service/:id/preview` continues to work for direct deep-links.
- Inside the Preview tab, render `<ServicePreviewWorkspace />`. Citizen/employee toggle, role switching, and screen navigation continue to work via the existing `PreviewProvider`.
- Add a small toolbar above the embedded preview with a single `Go Live` / `Publish` action, shown only when `!service?.isLive`. Clicking it runs the same `setActiveService` + `navigate("/go-live")` flow as today.

### 7. Tile detail screens

- No change. `activeTile` early-return rendering of `FormBuilder`, `RolesDesigner`, `WorkflowDesigner`, etc. stays exactly as it is.
- Switching modules continues to clear `activeTile`.

### 8. Data tweaks (`src/data/serviceModules.ts`)

- Add a `group: "core" | "additional"` field to each `ConfigTile` so the page can filter cleanly without hardcoding ids in JSX. Mark `forms`, `roles`, `workflow` as `core`; the rest as `additional`.
- Fix existing typo "Application Application Forms" → "Application Forms" while in this file.
- No change to tile ids, so all `activeTile` switches remain valid.

## Out of scope

- Changing any individual configurator (forms/roles/workflow/etc.) screens.
- Touching `/go-live`, routing, or persistence.
- Visual redesign of `ServicePreview` internals — only its outer wrapper is made embeddable.

## Files touched

- `src/pages/ServiceConfig.tsx` — main refactor
- `src/components/preview/ServicePreview.tsx` — extract embeddable inner component
- `src/data/serviceModules.ts` — add `group` field, fix title typo