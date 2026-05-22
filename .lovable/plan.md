## Root cause

`RolesDesigner` computes per-role workflow-step counts by reading `localStorage` directly:

```ts
const key = `workflow-transitions-v4:${serviceId}:${moduleName}`;
const raw = localStorage.getItem(key);
if (!raw) return {};
```

But workflow transitions only get **written** to localStorage after the user opens the Workflow Designer and saves. Until then, the rest of the app gets transitions from `buildSeedTransitions(moduleName)` (see `src/lib/useServiceWorkflow.ts`, which falls back to seeds when the key is absent).

So for a freshly created service (like the current `trade-license-mpfgtpvl`), the seeded Trade-License transitions (Document Verifier, Field Inspector, Approver, etc.) exist in memory and drive Workflow Designer + Preview, but `RolesDesigner` sees no localStorage entry and shows "No workflow steps" for every role.

There is also a second, smaller bug: the seed role keys are camelCase (`documentVerifier`, `fieldInspector`) and are mapped to snake_case (`document_verifier`, `field_inspector`) inside `buildSeedTransitions` via `SEED_ROLE_MAP`. The role records in `useServiceRoles` use the snake_case IDs, so once we go through `buildSeedTransitions` the IDs match correctly — no extra mapping needed.

## Fix

Replace the direct-localStorage read in `RolesDesigner.tsx` with the same source-of-truth the rest of the app uses, so seeded transitions are counted before the user ever saves the workflow.

### Change in `src/components/service-config/RolesDesigner.tsx`

1. Remove the local `useTransitionCountByRole` helper.
2. Use `useServiceWorkflow(serviceId)` and select transitions for the current `moduleName`:
   - `Issuance` → `store.issuance.transitions`
   - `Renewal`  → `store.renewal.transitions`
3. Derive `transitionCountByRole` with `useMemo` by counting `roleId` occurrences on that array.
4. Keep the existing badge rendering as-is; it will now reflect seeded + saved transitions and update live via the existing `WORKFLOW_UPDATED_EVENT` listener inside `useServiceWorkflow`.

### Files touched
- `src/components/service-config/RolesDesigner.tsx` (only)

### Out of scope
- No changes to seed data, role IDs, or Workflow Designer.
- No backend/state-shape changes.