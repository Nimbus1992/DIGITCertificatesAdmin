## Goal

Rebuild the Notifications screen to match the uploaded reference, enforce one-channel-per-notification, add Push as a third channel, map each notification to a target role, and make changes flow into Workflow and Preview.

## UI redesign (`NotificationsManager.tsx`)

Top header — keep "Notifications" title and a prominent **+ Create New Notification** button (accent-filled, top right).

**Channel summary row** — three cards side-by-side: Email, SMS, Push. Each shows icon, title, "Configure {channel} notifications" subtitle, count badge, and a `+` button that opens the create dialog pre-filled with that channel.

**Tabs + list** — single card containing channel tabs `Email (n)` / `SMS (n)` / `Push (n)` (active tab uses accent) plus a search box on the right. Below: list of notification cards filtered by active channel.

**Notification card** — title row with subject (left) and **Edit / Duplicate / Delete** outline buttons (right). Message preview underneath. Footer row shows the workflow-state pill and a role pill (e.g. "Citizen", "Approver").

## Data model changes

```ts
interface Notification {
  id: string;
  workflowState: string;
  channel: "email" | "sms" | "push";   // single channel, replaces channels[]
  recipientRole: string;               // role id from useServiceRoles
  subject: string;                     // optional/empty for SMS & Push? keep field, hide for SMS
  message: string;
  tag: string;
  tagColor: string;
}
```

Migration: when loading legacy notifications with `channels: [...]`, expand into one record per channel and default `recipientRole` to `"citizen"`.

Update `TRADE_NOTIFICATIONS` and `RENEWAL_NOTIFICATIONS` seeds in `tradeLicenseTemplate.ts` / `renewalTemplate.ts` to one-row-per-channel and add `recipientRole`.

## Create / Edit dialog

Single dialog reused for create + edit + duplicate.

Fields:
1. **Channel** — segmented control (Email / SMS / Push), required, locked when editing existing record.
2. **Workflow State** — existing select.
3. **Recipient Role** — select sourced from `useServiceRoles(serviceId)` so custom/renamed roles appear automatically.
4. **Subject** — shown only for Email.
5. **Message Body** — textarea with personalization variable chips. SMS shows the `63/160` counter and the telecom-approval info banner from the reference.
6. **Push** shows a small "delivered to in-app inbox" helper.

Footer: Cancel / Save. Validation: channel + state + role + message required (subject required for Email).

Duplicate: clones the record with `id = uuid()` and opens the dialog in edit mode.

## Propagation

- **Preview** (`PreviewContext` / `NotificationsPanel`): the existing notification matrix already filters by `recipientRole`. Extend the dispatch to also read user-defined notifications from `useModuleState("notifications", …)` so newly created/edited entries fire in preview at the matching workflow state, addressed to the configured role. Push → renders in `NotificationsPanel`; SMS/Email → simulated in `MessagesDrawer` (already supports both).
- **Workflow Designer**: in each state's side-panel "Notifications" section, list notifications whose `workflowState` matches the state, grouped by channel and role. Read-only chips with a "Manage" link back to the Notifications screen.
- **Roles changes**: because role list comes from `useServiceRoles`, renames propagate automatically. If a role is deleted, show a "Reassign role" inline picker on affected notification cards (mirrors the existing pattern in WorkflowDesigner).

## Files to touch

- `src/components/service-config/NotificationsManager.tsx` — full rewrite of UI + dialog + CRUD + channel tabs + role select.
- `src/data/tradeLicenseTemplate.ts`, `src/data/renewalTemplate.ts` — seed shape: one row per channel, add `recipientRole`.
- `src/components/service-config/WorkflowDesigner.tsx` — show notifications per state in the side panel.
- `src/components/preview/PreviewContext.tsx` (and/or `notificationMatrix.ts` consumers) — merge user-defined notifications into the dispatcher so preview reflects changes.
- Light type updates anywhere `Notification.channels` is referenced.

## Out of scope

- No backend / persistence beyond the existing `useModuleState` localStorage layer.
- No real Push/SMS/Email delivery — preview simulation only.
