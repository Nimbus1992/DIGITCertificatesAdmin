## Go Live page cleanup

### Required checklist (keep only 2)
Remove `Deployment Setup` and `Customize your subdomain` from the required list. Keep:
1. User Access & Authentication
2. License Key

Also drop the unused imports (`DeploymentSetup`, `SubdomainSetup`, `MapPin`, `Globe`) in `src/pages/GoLive.tsx`.

### Optional section
Keep all three: Customize Theme, Integrations, Additional Languages.

- **Customize Theme** — unchanged, navigates to `/config/branding`.
- **Integrations** — clicking opens a "Coming soon" dialog (replace the existing `IntegrationsDialog` trigger).
- **Additional Languages** — clicking opens the same "Coming soon" dialog.

Add a small reusable `ComingSoonDialog` (inline in `GoLive.tsx`) using the existing `Dialog` primitive — title "Coming soon", short message that this capability will be available in an upcoming release.

### Fix the "disabled" look
The optional cards currently use `opacity-70` which makes them look disabled. Remove the opacity class so they render at full strength, matching the required cards' visual weight. Keep the hover lift (`hover:shadow-md`) for affordance and keep the "Optional" badge.

### Files touched
- `src/pages/GoLive.tsx` — only file changing. No backend or context changes.

### Out of scope
- `IntegrationsDialog.tsx`, `DeploymentSetup.tsx`, `SubdomainSetup.tsx` files stay in the repo (not deleted) in case they're reused later.
