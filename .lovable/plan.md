## Goal

Make **Branding & Theme** functional. Edits on `/config/branding` should persist and immediately reflect in:

1. **The studio UI** — sidebar org name, app shell logo, primary/accent colors used across the dashboard.
2. **The service preview** — citizen portal top bar, employee portal top bar, primary buttons/links inside the preview, portal name, footer copyright.

Today the page is purely local React state with a no-op "Apply Theme" toast. Nothing escapes the page.

## Approach

Persist branding on the **active service** in `OnboardingContext` (already persisted to `localStorage`), then read it from a small `useBranding()` hook and apply it via CSS variables on a wrapper element so existing `bg-primary` / `text-primary` / `border-accent` Tailwind tokens keep working.

### 1. Data model

Extend `ServiceItem` in `src/contexts/OnboardingContext.tsx` with:

```ts
branding?: {
  presetId?: string;
  primaryColor: string;     // hex
  accentColor?: string;     // hex
  font: string;             // family name
  buttonRadius: string;     // px / rem
  cardRadius: string;
  logoDataUrl?: string;     // persisted as data URL (no storage bucket needed)
  portalName: string;
  copyright: string;
};
```

Use a data URL for the logo so it survives reloads via `localStorage` (the current `URL.createObjectURL` is lost on refresh). Read uploaded files with `FileReader.readAsDataURL`.

Add a tiny helper `updateActiveServiceBranding(branding)` that calls existing `updateService(activeServiceId, { branding })`.

### 2. `BrandingTheme.tsx` rewrite (logic only)

- Initialize all local state from `getActiveService()?.branding` (falling back to the existing defaults / DIGIT preset).
- Logo upload → `FileReader` → store as data URL in state.
- "Apply Theme" button (both at top and bottom) → call `updateActiveServiceBranding({...})`, show toast.
- Live preview panel keeps working with the same local state (instant feedback before saving).
- No visual redesign of the page.

### 3. `useBranding()` hook + `<BrandingScope>` wrapper

New file `src/hooks/useBranding.ts`:

- Returns `{ branding, cssVars, fontFamily }`.
- `cssVars` converts `primaryColor` / `accentColor` hex → HSL triplets and produces a style object that overrides:
  - `--primary`, `--ring`, `--accent`, `--sidebar-primary`, `--radius` (derived from `cardRadius`), `--primary-foreground` (computed contrast color).
- `fontFamily` is the chosen font family string.

New file `src/components/BrandingScope.tsx`:

- Wraps children in a `div` with `style={cssVars}` and `style={{ fontFamily }}`.
- Optionally injects a `<link>` to Google Fonts for the chosen font (`Roboto`, `Inter`, `Public Sans`, `DM Sans`, `Lato`, `Source Sans Pro`).

### 4. Apply in the studio UI

- Wrap the studio shell once in `src/components/AppLayout.tsx` with `<BrandingScope>`. This re-themes the dashboard, sidebar accents, primary buttons.
- `AppSidebar` already renders `state.orgName` — also render the branded logo when `branding.logoDataUrl` exists (small image next to org name).

### 5. Apply in the service preview

- Wrap the preview content in `src/components/preview/ServicePreview.tsx` with `<BrandingScope>` so the same CSS variable overrides cascade into citizen + employee screens.
- **Citizen top bar** (`CitizenScreenShell.tsx`): show `branding.logoDataUrl` (fallback to existing icon) and `branding.portalName` (fallback to current label).
- **Employee top bar** (`EmployeeTopBar.tsx`): replace the hardcoded `bg-gradient-to-r from-[#0b4f6c]…` with `bg-primary`, and show logo + `portalName` instead of the hardcoded "DIGIT | dev".
- **Footer copyright**: render `branding.copyright` in `CitizenHome` footer area (small text at the bottom of the citizen home screen) — minimally invasive.
- All existing primary-colored buttons inside the preview already use `bg-primary` / `text-primary-foreground`, so they pick up the override automatically.

### 6. Sensible defaults

If a service has no `branding` saved yet, derive defaults from the existing onboarding values (`state.orgName` → portalName, `state.logoUrl` → logo, `state.themeColor` → primary) and the current "DIGIT" preset. So even before the user opens Branding & Theme, the preview reflects org name and logo from onboarding.

## Files touched

- `src/contexts/OnboardingContext.tsx` — extend `ServiceItem` with `branding`, add helper.
- `src/hooks/useBranding.ts` — **new**.
- `src/components/BrandingScope.tsx` — **new**.
- `src/pages/BrandingTheme.tsx` — wire load/save, file → dataURL, hook up Apply.
- `src/components/AppLayout.tsx` — wrap with `BrandingScope`.
- `src/components/AppSidebar.tsx` — render branded logo next to org name.
- `src/components/preview/ServicePreview.tsx` — wrap preview with `BrandingScope`.
- `src/components/preview/citizen/_shell/CitizenScreenShell.tsx` — logo + portalName.
- `src/components/preview/employee/EmployeeTopBar.tsx` — logo + portalName, use `bg-primary`.
- `src/components/preview/citizen/CitizenHome.tsx` — footer copyright line.

## Out of scope

- Per-screen typography overrides (we set one global font family).
- Dark-mode-specific overrides for the chosen color (we override the `:root` HSL only; dark mode keeps its own values).
- Remote storage of the logo (data URL in localStorage is sufficient for the prototype).
- Brand Guidelines file persistence (stays as ephemeral upload — the file isn't applied anywhere visually).
