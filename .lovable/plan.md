## Goal
Move the module switcher (Issuance / Renewal) from the Service Configuration hub into each individual configurator. The hub becomes a clean launcher; module context is selected inside the tool.

## Hub changes (`src/pages/ServiceConfig.tsx`)
- Remove the "Modules" pill row at the top of the Configure tab.
- Remove per-module status tracking: drop `selectedModule`, `tileStatuses`, `currentStatuses`, `completedCount`, the status badges on core tiles, and the colored dots on additional tiles.
- Tiles render as clean launchers (icon + title + description). The "X of Y configured" counter is removed.
- When a tile is opened, the configurator receives the list of available modules instead of a single `moduleName`. The current module is owned by the configurator itself (default = first module, persisted per service in localStorage so re-entry restores the last module).

## Configurator shell pattern
A small shared header component, e.g. `src/components/service-config/ModuleTabs.tsx`, renders Issuance / Renewal as top tabs (matching the existing wizard step tab styling: underline-on-active, muted otherwise). Single-module services hide the tabs entirely.

Each configurator is updated to:
- Accept `modules: string[]` (and remove the `moduleName` prop).
- Own `activeModule` state, persisted at `serviceconfig:<serviceId>:<tileId>:module`.
- Render `<ModuleTabs />` directly under its existing back/title bar.
- Key its existing per-module storage off `activeModule` so switching tabs swaps content without losing edits.

## Configurators in scope
All eight: FormBuilder, RolesDesigner, WorkflowDesigner, ChecklistBuilder, NotificationsManager, DocumentDesigner, PaymentsConfigurator, FeesConfigurator. Each gets the same tab strip; their internal data already keys by module name in most cases, so the change is mostly prop/state plumbing.

The generic placeholder fallback in `ServiceConfig.tsx` (used for `plugins`) also gets the tab strip so the pattern is consistent.

## Out of scope
- No changes to citizen preview, Go-Live, or template setup.
- No changes to the underlying form/role/workflow data models.
- Roles stay per-module for now (user chose "all of them"); a future pass can promote shared resources to a global scope if desired.

## Technical notes
- `ModuleTabs` is a presentational component: `{ modules, active, onChange }`. Hidden when `modules.length <= 1`.
- localStorage key for active module: `serviceconfig:<serviceId>:<tileId>:activeModule`.
- Hub no longer needs `tileStatuses` seeding logic for the trade-license template; that block is removed.
- `MasterTemplateConfigurator` (Template Setup sheet) is unchanged — modules are still defined there.
