## Redesign Auth & Workspace Setup as Enterprise Government UI

Bring `SignIn`, `ResetPassword`, and `ConfirmOrganization` into the same dashboard design language: navy-based institutional theme, soft neutral background, white surface cards, thin borders, uppercase eyebrow labels, 8px spacing rhythm, and consistent navy CTAs. Add Back navigation between the steps.

### Shared shell

Create `src/components/onboarding/AuthShell.tsx` — a reusable layout used by all three screens:

- Compact top brand bar: white surface, thin bottom border, navy `Shield` icon + "Government Services Portal" wordmark on the left, small step indicator on the right ("Step 1 of 3 · Sign in" etc.).
- Soft neutral page background (`bg-muted/40`) so cards stand out.
- Centered container, content width clamped to ~520px (auth) and ~720px (workspace setup).
- Optional right-side decorative pattern panel on `lg+` (subtle navy gradient + dotted grid + tagline) — hidden on smaller screens. Used on SignIn / ResetPassword only; ConfirmOrganization gets the wider single-column layout.
- Footer strip with "Secure government workspace · v1.0".

### Back navigation (functionality)

- Add `goBack` controls wired through `OnboardingContext` flags:
  - `ResetPassword` Back → `updateState({ isLoggedIn: false })` returns to SignIn.
  - `ConfirmOrganization` Back → `updateState({ isPasswordReset: false })` returns to ResetPassword.
  - `SignIn` shows no Back (entry point).
- Render Back as a ghost button with `ArrowLeft` in each card header.

### SignIn redesign (`SignIn.tsx`)

- Wrap in `AuthShell` with side illustration enabled.
- Centered card (`Card`, white, thin border, radius 10px, subtle shadow):
  - Eyebrow: `WORKSPACE ACCESS` (uppercase, tracked, muted).
  - Title: "Sign in to your workspace" (semibold, navy foreground).
  - Description: trustworthy one-liner about temporary access.
  - Inputs: Email, Temporary password — `h-10`, label in medium weight, helper text under password ("Use the temporary password shared by your platform team.").
  - Inline error region using `text-destructive`.
  - Primary CTA: full-width navy button (`bg-primary text-primary-foreground hover:bg-primary/90`) with `ArrowRight`.
  - Footer microcopy: "Need help? Contact your platform administrator." (muted, centered).

### ResetPassword redesign (`ResetPassword.tsx`)

- Same `AuthShell` with side illustration.
- Card header: Back button (left) + step eyebrow `SECURE PASSWORD RESET`.
- Title "Set a new password" + description about mandatory rotation.
- Three inputs (Current, New, Confirm), `h-10`, with helper text under New ("At least 8 characters. Use a mix of letters and numbers.").
- Inline validation messages preserved.
- Navy primary CTA "Continue" with `ArrowRight`; Back ghost button on the left of footer row.

### ConfirmOrganization redesign (`ConfirmOrganization.tsx`)

- Reuse `AuthShell` (no side illustration; full centered column up to 720px).
- Top of content area:
  - Step eyebrow: `STEP 3 OF 3 · WORKSPACE SETUP`.
  - Identity block: smaller logo button (40px) + heading + `Licenses & Permits Workspace` muted badge inline.
  - One-line guidance ("Confirm a few details to finish activating your workspace.").
- Card divided into clear sections with uppercase eyebrow labels:
  1. **Department** — single dropdown.
  2. **Regional settings** — 2-col grid: Country, Currency, Country code, Default language.
  3. **Workspace access** — Workspace URL read-only field with `Copy` icon button + helper text ("Applicants and employees will access services using this URL.").
- Section dividers via thin `border-t` between groups inside the card; tight padding (`px-6 py-5`, section `space-y-4`).
- Footer row inside card: Back ghost button (left), helper microcopy + navy "Continue" CTA (right). Reduced footer padding (`py-3`).
- Keep all existing logic (country defaults autofill, currency/phone-code highlight, logo upload, workspaceUrl derivation, copy-to-clipboard, validation gating Continue).

### Visual tokens

- Use existing semantic tokens: `bg-background` for page, `bg-card` for surfaces, `border-border` for thin borders, `text-foreground` / `text-muted-foreground`, navy `bg-primary` for CTAs (replaces `bg-accent`), `--radius` already 0.75rem.
- Eyebrow style: `text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground`.
- Inputs unified at `h-10`; buttons at `h-10` for primary, `h-9` for secondary/back.

### Files

- New: `src/components/onboarding/AuthShell.tsx`.
- Edit: `src/components/onboarding/SignIn.tsx`, `src/components/onboarding/ResetPassword.tsx`, `src/components/onboarding/ConfirmOrganization.tsx`.
- No router or state-shape changes needed — Back uses the existing `isLoggedIn` / `isPasswordReset` flags already in `OnboardingContext`.