## Plan

Merge "Monitor" and "Manage" into a single always-enabled tab named **Operate** in the service workspace, and show a dummy-data disclaimer until the service is live.

### Changes

**`src/pages/ServiceConfig.tsx`**
- Replace the two tabs (`operations` Monitor and `deployment` Manage) with one tab `operate` labeled "Operate" for both draft and live services. Remove the disabled state and tooltip.
- Render a new `OperateWorkspace` for that mode. Default `initialMode` still works; map any legacy `operations`/`deployment` navigation state to `operate`.

**New `src/components/operate/OperateWorkspace.tsx`**
- Two-pane layout that reuses the existing left secondary nav pattern from `OperationsWorkspace`.
- Sections: Analytics, SLA Monitoring, Workflow Queues, Audit Logs, Reports & Exports (from current Monitor) plus a new **Manage** section that renders the existing deployment list (Production Status, Active Modules, Published Versions, Operational Settings, Monitoring, Integrations, Audit Logs, Environment Management) currently in `DeploymentWorkspace`.
- When `service.isLive` is false, show a sticky disclaimer banner at the top: "Preview with sample data. You'll see live data here once the service goes live." Use `bg-warning/10 text-warning-foreground border-warning/30` styling consistent with the design system.
- Move `DeploymentWorkspace` markup into this file as the "Manage" section; delete the old standalone usage in `ServiceConfig.tsx`.

### Out of scope
- No changes to the underlying Monitor views, mock data, or design tokens.
- No changes to Go Live, Configure, Preview, or Overview tabs.