
# Make the configurator state-driven + category-aware workflows

Today each configurator (Forms, Roles, Workflow, Documents, Fees, Payments, Notifications, Checklists) writes to its own `localStorage` key via `useModuleState`, and the preview re-derives screens from yet another set of keys. Template Setup data (categories, subcategories, renewal policy, enabled modules) lives on `OnboardingContext` but isn't read by the configurators or preview. That's why edits feel disconnected.

This plan introduces a single per-service configuration store, migrates every configurator and the preview to read/write through it, and makes workflows category-aware via a reusable "scope" pattern.

---

## 1. Single source of truth: `ServiceConfigStore`

New file: `src/contexts/ServiceConfigContext.tsx`

Shape (one object per service, persisted under `serviceconfig:v2:${serviceId}`):

```text
ServiceConfig {
  serviceId
  identity        { name }
  structure       { hasCategories, hasSubcategories, categories[], subcategories[{name,parent}] }
  modules         { issuance: true, renewal: bool, payments: bool, ... }
  renewalPolicy   { mode, globalMonths, perCategory{}, perSubcategory{} }
  roles           Role[]                     // shared across modules
  perModule:                                 // keyed by moduleName ("Issuance" | "Renewal" | ...)
    forms         WizardStep[]
    documents     DocumentTemplate
    notifications NotificationMatrix
    checklists    ChecklistConfig
    fees          FeesConfig
    payments      PaymentConfig
  workflows:
    scope         "shared" | "by_category" | "by_subcategory"
    shared        { Issuance: WorkflowGraph, Renewal: WorkflowGraph }
    byCategory    { [category]: { Issuance, Renewal } }
    bySubcategory { [subcategoryKey]: { Issuance, Renewal } }
}
```

API exposed by `useServiceConfig(serviceId)`:
- `config` — full object, reactive
- `update(path, patch)` and small typed setters (`setForm`, `setRoles`, `setWorkflow(scope,key,module,graph)`, `setRenewalPolicy`, …)
- `derived`: `categories`, `subcategories`, `enabledModules`, `workflowFor(category, module)` (with inheritance: subcategory → category → shared), `renewalMonthsFor(category, subcategory)`, `effectiveFormFields(moduleName)`, etc.

Persistence: single `useEffect` writes the whole object as JSON. A one-time migration on mount reads each legacy `useModuleState` key and folds it into the new store, then deletes the old keys.

Provider mounted in `ServiceConfig.tsx` (and in the preview route) wrapping all configurators + `ServicePreviewWorkspace`.

## 2. Template Setup ↔ Config wiring

`TemplateSetup.finalize()` already writes to `OnboardingContext`. After creating the service, also seed the new store with `structure`, `modules`, `renewalPolicy`. From then on, the store is authoritative; the `ServiceItem` keeps only display metadata (name, status, deployment).

Editing categories later (via `MasterTemplateConfigurator`) writes back through `useServiceConfig` so all consumers update immediately. When a category is renamed, run a rename pass across `workflows.byCategory`, `renewalPolicy.perCategory`, `fees`, etc. When a category is deleted, drop its mappings.

## 3. Migrate configurators to the shared store

Each file below stops calling `useModuleState` and instead reads/writes via `useServiceConfig`. Functional behavior unchanged; only the storage layer moves.

- `FormBuilder.tsx` → `config.perModule[mod].forms`
- `DocumentDesigner.tsx` → `config.perModule[mod].documents`; reads form fields from the same store so doc tokens auto-refresh
- `NotificationsManager.tsx` → `config.perModule[mod].notifications`
- `ChecklistBuilder.tsx` → `config.perModule[mod].checklists`; role dropdowns bound to `config.roles`
- `FeesConfigurator.tsx` → `config.perModule[mod].fees`; if `modules.payments=false`, hide payment-stage mapping
- `PaymentsConfigurator.tsx` → `config.perModule[mod].payments`; gated by `modules.payments`
- `RolesDesigner.tsx` → `config.roles` (single shared list); workflows + checklists react when a role is renamed/removed
- `WorkflowDesigner.tsx` → see section 4

Module tabs in `ServiceConfig.tsx` derive from `config.enabledModules` so disabling Renewal removes its tab everywhere (configurator, preview, go-live checks). Renewal-related preview screens, citizen flows, notifications, and policy step also hide automatically because they're rendered conditionally on `enabledModules.renewal`.

## 4. Category-aware workflows

### 4.1 New setup question

After Renewal Policy step (only if `structure.categories.length > 0`), add **Step 4b: Workflow Scope** in `TemplateSetup`:

> "Do different categories require different approval processes?"
> - Same approval process for all categories  → `scope = "shared"`
> - Different approval processes by category  → `scope = "by_category"`

(Subcategory option deferred but the data shape supports it.)

If no categories → step skipped, `scope = "shared"` implicitly.

On confirm, auto-seed workflow variants:
- `shared`: one `WorkflowGraph` per enabled module, cloned from the template default.
- `by_category`: for each category, clone the template default and label it `"<Category> – <Module>"`. Smart presets where we can detect intent from category name (e.g., "Food" → injects an "Inspection" stage). All categories start from the same baseline; users edit per category.

### 4.2 Workflow Designer UI

`WorkflowDesigner.tsx` gets a header strip:

```text
Apply to:  (•) All categories   ( ) Specific categories
Current Category:  [ Retail ▼ ]      ← shown only when scope = by_category
```

- Switching the **Apply to** radio updates `config.workflows.scope` and migrates data (when going `by_category → shared`, ask whether to keep one of the variants as the new shared workflow).
- The category dropdown switches the active editing context; the canvas renders `workflowFor(category, activeModule)`.
- Saves write to the correct slot. Stage role pickers use `config.roles`.

### 4.3 Reusable `ScopeSelector` component

New `src/components/service-config/ScopeSelector.tsx`:

```text
<ScopeSelector
  value={scope}
  onChange={...}
  options={["all","by_category","by_subcategory"]}
  available={{ by_category: hasCategories, by_subcategory: hasSubcategories }}
/>
```

Used by Workflow now; ready for Fees, Renewal, Documents, Notifications, Checklists later (no behavioral change to those configurators in this pass — wiring only).

## 5. Preview becomes config-driven

`PreviewContext.tsx` and the citizen/employee screens currently read from their own seeds. Refactor to:
- Read `categories`, `enabledModules`, `forms`, `documents`, `fees`, `renewalPolicy`, `roles`, `workflows` from `useServiceConfig`.
- The simulated application carries a `category` (and optional subcategory). All downstream screens resolve via `workflowFor`, `renewalMonthsFor`, etc.
- Renewal screens / "Renew" CTA only render when `modules.renewal`.
- License document preview computes validity from `renewalMonthsFor(category)`.
- Payment/Invoice screens hidden when `modules.payments` is off.

No change to visual design; only the data source.

## 6. Files touched

New:
- `src/contexts/ServiceConfigContext.tsx`
- `src/components/service-config/ScopeSelector.tsx`
- `src/components/template-setup/Step5WorkflowScope.tsx`
- `src/lib/serviceConfigMigration.ts` (one-time legacy → v2 fold)

Edited:
- `src/pages/ServiceConfig.tsx` (provider, derive module tabs from store)
- `src/pages/TemplateSetup.tsx` + `SetupShell.tsx` (insert workflow-scope step, seed store on finalize)
- All 8 files in `src/components/service-config/*` (swap `useModuleState` for `useServiceConfig`)
- `src/components/service-config/MasterTemplateConfigurator.tsx` (writes structure back through store, with rename/delete fan-out)
- `src/components/preview/PreviewContext.tsx` and citizen/employee screens that currently read seeds
- `src/lib/moduleStorage.ts` kept temporarily for migration, then removed

## 7. Out of scope (called out so you can confirm)

- Subcategory-level workflows: data shape included, UI deferred.
- Per-category fees/documents/notifications: `ScopeSelector` plumbed but those configurators still operate at module level in this pass.
- Backend persistence (still localStorage). Moving to Lovable Cloud is a separate task.

## 8. Risks

- Migration of existing users' `useModuleState` data — handled by one-shot migration utility on first read; original keys preserved for one release behind a flag in case we need to roll back.
- Performance: full-config `useEffect` writes on every change. Mitigated by debouncing the persist effect (200ms) and using a reducer so updates are scoped.
