## Problem

Pages briefly "blink" before settling. Three things contribute:

1. **First paint uses index.css defaults, then JS swaps in branded tokens.** `BrandingScope` writes CSS vars (`--primary`, `--sidebar-*`, `--radius`, etc.) to `<html>` inside a `useEffect`. That runs *after* the first render, so users see a frame painted with the default theme, then a recolor.
2. **`applyToRoot` effect strips and re-sets vars on every dependency change.** The effect returns a cleanup that calls `removeProperty` for every CSS var. Whenever `cssVars`/`fontFamily` identity changes (which happens on most navigations because `useBranding` re-memoizes against context state), React runs cleanup → vars momentarily fall back to the index.css defaults → setup re-applies the branded values. That's a one-frame flash on every route change.
3. **Font is loaded after mount.** The `<link>` for the chosen Google Font is injected inside a `useEffect`, so the first paint uses the system fallback and then re-flows when the font finishes loading (FOUT).

## Fix

**`index.html`** — eliminate the first-paint mismatch:
- Add `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` plus a `<link rel="stylesheet">` for the default font (Inter) so it's available before React mounts.
- Add a tiny inline bootstrap `<script>` that, before React mounts, reads the persisted onboarding state from localStorage, derives the same CSS vars `useBranding` would derive (primary HSL, sidebar shades, radii, font-family) and sets them on `document.documentElement.style`. This makes the very first paint match the branded theme.

**`src/components/BrandingScope.tsx`** — stop the per-navigation flash:
- In the `applyToRoot` effect, *do not* return a cleanup that removes properties. Just write the new values; subsequent renders overwrite them in place. This removes the unset → reset gap.
- Keep the scoped inline `style` on the wrapper div as-is so non-root scopes (preview overrides) still work.

**`src/hooks/useBranding.ts`** — no behavioral change, but expose a small helper (`computeCssVars(branding)`) so the inline bootstrap script in `index.html` and the hook stay in sync. The helper stays pure and is imported by the hook; the bootstrap script in `index.html` duplicates the small HSL math (acceptable because it must run before any module loads).

## Out of scope

- No changes to branding precedence, persistence shape, or any business logic.
- No visual redesign — colors, radii, fonts, and layouts remain identical once loaded; only the initial/transition flash is removed.

## Technical notes

- The bootstrap script is ~30 lines, runs synchronously in `<head>`, and is wrapped in `try/catch` so a malformed localStorage entry can never block React from mounting.
- Removing the effect cleanup is safe because `BrandingScope applyToRoot` is mounted once at the app root (`AppLayout`) and the same vars are always re-written on update — there's no scenario where we need to "unset" them.
