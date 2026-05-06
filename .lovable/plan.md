## Goal
Fix the onboarding so it always starts with "Activate your account" (password setup), then advances to a refined "Confirm organization" screen that reads as enterprise account activation, not a generic admin form.

## Problem
On the current `/onboarding` route, users land directly on the Confirm Organization screen. Cause: `OnboardingContext` persists `currentStep` in localStorage, so a previously-set value (e.g. `1`) skips ActivateAccount. There is also no explicit "is activated" gate.

## Changes

### 1. Gate the flow on activation, not on `currentStep`
- `src/contexts/OnboardingContext.tsx`: add `isActivated: boolean` (default `false`) to `OnboardingState`.
- `src/pages/Onboarding.tsx`: render based on `state.isActivated` instead of `currentStep`.
  - Not activated → `ActivateAccount`.
  - Activated and not complete → `ConfirmOrganization`.
  - Complete → redirect to `/dashboard`.
- `ActivateAccount.onComplete` sets `isActivated: true` (in addition to email/orgName).
- This makes the flow resilient to stale localStorage and refreshes mid-flow.

### 2. ActivateAccount (minor)
- Keep current layout/copy (already matches the brief: shield icon, "Activate your account", helper line, Email + Password + Confirm).
- Ensure email is pre-filled from `state.email` when present (already true) and remains editable.

### 3. ConfirmOrganization — refined enterprise feel
Rework `src/components/onboarding/ConfirmOrganization.tsx`:

**Header**
- Replace "Hey {org} 👋" with `Welcome, {orgName} 👋` as an H1.
- Sub-line: "Your workspace is already prepared — review and personalize it before continuing."
- Remove the editable Organization Name input entirely. Org name is fixed by the platform team.

**Identity row (compact, avatar pattern)**
- Small circular avatar (56px) showing logo or org initial, with a hover camera overlay to upload — same component, just inline next to the org name area inside the form card header (not its own large section).
- Tiny helper underneath: "Optional — used to personalize documents and certificates."

**Workspace summary card (compact)**
- Reduce padding (`p-3`), single-line treatment: `Sparkles` icon + "Your workspace is already configured" + inline pill list of included items separated by dots, not a 2-column grid.
- Lower visual weight: muted background, no accent border.

**Form card — grouped sections**
- Section 1: "Department" (single field, full width on mobile, half on desktop).
- Section 2: "Regional settings" with a small section label + helper "Country auto-fills currency and dialing code." Fields: Country, Currency, Country code, Default language. Keep the subtle ring highlight on auto-updated Currency / Country code (existing `highlightAuto` behavior).
- Tighten spacing: `space-y-4`, smaller section gaps.

**Footer CTA inside the card**
- Move the Continue button into the form card's footer (bordered top divider, right-aligned).
- Add muted helper text on the left: "You can update these anytime in Workspace Settings."
- Remove the floating button block below the card.

### 4. Out of scope
- No changes to Dashboard, routing elsewhere, or backend.
- No design-token additions; reuse existing semantic tokens.

## Technical notes
- `OnboardingState` change is additive; existing localStorage merges with `initialState` so `isActivated` defaults to `false` for returning users — they'll be sent through ActivateAccount once, which is the desired correction.
- `canContinue` in ConfirmOrganization no longer depends on `orgName` input; gate on `state.country && state.department` instead.
- Keep all existing imports, country/currency data, and animation classes.
