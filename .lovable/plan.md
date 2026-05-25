
## Goal

Make Audit Logs feel like a real investigation tool: one unified, filter-driven table where users can find "who did what, when, where" — instead of four disconnected tabs with mixed table/feed layouts. Click a row to open a right-side drawer with full details, before/after diff, metadata, and related events.

## Problem with the current screen

- Four tabs (Governance / Configuration / Deployments / Runtime) split the data, so a user investigating "what changed on Trade Permit yesterday" has to look in 3 places.
- Two tabs use a card/feed layout (`ConfigActivityTab`, `RuntimeActivityTab`, `DeploymentsTab`) — not scannable, not filterable as a table.
- Filters live above tabs but each tab uses them differently; "Event type" / "Status" only apply to some tabs.
- Inline row expansion in `GovernanceTab` is cramped and breaks table rhythm.

## New structure

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Audit Logs                                            [Export]  [Report]│
├─────────────────────────────────────────────────────────────────────────┤
│ Insight strip (unchanged: 4 stat tiles)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ Filter bar                                                              │
│ [🔍 Search]  [Date range ▾]  [Category ▾]  [More filters ▾]  Clear all  │
│ Active pills: [Service: Trade Permit ✕] [Severity: Failed ✕]            │
├─────────────────────────────────────────────────────────────────────────┤
│ Quick views (chips, optional, single-select):                           │
│  All · Failed only · Config changes · Permission changes · Deployments  │
│  · Runtime approvals · Security events                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ Unified table                                                           │
│ Time ▾  │ Actor  │ Category │ Action / Summary │ Entity │ Service │ Env │ Status │
│ 12m ago │ Aarav  │ Governance│ Role updated    │ Doc Verifier │ BL,TP │ Prod │ Success │
│ 35m ago │ Priya  │ Config    │ Workflow stage added │ BL Workflow │ BL │ Prod │ v14.2 │
│ 3h ago  │ System │ Deployment│ Published v8.4  │ Trade Permit │ TP │ Prod │ Published │
│ 2h ago  │ Sneha  │ Runtime   │ Application approved │ TL-2031 │ TP │ Prod │ Approved │
│ …                                                                       │
│ [Load 20 more · 24/142]                                                 │
└─────────────────────────────────────────────────────────────────────────┘

Row click → right Sheet drawer (480-560px):
  Header: action title, category badge, status badge, Audit ID (copy)
  Meta grid: When (abs + rel), Who, Where (IP), Env, Service(s), Module
  Before / After diff panels (when applicable)
  Domain-specific block:
    - Governance: scope, related events (clickable IDs)
    - Config: module, version, notes, affected modules
    - Deployment: version, duration, changed modules, warnings, runtime health
    - Runtime: application ID, applicant, stage, documents, payments, notifications
  Footer: "Open in source" link (e.g. Open application, Open service config)
```

## Implementation

### 1. Unified event model (`src/components/audit/AuditContext.tsx`)

Add a derived `useUnifiedEvents()` hook that normalises all four sources into one row shape:

```ts
type AuditCategory = "governance" | "config" | "deployment" | "runtime";
type UnifiedEvent = {
  id: string;
  timestamp: string;
  actor: string;
  category: AuditCategory;
  action: string;          // human-readable title
  entity: string;          // what was acted on
  service?: string;        // single primary service for the column
  services: string[];      // all affected (for filtering)
  environment?: Environment;
  statusLabel: string;     // "Success" / "v14.2" / "Published" / "Approved"
  statusTone: "success" | "warning" | "failed" | "neutral" | "info";
  raw: GovernanceEvent | ConfigActivityEvent | Deployment | RuntimeEvent;
};
```

Apply all existing filter logic in one place (search, date range, service, user, environment, severity, status, plus new `category` and `quickView`).

### 2. Filter bar (`AuditFilterBar.tsx`)

- Keep search + date range + More filters popover.
- Add a **Category** dropdown next to date range: All / Governance / Configuration / Deployments / Runtime.
- Add a row of **Quick view** chips below the input row:
  `All · Only failures · Permission & role changes · Config changes · Deployments · Runtime approvals · Security events`
  Each chip sets a preset (combination of category + severity + simple text predicate).
- Keep ActivePill row.

Update `AuditFilters` to include `category: "all" | AuditCategory` and `quickView: string`.

### 3. New unified table (`src/components/audit/UnifiedAuditTable.tsx` — new)

- Single table with columns: **Time · Actor · Category · Action · Entity · Service · Env · Status · ID**.
- Sort by Time / Actor / Category.
- Sticky header (`bg-muted/30`), zebra on even rows, severity left border (`border-l-destructive` for failed, `border-l-warning` for warning).
- Category column shows a compact pill (Governance / Config / Deployment / Runtime) with a subtle dot color — restrained, single hue per category.
- Time stays stacked (relative + absolute) using existing `RelativeTime stacked`.
- Row click opens drawer instead of inline expansion. Hover reveals a tiny "View details" hint at the row end.
- Pagination: existing `LoadMore` (20/page).

### 4. Detail drawer (`src/components/audit/AuditDetailDrawer.tsx` — new)

- Built on shadcn `Sheet` (right side, w-[520px]).
- Sections:
  - **Header**: action, category badge, status badge, copy-ID button.
  - **Summary grid**: When (exact + relative), Actor, IP, Environment, Service(s), Module/Version.
  - **Before / After**: reuse `JsonPanel` side-by-side when both present; otherwise render whichever exists.
  - **Domain block**: switch on category to show governance-specific (scope, related event links that open the same drawer for that ID), config-specific (notes, affected modules, publishedBy), deployment-specific (duration, warnings, health, changedModules), runtime-specific (applicationId, applicant, stage, documents, payments, notifications).
  - **Footer actions**: Copy JSON, Open source (best-effort link to `/services/:id` etc.; falls back to disabled).

### 5. Page (`src/pages/AuditLogs.tsx`)

- Remove `Tabs` and the four `*Tab` containers.
- Render: Header → InsightStrip → Filter bar (with category + quick views) → UnifiedAuditTable → mount AuditDetailDrawer with selected event.
- Keep export buttons; "Export Logs" now exports the currently filtered unified rows (respects filters).

### 6. Cleanup

- Delete (or stop importing) `GovernanceTab.tsx`, `ConfigActivityTab.tsx`, `DeploymentsTab.tsx`, `RuntimeActivityTab.tsx`. Keep the files only if `ServiceManage.tsx` uses any of them; in that case leave them untouched and only switch the main Audit Logs page.
- `shared.tsx` stays; add a small `CategoryBadge` component there.

## Out of scope

- New mock data, new tokens, schema/backend changes, edits to ServiceManage's scoped audit view (it can keep its current tabs for now, or we switch it separately on request).
- Saved views, scheduled exports, role-based masking — these belong in a later pass.

## Files

- new: `src/components/audit/UnifiedAuditTable.tsx`
- new: `src/components/audit/AuditDetailDrawer.tsx`
- edited: `src/components/audit/AuditContext.tsx` (add `category`, `quickView`, `useUnifiedEvents`)
- edited: `src/components/audit/AuditFilterBar.tsx` (category select + quick view chips)
- edited: `src/components/audit/shared.tsx` (add `CategoryBadge`)
- edited: `src/pages/AuditLogs.tsx` (remove tabs, mount unified table + drawer)
