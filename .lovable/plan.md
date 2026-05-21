## Fix Notification Preview + New Notifications Not Showing

### Issues
1. The in-dialog preview renders SMS, Email, and Push blocks all at once, regardless of the selected channel.
2. Newly created notifications appear to "disappear". Root cause: the list view filters by the outer `activeChannel` tab. If the user changes the channel inside the dialog (e.g. clicks New on the Email tab but picks SMS), the saved record lands in a different channel bucket than the tab the user is staring at, so it looks like nothing was added.

### Changes (UI/presentation only — no schema, no storage)

**`src/components/service-config/preview/NotificationPreview.tsx`**
- Accept a `channel: "email" | "sms" | "push"` prop.
- Render exactly one block based on `channel`:
  - `sms` → bubble + char counter only
  - `email` → email card (from / to / subject / body) only
  - `push` → push toast card only
- Keep token resolution and the audience-aware mobile vs desktop `EmulatorFrame` as-is.
- Update the frame `label` to reflect the channel (e.g. "Citizen · SMS", "Employee · Push").

**`src/components/service-config/NotificationsManager.tsx`**
- In `NotificationDialog`, pass `channel={draft.channel}` so the preview swaps live as the user toggles the channel segmented control.
- In `save(n)`:
  - After updating the array, call `setActiveChannel(n.channel)` so the list tab auto-switches to the saved notification's channel.
  - Clear the search box if it would hide the new row (`setSearch("")`).
  - Fire a small `toast` confirming "Notification saved" so the action is visibly acknowledged.
- No changes to `useModuleState`, persistence keys, or `emitNotificationsUpdated`.

### Out of scope
Workflow, roles, fees, PDFs, backend, and any other configurator.