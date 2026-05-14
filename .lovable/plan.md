## Goal
Each configuration block (Forms, Roles, Workflow, Checklists, Notifications, Documents, Fees, Payments) should load the right seed for the active module (Issuance vs Renewal) and persist edits per module so switching the top tabs swaps content without losing work.

## Renewal seed (new)
Create `src/data/renewalTemplate.ts` with a smaller, renewal-flavored variant of the trade-license seeds.

- **Workflow** — `RENEWAL_WORKFLOW_STATES` + `RENEWAL_WORKFLOW_TRANSITIONS`:
  Submitted → Under Document Verification → Under Approval → Payment Pending → Paid → License Renewed, plus Sent Back and Rejected. No inspection state, no field-inspector transitions.
- **Roles** — `RENEWAL_ROLES`: Citizen, Document Verifier, Approver. Field Inspector dropped.
- **Checklists** — `RENEWAL_CHECKLISTS`: Document Verification (renewal-focused: existing license valid, payment of dues, updated documents), Approval (renewal decision), Send Back. No Inspection checklist.
- **Notifications** — `RENEWAL_NOTIFICATIONS`: one per relevant state, with renewal-specific copy ("Your renewal application…", "Your licence has been renewed until {expiryDate}").
- **Documents** — `RENEWAL_DOCUMENTS`: Renewal Application Form, Acknowledgement, Renewed License Certificate, Payment Receipt. No Inspection Report.
- **Fees** — `RENEWAL_FEES`: single `Renewal Fee` (fixed, ₹750, applicable at Payment Pending, mandatory).
- **Payments** — `RENEWAL_PAYMENT_STAGES`: one stage `Renewal Payment` at Payment Pending, fees `["Renewal Fee"]`, online + offline.

The existing `renewalFormTemplate.ts` already provides a renewal Form seed and stays as-is.

## Per-module persistence pattern
Every configurator that currently has no localStorage gets a per-module storage key:

```
{configurator-prefix}:{serviceId}:{moduleName}
```

Each configurator:
1. Accepts the existing `moduleName` prop.
2. Detects renewal via `moduleName.toLowerCase().includes("renew")` (matches FormBuilder).
3. Picks `ISSUANCE_*` or `RENEWAL_*` seed accordingly.
4. Loads from localStorage on mount (keyed by serviceId + moduleName); falls back to the matching seed.
5. Persists state changes back under the same key.

The hub's `renderConfigurator` already remounts on `activeModule` change via `key={activeModule}`, so a fresh load happens automatically when the user switches tabs.

## Per-configurator changes
- **RolesDesigner** — seed from `ISSUANCE_ROLES` (alias of `TRADE_ROLES`) or `RENEWAL_ROLES`. Persist to `roles:{serviceId}:{moduleName}`.
- **WorkflowDesigner** — seed states + transitions from issuance vs renewal. Persist to `workflow:{serviceId}:{moduleName}`.
- **ChecklistBuilder** — seed checklists; persist to `checklists:{serviceId}:{moduleName}`.
- **NotificationsManager** — seed notifications; persist to `notifications:{serviceId}:{moduleName}`.
- **DocumentDesigner** — seed document list; persist to `documents:{serviceId}:{moduleName}`. (Per-document canvas state stays as-is.)
- **FeesConfigurator** — seed fees; persist to `fees:{serviceId}:{moduleName}`.
- **PaymentsConfigurator** — seed payment stages; persist to `payments:{serviceId}:{moduleName}`.
- **FormBuilder** — already wired; no changes.

## Out of scope
- Citizen/Employee preview (still drives off PreviewContext defaults).
- Cross-module shared resources (e.g. global Roles). Roles stay per-module.
- Backend persistence — this stays in localStorage for now.
- New UI affordances; only seed + persistence wiring.

## Technical notes
- A small helper `pickSeed(moduleName, issuance, renewal)` in `src/data/renewalTemplate.ts` keeps the renewal-detection rule in one place.
- Each configurator does a deep clone of the seed (existing pattern) before storing in state to avoid mutating the imported constants.
- localStorage reads are wrapped in try/catch to tolerate quota / SSR issues.
