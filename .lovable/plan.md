## Goal

In **Go Live → User Access & Authentication**, the role list is currently sourced from the static template (`getServiceRoles`). Any custom role created in the service's **Roles & Access** configurator is ignored. The step should list every role that exists for the active service, including custom ones.

## Where the gap is

- `src/components/go-live/RoleAccessSetup.tsx` (line 32) calls `getServiceRoles(activeService?.templateId)` — template-only.
- `src/lib/serviceRoles.ts` returns hard-coded `TRADE_ROLES`.
- The configurator already persists the live role list via `useServiceRoles(serviceId)` → `moduleStorage` key `roles:<serviceId>:__shared__`.

## Change

1. **`RoleAccessSetup.tsx`** — replace the static `getServiceRoles(...)` call with the live store:
   - Use `useServiceRoles(activeService.id)` to read roles reactively.
   - Map each role to a `ServiceRole`-shaped object (`id`, `name`, `description`) so the rest of the component is unchanged.
   - Default the access type for new/custom roles: if `isCitizenRole(role)` (has `create_application`) → `self_registration`, otherwise `pre_registered`. Keeps existing behavior for the built-ins (`citizen` / `applicant`).
   - Preserve any previously saved `roleAccess` entry for a role by `roleId`. Drop entries whose role no longer exists. Append fresh defaults for newly added roles.

2. **No schema/context changes** — `RoleAccessConfig` already stores `roleId` + `roleName`, so custom roles serialize without migration. `handleComplete` continues to write to `service.roleAccess`.

3. **Edge cases**
   - Service has no custom roles → behavior identical to today.
   - Custom role renamed in configurator → display picks up new name; persisted config keeps its `roleId`, `roleName` refreshed on save.
   - Custom role deleted → that role's saved access config is filtered out on next entry to the step.

## Out of scope

- Changing how roles are created/edited (that flow already exists in the configurator).
- Backend/auth wiring — this step is still configuration captured into onboarding state.
- Touching the citizen/applicant defaults beyond the rule above.

## Technical notes

- `useServiceRoles` requires a `serviceId`; guard with `activeService?.id ?? ""` and render an empty state if no active service (shouldn't happen at this step, but safe).
- Keep the `useMemo` for the merged list keyed on `[roles, activeService?.roleAccess]` so toggling between services rehydrates correctly.
- `RoleAccessConfig.authMethod` defaults stay as today: `mobile_otp` for self-reg, `email_password` for pre-registered.
