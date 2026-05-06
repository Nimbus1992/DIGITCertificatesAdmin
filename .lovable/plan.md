# Refactor Onboarding to Enterprise Activation Flow

Transform the current 4-step discovery onboarding (Welcome → SSO → 6-step Org Setup → Complete) into a focused 2-step activation flow for pre-registered organizations, followed by a welcome modal on the dashboard.

## New Flow

```text
Activate Account  →  Confirm Organization  →  Dashboard (welcome modal)  →  Choose Template → Preview → Configure → Go Live
   (Step 0)              (Step 1)                                            (existing, unchanged)
```

## Screens to Build

### 1. `ActivateAccount.tsx` (replaces `WelcomeScreen` + `SSOSignIn`)

- Title: "Activate your account"
- Subtext: "Your organization workspace has already been created. Set your password to get started."
- Fields: Email (pre-filled & editable), Password, Confirm Password
- Validation: password ≥ 8 chars, both match
- CTA: "Continue" → derive org name from email domain/local part, store in context, advance step
- No SSO buttons, no marketing copy, no helper reassurance text
- Reuses existing card/Input/Button styling

### 2. `ConfirmOrganization.tsx` (replaces 6-step `OrgSetup` + `OrgSetupComplete`)

Single-page form (not a wizard). Reuses existing Input/Select/country-defaults logic.

**Header**

- "Hey {orgName} 👋" — derived from email (e.g. `john@acme.gov` → "Acme", capitalized)
- Subtext: "We've pre-configured your workspace. Review and update the details below before continuing."

**Pre-configured info card** (above form)

- Title: "Your workspace includes"
- 4 items with check icons: Default integrations · Notification setup · Payment support · User management

**Logo placeholder** (top of form, near org name)

- Circular avatar-style placeholder, click to upload (file input → data URL into `state.logoUrl`)
- Helper: "Add your organization logo to personalize documents and certificates."
- Skippable

**Form fields** (all pre-filled from sensible defaults, all editable)


| Field             | Default            |
| ----------------- | ------------------ |
| Organization Name | derived from email |
| Department        | "Revenue"          |
| Country           | "United States"    |
| Currency          | auto from country  |
| Country Code      | auto from country  |
| Default Language  | "English"          |


**Smart country behavior**: changing Country auto-updates Currency + Phone Code with a brief ring/fade highlight on those fields (reuse existing `highlightAuto` pattern from `OrgSetup`).

**CTA**: "Continue to Dashboard" → marks `isOnboardingComplete`, navigates to `/dashboard`.

### 3. Dashboard welcome modal

- Replace the current toast in `Dashboard.tsx` with a Dialog shown on first visit (gated by existing `lnp-welcome-seen` localStorage key)
- Title: "Welcome to Licenses & Permits"
- Subtext: "Start by choosing a application template and configuring your first workflow."
- CTA: "Choose Template" → navigates to `/services`, dismisses modal

## Files Changed

- `src/pages/Onboarding.tsx` — reduce to 2 steps, route to new components
- `src/components/onboarding/ActivateAccount.tsx` — new
- `src/components/onboarding/ConfirmOrganization.tsx` — new
- `src/pages/Dashboard.tsx` — swap welcome toast for Dialog modal
- `src/contexts/OnboardingContext.tsx` — add `email` field to state
- Delete (no longer used): `WelcomeScreen.tsx`, `SSOSignIn.tsx`, `OrgSetup.tsx`, `OrgSetupComplete.tsx`, `HelperText.tsx`, `StepProgress.tsx`, `TemplateSelection.tsx`, `TemplateCard.tsx`, `TemplateIntroduction.tsx`, `ServiceDetails.tsx`, `AutoSetup.tsx`
  *(The template/service-creation flow lives in `src/pages/Services.tsx` and is unaffected — only the unused onboarding-embedded versions are removed.)*

## Out of Scope

- No backend/auth wiring (purely UI; password is not actually persisted)
- No changes to Services, ServiceConfig, GoLive, BrandingTheme, or any post-dashboard flow
- Design system, colors, and existing card/button patterns kept as-is