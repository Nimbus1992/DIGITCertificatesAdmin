# Fix: Declaration checkbox stuck disabled on Review

## Problem
On the application Review screen, the "I confirm…" checkbox is disabled until the user scrolls to the bottom. Submit stays disabled because the checkbox can never be checked.

Root cause: the scroll listener is attached to `reviewScrollRef`, which is an inner `<div className="h-full">` that does not scroll. The actual scroll container is its parent inside `CitizenScreenShell` (`<div className="flex-1 overflow-y-auto …">`). So `scrollTop` stays 0, `scrolledToBottom` never flips to `true`, and the Checkbox stays `disabled`.

## Change (single file)
`src/components/preview/citizen/ApplicationForm.tsx` — fix the scroll-gating effect so it watches the correct scroller.

In the `useEffect` at ~line 297:
- Resolve the scrollable element as `reviewScrollRef.current?.parentElement` (the `overflow-y-auto` wrapper from `CitizenScreenShell`). Fall back to walking up parents until one has `overflowY: auto|scroll`, for safety.
- Use that element for the `scroll` listener and the `scrollTop + clientHeight >= scrollHeight - 8` check.
- Also call the check once via `requestAnimationFrame` after mount so that, when the review content is short enough to not require scrolling, `scrolledToBottom` immediately becomes `true`.
- Add a `ResizeObserver` on the scroll element (and window `resize`) so the "fits without scrolling" case re-evaluates after layout.

No other files change. No business logic changes — gating behavior is preserved, it just works correctly now.

## Out of scope
- Removing the scroll-to-confirm UX entirely.
- Restyling the footer / checkbox.
- Any change to wizard steps before Review.
