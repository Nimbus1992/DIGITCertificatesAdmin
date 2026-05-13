## Problem

In the configurator's Preview tab, the embedded `ServicePreviewWorkspace` hides `PreviewTopBar` entirely. Two regressions:

1. **No device toggles** — mobile/tablet/desktop switcher lived in `PreviewTopBar`, which embedded mode skips.
2. **Mobile frame overflows / looks oversized** — `MobileFrame` is fixed at `375×750` with `py-8`, so on the constrained Preview pane it pushes outside the panel and the `375px` phone width feels too small relative to the `flex-1` dark canvas. Combined with the outer container only setting `height: calc(100vh - 220px)`, the layout looks broken at 1136px viewport.

## Fix (UI only)

### 1. `src/components/preview/ServicePreview.tsx`
In embedded mode, render a compact toolbar at the top of the workspace (in place of the hidden `PreviewTopBar`) containing only the device-mode toggle group (mobile / tablet / desktop). No Exit button, no Help — those don't apply in the embedded context. Reuse the same toggle styling as `PreviewTopBar` for consistency.

### 2. `src/components/preview/MobileFrame.tsx`
Make the phone frame scale down to fit its container instead of always rendering at `375×750`:
- Wrap the fixed-size phone in a centering container that uses `max-h-full` and a CSS `transform: scale(...)` based on available height, OR simpler: switch the frame to use `h-full max-h-[750px]` with `aspect-[375/750]` and let it shrink. Pick the simpler aspect-ratio approach so the phone always fits the available pane height with reasonable padding.
- Reduce the outer `py-8` to `py-4` so smaller embedded heights don't clip the frame.

### 3. `src/pages/ServiceConfig.tsx`
The Preview pane container uses `height: calc(100vh - 220px)` which is fragile. Replace with a flex-based height: make the outer page a `flex flex-col h-screen`, header `shrink-0`, and the preview `<main>` `flex-1 min-h-0` so the embedded preview fills naturally. This also keeps the device toggle visible without the user having to scroll.

## Out of scope

- No changes to preview screens, sidebar, branding, or any business logic.
- Desktop/tablet preview chrome is unchanged — only the mobile frame sizing is adjusted.
- `PreviewTopBar` (used by the standalone `/service/:id/preview` route) is left as-is.
