## Redesign: Templates → Service Workspace

Rebuild `src/pages/TemplatesDashboard.tsx` as a card-based catalog. Services are the primary object; templates are reusable blueprints that can spawn many services.

### Page structure

```
┌─ Header ─────────────────────────────────────┐
│  Services                                    │
│  Manage your active services and create new  │
│  ones from templates.                        │
└──────────────────────────────────────────────┘

┌─ My Services ────────────────────────────────┐
│  [Service Card]  [Service Card]  [Service…]  │
│  3-col responsive grid (2 / 1 col on narrow) │
└──────────────────────────────────────────────┘

┌─ Start a New Service ────────────────────────┐
│  Create a new service using a pre-built      │
│  template.                                   │
│  [Template Card]  [Template Card]  [Template]│
└──────────────────────────────────────────────┘
```

### Section 1 — My Services (card grid)

Each service card shows:
- Service name (lg, semibold) + small template-origin line ("from Business License Template")
- Status chip: `Draft` (warning), `Live` (success), `Archived` (muted)
- Owner row: avatar + name (or "Unassigned" warning link for admins)
- Meta: "Updated 2h ago"
- Primary action by status:
  - Draft → **Continue configuration**
  - Live → **Open service** + secondary **View operations**
  - Archived → **Reopen** (disabled placeholder)
- Overflow menu (⋯): Open workspace, Assign owners (admins), Delete (drafts, admins)
- Hover: subtle border lift + shadow; whole card clickable to workspace

Empty state (no services): single centered card "No services yet — create one from a template below" with a scroll-to-templates button. Replaces the old empty state + first-run banner.

Service-owner persona: section title becomes "My services", only assigned services shown, no admin-only actions, templates section hidden.

### Section 2 — Start a New Service (template grid)

Section header: "Start a new service" + subtitle.

Each template card shows:
- Icon tile + template name
- Ready/Coming soon chip (top-right)
- 1-line description
- **Capabilities** row: small pill chips (Issuance, Renewal, Payments, Workflow, Citizen Portal) — derived from `template.modules`/`template.capabilities`; cap at 5 with "+N"
- **Used by** count: number of services already created from this template (compute from `state.services.filter(s => s.templateId === t.id).length`)
- Primary CTA **Create service** (routes to `/templates/:id/setup`)
- Secondary CTA **View template** (opens a details sheet — reuse existing template metadata; if no detail view exists, link to setup with a `?preview=1` flag or open a lightweight sheet showing description + capabilities)
- Coming-soon state: card dimmed, CTA disabled showing "Coming soon"

Templates section is hidden for service-owner persona.

### Removals

Delete from current file: stat strip, filter pills, search box (optional — see open question), section-header rows, table markup, `SectionHeader`/`ServiceRow`/`TemplateRow`/`StatusDot`/`Stat`/`Divider`/`FirstRunBanner`, all "activate" CTAs in header. Owner/Updated/Status columns disappear (data moves into card).

### Preserved behavior

- `recent` query param → highlight the matching service card with a "Just created" ribbon + scroll into view; clear param after first render.
- Delete confirmation dialog (`AlertDialog`) and `AssignOwnerSheet` integration unchanged.
- Routing helpers (`goConfigure`, `goWorkspace`, `goActivate`) unchanged.
- Persona-based visibility (service_owner vs admin) preserved.
- Toasts on create/delete preserved.

### Visual language

- Cards: `rounded-lg border border-border bg-card`, `p-5`, hover `shadow-sm` + `border-foreground/15`.
- Status chips: small (`h-5 px-2 text-[10px] uppercase tracking-wide`), semantic token backgrounds (`bg-success/10 text-success`, `bg-warning/10 text-warning`, `bg-muted text-muted-foreground`).
- Capability pills: `h-5 px-2 rounded text-[11px] bg-muted text-muted-foreground`.
- Spacing: section gap `mt-10`, grid `gap-4`, generous header padding.
- Typography: section titles `text-base font-semibold`, subtitles `text-sm text-muted-foreground`.
- No tables, no dense rows, no repeated dashboard widgets.
- All colors via semantic tokens in `index.css` — no raw hex.

### Files

- Rewrite: `src/pages/TemplatesDashboard.tsx` (single file; ~ -350/+300 lines).
- No new components required unless the "View template" sheet is built — see open question.
- No changes to routes, contexts, or data layer.

### Open questions

1. **Search**: keep a single search input above My Services (filters both services and templates), or drop entirely as part of the "no spreadsheet" goal?
2. **View template** secondary CTA: build a lightweight details sheet now (new `TemplateDetailsSheet.tsx`), or defer and have the button route to the setup flow's first step in read-only mode?
3. **Archived** status: current data model has only `isLive` boolean — should "Archived" be wired now (needs a flag) or rendered only as a future-ready chip option?
