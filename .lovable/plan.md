## Update SignIn layout

Swap the AuthShell side panel to the left side and add a background image behind the navy overlay.

### Changes

**`src/components/onboarding/AuthShell.tsx`**
- Add a new prop `sidePanelPosition?: "left" | "right"` (default `"right"`).
- Render the `<aside>` before or after the form container based on the prop. Use `flex-row-reverse` or simple conditional ordering.
- Add a `backgroundImage` prop (optional) so the panel can show a hero image. Default to a generated civic/government image.
- Update the panel styling: layer the background image at the bottom, then a navy gradient overlay (`from-primary/95 via-primary/85 to-primary/70`), then the dotted-grid pattern, then the content. This keeps text legible while showing the photo.
- Keep border on the correct side (border-r when on left, border-l when on right).

**`src/components/onboarding/SignIn.tsx`**
- Pass `sidePanelPosition="left"` to `AuthShell`.

**New asset: `src/assets/auth-side.jpg`**
- Generate a subtle, professional civic/government building or abstract institutional image (muted tones so the navy overlay reads cleanly).
- Imported in `AuthShell.tsx` and used as the panel background.

No logic changes; only layout and a new decorative asset. ResetPassword keeps the right-side panel unless you want it changed too — let me know.
