## Goal
On the workspace setup step (`ConfirmOrganization`), the **Regional Settings** section (Country, Currency, Country code, Default language) should be locked by default. Users must explicitly click an edit (pencil) icon to unlock the fields. This adds intentional friction so values aren't changed by accident.

## Behavior
- On load: all 4 Regional Settings selects are **disabled** and visually styled as read-only (muted background, no caret hover).
- A small **pencil edit icon button** sits next to the section title ("Regional Settings"). Clicking it toggles the section into edit mode.
- In edit mode: fields become enabled, the icon swaps to a **check/lock icon** (tooltip: "Done"), and clicking it locks the section again.
- The existing auto-fill highlight ring (when country changes update currency/phone code) continues to work while unlocked.
- No changes to data persistence — values are still written to `OnboardingContext` via `updateState`.

## Scope of change
Single file: `src/components/onboarding/ConfirmOrganization.tsx`
- Add local `regionalEditable` boolean state (default `false`).
- Extend the `Section` component (or inline at this one section) to accept an optional right-aligned action slot for the edit toggle button.
- Pass `disabled={!regionalEditable}` to the four `Select` components in Regional Settings.
- Use `Pencil` and `Check` icons from `lucide-react`.

## Out of scope
- Department section (already removed).
- Workspace Access section (org name + URL stay read-only as today).
- No confirmation dialog or password gate — just the icon toggle.
