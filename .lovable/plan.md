## Goals

Fix four reported issues and audit why yesterday's changes don't appear to be taking effect.

---

## 1. Role cards — replace confusing "tag" badges

**Problem.** The colored chips on each role card render raw permission ids (e.g. `edit_draft`, `submit_application`, `approve_scrutiny`). These strings come from older localStorage data — none of them exist in the current `PERMISSIONS` list (only `create_application`, `edit_application`, `view_application`, `fill_checklist`, `edit_checklist`, `view_checklist` are defined), so `permissionLabel()` falls back to the raw id. The permissions themselves aren't used anywhere meaningful in the app except `isCitizenRole()` (which checks `create_application`).

**Change** in `RolesDesigner.tsx`:
- Remove the permission badges from each role card.
- Replace with **two meaningful chips**:
  - **Persona** — `Citizen` (when role has `create_application`) or `Employee` (everyone else). This is what actually drives preview behavior.
  - **Workflow steps** — count of transitions in the current module's workflow assigned to this role (e.g. "3 workflow steps"). Read from `workflow:<serviceId>:<moduleName>` in localStorage.
- In the Create/Edit Role dialog, simplify the "Permissions" picker to a single **Persona toggle** (Citizen / Employee). Behind the scenes still write the matching `create_application` permission so existing logic keeps working.
- Migrate any legacy permission strings on load: strip ids not in the canonical `PERMISSIONS` list so cards don't show stale chips for users with old data.

---

## 2. Per-module roles (Issuance vs Renewal)

**Problem.** `useServiceRoles` stores all roles under the key `roles:<serviceId>:__shared__`, so adding a role in Issuance also surfaces it in Renewal.

**Change** in `src/lib/useServiceRoles.ts`:
- Change the storage scope from `"__shared__"` to the actual `moduleName` argument. Each module now owns its own role list seeded from its template defaults (`TRADE_ROLES` for Issuance, `RENEWAL_ROLES` for Renewal).
- One-time migration on first read: if `roles:<serviceId>:<moduleName>` is missing but `roles:<serviceId>:__shared__` exists, copy the legacy value into the active module key so users don't lose existing custom roles.

**Downstream impact**:
- `WorkflowDesigner`, `NotificationsManager`, `RolesDesigner` already pass `moduleName` — they get module-scoped roles automatically.
- `PreviewSidebar`, `InboxView`, `EmployeeHome` call `useServiceRoles(serviceId)` without a module. The preview is currently single-module (Issuance), so they keep defaulting to `"Issuance"`.
- `RoleAccessSetup` (Go Live) currently reads only `"Issuance"`. Change it to **union all module role lists** (Issuance + Renewal) deduped by `roleId` so go-live access covers every persona configured anywhere.

---

## 3. Fees — drop the "Applicable Stage" field

**Problem.** Each fee has an `applicableStage` field, but actual stage mapping happens in the Payment Setup (a payment stage holds the workflow state + a set of fees). The stage on the fee itself is dead metadata that confuses users.

**Change** in `src/components/service-config/FeesConfigurator.tsx`:
- Remove the "Applicable Stage" select from the create/edit sheet.
- Remove the "Stage: …" line from each fee card.
- Stop seeding `applicableStage` in `emptyFee()` and `buildDefaultFees()` (still tolerate it in stored data — just ignore it on render).
- Type stays for back-compat; no migration needed because the field is simply unused.

Payments and workflow continue to drive stage mapping unchanged.

---

## 4. New notifications / checklists / payment setups don't appear on the workflow state

**Problem.** A workflow state stores `notificationIds: string[]` (and a transition stores `checklistIds`). These arrays are populated **once** at seed time by matching `workflowState === state.name`. When a user later adds a Notification with `workflowState = "Submitted"`, nothing recomputes `state.notificationIds`, so the new item never shows up on the canvas/inspector unless the user manually attaches it.

**Change** in `src/components/service-config/WorkflowDesigner.tsx`:
- Add a reconciliation `useEffect` that runs whenever `notifications`, `checklists`, or `paymentStages` change:
  - For each state, **union** `state.notificationIds` with every notification whose `workflowState === state.name`; drop ids whose underlying notification no longer exists.
  - For each transition, do the same with `checklistIds` (matched against `toState.name`).
  - For each state, if `paymentStageId` is null, auto-assign the payment stage whose `workflowState === state.name`. If the assigned stage was deleted, clear it. Do not overwrite a manually-chosen stage.
- The reconciliation must be additive and idempotent so re-renders don't churn.
- Also subscribe `WorkflowDesigner` to `MODULE_STATE_EVENT` so edits made in `NotificationsManager` / `ChecklistBuilder` / `PaymentsConfigurator` from another route segment cascade in even if WorkflowDesigner stays mounted (e.g. tab switch within the configurator shell).

---

## 5. Verify yesterday's changes are actually wired

User reports the two-persona model, PDF overflow fixes, branded logo, and viewport-fit changes "don't seem to be reflecting." Quick verification pass before claiming anything else:

- **Two-persona sidebar**: `PreviewSidebar.tsx` should group by `isCitizenRole`. Confirm `serviceRoles` is being read with the **current module** (after change #2 lands, default to Issuance) so custom roles created in Roles Designer actually show up.
- **Inbox/Home queues filtered by `t.roleId === activeRoleId`**: confirm the change landed in `InboxView.tsx` and `EmployeeHome.tsx`; if a regression exists, restore it.
- **PDF pager**: confirm `applicationPdf.ts`, `licensePdf.ts`, `demandNoticePdf.ts`, `invoicePdf.ts` import `makePager` / `drawWrapped` from `pdfUtils.ts` and no longer use raw `y += N`. If any still do, port them.
- **Branded logo in PDFs**: confirm each PDF calls `drawHeaderLogo(doc, resolvePdfBranding(), …)` instead of drawing an emblem. Confirm `resolvePdfBranding()` reads the same key that `BrandingTheme.tsx` writes to (`logoUrl` data URL or service-level `branding.logo`). If branding stores the logo elsewhere, extend `resolvePdfBranding` to cover it.
- **Viewport fit**: spot-check `ServicePreview.tsx`, `ApplicationReview.tsx`, `WorkflowDesigner.tsx`, `FeesConfigurator.tsx`, `DocumentDesigner.tsx` for `flex flex-col h-full min-h-0` shell + sticky footer pattern. List any screen still requiring zoom-out and apply the pattern there.

This is verification + targeted fix only — no broad refactor unless the audit finds something broken.

---

## Out of scope

- No backend / schema changes.
- No changes to how roles are consumed for auth (still configuration capture).
- Not changing the fee data model — `applicableStage` field stays in the type, just hidden from UI and no longer required.

---

## Technical notes

- `useModuleState` already emits `MODULE_STATE_EVENT` on every write; WorkflowDesigner just needs a `window.addEventListener(MODULE_STATE_EVENT, …)` to refetch on cross-page edits.
- Persona inference helper stays in `useServiceRoles.ts` (`isCitizenRole`) — no new file needed.
- Role storage migration runs lazily inside `useServiceRoles` initializer; one read, one write, no flicker.
- Reconciliation effect in WorkflowDesigner must guard against infinite setState loops: compare arrays by length+sorted-ids before calling `setStates` / `setTransitions`.
