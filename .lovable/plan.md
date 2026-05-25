# Audit Logs — Visual Refinement Pass

Scope: tighten visual hierarchy, grouping, and rhythm on `/audit-log`. No structural/functional changes. All work uses existing theme tokens (`bg-card`, `bg-muted`, `border`, `text-muted-foreground`, `bg-success`, `bg-destructive`, `bg-warning`, etc.).

## 1. Page layout & hierarchy (`src/pages/AuditLogs.tsx`)

- Wrap page in a calmer container; reduce "one big slab" feeling.
- Header: keep title + description; add a thin `border-b` separator with `pb-5 mb-5` rhythm. Move Export/Download buttons to a right-aligned cluster with `variant="outline" size="sm"` and a subtle `bg-card` group.
- Insert new **Operational Insight Strip** between header and filter bar:
  - Horizontal row of 4 compact stat pills inside a single `bg-card border rounded-lg p-3` container.
  - Each pill: small icon + count + muted label (e.g., "4 failed sign-ins · 24h", "2 permission changes today", "1 deployment rollback", "3 services modified").
  - Derived from existing `governanceEvents`, `deployments`, `runtimeEvents` mock data — no new data sources.
- Group filter bar + tabs + table inside a single elevated surface:
  ```text
  ┌─ Insight strip ────────────────────────┐
  ┌─ Surface (bg-card border rounded-lg) ──┐
  │  Filter toolbar (bg-muted/40, border-b)│
  │  Tabs (attached, border-b indicator)   │
  │  Tab content / table                   │
  └────────────────────────────────────────┘
  ```
- Increase spacing: `gap-6` between header / insight / surface.

## 2. Filter bar restructure (`src/components/audit/AuditFilterBar.tsx`)

- Primary row (always visible):
  - Search input (flex-1, prominent, `h-9`, leading search icon, subtle `bg-background`).
  - Date Range picker (Popover + existing Calendar) — new control, value stored in `AuditContext` (additive; default `all-time`, filters ignore it for now if no date field — wire to `timestamp` where present).
  - "More filters" button (Popover) showing a count badge when secondary filters are active.
  - Clear button (only when active).
- Secondary controls (Service, User, Environment, Event type, Severity, Status) move into the **More Filters Popover** as a 2-column grid of labeled Selects. Active selections also render as removable filter pills under the primary row (compact, `h-6 text-xs`, X to clear).
- Drop the sticky background; the parent surface handles separation. Use `bg-muted/40 border-b px-4 py-3`.

## 3. Tabs (Audit page + ServiceManage nested tabs)

- Replace pill-style `TabsList` (the default muted rounded background) with an underline tab style attached to the container:
  - `TabsList` becomes `h-auto bg-transparent border-b w-full justify-start rounded-none p-0 gap-1`.
  - `TabsTrigger` becomes `rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground`.
- Tabs row sits flush with filter bar's bottom border; table content gets `p-4` inside the surface.
- Apply same treatment to nested ServiceManage tabs for consistency.

## 4. Color hierarchy fixes

- **Environment badges** (`src/components/audit/shared.tsx` `EnvBadge`): switch to neutral outlined style — `border bg-muted/50 text-muted-foreground` with a subtle dot indicator. Production no longer green.
- Keep `success` green strictly for success result/status badges (ResultBadge, StatusBadge for Approved/Published/Completed).
- **Sidebar** (`src/components/AppSidebar.tsx`): soften active item background — reduce green saturation, e.g., `bg-primary/10 text-primary` instead of solid; lighter hover. Keep brand color, just lower emphasis.

## 5. Table readability (`GovernanceTab.tsx`)

- Wrap table in `rounded-md border` inside the surface (or remove inner border if surface provides it — pick one).
- Row styling: `border-b last:border-0`, `hover:bg-muted/40 transition-colors`, alternating tint via `even:bg-muted/20` (very subtle).
- Vertical rhythm: `py-3` cells (currently `py-2`), `text-sm`, header `text-xs font-medium uppercase tracking-wide text-muted-foreground`.
- **Severity tension**: failed rows get `border-l-2 border-l-destructive`; warning rows get `border-l-2 border-l-warning bg-warning/5`; success rows stay neutral.
- **Timestamp column**: stack relative + absolute:
  ```text
  23m ago
  25 May, 09:50   (text-xs text-muted-foreground)
  ```
  Implemented by updating `RelativeTime` in `shared.tsx` to accept a `stacked` prop.
- **Replace left chevron** expand control: drop the chevron column. Add a hover-revealed "View details" ghost button at row end (`opacity-0 group-hover:opacity-100`), and make the entire row clickable to toggle expansion. Expanded panel keeps existing diff JSON content but inside a `bg-muted/30 border-t` strip with tighter padding.

## 6. Config Activity / Deployments / Runtime tabs

Light touch only — propagate consistency:
- Cards use `bg-card border` (already), but reduce internal padding to `p-4`, increase card-to-card gap to `gap-3`.
- Apply same severity left-border accents for failed/warning items.
- Replace chevron toggles with the same "View details" hover pattern where rows are tabular; keep collapsible cards otherwise but soften the chevron to `text-muted-foreground`.
- Apply stacked timestamp formatting via shared `RelativeTime`.

## 7. AuditContext additive changes (`AuditContext.tsx`)

- Add `dateRange?: { from?: Date; to?: Date }` to `AuditFilters`.
- Filter hooks apply date range against each event's timestamp when present.
- No removal of existing fields.

## Files touched

- `src/pages/AuditLogs.tsx` — layout, insight strip, surface grouping.
- `src/components/audit/AuditFilterBar.tsx` — primary/secondary split, More Filters popover, active pills, date range.
- `src/components/audit/AuditContext.tsx` — add `dateRange` field + filter wiring.
- `src/components/audit/shared.tsx` — `EnvBadge` neutral style, `RelativeTime` stacked variant.
- `src/components/audit/GovernanceTab.tsx` — table polish, severity borders, stacked timestamps, hover-reveal details.
- `src/components/audit/ConfigActivityTab.tsx` — spacing + timestamp + severity accents.
- `src/components/audit/DeploymentsTab.tsx` — same.
- `src/components/audit/RuntimeActivityTab.tsx` — same.
- `src/pages/ServiceManage.tsx` — apply underline tab styling to nested tabs.
- `src/components/AppSidebar.tsx` — soften active nav background only (no structural change).

## Out of scope

- New tokens in `index.css` / `tailwind.config.ts` (reuse only).
- New data, new tabs, new routes.
- Functional behavior of filters, export, or expansion logic.

## Verification

- `/audit-log` shows: header → insight strip → unified surface containing filter toolbar → underline tabs → table.
- Filter bar shows only Search + Date Range + More Filters + Clear at rest; secondary filters open in popover and surface as removable pills when active.
- Environment chips are neutral; only success/approved/published items are green.
- Failed rows show red left accent; warning rows amber; timestamps stacked.
- Hovering a row reveals "View details"; clicking expands inline diff panel.
- Sidebar active state visibly softer.
- ServiceManage nested tabs match new underline style.
