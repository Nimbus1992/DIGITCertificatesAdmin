## Goal

Transform the post-setup Overview from a generic dashboard into a launch-readiness confirmation. Answer one question for the user: *"Is my service ready, and what should I do next?"*

## Scope

Only `src/components/service-config/OverviewWorkspace.tsx` is rewritten. No changes to routing, business logic, contexts, or the parent header (Go Live button already lives there). All styling uses existing semantic tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, `accent`, `border-border`, `bg-success`/green via existing pattern in `ServiceConfig.tsx`).

## New layout

```text
┌──────────────────────────────────────────────────────────┐
│ HERO                                                     │
│   [✓ Ready for Launch]  ← status badge (accent/success)  │
│   Business License                                       │
│   Generated successfully from the Business License       │
│   template. Publish immediately with defaults, or        │
│   review and customize before going live.                │
│                                                          │
│   [ Go Live ]  [ Preview Experience ]  [ Customize ]     │
└──────────────────────────────────────────────────────────┘

SERVICE READINESS
  ✓ License Types Generated: Issuance, Renewal
  ✓ Business Categories: Retail, Manufacturing, Hospitality
  ✓ Employee Roles Created: 3
  ✓ Citizen Portal Generated
  ✓ Employee Workspace Generated
  ✓ Renewal Policy: 12 Months

GENERATED EXPERIENCES
  ┌─────────────────────────┐  ┌─────────────────────────┐
  │ 👤 Citizen Portal       │  │ 🏛 Employee Workspace   │
  │ ✓ Ready                 │  │ ✓ Ready                 │
  │ Apply, pay fees, track  │  │ Review applications,    │
  │ status, download        │  │ process approvals,      │
  │ licenses.               │  │ issue licenses.         │
  └─────────────────────────┘  └─────────────────────────┘

WHAT WOULD YOU LIKE TO DO NEXT?
  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
  │ Preview          │  │ Customize        │  │ Monitor & Manage │
  │ Experience       │  │ Service          │  │ (muted)          │
  │ Review citizen + │  │ Forms, workflows,│  │ Available after  │
  │ employee flows.  │  │ notifications,   │  │ Go Live          │
  │ [Open Preview]   │  │ roles, SLA.      │  │ [Disabled]       │
  └──────────────────┘  └──────────────────┘  └──────────────────┘
```

## Component sections

1. **Hero block** — Card with subtle accent border/background.
   - Top: success badge `<Badge>` with `CheckCircle2` icon + "Ready for Launch", styled with green tokens consistent with existing "Live" badge in `ServiceConfig.tsx` (`bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`).
   - `serviceName` as `<h2 className="text-2xl font-semibold">`.
   - Description paragraph.
   - CTA row: `Go Live` (default variant, prominent), `Preview Experience` (secondary), `Customize Service` (ghost/outline).
   - Go Live: `navigate('/go-live')` after `setActiveService(service.id)` — same pattern as parent header. Hidden when `isLive`; replaced with "View Live Service" / live URL chip.
   - Preview / Customize call `onNavigate("preview" | "configure")`.

2. **Service Readiness** — Card with check rows. Each row: `CheckCircle2` (text-green) + bold label + value. Derive from existing `service` fields (`customModules`, `templateSetup.categoriesList`, `renewalPolicy`). Keep current `renewalLabel()` helper.

3. **Generated Experiences** — Two-card grid. Each card: icon (`User` / `Briefcase` from lucide), title, "Ready" success chip, one-line description. Cards are non-interactive (no CTAs — actions live in next section).

4. **What would you like to do next?** — Three-card grid:
   - Preview Experience → `onNavigate("preview")`
   - Customize Service → `onNavigate("configure")`
   - Monitor & Manage → disabled + muted, hint "Available after Go Live". Single combined card (was two: Monitor + Manage).
   - Remove the existing "Configure Service" card from the action grid (now promoted into hero).

## Visual hierarchy

- Hero CTAs use size/weight to enforce: Go Live (default solid) > Preview (secondary) > Customize (ghost).
- Action card grid changes from 4 equal cards to 3, with the third visibly de-emphasized (opacity-60, `border-dashed`).
- "Get Started" heading removed entirely; replaced by "What would you like to do next?".

## What stays the same

- Parent header tabs and Go Live button in `ServiceConfig.tsx` (unchanged).
- Tab label remains "Overview" (no rename to "Service Readiness" — keeps tab bar terse; the hero communicates the state).
- `OverviewWorkspace` props signature: `{ service, isLive, onNavigate }`.
- No new dependencies, no new routes, no data model changes.

## Out of scope

- Template Setup wizard, OnboardingContext, ServiceConfig tab structure, Go Live flow internals.
