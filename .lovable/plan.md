## 1. Persona switcher in top-right (no separate login)

**`src/contexts/PersonaContext.tsx`**
- Add `switchPersona(email)` method: like `signIn` but **does not call `clearDrafts()`** and does not reset the session marker — drafts (and the service-owner assignments on them) must survive the switch. Still triggers `window.location.reload()` so `OnboardingProvider` re-hydrates cleanly under the new persona.
- Expose it through the context value alongside `signIn` / `signOut`.

**`src/components/AppLayout.tsx`**
- Replace the current single "Sign out" dropdown with a persona-switcher dropdown built from `PERSONA_SEEDS` (Super Admin, Administrator, Trade Owner, Building Owner).
- Each entry shows name + role badge + email; clicking calls `switchPersona(seed.email)`.
- Keep a "Sign out" entry at the bottom (separator above it).
- Current persona row stays as the trigger (avatar + name + role).

**Service-owner visibility** — already wired: `TemplatesDashboard` filters `visibleServices` by `assignedOwners.includes(persona.email.toLowerCase())`. No change needed; switching to `trade.owner@egov.demo` will now surface any draft/live service where that email was assigned via "Assign service owner".

## 2. Remove setup progress bar from draft cards

**`src/pages/TemplatesDashboard.tsx`** — in `DraftServiceCard` (lines ~383–396), delete the entire "Setup progress" block (label row + `<Progress />` + the "Finish template setup…" helper). The `setupComplete` boolean is still computed from `service.templateSetup` and continues to gate the Continue/Complete-setup CTA — that stays. Remove the now-unused `setupProgress` import if nothing else uses it on the page.

## 3. Go-live tweaks

**`src/pages/GoLive.tsx`**
- Move the `users` checklist item from required → optional (flip `required: false`).
- On mount (and on focus), re-read `go-live-checklist-status` from `localStorage` so externally-set completions show up when the user returns from a sub-page.

**`src/pages/BoundaryConfiguration.tsx`**
- In the save path (both "select existing → continue" and "wizard complete"), when `from === "go-live"`, merge `{ boundary: "completed" }` into the `go-live-checklist-status` localStorage entry. This way returning to `/go-live` shows Boundary as ✅ completed without further interaction.

### Technical notes
- `switchPersona` intentionally skips `clearDrafts`; `signIn` (used from `PersonaLogin`) keeps its current fresh-session behavior.
- Reload after switch is necessary because `OnboardingProvider` snapshots localStorage on mount; without it the dashboard would still render the previous persona's filtered list until a manual refresh.
- No backend / data-model changes.
