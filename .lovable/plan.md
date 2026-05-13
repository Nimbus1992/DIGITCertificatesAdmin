## Goal

Replace the current `UseTemplateDialog` popup with a guided, multi-screen "Master Template Configurator" experience that runs after a template is selected (from `TemplateCard` "Use" or `TemplateIntroduction` "Use template"). The downstream configurator (`/service/:id/configure`) stays unchanged — only the setup-before-configurator flow is replaced.

## Flow overview

```text
Templates list ──► [Use template] ──► /templates/:templateId/setup
                                       │
                                       ├─ step=identity   (Screen 1: name)
                                       ├─ step=modules    (Screen 2: capabilities)
                                       ├─ step=structure  (Screen 3: categories / subcategories)
                                       ├─ step=initialize (Screen 4: animated setup)
                                       └─ done ──► /service/:newId/configure
```

## New files

**`src/pages/TemplateSetup.tsx`** — full-page route, owns wizard state (`name`, `modules`, `hasCategories`, `categoriesFile`, `hasSubcategories`, `subcategoriesFile`, `step`). Loads template by `:templateId` param, redirects to `/services` if missing or `comingSoon`. Renders the active step component inside a shared shell. On final submit, builds the `ServiceItem` (same shape as today's `UseTemplateDialog.handleCreate`), calls `addService(...)`, then `navigate(\`/service/${newService.id}/configure\`)`.

**`src/components/template-setup/SetupShell.tsx`** — shared layout: centered max-w-2xl content column on `min-h-screen bg-background`, top progress indicator (4 dots / step labels: Identity · Modules · Structure · Initializing), Back link (prev step or back to template list on step 1), `animate-fade-in` between steps via a keyed wrapper.

**`src/components/template-setup/Step1Identity.tsx`** — Heading "Set up your service", sub "Let's start by defining the basic identity of your service.", single `Input` for Service Name (prefilled with `template.name`, editable), inline duplicate-name validation against `state.services` (reuse the rule from `UseTemplateDialog`). Primary CTA "Continue".

**`src/components/template-setup/Step2Modules.tsx`** — Heading "Choose operational capabilities", sub "Select the capabilities your service will support.". Two large selectable `Card` tiles (not checkboxes):
- **Issuance** — always on, visually marked with a small `Lock` chip + muted background, not clickable.
- **Renewal** — toggleable card with a `Switch` in the corner, default on. Selected state uses `border-accent` + `bg-accent/5`; unselected uses default border.

Primary CTA "Continue".

**`src/components/template-setup/Step3Structure.tsx`** — Heading "Let's structure your licenses". Two stacked conversational cards:
1. "Do you have license categories?" — Yes / No segmented buttons. Choosing Yes reveals an upload dropzone (file input wrapped as a styled drop area, accepts `.csv,.xlsx`) with `animate-accordion-down`.
2. "Do you have license subcategories?" — same pattern for subcategories.

Files are stored in local wizard state only (no parsing yet — downstream configurator owns real ingestion). Primary CTA "Continue" always enabled (Yes without a file shows a soft "Add file later" hint but does not block).

**`src/components/template-setup/Step4Initializing.tsx`** — Heading "Setting up your workspace", sub "We're preparing everything based on your template.". Vertical task list (7 items):
1. Creating {service name} service
2. Configuring modules
3. Preparing workflows
4. Setting up renewals (skipped/strikethrough if Renewal off)
5. Preparing document templates
6. Linking categories (skipped if no categories)
7. Generating citizen and employee experiences

Each row: `Loader2 spin` → `CheckCircle2 text-accent` when complete, with staggered timers (~450 ms each via `setTimeout`). Once last task completes, ~400 ms delay then `onComplete()` triggers service creation + navigation. Subtle progress bar at top using `Progress` component bound to completed-count / total. Uses `animate-fade-in` for each row as it appears.

## Edits to existing files

**`src/App.tsx`** — Add route inside `<AppLayout>` group (so the sidebar stays for continuity):
```tsx
<Route path="/templates/:templateId/setup" element={<TemplateSetup />} />
```

**`src/pages/Services.tsx`** — Remove `UseTemplateDialog` import, `pendingTemplate` state, both `<UseTemplateDialog .../>` mounts. Change `handleUse` to `navigate(\`/templates/${t.id}/setup\`)`. Keep `TemplateIntroduction` mount; its `onUseTemplate` now also navigates to the new setup route.

**`src/components/onboarding/UseTemplateDialog.tsx`** — Delete file (no other consumers per `rg`).

## Behaviour notes

- Issuance is forced on (matches existing `normalizeModules` rule that maps the first module to "Issuance"); Renewal default on, toggleable.
- Service name duplicate-check + trim mirrors current dialog logic exactly so we don't regress validation.
- The new flow is the single entry point for "Use template" from both `TemplateCard` and `TemplateIntroduction`. There are no other call sites (verified via search).
- No backend / context shape changes — `ServiceItem` is built and `addService` is called only at the end of Step 4, identical to today.
- All styling uses semantic tokens (`bg-accent`, `text-muted-foreground`, `border-input`, etc.) and existing `animate-fade-in` / `animate-accordion-down` keyframes — no hard-coded colors or new dependencies.
