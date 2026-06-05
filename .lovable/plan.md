## Purge draft services on every fresh login session

### Problem
`clearDrafts()` only fires inside `signIn()`. Because the persona is cached in `localStorage`, returning users (or reloads) skip `signIn` entirely, so old drafts persist forever. The user sees pre-existing `Business License` drafts they never created in the current session.

### Fix (single file: `src/contexts/PersonaContext.tsx`)

1. **Lift `clearDrafts` into a module-level helper** so it can run during `PersonaProvider` initialization (before any component mounts), not just inside `signIn`.

2. **Introduce a session marker** in `sessionStorage` (key `persona:session`).
   - `sessionStorage` is wiped when the tab closes and is not shared across browser sessions — exactly the "per login" boundary the user described.
   - On `PersonaProvider` mount, if `sessionStorage.getItem("persona:session")` is missing → this is a fresh login session → call `clearDrafts()` synchronously, then set the marker.
   - This runs even when the persona is hydrated from `localStorage` (no explicit `signIn` call needed).

3. **`signIn` also clears the marker first** then calls `clearDrafts`, so an in-tab persona switch still purges.

4. **`signOut` clears the marker** so the next `signIn` is treated as fresh.

5. Remove the post-`signIn` `window.location.reload()`. Since `clearDrafts` now runs before `OnboardingProvider` mounts on the next load, the reload is unnecessary; for the in-tab `signIn` path, the existing flow already navigates to `/templates` which re-reads context.

### Result
- Every browser session (tab open / login / hard reload) starts with **zero draft services**, regardless of what's in `localStorage`.
- Drafts created **during** the session persist normally (they're written after the purge).
- Live services are never touched.

### Risk / scope
- One file touched. No data model or UI changes.
- `sessionStorage` is per-tab — opening a new tab counts as a new session and will purge drafts. This matches the user's stated intent ("after I login").
