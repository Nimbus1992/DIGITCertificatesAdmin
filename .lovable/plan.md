## Changes to `src/components/onboarding/ConfirmOrganization.tsx`

1. **Welcome heading** — replace dynamic `Welcome, {orgName}` with the fixed string `Welcome to Licenses and Permits Studio`. Keep avatar uploader, badge, and subheading.

2. **Workspace Access section** — render two read-only fields side-by-side on one row (stack on mobile):
   - **Organization name** (left) — read-only input bound to `state.orgName`, same disabled styling as the URL field, no copy button.
   - **Workspace URL** (right) — read-only input, value updated to `www.digit.org/govt-lp-studio/<slug>` (slug derived from `state.orgName`, fallback `your-org`). Copy button retained.
   - Layout: `grid sm:grid-cols-2 gap-4`.
   - Helper text below the row stays: "Applicants and employees will access services using this URL."

No other files, logic, or routes change.