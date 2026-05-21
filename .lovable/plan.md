## Users & Access — RBAC Module

Replace the placeholder at `/setup/users` with a full Users & Access experience: two tabs (Users / Roles & Permissions), invite drawer, role detail drawer with grouped permissions. Operational SaaS-admin density (Stripe/Linear/Retool feel), themed via existing semantic tokens.

### Route & nav

- Keep route `/setup/users`. Rename sidebar label to **Users & Access** (`AppSidebar.tsx`).
- Page title: "Users & Access", subtitle "Manage people, roles, and service permissions across your platform."

### Page shell (`src/pages/UsersAccess.tsx`)

- Header row: title + subtitle on left, `[+ Invite User]` primary CTA top-right (teal/accent).
- shadcn `Tabs` directly below header: **Users** | **Roles & Permissions**. Tab state synced to `?tab=users|roles` query param so deep links work.

### Tab 1 — Users

**Metric strip** — 4 compact cards in a `grid-cols-4` row, each ~80px tall:
- Total Users · System Users · Service Users · Pending Invites
- Small label (muted), large number, tiny delta line. No gradients, just `border bg-card`.

**Toolbar**
- Left: segmented filter pills — All / System / Service / Invited (count badge per pill).
- Right: search input (icon-left, ~280px), `Role` filter `Select`, `Status` filter `Select`.

**Table** (shadcn `Table`)
- Columns: User (avatar + name + email stacked), Role (pill), Service Scope (badge list, +N overflow), Status (dot + label: Active / Invited / Disabled), Last Active (relative), Actions (kebab → Edit role, Resend invite, Disable, Remove).
- Sticky header, `text-xs uppercase tracking-wide text-muted-foreground` heads, compact row padding (`py-2.5`), hover `bg-muted/40`, row click opens edit drawer.
- Empty state and pagination footer ("1–20 of 47").

**Invite User drawer** (right-side `Sheet`)
- Fields: Email (chips, multi), Role (`Select` grouped: System Roles / Service Roles), Service Selection (`MultiSelect` of services from `OnboardingContext.state.services`, only visible when a service role is picked), optional Message.
- Footer: Cancel · Send Invite (primary). Toast on send; new "Invited" row appended to local mock state.

### Tab 2 — Roles & Permissions

**Two sections** with `h3` group headers and small count badges:

- **System Roles**: System Admin, Service Designer
- **Service Roles**: Document Verifier, Field Inspector, Approver, Counter Operator, Viewer

**Role card** (dense, `border bg-card rounded-lg p-4`, grid 3-col on xl, 2-col on lg)
```text
┌───────────────────────────────────────────────┐
│ Field Inspector            [Service] badge    │
│ Conduct field inspections and upload reports. │
│                                               │
│ 12 users · Trade License, Building Permit +1  │
│                                               │
│ [Manage Permissions]   [View Users]           │
└───────────────────────────────────────────────┘
```
- Role type badge top-right (System = neutral, Service = accent tint).
- Footer actions are ghost buttons aligned right.

**Role detail drawer** (large right `Sheet`, ~560px)
- Header: role name, type badge, "12 users assigned" inline, Save/Cancel sticky footer.
- Section 1: **Service Assignment** (service roles only) — multiselect chips of services.
- Section 2: **Workflow Stage Access** (service roles only) — per selected service, list workflow stages with checkboxes (e.g., Approver → Trade License → Approval Stage only).
- Section 3: **Permissions** — shadcn `Accordion` (single-open) with groups: Dashboard, Applications, Workflow, Documents, Inspections, Reports, Settings.
  - Each row: permission label + small helper text on the left, segmented control on the right with 4 options: No Access · View · Limited · Full.
  - Segmented control built from `ToggleGroup` styled as pill selector; selected uses `bg-primary text-primary-foreground`.
- Dirty state enables Save; unsaved-changes confirm on close.

### Data layer (frontend only, mock)

- New `src/data/usersAccess.ts` — typed mock seeds for users and roles, plus permission group catalog and the 4 access levels.
- New `src/contexts/UsersAccessContext.tsx` (or local `useState` in the page since this is presentation-only) holding users + role permission map; persisted to `localStorage` under `users-access:v1` so edits survive reloads.
- No backend / Supabase changes.

### Components to add

- `src/pages/UsersAccess.tsx` (replaces placeholder route handler)
- `src/components/users-access/MetricCard.tsx`
- `src/components/users-access/UsersTable.tsx`
- `src/components/users-access/InviteUserSheet.tsx`
- `src/components/users-access/RoleCard.tsx`
- `src/components/users-access/RoleDetailSheet.tsx`
- `src/components/users-access/PermissionRow.tsx` (label + segmented control)
- `src/components/users-access/RolePill.tsx`, `StatusDot.tsx`, `ServiceScopeBadges.tsx`
- `src/data/usersAccess.ts`

### Files edited

- `src/App.tsx` — swap `/setup/users` placeholder for `UsersAccess` page.
- `src/components/AppSidebar.tsx` — rename "Users & Roles" → "Users & Access".

### Visual rules

- Reuse semantic tokens only (`bg-card`, `border-border`, `text-muted-foreground`, `bg-primary`, `bg-accent`). Teal/green CTAs use existing `--primary` / `--accent`.
- Compact density: row height 44px, card padding 16px, section gap 24px.
- No gradients, no decorative illustrations, no oversized hero.
- Status dots: Active = emerald, Invited = amber, Disabled = muted.

### Out of scope

- Real auth, real invites, real permission enforcement, audit log entries — all mocked locally.
- Bulk operations, CSV import/export, SCIM — can be added later.
