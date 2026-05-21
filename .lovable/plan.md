# Plan (revised)

## 1. Delete services (Draft and Live) from Dashboard

**Context:** Services live in `OnboardingContext` (`state.services`) with mutations `addService` / `updateService` only — no delete. Dashboard cards on `src/pages/Dashboard.tsx` render every service with View/Edit/Go Live actions but no delete affordance. Same cards also surface on `src/pages/Services.tsx`.

**Changes:**

- `src/contexts/OnboardingContext.tsx`
  - Add `deleteService(id: string)` to context value + provider: removes the service from `state.services` and, if `activeServiceId === id`, clears it. Persists via the existing localStorage effect.
  - Also clears module-scoped storage for that service: iterate `localStorage` keys, remove any starting with the per-service prefix used by `moduleStorage.ts` / `formStorage.ts` (`svc:{id}:` and any related `svc-{id}` keys discovered by a grep). Bound the cleanup to keys we actually own.

- `src/pages/Dashboard.tsx`
  - Add a small trash icon button to each service card header (top-right, near the status `Badge`). On click, open a confirm `AlertDialog`: "Delete '{name}'? This permanently removes its configuration. Live services will go offline."
  - For Live services, require an extra typed confirmation (type the service name) before the Delete button enables — prevents accidental teardown of production-facing entries.
  - On confirm: call `deleteService(id)`, toast success ("Service deleted").

- `src/pages/Services.tsx`
  - Mirror the same delete affordance on the service cards used there (same dialog + same protection rule for Live).

Out of scope: server-side cleanup of any Supabase data tied to the service (no such tables exist yet); preview-mode "delete application" requests from earlier turn (not what user meant).

## 2. Remove Configure CTA from preview top bar

- `src/components/preview/PreviewTopBar.tsx` — delete the Configure `<Button>`, drop now-unused `useNavigate`, `useParams`, `Settings2` imports. Exit Preview stays as the only left-side action.

## 3. Responsive QA utility — test UI across resolutions

New internal page that loads any route inside multiple iframes at common device widths so you can scan all breakpoints at once.

- `src/pages/ResponsiveQA.tsx` (new)
  - Toolbar: route input (default `/`), "Reload all" button, "Fit to column" toggle (CSS `transform: scale` so each frame fits its grid cell while preserving its real viewport).
  - Grid of labeled iframe cards at: 320×568, 375×812, 414×896, 768×1024, 834×1194, 1280×800, 1440×900, 1920×1080. Each card shows label + dimensions + "Open in new tab".
  - Iframe `src = ${origin}${route}` at exact pixel dimensions.
- Route added in `src/App.tsx`: `/responsive-qa`.
- Sidebar entry in `src/components/AppSidebar.tsx` under Utilities ("Responsive QA", Monitor icon).
- Helper banner: best viewed by opening the page in a new browser tab (avoids nested-iframe sizing quirks inside the Lovable editor preview).

No backend changes.

## Files touched
- edit: `src/contexts/OnboardingContext.tsx`
- edit: `src/pages/Dashboard.tsx`, `src/pages/Services.tsx`
- edit: `src/components/preview/PreviewTopBar.tsx`
- edit: `src/App.tsx`, `src/components/AppSidebar.tsx`
- new: `src/pages/ResponsiveQA.tsx`
