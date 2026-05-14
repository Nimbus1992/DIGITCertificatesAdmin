## Problem

`ServicePreview` (route `/service/:id/preview`) hardcodes its Exit Preview action to `navigate('/service/${id}/configure')`. So no matter where the user came from (Services list, Service Manage card, etc.), Exit Preview dumps them on the configure page instead of returning to the previous screen.

## Fix

In `src/components/preview/ServicePreview.tsx`:

- Change the default `handleExit` from `navigate('/service/${id}/configure')` to `navigate(-1)` so it goes back to whatever screen the user came from.
- Add a safety fallback: if there's no history entry to go back to (e.g. the user opened the preview URL directly in a new tab), fall back to `/dashboard` (or `/services`). Detect via `window.history.length <= 1` or a `key === 'default'` check on the current location.
- Embedded usage (`ServicePreviewWorkspace` inside `ServiceConfig`'s Preview tab) is unaffected because it doesn't render `PreviewTopBar` and passes its own `onExit` when needed.

No other files need changes — all entry points (`Services.tsx`, `ServiceManage.tsx`, plus any future ones) navigate normally, so `navigate(-1)` correctly returns them.

## Technical detail

```tsx
const location = useLocation();
const handleExit = onExit ?? (() => {
  if (location.key === "default") {
    navigate(`/service/${id}/configure`); // fallback for direct loads
  } else {
    navigate(-1);
  }
});
```
