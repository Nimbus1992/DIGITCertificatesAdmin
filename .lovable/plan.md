# Service Workspace — Overview tab

## Goal
After Template Setup, drop users into a calm **Overview** screen (not the device Preview) that summarizes what was generated and points to the next actions.

## Where it lives
`src/pages/ServiceConfig.tsx` already renders the service header + tabs (Configure / Preview / Monitor / Manage). We extend it with a new `overview` mode and make it the default.

## Changes

### 1. Route into Overview after Template Setup
- `src/pages/TemplateSetup.tsx` — `finalize()` navigates to `/service/${id}/configure` with `state: { mode: "overview" }`.

### 2. Add Overview mode to `ServiceConfig.tsx`
- Extend the `mode` union: `"overview" | "configure" | "preview" | "operations" | "deployment"`.
- Default `initialMode` to `"overview"` (instead of `"preview"`).
- Insert **Overview** as the first item in `workspaceTabs` for non-live services (and live, for consistency). Order becomes: Overview | Configure | Preview | Monitor | Manage.
- Render a new `<OverviewWorkspace service={service} />` when `mode === "overview"`.

### 3. New component `src/components/service-config/OverviewWorkspace.tsx`
Layout (uses existing tokens: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `accent`, `Badge`, `Card`, `Button`):

**Intro block**
- Subtitle: "Your service has been initialized and is ready for configuration, preview, deployment, and monitoring."
  (Service name + Draft badge already shown in the parent header; we do not duplicate it. Go Live button also stays in parent header.)

**Setup Summary**
- Section heading: "Setup Summary".
- Render as a single bordered card containing a tight list of rows (label on the left, value chips on the right). No large cards.
- Rows derived from `service`:
  - **Modules** — chips from `service.customModules` (e.g. Issuance, Renewal).
  - **Categories** — chips from `service.templateSetup?.categoriesList`; show "None" if empty. If >8, show first 8 + "+N more".
  - **Subcategories** — chips from `service.templateSetup?.subcategoriesList` (name only); same overflow rule.
  - **Renewal Configuration** — derived from `service.renewalPolicy?.mode` → "Global ({months} months)" / "Category Based" / "Subcategory Based"; or "Not enabled" if undefined.
  - **Employee Roles Generated** — count via `useServiceRoles` (or fall back to a constant 3 if hook unavailable in this scope).
  - **Citizen Portal Generated** — green check chip.
  - **Employee Workspace Generated** — green check chip.

**Primary Workspace Actions**
- Section heading: "Get Started".
- Grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`, four equal cards using the same `Card` styling as Configure tiles (icon tile + title + description + CTA button at the bottom).
  1. **Configure Service** — desc "Forms, workflows, notifications, payments, roles." CTA "Open Configuration" → `setMode("configure")`.
  2. **Preview Applications** — desc "Preview generated Citizen and Employee experiences." CTA "Open Preview" → `setMode("preview")`.
  3. **Monitor** — desc "Monitor application volume, SLA performance, approvals." CTA "Open Reports" → `setMode("operations")`.
  4. **Manage** — desc "Authentication, domains, environments, publishing settings." CTA "Manage Deployment" → `setMode("deployment")`. Disabled (button + card opacity-60, cursor-not-allowed) until `isLive`; show small "Available after Go Live" helper text.

### 4. Persist tab choice
No persistence needed — defaulting to `overview` is enough; explicit user clicks change `mode` for the session, same as today.

## Out of scope
- No changes to Template Setup wizard steps, OnboardingContext shape, or operations/preview internals.
- No new routes; Overview is a sub-mode of `/service/:id/configure`, matching the existing pattern.

## Design system
- Uses only semantic tokens (`bg-card`, `text-foreground`, `text-muted-foreground`, `accent`, `border-border`, `bg-muted`).
- Icons from `lucide-react` (`Settings2`, `Eye`, `BarChart3`, `Rocket`, `CheckCircle2`).
- No raw hex colors; chips use `Badge variant="secondary"` and `bg-accent/10 text-accent` for highlights, matching the existing Configure tiles.
