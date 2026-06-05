# Role-Based Experience Simulation

A frontend-only prototype that simulates Super Admin vs Service Owner experiences, driven entirely by localStorage. No backend, no real auth.

## 1. Persona Login

Replace the current sign-in screen with a persona picker.

- New file: `src/components/onboarding/PersonaLogin.tsx`
  - Three preset cards (no password):
    - `superadmin@egov.demo` → Super Admin
    - `trade.owner@egov.demo` → Service Owner (assigned: Business License)
    - `building.owner@egov.demo` → Service Owner (assigned: Building Permit)
  - Free-text email also accepted; persona inferred from a seeded list.
- New file: `src/contexts/PersonaContext.tsx`
  - `role: "super_admin" | "service_owner"`, `email`, `assignedTemplates: string[]`, `hasChangedPassword`, `hasCompletedOnboarding`, `invitedUsers: InvitedUser[]`.
  - Persisted at `persona:v1` in localStorage.
- Seed: `src/data/personaSeeds.ts` — defines the three preset personas + service-owner-to-template mapping.

## 2. Onboarding Routing

Update `src/pages/Onboarding.tsx` to branch by persona:

- No persona selected → `PersonaLogin`.
- Super Admin (first login):
  1. Change Password (prototype — any non-empty values pass)
  2. Confirm Organization (reuse existing `ConfirmOrganization`)
  3. Invite Team Members (new step — see §3)
  4. Onboarding Complete success screen → `/dashboard`
- Service Owner (first login):
  1. Change Password only → redirect to `/services` (their assigned templates)
- Returning users skip onboarding and land on their default route.

## 3. Invite Team Members Step

New file: `src/components/onboarding/InviteTeam.tsx`

- Form: Email, Role dropdown (`Administrator`, `Service Owner`).
- If role = Service Owner → reveal `Assigned Template` dropdown:
  - Business License (active), Building Permit, Fire NOC, Occupancy Certificate, Road Digging Permit, Birth & Death Certificate, Pet License
  - Helper text per spec.
- Inline role description card updates with selection.
- Table of invited users: Email · Role · Assigned Template · Status (always `Invited`).
- Stored in PersonaContext (`invitedUsers`), persisted in localStorage.
- Continue button → success screen with counts (Administrators, Service Owners, Templates activated).

## 4. Super Admin Dashboard (Governance Focus)

Rewrite `src/pages/Dashboard.tsx` (when role = super_admin):

- Stat cards: Administrators · Service Owners · Active Services · Services Live (counts derived from invited users + services list).
- Quick Actions row: Add User → `/setup/users`, Manage Roles → `/setup/users`, Activate Template → `/services`, View Audit Logs → `/audit-log`.
- Keep existing dashboard for service_owner but scoped to their assigned services (see §6).

## 5. Sidebar Scoping

Update `src/components/AppSidebar.tsx` to read persona and filter nav:

- Super Admin: full nav (current).
- Service Owner: Show Organization Profile [view only] , Application Areas (Boundaries) [view only] Authentication [view only] ,  Dashboard [view only] , Templates [only active for them], Branding[view only] , Audit Log[only template specific] , Users & Access , Settings, Help.
- Use a single `navItems` source filtered by `role`.

## 6. Service Owner Experience

- `src/pages/Services.tsx`: when role = service_owner, filter `allTemplates` to `assignedTemplates`. Show inline "Continue Configuration" CTA on the assigned (draft) template.
- After password change, redirect to `/services` (their landing).
- `src/pages/UsersAccess.tsx`: when role = service_owner, scope to service roles only (Document Verifier, Field Inspector, Approver, Counter Operator) — hide system roles and the org-wide invite path. Add a banner "Service-scoped users for &nbsp;".
- `src/pages/AuditLogs.tsx`: when role = service_owner, add a banner "Showing logs for &nbsp;" (purely cosmetic filter — no data wiring beyond that).
- Block direct navigation to hidden routes: small `RoleGuard` wrapper redirects service owner away from `/setup/organization`, `/setup/deployment`, `/boundary`, `/setup/auth`, `/setup/license` to `/dashboard`.

## 7. Persona Switcher (Demo Aid)

Small dropdown in `AppLayout` header showing current persona with a "Sign out / switch persona" action that clears `persona:v1` and routes to `/onboarding`. Helps demos.

## Files

**New**

- `src/contexts/PersonaContext.tsx`
- `src/data/personaSeeds.ts`
- `src/components/onboarding/PersonaLogin.tsx`
- `src/components/onboarding/ChangePassword.tsx`
- `src/components/onboarding/InviteTeam.tsx`
- `src/components/onboarding/OnboardingComplete.tsx`
- `src/components/RoleGuard.tsx`

**Edited**

- `src/App.tsx` — wrap with `PersonaProvider`, add `RoleGuard` on restricted routes.
- `src/pages/Onboarding.tsx` — branch by persona.
- `src/pages/Dashboard.tsx` — governance view for super admin.
- `src/pages/Services.tsx` — filter for service owner.
- `src/pages/UsersAccess.tsx` — service-scoped mode.
- `src/pages/AuditLogs.tsx` — service-scoped banner.
- `src/components/AppSidebar.tsx` — role-based nav.
- `src/components/AppLayout.tsx` — persona switcher in header.

## Notes

- Existing `OnboardingContext` is left intact; PersonaContext layered alongside so existing service-config flow continues to work.
- All gating is cosmetic / route-level — no real permission enforcement, per prototype spec.