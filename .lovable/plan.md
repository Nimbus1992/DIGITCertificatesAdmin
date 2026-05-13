## Goal

Transform the configurator home from a card-dashboard into a guided setup workspace. Reduce visual noise, lead with progression and next-action clarity, and elevate Preview as the validation experience. Functionality stays intact — only IA and presentation change.

All edits are scoped to `src/pages/ServiceConfig.tsx` (plus minor reuse of existing `configTiles` data — no schema changes).

---

## New page anatomy (Configure mode)

```text
┌─────────────────────────────────────────────────────────┐
│  ← Business License                                     │
│  Configure flows, experiences, and operational setup    │
│  [Configure]  [Preview]                                 │
├─────────────────────────────────────────────────────────┤
│  Modules:  Issuance ✓   Renewal !   + Add               │
│                                                         │
│  Service Readiness ───────────────────────  82%         │
│  Remaining: Workflow, Billing                           │
│                                                         │
│  SETUP JOURNEY                                          │
│   ✓  Application Forms          Edit  ›                 │
│   ✓  Roles & Permissions        Edit  ›                 │
│   →  Workflow / Process Flow    Continue  ›             │
│                                                         │
│  Supporting Setup                                       │
│   ○ Checklists      ○ Notifications   ○ Documents       │
│   ○ Payments        ○ Billing         ○ Plugins         │
│                                                         │
│  ─────────────────────────────────────────────          │
│  Preview Service                                        │
│  Experience how citizens and employees will interact.   │
│  [ Citizen Preview ]   [ Employee Preview ]             │
│                                                         │
│  (Go Live appears here only when readiness = 100%)      │
└─────────────────────────────────────────────────────────┘
```

---

## Sections in detail

### 1. Header — lighter
- Keep title, subtitle, Configure/Preview tabs.
- Remove top-right Go Live from header entirely (already removed); make tabs the only mode control.

### 2. Modules row — quieter
- Keep module pills + Add Module, but lower contrast: text-only chips with a small dot/check, no filled accent background for active (use underline + medium weight). Drop the "X of Y configured" counter (replaced by readiness bar below).

### 3. Service Readiness (new, lightweight)
- Single row: small label + thin progress bar + percent on right.
- Computed: `completed required / total required` for the active module (required = `tile.required === true`).
- Below bar: muted one-line "Remaining: Workflow, Billing" listing required tiles not yet completed. Hidden at 100%.
- No card/border — flat block with bottom divider.

### 4. Setup Journey (replaces Core Setup grid)
- Section heading "Setup Journey" + one-line helper.
- Render core tiles (`forms`, `roles`, `workflow`) as a vertical list of rows, not cards:
  - Left: status glyph — `✓` (completed, accent-muted), `→` (next actionable / in_progress, accent), `○` (not started, muted).
  - Middle: tile title (medium weight) + tiny muted description.
  - Right: inline ghost link button — "Edit", "Continue", or "Start" depending on status — opens the tile (same `setActiveTile` handler).
- Rows separated by hairline divider, no card borders, generous vertical padding.
- The first non-completed required tile is visually marked as "next" (accent text + arrow glyph) to answer "what next?".

### 5. Supporting Setup (replaces Additional Setup grid)
- Section heading "Supporting Setup" in muted small-caps.
- Compact 3-column list: each item is a single text row `Title · status dot`, click opens tile. Strip card backgrounds and icon tiles — keep just a small monochrome icon + label + status dot.
- On <md viewports collapse to 1 column.

### 6. Preview Service block (new, prominent)
- Distinct band at the bottom of Configure (with top divider, not a card):
  - H3 "Preview Service" + subtitle "Experience how citizens and employees will interact with your service."
  - Two primary-style buttons side by side: "Citizen Preview", "Employee Preview". Both switch to Preview tab; Employee preselects the employee role via existing preview store if trivial — otherwise both just switch tab and we adjust later.

### 7. Go Live — readiness-gated
- Show Go Live button only when readiness = 100% (all required complete).
  - Placement: appears as a single accent button under the Preview Service block with a short line "Your service is ready to go live."
- When not ready, show nothing (or a muted hint "Complete required setup to enable Go Live").
- Preview tab also: hide Go Live; only show in Preview when readiness=100%.

---

## Visual / styling rules

- Remove `Card` wrappers from primary content areas; use spacing + hairline `border-b border-border/60` dividers.
- Drop status `Badge` pills and colored backgrounds on tiles. Use small monochrome glyphs and a single accent for "next".
- Replace hover shadow lift with subtle background tint.
- Reduce green: Completed uses muted check (text-muted-foreground or text-foreground/70), not green pill. Reserve accent color for the "next" item and primary CTAs only.
- Increase whitespace between sections (`space-y-10`), reduce padding within rows (`py-3`).
- Typography: stronger hierarchy — section headings in `text-base font-semibold`, supporting headings in `text-xs uppercase tracking-wide text-muted-foreground`.

---

## Behavior preserved

- Module switching, tile-open routing to `FormBuilder`, `RolesDesigner`, `WorkflowDesigner`, etc. — all unchanged.
- `tileStatuses` initialization, Trade License pre-completion logic — unchanged.
- Preview embedding via `ServicePreviewWorkspace` — unchanged.
- Routing (`/dashboard` back, `/go-live`) — unchanged.

## Out of scope

- No changes to individual configurators, preview internals, data model, `serviceModules.ts`, routing, or persistence.
- No new global components; everything inline in `ServiceConfig.tsx` for this pass (can extract later if reused).
