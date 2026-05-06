## Goal
Replace the single "Activate your account" screen with an enterprise-style two-step activation: (1) Login with temporary password, (2) Mandatory password reset, then continue to workspace confirmation.

## Flow

```text
Login (email + temp password 12345678)
        ↓ success
Reset Password (current / new / confirm)
        ↓ success
ConfirmOrganization (existing)
        ↓
Dashboard
```

## Changes

### 1. `src/contexts/OnboardingContext.tsx`
- Add `isLoggedIn: boolean` and `isPasswordReset: boolean` to `OnboardingState` (default `false`).
- Keep `isActivated` as the final gate (true only after password reset completes).

### 2. New `src/components/onboarding/SignIn.tsx`
- Enterprise-styled login card matching current `ActivateAccount` visual language (Shield icon, same typography, accent button).
- Heading: "Sign in to your workspace". Subtext: "Use the temporary password shared by your platform team to activate your account."
- Fields: Email address (pre-filled from `state.email` if present), Temporary password.
- Validation: email regex + non-empty password. On submit, check password === `"12345678"`; if not, show inline error "Incorrect password. Use the temporary password shared with you."
- Subtle helper hint below form: "First time signing in? Use the temporary password from your activation email."
- On success: persist email + derived orgName to context, call `onComplete()`.

### 3. New `src/components/onboarding/ResetPassword.tsx`
- Same visual shell. Heading: "Reset your password". Subtext: "For security, set a new password before accessing your workspace."
- Fields: Current password, New password, Confirm new password.
- Validation:
  - Current password must equal `"12345678"` → else "Current password is incorrect."
  - New password ≥ 8 chars, must differ from current → else clear error.
  - Confirm must match new password.
- Inline field-level error states + a single error line under the form.
- Continue button disabled until all valid. On success, call `onComplete()`.

### 4. `src/pages/Onboarding.tsx`
Routing logic:
```text
if (!isLoggedIn)        → <SignIn onComplete={() => updateState({ isLoggedIn: true })} />
else if (!isPasswordReset) → <ResetPassword onComplete={() => updateState({ isPasswordReset: true, isActivated: true })} />
else                    → <ConfirmOrganization ... />
```

### 5. Cleanup
- Delete `src/components/onboarding/ActivateAccount.tsx` (replaced by SignIn + ResetPassword).

## Notes
- Pure frontend prototype — no Supabase auth wiring; temp password `"12345678"` is hardcoded as requested.
- Reuse existing design tokens (`bg-accent`, `text-accent-foreground`, h-11 inputs, same spacing) so all three screens feel like one continuous enterprise activation flow.
- No changes to `ConfirmOrganization` or downstream steps.
