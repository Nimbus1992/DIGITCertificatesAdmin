# Templates-First Refactor — Enterprise SaaS Pass

Reorient the platform so the Templates Dashboard is the home screen and primary control surface. Onboarding handles platform setup only. Service activation and user assignment happen from inside the Templates Dashboard, not during onboarding. Visual target: Linear / Stripe / Vercel — dense, structured, tabular, no card sprawl.

## Role model (clarified)

| Role | Onboarding | Can activate templates | Can add users to a service | Sees service |
|---|---|---|---|---|
| Super Admin | Password → Org → Add Admins → Templates | Yes | Yes (any role) | All |
| Administrator | Password → Templates | Yes | Yes (any role) | All |
| Service Owner | Password → Templates | No | Yes (within their assigned services only) | Only services where they're assigned |

A service appears for a Service Owner only after a Super Admin or Admin (a) activates the template and (b) assigns that owner to the resulting service.

## 1. Persona model

`src/data/personaSeeds.ts`:
- `PersonaRole = "super_admin" | "administrator" | "service_owner"`
- Seeds: `superadmin@egov.demo`, `admin@egov.demo`, `trade.owner@egov.demo`, `building.owner@egov.demo`
- Drop `assignedTemplates` from seeds; derive scope from `state.services[i].assignedOwners` instead.

`src/contexts/PersonaContext.tsx`: unchanged shape, plus new role. Unknown emails default to `administrator` (safer than service_owner for demos).

`src/contexts/OnboardingContext.tsx` — extend `ServiceItem`:
```ts
assignedOwners?: string[];   // emails of service owners
serviceUsers?: { id, email, role: 'service_owner'|'document_verifier'|'field_inspector'|'approver'|'counter_operator', status }[];
```

## 2. Onboarding — platform-only

`src/pages/Onboarding.tsx`:
- Super Admin: Password → Confirm Organization → **Add Administrators** → Done → `/templates`
- Administrator: Password → `/templates`
- Service Owner: Password → `/templates`

Replace `InviteTeam.tsx` with `AddAdministrators.tsx`:
- Single role (Administrator). No template assignment. No service-owner option.
- Compact two-column form (email + optional name) + dense list table below.
- Skippable with secondary "Skip for now".

`OnboardingComplete.tsx`: single summary stat (Administrators invited). CTA → `/templates`.

## 3. Templates Dashboard — the home screen

New file `src/pages/TemplatesDashboard.tsx` replaces both `/dashboard` and `/services` as the landing route. `/dashboard` and `/services` 301-redirect to `/templates`.

### Layout (enterprise, table-first — not cards)

```text
┌─────────────────────────────────────────────────────────────────┐
│ Templates                                       [+ Activate]    │
│ Manage service templates, drafts, and live services             │
├─────────────────────────────────────────────────────────────────┤
│ Live 2 · Draft 3 · Available 5 · Attention 1                    │  ← stat strip, no cards
├─────────────────────────────────────────────────────────────────┤
│ [All] [Live] [Draft] [Available]     Search… ⌕   Sort ▾         │
├─────────────────────────────────────────────────────────────────┤
│ SERVICE / TEMPLATE     STATUS    OWNER        UPDATED   ACTIONS │
│ ● Business License     Live      J. Smith     2h ago    ⋯       │
│ ● Building Permit      Draft     Unassigned   1d ago    ⋯       │
│ ○ Fire NOC             Available —            —         Activate│
│ ○ Pet License          Available —            —         Activate│
└─────────────────────────────────────────────────────────────────┘
```

- Single unified table grouped by section header rows: **Live Services**, **Draft Services**, **Available Templates**. No separate card grids.
- Row contains: status dot, name, status pill, primary owner + count, last updated, kebab menu.
- Kebab actions (contextual):
  - Available → Activate Template · View Details
  - Draft → Continue Configuration · Assign Owner · Open Workspace · Delete
  - Live → Open Workspace · Manage Users · View Public URL · Deactivate
- Empty state (no services + no templates assigned for SO): single inline panel with one CTA, not a hero card.
- "Attention" counter only appears when truthy (unassigned drafts, expiring licenses, failed deploys — surface real signals from `state.services`).

### Service Owner scoping

- Header reads "My Services".
- Available Templates section **hidden** (they cannot activate).
- Table filtered to services where `assignedOwners.includes(persona.email)`.
- Empty state: "No services have been assigned to you yet. Your administrator will give you access once a service is activated."

## 4. Activate flow — no auto-preview

`src/pages/TemplateSetup.tsx` `finalize()`:
- Change `navigate(\`/service/\${id}/configure\`)` → `navigate("/templates?recent=" + id)`.
- Dashboard reads `?recent=` and pins that row to the top of Draft Services with a small "Just created" indicator (subtle, not a banner) for the current session.
- No automatic preview, no automatic workspace open.

## 5. Assign Service Owner

New `src/components/templates/AssignOwnerSheet.tsx` (right-side sheet, not modal popover):
- Triggered from row kebab on Draft/Live services (admin + super_admin only).
- Lists existing administrators/owners in the workspace; "Add new" inline.
- Writes `assignedOwners` on the service. After save, that owner immediately sees the row when they log in.

## 6. Service Users live inside the workspace

- Add "Users & Access" tab to `ModuleTabs.tsx` for the service workspace.
- New `src/components/service-config/ServiceUsersPanel.tsx`: dense table of service users with roles Service Owner / Document Verifier / Field Inspector / Approver / Counter Operator. Invite via slide-over sheet.
- Writes to `service.serviceUsers`. Super Admin, Admin, and assigned Service Owners can manage; Service Owners limited to their service.
- Global `/setup/users` remains for **platform** users only (admins). Rename header to "Platform Users" to make the split explicit.

## 7. Service Workspace

No structural redesign in this pass — but tighten the entry. Reached only by explicit click from Templates Dashboard. `ServiceConfig.tsx` already supports this; just ensure no route in the app auto-redirects there post-activation.

Workspace tabs (existing): Configure · Applications · Operations · Deployment — add **Users & Access** as a fifth tab.

## 8. Sidebar

`src/components/AppSidebar.tsx`:
- Rename Main → "Workspace". Items: **Templates** (primary), Audit Log.
- Setup group (Super Admin + Administrator): Organization Profile, Platform Users, Application Areas, Authentication.
- Configuration: Branding, Languages, Integrations.
- Service Owner: Workspace (Templates only) + Help/Settings. Hide Setup + Configuration entirely (cleaner than view-only lock icons — matches Linear/Vercel role scoping).
- Remove "Dashboard" entry.

## 9. Visual system pass

Enforce the enterprise feel across the new screens:

- **Table-first**: use `Table` primitive consistently; row height 44px; zebra off; hover row background `bg-muted/40`; sticky header.
- **Status indicators**: 6px filled dot + lowercase text label, not colored pill badges everywhere. Reserve badges for counts.
- **Spacing scale**: page padding `px-8 py-6`, section gap `space-y-6`, no `space-y-10+`. Remove decorative gradient blocks from the legacy dashboard.
- **Typography**: page title `text-xl font-semibold`, section labels `text-xs uppercase tracking-wide text-muted-foreground`. Drop `text-3xl` page headings.
- **Actions**: primary in top-right of page header, contextual in row kebab. No floating CTA cards.
- **Empty states**: single line of copy + single inline CTA, no large illustrations.
- **Color**: keep existing tokens; remove ad-hoc `bg-green-100`, `from-accent/10 via-background to-primary/5`, `border-2 border-accent/30` patterns from the old dashboard.

Delete `Dashboard.legacy.tsx` once `/dashboard` redirects.

## Files

**New**: `src/pages/TemplatesDashboard.tsx`, `src/components/templates/TemplatesTable.tsx`, `src/components/templates/AssignOwnerSheet.tsx`, `src/components/onboarding/AddAdministrators.tsx`, `src/components/service-config/ServiceUsersPanel.tsx`.

**Edited**: `src/App.tsx` (routes + redirects), `src/pages/Onboarding.tsx`, `src/components/onboarding/OnboardingComplete.tsx`, `src/components/onboarding/PersonaLogin.tsx`, `src/contexts/PersonaContext.tsx`, `src/data/personaSeeds.ts`, `src/contexts/OnboardingContext.tsx` (assignedOwners/serviceUsers), `src/components/AppSidebar.tsx`, `src/pages/TemplateSetup.tsx` (post-finalize nav), `src/pages/Services.tsx` (replaced/removed), `src/pages/Dashboard.tsx` (redirect to `/templates`), `src/components/service-config/ModuleTabs.tsx` (Users & Access tab), `src/pages/UsersAccess.tsx` (rename → Platform Users).

**Removed**: `src/pages/Dashboard.legacy.tsx`, `src/components/onboarding/InviteTeam.tsx`.

## Risks & how they're handled

- **Existing localStorage shape change** (`assignedTemplates` → `assignedOwners` on services): write a one-shot migration in `OnboardingContext` init that backfills `assignedOwners` from any persona seeds so existing demo state doesn't break.
- **Deep links to `/dashboard` and `/services`**: both redirect to `/templates`; no broken links.
- **Service Owners with no assigned services on first login**: explicit empty state with copy explaining next step — not a blank page.
- **Auto-open paths**: audit `TemplateSetup.tsx`, `GoLive.tsx`, `OnboardingComplete`, any `useEffect` redirect to `/service/:id/*`. Only explicit user clicks should enter the workspace.
- **Role drift on unknown emails**: default to `administrator` (least surprising), and PersonaLogin shows the three named personas prominently.
- **No regressions in Go Live / Boundary / Preview**: this PR only touches routing-around and dashboard surface; service internals untouched.
