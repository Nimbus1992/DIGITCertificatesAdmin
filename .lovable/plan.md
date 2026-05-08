# Fix: Branding & Theme not applying

## Root causes found

1. **Studio shell theme tokens never change.** `AppLayout` wraps children in `BrandingScope`, but `BrandingScope` renders a `<div className="contents">`. CSS custom properties set via `style` on a `display: contents` element are NOT inherited by descendants in most browsers. So `--primary`, `--radius`, font family etc. are effectively dropped — sidebar/header colors, buttons, fonts never update.
2. **No active service = no branding.** `useBranding` only falls back to global `state.logoUrl / orgName / themeColor` when there is no active service. The studio sidebar is rendered before any service is active (Dashboard, Templates, Setup pages), and `BrandingTheme` itself saves only to the active service. Result: when you open `/config/branding` from the sidebar with no active service, "Apply Theme" silently no-ops (it calls `updateActiveServiceBranding` which maps over services and finds nothing to update).
3. **Footer/copyright never editable.** `BrandingTheme` doesn't expose copyright in the form (only seeded), and the citizen shell shows it only when there's no `footer` slot — so most screens never show it.
4. **Preview surfaces miss tokens.** `PreviewTopBar` and other chrome use `bg-primary` but they sit OUTSIDE the inner `BrandingScope` only on some screens; the larger issue is again #1 (`contents` wrapper losing CSS vars).
5. **Font radius/buttonRadius unused.** `cssVars` only sets `--radius` from `cardRadius`; `buttonRadius` is saved but never wired to any token, so buttons don't change shape.
6. **No persistence to global defaults.** Logo uploaded in onboarding lands in `state.logoUrl`, but BrandingTheme writes only to the active service. If user is editing the platform default (no service), nothing saves.

## What we'll change

### 1. `BrandingScope` — make it a real scope
- Replace `className ?? "contents"` with a real block (`className ?? "flex flex-col min-h-0 flex-1"` for layout cases, plain `<div>` otherwise) so `style={cssVars}` actually cascades.
- Add `--button-radius` to `cssVars` and apply both `--radius` (from `cardRadius`) and `--button-radius` (from `buttonRadius`).
- Keep font-link injection.

### 2. `useBranding` — always merge, never return nothing
- Compute a merged branding: `{ ...DEFAULT_BRANDING, ...globalFallback, ...(activeService?.branding ?? {}) }` so partial saves still work and global theme always wins over defaults even when a service exists but has no logo.
- Add an optional second source: a new global `state.platformBranding` (see below) so the studio shell has its own brand identity independent of any service.

### 3. `OnboardingContext` — add platform-level branding
- Add `platformBranding?: BrandingConfig` to `OnboardingState` (persisted in localStorage like the rest).
- Add `updatePlatformBranding(branding)` action.
- `useBranding` precedence: `override` → active service branding → platform branding → legacy `state.logoUrl/orgName/themeColor` → defaults.

### 4. `BrandingTheme` page — explicit scope + missing controls
- Add a small toggle at top: **"Editing: This service"** vs **"Editing: Platform default"**. Default to active service if one exists, otherwise platform.
- On Apply: route to `updateActiveServiceBranding` or `updatePlatformBranding` accordingly.
- Add a **Copyright** input (already in state, just expose it).
- Add an explicit **Logo upload + Remove** that writes directly into the saved branding (today the logo only saves through Apply Theme — confirm by also calling Apply on file change is unnecessary; just include `logoDataUrl` in the saved object, which we already do — but make sure global path works too).
- Persist `buttonRadius`.

### 5. Surfaces that consume branding (verify only, no logic change beyond #1)
- `AppSidebar` — already reads `branding?.logoDataUrl` & `portalName`. After fix #1 + #3 it will pick up platform branding too.
- `EmployeeTopBar`, `CitizenScreenShell` — already read from `useBranding()`; after fix #1 the wrapper actually passes CSS vars down.
- `PreviewTopBar` (uses `bg-primary` for active device button) — will inherit since it's rendered inside `ServicePreviewInner` and we'll move `BrandingScope` to wrap the entire `ServicePreviewInner` (not just inner content) so the top bar is themed too.
- Citizen footer/copyright — render copyright always at the bottom of the shell (small line), even when a sticky footer is present; or render inside the sticky footer area as a secondary line.

### 6. Tailwind/button radius wiring
- In `tailwind.config.ts` (or via `index.css`), add a `--button-radius` consumer. Lightest-touch fix: in `useBranding.cssVars` set both `--radius` and override the `lg`/`md`/`sm` variants used by the `Button` component by emitting `--radius` from `buttonRadius` for buttons via a CSS rule scoped to `[data-branding-scope] .btn-brand` — simpler: just set `--radius: buttonRadius` and use `cardRadius` for cards via inline classes already present. Pick whichever is smallest; details in tech notes.

## Acceptance criteria

- Uploading a logo + applying theme on `/config/branding` updates: studio sidebar logo/name, the citizen preview header logo/name, the employee preview header logo/name — without a refresh.
- Changing primary color updates: sidebar active state, primary buttons across studio AND inside the service preview, the citizen/employee header background.
- Changing font updates the visible font across both studio and preview.
- Refreshing the page keeps all branding (already persisted via localStorage; verify after switch to platform-level branding).
- Copyright text appears in the citizen preview footer area on every screen.
- Works with no active service (edits platform default) AND with an active service (edits per-service, falling back to platform default for any field not set).

## Technical notes

- `display: contents` + inline `style` does set the property on the element, but children inherit CSS custom properties through the cascade only if the property is on a real containing element in the layout tree. Modern browsers do inherit custom properties through `display: contents`, BUT some descendants (sidebar primitives, portals like dropdowns/toasts) escape the subtree entirely. Using a real `<div>` plus also injecting the vars on `:root` for the platform-level branding (so portals also inherit) is the robust fix. Plan: BrandingScope writes its vars on `documentElement.style` as a side effect (for platform branding) AND on its own div (for service-scoped overrides inside preview).
- Files to touch:
  - `src/components/BrandingScope.tsx` — real wrapper + optional `applyToRoot` prop; also write `--button-radius`.
  - `src/hooks/useBranding.ts` — merge logic + read `state.platformBranding`.
  - `src/contexts/OnboardingContext.tsx` — add `platformBranding`, `updatePlatformBranding`.
  - `src/pages/BrandingTheme.tsx` — scope toggle, copyright field, route apply to platform/service.
  - `src/components/AppLayout.tsx` — pass `applyToRoot` to BrandingScope.
  - `src/components/preview/ServicePreview.tsx` — wrap whole `ServicePreviewInner` (incl. PreviewTopBar) with BrandingScope.
  - `src/components/preview/citizen/_shell/CitizenScreenShell.tsx` — always render copyright line.

## Out of scope
- New theme presets, dark-mode toggle, per-role branding, exporting brand kit.
