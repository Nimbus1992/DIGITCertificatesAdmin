## Goal

In the Forms configurator, the header currently shows "Form for Issuance" even when Issuance is the only module on the service. The module switcher (`ModuleTabs`) already hides itself when there is just one module, so this label adds no information and should also be hidden in that case.

## Change

**File:** `src/components/service-config/FormBuilder.tsx`

- Read the service's `customModules` from `OnboardingContext` (using the current `serviceId` already derived in this file).
- Compute `isSingleModule = customModules.length <= 1`.
- In the header (around line 411–414), only render the "Form for {moduleName}" label when `isSingleModule` is false. The Back button, separator, and Help affordance stay as-is.

No changes to other configurators (Workflow, Roles, Fees, Documents, Payments, Notifications, Checklists) — the user request is scoped to Forms.

## Out of scope

- No change to `ModuleTabs` (already correctly hidden for single-module services).
- No change to module derivation or storage logic.
- No change to the footer hint ("Editing {moduleName} form…") inside FormBuilder, since it describes the save scope rather than acting as a redundant title.
