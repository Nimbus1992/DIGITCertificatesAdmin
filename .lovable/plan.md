The Workflow Designer currently shows an 'Apply to' scope bar whenever a service has categories enabled. Since per-category workflows are not being offered, this bar is unnecessary.

## Changes

1. **Hide `ScopeBar` in Workflow Designer**
   - `src/components/service-config/WorkflowDesigner.tsx`: Remove `ScopeBar` JSX from both the empty-state and main render paths. The component itself can stay in the file (it does no harm), but it should no longer be rendered.

2. **Force shared workflow storage**
   - In the same file, change `storageSuffix` to always be `moduleName`, ignoring `showCategoryPicker` / `activeCategory`. This guarantees all workflow reads/writes use the shared module key regardless of category configuration.

3. **Remove unused category-scoped state**
   - Remove `activeCategory` state and `setActiveCategory` from `WorkflowDesigner`.
   - Remove `showCategoryPicker` logic.

## Out of scope

- No changes to `MasterTemplateConfigurator`, `TemplateSetup`, or `ServiceConfigContext`. Those already disable the `by_category` option; we are only removing the redundant designer UI.
- No migration of existing localStorage data with `::cat::` suffixes.
- No removal of the `ScopeSelector` component itself (it is used nowhere else, but deleting it is optional cleanup).