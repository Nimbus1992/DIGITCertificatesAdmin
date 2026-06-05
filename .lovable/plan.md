## Goal

Make **assigning a service owner** the first and only step of template *activation*. All other configuration (name, structure, renewal, workflow scope) moves out of activation and becomes a **Continue setup** action initiated from the Services workspace.

```
Activate template
   ↓
Assign service owner    ──▶ Save: owner gets invite, draft appears in workspace
   (optional)                  for owner to continue setup
   ↓                       
   Skip                  ──▶ Draft appears in workspace; admin sees
                              "Continue setup" prompt and resumes wizard
```

## Changes

### 1. New `TemplateActivate` page (`src/pages/TemplateActivate.tsx`)
Route: `/templates/:templateId/activate`

Single-screen step using the same `SetupShell` chrome as the wizard so the experience feels continuous. Content:

- Heading: "Assign a service owner"
- Body copy explains: the service owner is responsible for naming, configuring modules, renewal rules, and workflow. This step is optional — you can skip and continue setup yourself.
- Email input + suggestion chips (reuse `PERSONA_SEEDS` + `persona.invitedUsers`, same as `AssignOwnerSheet`).
- Two actions in footer:
  - **Skip — I'll set it up** (ghost) → creates draft with no owner.
  - **Assign and create draft** (primary, disabled until valid email) → creates draft with `assignedOwners: [email]`.

On either action:
1. Build a minimal `ServiceItem`:
   - `id: ${templateId}-${Date.now().toString(36)}`
   - `name: template.name` (placeholder; owner/admin can rename in Continue setup)
   - `templateId`, `status: "draft"`, `customModules: ["Issuance"]`
   - `isPublished: false`, `isLive: false`
   - `deployment: { availabilityScope: "entire_state", selectedItems: [] }`
   - `teamMembers: []`, `authMethod: "email"`
   - `assignedOwners: assigned ? [email] : []`
2. `addService(draft)`
3. Toast: "Draft created — continue setup" or "Owner invited — they'll complete setup"
4. `navigate(/templates?recent=${id})`

### 2. Update `TemplateSetup` to support resume
File: `src/pages/TemplateSetup.tsx`

- Read `?serviceId=` query param.
- When present:
  - Look up the existing draft from `state.services`.
  - Hydrate local state (`name`, `renewalEnabled`, `hasCategories`, `categoriesList`, `subcategoriesList`, `renewalPolicy`, `workflowScope`) from `service.templateSetup` / `service.renewalPolicy` / `service.workflowScope` / `service.customModules`.
  - In `finalize()`, call `updateService(serviceId, { ...patch })` instead of `addService`. Preserve existing `assignedOwners`.
- When absent: keep current behaviour (legacy direct-setup path).

### 3. Workspace wiring (`src/pages/TemplatesDashboard.tsx`)
- `activateTemplate(t)` → `navigate(/templates/${t.id}/activate)` (instead of `/setup`).
- The same change applies in `TemplateCatalogDialog`, `TemplatePreviewSheet`, and `TemplateDetailsSheet` since they all call back through `onActivate`. (Single change in workspace's `activateTemplate` covers all three.)
- `AttentionRow` "Continue setup" CTA → `navigate(/templates/${s.templateId}/setup?serviceId=${s.id})` (instead of `/service/:id/configure`). This makes the prompt resume the wizard where it left off.

### 4. Route registration (`src/App.tsx`)
Add: `<Route path="/templates/:templateId/activate" element={<TemplateActivate />} />`

## Out of scope

- Real email invitation. The "owner invited" toast is just UI; assignment is stored on the service like today.
- Resuming partial wizard progress mid-step. Hydration is from saved fields only — the wizard starts at "Identity" but with values pre-filled, and the user steps through; the steps already short-circuit when data is valid.
- Renaming the wizard's first step. The owner/admin can change the name there.

## Files touched

- `src/pages/TemplateActivate.tsx` (new)
- `src/pages/TemplateSetup.tsx` (hydrate + update path)
- `src/pages/TemplatesDashboard.tsx` (activate route + continue-setup route)
- `src/App.tsx` (route registration)
