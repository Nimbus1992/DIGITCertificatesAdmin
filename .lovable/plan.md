## Reorder workspace tabs in ServiceConfig

Change the tab bar in `src/pages/ServiceConfig.tsx` so the order and default depend on whether the service is Live.

**Draft services** (3 tabs, default = Preview):
1. Preview (default/active)
2. Configure
3. Manage — disabled, tooltip "Available after publishing the service"

**Live services** (2 tabs, default = Preview):
1. Preview (default/active)
2. Manage

No Configure tab is shown for Live services.

### Implementation notes

- Change initial `mode` state from `"configure"` to `"preview"`.
- Build `workspaceTabs` conditionally:
  - If `isLive`: `[{preview}, {deployment: "Manage"}]`
  - Else: `[{preview}, {configure}, {deployment: "Manage", disabled, tooltip}]`
- Keep existing render branches for each mode unchanged.
- No changes to `ServiceManage.tsx` or other files.