## Goal

Teal becomes the default brand color everywhere — including the dark sidebar nav on the main app screen — and the sidebar continues to follow whatever brand color is selected in Branding & Theme.

## Changes

**1. Default brand → Teal**
- `src/hooks/useBranding.ts` — update `DEFAULT_BRANDING`:
  - `presetId: "teal"`
  - `primaryColor: "#0D9488"` (matches the existing "Teal Modern" preset)
  - `accentColor: "#0F766E"` (slightly deeper teal for hover/active states)
  - Font and radii stay as they are today.

**2. Sidebar adopts the brand color**

Today `useBranding` only writes `--primary`, `--accent`, `--sidebar-primary`, `--ring`, and `--radius`. The sidebar's background (`--sidebar-background`), hover surface (`--sidebar-accent`), and border (`--sidebar-border`) come from `index.css` and are hard-coded dark blue, so they never change.

- Extend `useBranding` to also derive and set, from the primary HSL:
  - `--sidebar-background` — primary hue/sat at ~18% lightness (deep teal)
  - `--sidebar-accent` — primary hue/sat at ~26% lightness (hover row)
  - `--sidebar-border` — primary hue/sat at ~28% lightness
  - `--sidebar-foreground` and `--sidebar-accent-foreground` — white
  - `--sidebar-primary` stays the brand color (active item highlight)
- These are applied via the existing `applyToRoot` path in `BrandingScope`, so portals/popovers stay in sync.

**3. Update fallback tokens in `src/index.css`**

So the sidebar renders teal on first paint (before React mounts) and any non-branded surface uses teal:
- `:root` `--primary` → `174 58% 28%` (teal)
- `:root` `--ring` → `174 58% 28%`
- `:root` `--sidebar-background` → `180 55% 18%`
- `:root` `--sidebar-accent` → `180 50% 26%`
- `:root` `--sidebar-border` → `180 50% 30%`
- `:root` `--sidebar-primary` → `174 58% 42%`
- Matching adjustments in `.dark` block.

## Out of scope

- No changes to the Branding & Theme presets, color swatches, or per-service overrides — picking a different preset still works exactly as today and now also recolors the sidebar.
- Logo, typography, and radius defaults are unchanged.
