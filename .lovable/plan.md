
# Restructure First-Time Super Admin Onboarding

Shift Studio from "create a service immediately" to "set up governance and ownership first, then configure services." Add a Service Owner experience that is distinct from Super Admin.

## 1. Sign-in: choose role first

Update `SignIn` (and `Onboarding.tsx`) to ask, before login, which user you are:

- Super Admin
- Service Owner

Two large role cards on the sign-in screen, then the existing email/password form. Selection is stored on `OnboardingState.currentUserRole` ("super_admin" | "service_owner") in localStorage and drives the post-login landing route.

Existing Confirm Org + Reset Password steps remain only for Super Admin first run. Service Owner sign-in skips straight to their own home (see §6).

## 2. New onboarding steps (full-page, app shell)

After `ConfirmOrganization`, Super Admin lands in the app shell (sidebar visible) and walks through three required setup tiles. These are also accessible later from the Setup Dashboard.

### Step A — Invite Additional Admins (`/setup/invite-admins`)
- Email field + role dropdown (Admin only for now) + "Add another"
- Status badges: Invited / Active
- "Skip" and "Continue" CTAs
- Backed by `org_invites` table (see §5)

### Step B — Activate Service Templates (`/setup/activate-services`)
- Reuses `TemplateCard` from `src/components/onboarding/TemplateCard.tsx`
- Multi-select via card checkbox; Building Permit + Fire NOC stay disabled
- Each card already shows name, description, modules count — add a small "Roles included" line by reading `tradeLicenseTemplate.roles` length (or seed similar)
- CTA "Activate Selected Services" creates one Draft `ServiceItem` per selection via `addService` (no wizard, no config)
- Helper banner: "You can always activate more later from Services."

### Step C — Assign Service Owners (`/setup/assign-owners`)
- One row per newly activated service
- Two actions: "Assign Existing User" (dropdown of admins/users from `org_members`) or "Invite New User" (inline email)
- Role description card on the right explaining Service Owner can/cannot do
- Skip allowed with inline warning: "No Service Owner assigned. This service cannot be configured until ownership is assigned."
- CTA "Finish Organization Setup" → `/dashboard`

## 3. Setup Dashboard (`/dashboard` replacement for Super Admin)

Replace the current Templates-centric Dashboard for Super Admin with an Organization Setup Dashboard:

- Welcome card: "Your government workspace is ready. Complete the remaining setup activities before services can go live."
- Clickable checklist tiles, each routing to its setup page:
  - ✅ Organization Confirmed → `/setup/organization`
  - ✅ Service Templates Activated → `/setup/activate-services`
  - ⬜ Service Owners Assigned → `/setup/assign-owners`
  - ⬜ First Service Configured → opens first draft service's configure page
  - ⬜ First Service Published → opens Go Live
- Below the checklist, a compact "Services" section listing activated services with owner avatars and status pills (Draft / Live). Each row links to `/service/:id/manage` for Super Admin oversight (not configure).
- Existing service grid moves to `/services` (already exists). Sidebar entry "Services" remains.

## 4. Service Owner experience (`/owner`)

When `currentUserRole === "service_owner"`, after login route to `/owner`:

- Header: "My Services"
- Lists only the services where the signed-in user is the owner (mocked: pick by `state.currentOwnerEmail` matched against `service.ownerEmail` once we have it; until real auth, the role switcher picks one demo owner)
- Each card: service name, status badge, "Start Setup" CTA → existing `/service/:id/configure`
- Inside service config, the owner already sees the existing Configure → Add Team → Go Live checklist; no change needed there
- Sidebar is trimmed for owners: only Services + Help (hide Setup/Configuration/Utilities)

## 5. Lovable Cloud schema

Backend stores invites + ownership so multiple admins can collaborate. Tables (all in `public`, with GRANT + RLS):

- `org_members` — id, user_id (auth), email, full_name, role ('super_admin' | 'admin' | 'service_owner'), status ('invited' | 'active'), invited_by, created_at
- `service_owners` — id, service_id (text, matches local `ServiceItem.id`), owner_email, owner_user_id (nullable until they accept), assigned_by, created_at
- RLS: any authenticated org member can SELECT; only super_admin role can INSERT/UPDATE/DELETE. Use a `has_role(uuid, app_role)` security-definer + `app_role` enum per project standards.

Auth: enable Email/Password + Google (project defaults). Skip a `profiles` table for now — name comes from `org_members`.

Invites flow uses Lovable's transactional email (`send-transactional-email`) to email the invitee a sign-up link.

## 6. Routing & guard changes

`App.tsx`:
- Pre-login: `Onboarding` renders role choice → SignIn → (Super Admin only) Reset Password + Confirm Org
- After Super Admin onboarding completes → `/dashboard` (new Setup Dashboard)
- Service Owner login → `/owner`
- New routes: `/setup/invite-admins`, `/setup/activate-services`, `/setup/assign-owners`, `/owner`
- A small `<RoleGate role="super_admin">` wrapper around setup/admin routes redirects owners to `/owner`

## 7. Files

New:
- `src/pages/SetupDashboard.tsx` (replaces current Dashboard content for Super Admin; current Dashboard logic preserved on `/services` which already exists)
- `src/pages/setup/InviteAdmins.tsx`
- `src/pages/setup/ActivateServices.tsx`
- `src/pages/setup/AssignOwners.tsx`
- `src/pages/OwnerHome.tsx`
- `src/components/onboarding/RoleChoice.tsx`
- `src/components/RoleGate.tsx`
- `src/lib/useOrgMembers.ts`, `src/lib/useServiceOwners.ts`

Edited:
- `src/pages/Onboarding.tsx` — insert RoleChoice before SignIn; branch after Confirm Org by role
- `src/components/onboarding/SignIn.tsx` — show selected role chip, add "Change" link
- `src/contexts/OnboardingContext.tsx` — add `currentUserRole`, `currentUserEmail`, `pendingActivatedServiceIds` (transient between steps B and C)
- `src/App.tsx` — add new routes, swap `/dashboard` element
- `src/components/AppSidebar.tsx` — hide non-owner items when role is service_owner

Unchanged: existing service config, Go Live, Preview, Branding, Boundary, Audit, Users & Roles pages.

## 8. Out of scope

- Real billing / license enforcement
- Real email send beyond invite (already covered by Lovable transactional)
- Multi-org / tenant switching
- Migrating existing services in localStorage into Cloud (services stay client-side; only members & ownership go to Cloud)

## Technical notes

- Role choice persisted in localStorage so refresh restores the right landing route.
- Setup checklist completion is computed from: `state.services.length`, `service_owners` rows, any service with `status === 'live'`, etc. No new flags needed.
- `RoleGate` checks `state.currentUserRole`; replace with `auth.uid()` + `has_role` when real auth lands.
- All new screens reuse existing card/typography tokens; no new design primitives.
