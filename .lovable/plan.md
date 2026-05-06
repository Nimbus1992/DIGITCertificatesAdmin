## Goal

Convert the single-form Org Setup into a one-question-per-screen conversational wizard, and add a "Get Started" empty-state card to the Dashboard. The Completion Screen should send the user to the Dashboard (not directly into template selection), so the Dashboard's empty state becomes the next guided action.

## Onboarding flow changes

Replace the current `OrgSetup.tsx` single page with a 6-screen mini-wizard, plus the existing completion screen. Each screen:
- Shared shell: organization title, subtext, animated transitions (`animate-fade-in`), a small step indicator (e.g. "Step 2 of 6"), Back + Continue buttons.
- One question, one input, helper text under the input.
- Continue is disabled until the question is answered.

Screens:
1. **Org name** — text input. Helper: "This will appear on licenses and official documents."
2. **Department** — select from existing list. Helper: "This helps route applications to the right team."
3. **Country** — select. On change, auto-fill currency + phone code in state and trigger a brief highlight animation flag (used on screens 4 & 5).
4. **Currency** — select, pre-filled, editable. Highlight ring fades out on first view if just auto-filled.
5. **Phone country code** — select, pre-filled, editable. Same highlight behavior.
6. **Language** — grid of options, only English selectable, others show "Coming Soon".

Implementation:
- New folder `src/components/onboarding/org/` with: `OrgWizardShell.tsx` (layout + progress + nav), `StepOrgName.tsx`, `StepDepartment.tsx`, `StepCountry.tsx`, `StepCurrency.tsx`, `StepPhoneCode.tsx`, `StepLanguage.tsx`.
- Rewrite `OrgSetup.tsx` as the controller: holds local sub-step index (0–5), renders the active step inside the shell, manages auto-fill on country change, and sets a transient `justAutoFilled` flag for the highlight animation. Calls `onComplete` after step 6, `onBack` from step 1.
- Completion screen `OrgSetupComplete.tsx` copy update:
  - Title: "You're all set"
  - Subtext: "Now let's set up your first service"
  - CTA: "Go to Dashboard" → navigates to `/dashboard`.
- `Onboarding.tsx`: change the step after `OrgSetupComplete` to navigate directly to `/dashboard` (skip Template/ServiceDetails/AutoSetup in the org flow — those become the Dashboard "Choose Template" path). Keep TemplateSelection/ServiceDetails/AutoSetup screens; they're already reachable from `/services`.
- Update `onboardingGuidance.ts` helper copy to match the new conversational text exactly.

## Dashboard empty-state changes

In `src/pages/Dashboard.tsx`:
- When `state.services.length === 0`, replace the current dashed empty card with a prominent **Get Started** card at the top:
  - Title: "Set up your first service"
  - Subtext: "Choose from a ready-made template to launch in minutes."
  - Primary CTA: **Choose Template** → `/services`.
  - Visual: accent gradient panel, sparkle icon, subtle entrance animation.
- Add a **one-time welcome popup** (subtle Sonner toast or small dismissible card) shown once per browser via `localStorage` flag `lnp-welcome-seen`, greeting the user by `orgName`.

## Technical notes

- Animation: use existing Tailwind utilities (`animate-fade-in`, `animate-slide-up`) and a temporary `ring-2 ring-accent/40` that clears after ~1.2s using `setTimeout` for the auto-fill highlight.
- State: continue using `useOnboarding` for all field values; the wizard sub-step is local React state inside `OrgSetup.tsx`.
- No backend, schema, or business-logic changes. Pure UI/flow refactor.

## Files

Create:
- `src/components/onboarding/org/OrgWizardShell.tsx`
- `src/components/onboarding/org/StepOrgName.tsx`
- `src/components/onboarding/org/StepDepartment.tsx`
- `src/components/onboarding/org/StepCountry.tsx`
- `src/components/onboarding/org/StepCurrency.tsx`
- `src/components/onboarding/org/StepPhoneCode.tsx`
- `src/components/onboarding/org/StepLanguage.tsx`

Edit:
- `src/components/onboarding/OrgSetup.tsx` (controller)
- `src/components/onboarding/OrgSetupComplete.tsx` (copy + CTA target)
- `src/pages/Onboarding.tsx` (route completion → `/dashboard`)
- `src/data/onboardingGuidance.ts` (copy)
- `src/pages/Dashboard.tsx` (Get Started card + welcome popup)
