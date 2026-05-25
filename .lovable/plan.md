# Audit Logs & Activity Center

Replace the empty `/audit-log` placeholder with a full enterprise governance screen, and extend `ServiceManage` with scoped audit tabs that reuse the same components.

## Files

**New**
- `src/data/auditLogs.ts` — typed mock dataset (governance, config, deployments, runtime) with realistic IDs, services (Business License, Building Permit, Trade Permit, Fire NOC, Occupancy Certificate), users, versions, before/after JSON.
- `src/pages/AuditLogs.tsx` — page shell: header, sticky filter bar, quick-filter pills, 4 main tabs.
- `src/components/audit/AuditFilterBar.tsx` — sticky single-row filters (Search, Date Range via popover calendar, Service, User, Environment, Event Type, Severity, Status) + quick-filter pills (All / Governance / Config Changes / Deployments / Runtime / Security). Uses existing `Select`, `Input`, `Popover`, `Calendar`, `Badge`, `Button` primitives.
- `src/components/audit/AuditContext.tsx` — small context holding filter state + a `useFilteredLogs(domain)` hook (search debounce, date range, pill scope).
- `src/components/audit/GovernanceTab.tsx` — dense `Table` with expandable rows. Expansion renders an inline detail panel with Performed By / Timestamp / Audit ID / IP / Environment / Affected Services and **Before / After** monospace JSON blocks in `bg-muted` rounded panels, plus Related Actions.
- `src/components/audit/ConfigActivityTab.tsx` — vertical feed of expandable timeline cards (service icon, module badge, version tag, env badge, actor, relative+exact time). Expanded state shows side-by-side diff blocks with highlighted modified fields, affected config modules (Forms / Workflow / Roles / Notifications / Payments), deployment notes, and an "Open Service Configuration" link → `/services/:id/configure`.
- `src/components/audit/DeploymentsTab.tsx` — vertical release timeline (left rail with connector). Each release card: version, publisher, env, status badge (Draft / Published / Failed / Rolled Back), impacted services chips, changed-modules count, duration, notes. Actions: View Changes / Compare Versions / Rollback / Open Details. Expanded: changed services, config modules, validation warnings, runtime health.
- `src/components/audit/RuntimeActivityTab.tsx` — left-aligned timeline event stream. Each card: application ID, applicant, service, workflow stage, actor, event type, status chip (Approved/SentBack/Rejected/Pending/InProgress with semantic colors). Expanded: journey snapshot, current stage, assignee, documents, payments, notifications, "Open Application" CTA.
- `src/components/audit/shared/` — `StatusBadge.tsx`, `ResultBadge.tsx`, `EnvBadge.tsx`, `DiffBlock.tsx`, `JsonPanel.tsx`, `RelativeTime.tsx`, `EmptyState.tsx`, `LoadingRows.tsx`. All using semantic tokens only (`bg-muted`, `text-muted-foreground`, `border-border`, `text-primary`, `bg-destructive/10`, `text-destructive`, etc.). No hardcoded hex.

**Modified**
- `src/App.tsx` — point `/audit-log` to the new `AuditLogs` page (keep the existing sidebar route untouched).
- `src/pages/ServiceManage.tsx` — wrap existing content in a top-level `Tabs` with `Overview` (current content) + new nested `Manage` tabs: **Activity Logs / Deployments / Versions / Service Users**. Activity Logs renders `ConfigActivityTab` + `RuntimeActivityTab` filtered to `serviceId`; Deployments renders `DeploymentsTab` filtered to `serviceId`; Versions shows a compact version history table built from the same dataset; Service Users reuses existing user list patterns. No governance events here.

## Design rules
- All visual styling via existing tokens (`bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary`, `bg-primary/10`, `text-destructive`, `bg-destructive/10`, etc.).
- Reuse `Table`, `Badge`, `Button` (ghost/outline/secondary), `Card`, `Tabs`, `Input`, `Select`, `Popover`, `Calendar`, `ScrollArea`, `Separator`, `Collapsible`, `Skeleton`.
- Result badges: Success = `bg-primary/10 text-primary`, Warning = `bg-amber-500/10 text-amber-600 dark:text-amber-400` via semantic warning class if available else token, Failed = `bg-destructive/10 text-destructive`. Confirm `warning` token exists; if not, use `bg-muted text-foreground` with an outline border in the project's accent.
- Dense spacing: `py-2 text-sm`, compact rows (`h-10`), sticky filter bar via `sticky top-12 z-10 bg-background border-b`.
- Monospace JSON blocks: `font-mono text-xs bg-muted rounded-md p-3 overflow-x-auto`.

## Behavior
- Filter state lives in `AuditContext`; each tab calls `useFilteredLogs("governance" | ...)`.
- Search input is debounced (250ms) and matches application ID, user, service, action, role, deployment version.
- Quick-pill selection narrows the domain scope across all tabs.
- Row expansion via `Collapsible` (governance + runtime) and an `isOpen` state in cards (config + deployments).
- Pagination: simple "Load more" button (20 at a time) — no virtualization needed for mock data.
- Column sorting on Governance table (Timestamp, User, Action).
- Empty/loading/no-results states for every tab.
- Export Logs / Download Audit Report buttons trigger a CSV blob download of the currently filtered set (no backend).

## Out of scope
- Real backend / persistence (mock data only, in keeping with rest of prototype).
- New semantic tokens — only use what's already in `index.css` / Tailwind config.
- Changes to global sidebar (route already exists as "Audit Log").

## Verification
- Navigate to `/audit-log`, confirm header + sticky filters + 4 tabs render with data.
- Toggle each pill and each tab; expand rows/cards in each.
- Open a service via `/services/:id/manage`, confirm new nested Manage tabs appear and are scoped to that service (no governance events).
- Visually confirm all colors/typography match the rest of the app under both light theme and any branding override.
