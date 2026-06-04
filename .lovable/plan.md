## Plan

The remaining flash is likely no longer the color-token reset; it is coming from UI that changes immediately after mount:

1. **Stabilize sidebar rendering before first paint**
   - Update `useIsMobile()` so it initializes from `window.matchMedia` synchronously instead of starting as `undefined` and correcting in `useEffect`.
   - This prevents the sidebar from rendering desktop layout first, then switching after mount on route/load.

2. **Keep sidebar open/collapsed state stable**
   - Update `SidebarProvider` to read the saved `sidebar:state` cookie during initial state setup.
   - This prevents the shell from briefly rendering expanded and then settling to the user’s saved state.

3. **Remove page-level entrance fades that look like blinking**
   - Remove `animate-fade-in` from `BrandingTheme` and avoid initial slide/fade on the dashboard empty state.
   - Keep hover/interaction transitions intact; only remove automatic page-load opacity/position animations.

4. **Verify visually**
   - Load `/dashboard`, navigate between Dashboard, Branding & Theme, and a service config page, and confirm there is no blank/white/theme flash or shell reflow.