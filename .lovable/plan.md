## Goal

Make the notification UX inside the Workflow Designer consistent with the Notifications dashboard, and let a **workflow state** carry attached documents from the configured Document Designer set.

## Changes (in `src/components/service-config/WorkflowDesigner.tsx`)

### 1. Notification dialog parity with NotificationsManager
The in-workflow `NotificationEditDialog` is missing the Recipient Role field. Bring it to parity with the dashboard create form:

- Add **Recipient Role** select, populated via `useServiceRoles(serviceId, moduleName)` (same hook NotificationsManager uses). Default new notifications to the first role.
- Keep existing Channel, Workflow State, Subject (email only), Message + Variables.
- Match field order/labels/required-validation with `NotificationsManager` so the two screens feel identical.
- Update `createNotificationFor` to seed `recipientRole` from the roles hook instead of any hardcoded value.

### 2. State inspector: notifications as a dropdown
Replace the inline checkbox list under "Notifications on entry" in the selected-state inspector with a dropdown multi-select:

- Trigger shows e.g. "2 notifications attached" (or "None"); opens a Popover/Command listing all notifications for this module with checkboxes.
- Each row shows subject, channel, recipient role, with a pencil icon to open the edit dialog (same `setEditingNotif` flow).
- Keep the existing "+ New notification" button below the dropdown.

### 3. Attach documents to a workflow state
Add a new field on the state record: `attachedDocumentIds: string[]` (default `[]`, backward compatible).

- Read configured documents for this module from `localStorage["documents:${serviceId}:${moduleName}"]` (the key Document Designer writes via `useModuleState`). Listen to the `storage` event so newly added docs appear without reload.
- In the state inspector, add a new section **"Attached documents"** below Notifications, rendered as a dropdown multi-select (same Popover/Command pattern as #2) listing each document's name.
- Trigger shows count + truncated names. Empty state: "No documents configured yet — add them in Document Designer."
- Persist via `updateState(selectedState.id, { attachedDocumentIds: next })`. Filter out IDs whose document was deleted when rendering.
- These attachments are state-level metadata — they don't change notification firing or document generation behavior; they just record which docs are relevant at that state (e.g. for inspectors to consult).

## Out of scope
- No backend changes; storage stays in localStorage via `useModuleState`.
- No change to how/when notifications actually fire.
- Notifications do **not** get a documents field.
- Document Designer is not modified.

## Files touched
- `src/components/service-config/WorkflowDesigner.tsx` only.
