## Goal

Today Service Owner and Super Admin see two completely different UIs (`/owner` vs `/dashboard`, different sidebars, different gates). We'll collapse them into **one shared interface**, and use a permission layer to hide/disable what a given role can't do. Same screens, same navigation shell — RBAC decides what's visible and what's actionable.

## Approach

### 1. Single permission layer
Add `src/lib/rbac.ts`:
- `Permission` union: `services.viewAll`, `services.activate`, `services.assignOwners`, `services.configure`, `services.goLive`, `org.manage`, `users.manage`, `branding.manage`, `audit.view`, `setup.manage`, etc.
- `ROLE_PERMISSIONS: Record<UserRole, Permission[]>` — `super_admin` gets all; `service_owner` gets only own-service scope (`services.configure`, `services.goLive` on assigned services, `branding.manage` scoped).
- `useCan(permission)` hook reading `currentUserRole` from `OnboardingContext`.
- `scopedServices(state)` helper — returns full list for admin, only assigned services for owner.

### 2. Shared home screen
Replace `OwnerHome` + `SetupDashboard` with one `pages/Home.tsx`:
- Always shows the "Activated Services" list, filtered through `scopedServices`.
- The setup checklist (Org Confirmed, Templates Activated, Owners Assigned, First Configured, First Published) renders only if `useCan("setup.manage")`. Owner sees just their services.
- Per-service row actions filtered by permissions (Configure / Manage / Go Live buttons hidden if not allowed).

### 3. Single sidebar, filtered
`AppSidebar` keeps one item list. Each item declares a `permission`. The sidebar filters with `useCan` instead of branching on `isOwner`. Result: owner sees Home + Help; admin sees the full Setup / Configuration / Utilities groups — from the same source of truth.

### 4. Routes
- `/` redirects to `/home` (after onboarding).
- `/home` is the unified screen — no role gate.
- Remove `/owner` and `/dashboard` (redirect both to `/home` for back-compat).
- Keep existing setup routes (`/setup/invite-admins`, etc.) but swap `RoleGate role="super_admin"` for a new `<Require permission="setup.manage">` wrapper that renders a friendly "You don't have access" panel instead of redirecting.
- Service-scoped routes (`/service/:id/configure`, `/manage`, `/go-live`) gated by `<Require permission="services.configure" serviceId={id}>` so an owner can only open their own services.

### 5. Onboarding flow
- `Onboarding.tsx`: after sign-in, both roles land on `/home` (drop the owner-specific branch).
- Keep the role chooser only as a dev/demo switcher (it currently sets `currentUserRole`); no functional branching elsewhere.

### 6. Cleanup
- Delete `pages/OwnerHome.tsx`, `pages/SetupDashboard.tsx`, `components/RoleGate.tsx` (replaced by `Require`).
- Update memory index entries that reference the old split.

## Files

- **new**: `src/lib/rbac.ts`, `src/components/Require.tsx`, `src/pages/Home.tsx`
- **edit**: `src/App.tsx` (routes), `src/components/AppSidebar.tsx` (permission-filtered), `src/pages/Onboarding.tsx` (single landing), `src/contexts/OnboardingContext.tsx` (only if we need a `hasServiceAccess(serviceId)` helper)
- **delete**: `src/pages/OwnerHome.tsx`, `src/pages/SetupDashboard.tsx`, `src/components/RoleGate.tsx`

## Out of scope

- No real auth/Supabase RBAC yet — still driven by `currentUserRole` in context + `serviceOwners` assignments. Structured so swapping in real auth later is a one-file change in `rbac.ts`.
- No visual redesign of existing screens; only gating and the merged home.
