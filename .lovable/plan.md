## Remove the Landing Page

Delete the public landing page at `/` and route the root to the onboarding flow instead.

### Changes
- Delete `src/pages/LandingPage.tsx`.
- In `src/App.tsx`:
  - Remove the `LandingPage` import.
  - Replace `<Route path="/" element={<LandingPage />} />` with a redirect: `<Route path="/" element={<Navigate to="/onboarding" replace />} />`.

### Notes
- `Navigate` is already imported from `react-router-dom` in `App.tsx`.
- No other files reference `LandingPage`, so no further cleanup is needed.
- The associated memory entry (`mem://features/landing-page`) can be removed after implementation since the feature no longer exists.