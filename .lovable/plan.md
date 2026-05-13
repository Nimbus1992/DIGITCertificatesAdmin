## Goal

Evolve `/service/:id/configure` from a page with small Configure/Preview pills into a service lifecycle workspace with three primary modes: **Configure**, **Preview**, **Deployment**. Restructure information architecture and visual hierarchy only — preserve all existing configuration, preview, and go-live functionality.

## Workspace Shell

Refactor `src/pages/ServiceConfig.tsx` so the page is a full-height flex column:

- Top: compact workspace header (back arrow, service name, lifecycle status badge: Draft / Live).
- Below header: full-width **workspace navigation bar** with three large underline-style tabs spanning the header width — Configure · Preview · Deployment. Active tab uses a 2px bottom border in `accent`, inactive uses muted text with hover. No pill/segmented styling. Tabs are buttons ~48px tall with comfortable horizontal padding, left-aligned within a max-width container matching the page.
- Body: the active workspace fills remaining height (`flex-1 min-h-0`).

Replace the current `Tabs` component usage with a custom underline tab bar (still driven by local `mode` state, default `"configure"`). Remove the inline "Go Live" button from the Preview body — Go Live is initiated from the Deployment workspace.

## Configure Workspace

Keep the existing Configure content (modules row, Core Setup, Additional Setup) but lower the visual noise:

- Rename the section heading "Core Setup" to **"Setup Journey"** with the same supporting copy.
- Remove the small "{n} of {n} configured" inline counter from the modules row and instead show it as a subtle right-aligned caption under the Setup Journey heading.
- Reduce card chrome: keep core tiles as cards but drop the inner CTA button (the whole card is already clickable) and tighten padding from `p-6` to `p-5`. Status badge stays.
- Increase vertical spacing between sections (`space-y-10` instead of `space-y-8`) for a calmer rhythm.
- No changes to the underlying tile click behavior or the specialized config screens.

## Preview Workspace

The Preview tab renders `ServicePreviewWorkspace` directly inside the workspace body — no intro strip, no "Go Live" button, no surrounding card border. The preview already provides its own immersive chrome (device toggle + sidebar + framed canvas), so we just give it the full pane:

- Container: `flex-1 min-h-0` with no border/padding around it. The dark `#444` canvas of the preview reaches the edges of the workspace pane, reinforcing the "experiencing the generated app" feel and visually distinguishing it from Configure.
- All existing functionality (citizen/employee role switch, screen navigation, device modes, notifications) is preserved via the existing `ServicePreviewWorkspace` component.

## Deployment Workspace

New workspace shown as the third tab. Behavior:

- Tab is **always visible** but **disabled** until the service is live (`service?.isLive` or `state.isLive`). When disabled: muted color, `cursor-not-allowed`, and a tooltip "Available after publishing the service".
- When the service is **not live**, clicking does nothing. The Configure / Preview tabs continue to function as today, and Go Live remains reachable from `/go-live` (entered via the existing dashboard / publishing flow). To preserve the previous in-page Go Live affordance, surface a single small "Go Live" link in the workspace header (right side) when the service is in Draft — neutral text button, no longer a primary CTA in the Preview body.
- When the service **is live**, the Deployment tab is enabled and renders a placeholder workspace (no functional changes yet):
  - Heading: "Deployment" + subtitle "Operate and manage your live service."
  - Live status row (status dot + "Live" + service URL link if available from `service`).
  - A flat list (not boxed cards) of upcoming sections, each as a typography-led row with title + one-line description, marked "Coming soon": Production Status, Active Modules, Published Versions, Operational Settings, Monitoring, Integrations, Audit Logs, Environment Management.
  - No nested cards; use dividers (`border-b border-border/60`) between rows.

## Visual Hierarchy Pass

Apply across the workspace shell:

- Use typography-led section headers (no boxed section containers).
- Reduce reliance on `Card` for grouping in Configure's Additional Setup and Deployment list — use simple bordered rows or plain rows with dividers.
- Increase whitespace between major regions; remove redundant sub-borders.
- Keep all colors on existing semantic tokens (`accent`, `muted`, `foreground`, `border`).

## Files Touched

- `src/pages/ServiceConfig.tsx` — workspace shell, new tab bar, three-mode rendering, Configure visual cleanup, Deployment placeholder, removal of in-Preview Go Live CTA, header-level Go Live link for Draft.

No other files require changes. `ServicePreviewWorkspace`, all `service-config/*` editors, and the `/go-live` route are reused as-is.

## Out of Scope

- No changes to preview internals, form/workflow/document editors, branding, routing, or data model.
- No real Deployment functionality — placeholder only.
- No changes to `/go-live` or publishing logic.
