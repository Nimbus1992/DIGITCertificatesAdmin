## Problem

Draft service cards currently always show **Continue configuring** → service workspace (Overview/Configure/Preview/etc.). But the workspace's internals (modules, categories, workflows, forms) all depend on the template setup wizard having been completed first. If a draft was created but setup was never finished, opening the workspace shows empty/broken state.

## Fix

Gate the draft card CTA on whether template setup is complete.

**"Setup complete" signal:** `service.templateSetup` is present (set on the final wizard step in `TemplateSetup.tsx`, alongside `customModules` from Step 2). Use `Boolean(s.templateSetup)` as the gate — same signal already used by `computeSetupSteps` for the "structure" step.

### In `src/pages/TemplatesDashboard.tsx`

1. In `DraftServiceCard`, branch the primary CTA:
   - **Setup not done** (`!service.templateSetup`):
     - Primary CTA label: **Complete setup**
     - onClick: `goConfigure(s)` (template setup wizard)
     - Hide the **Preview** secondary action (nothing meaningful to preview yet)
     - Optional subtle helper text on the card: "Finish template setup to start configuring."
   - **Setup done** (`service.templateSetup` exists):
     - Primary CTA: **Continue configuring** → `goOverview(s)` (current behavior)
     - Secondary: **Preview** → `goPreviewService(s)` (current behavior)

2. Pass `goConfigure` into `DraftServiceCard` alongside the existing handlers so the card can pick the right destination.

3. Progress bar / step list on the card (driven by `computeSetupSteps`) already reflects setup status — no change needed there, it will naturally show low completion for un-setup drafts.

No other files change. Live services are unaffected (setup is always complete by the time a service goes live).

## Why this is safe

- `templateSetup` is written by the setup wizard's final step and is the prerequisite for every downstream configurator (forms, fees, workflow, roles all key off categories/modules from setup).
- Service owners assigned to a draft before setup is finished will see **Complete setup** and be routed into the wizard — matching the "either super admin or service owner can complete setup" expectation.
