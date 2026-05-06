## Goal
Make the organization confirmation screen feel denser, more operational, and unmistakably "entering a workspace" — by adding a read-only Workspace URL, a workspace badge near the heading, and tightening spacing.

## Changes (single file: `src/components/onboarding/ConfirmOrganization.tsx`)

### 1. Header / identity block
- Tighten vertical alignment between avatar and heading: align avatar center to heading row (`items-center` instead of `items-start`, drop the `pt-1` offset).
- Reduce gap between avatar and text from `gap-4` → `gap-3`.
- Add a small muted badge next to (or just under) the "Welcome, {orgName} 👋" heading reading **"Licenses & Permits Workspace"** using existing `Badge` component with `variant="secondary"` and muted styling.
- Keep the small "Logo" caption under the avatar.

### 2. Regional settings — new Workspace URL field
- Add a new full-width field at the bottom of the Regional Settings grid (spanning `sm:col-span-2`):
  - Label: **"Workspace URL"**
  - Read-only `Input` with value like `springfield.digit.org` (derive from `state.orgName` slug + `.digit.org`, fallback to `your-org.digit.org`).
  - Right-aligned copy icon button (`Copy` from lucide-react) inside the input via relative wrapper; on click, `navigator.clipboard.writeText(...)` + toast "Copied".
  - Disabled visual treatment (`bg-muted/40 text-muted-foreground cursor-not-allowed`).
  - Helper text below: *"Applicants and employees will access services using this URL."*
- Remove the now-unused empty `{'\n'}` helper paragraph under the Regional settings header.

### 3. Spacing tightening
- Card inner padding: `p-6` → `p-5`.
- Section vertical rhythm: `space-y-5` → `space-y-4`; section internal `space-y-3` → `space-y-2.5`.
- Grid gap: `gap-4` → `gap-3`.
- Reduce header→card gap: `mb-5` → `mb-4`.
- Footer padding: `px-6 py-4` → `px-5 py-3`; keep border-top and muted background.
- Page wrapper: `py-8` → `py-6`.

### 4. Imports
- Add `Copy` from `lucide-react`.
- Add `Input` from `@/components/ui/input`.
- Add `Badge` from `@/components/ui/badge`.
- Add `useToast` from `@/hooks/use-toast`.

## Out of scope
- No changes to OnboardingContext, routing, or other screens.
- No business logic changes — Workspace URL is presentational/derived only.
