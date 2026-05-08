## Goal

Transform the citizen-facing prototype into a guided, government-grade wizard with consistent page hierarchy: Back link → Wizard progress → Question card → Sticky CTA. Refine UX copy throughout and break dense form sections into 12 sub-screens grouped logically across 5 steps.

## 1. Global page hierarchy

Update `CitizenScreenShell.tsx` so every wizard screen renders in this fixed order:

```text
[ Header (DIGIT) ]
[ ← Back chip       ] ← already exists
[ STEP X OF 5  •  Step Name ]
[ ────── progress segments ────── ]
[ ┌──── White Card ───────────────┐ ]
[ │ Question title                │ ]
[ │ Inputs + helper + inline err  │ ]
[ └───────────────────────────────┘ ]
[ Sticky footer: [Back] [Next →]  ]
```

- `WizardProgress.tsx` already matches the spec (5 segments, non-clickable). Reuse as-is.
- Footer: replace "Skip and Continue" pattern with `Back` + `Next`. `Skip` only appears as an inline secondary link inside specific sub-screens (Step 2 Screen 2, Step 3 Screen 1).

## 2. Screen-by-screen changes

### Service catalogue (`ServiceCatalogue.tsx`)
- Tag chip text → `Citizen Portal` (already correct).
- Subtitle → `Browse services and apply, pay, or download from one place` (drop trailing period to match spec or keep — minor).
- Section label → `Available Services`.
- Trade License card description → `Required for businesses operating within municipal limits`.

### Service detail / home (`CitizenHome.tsx`)
- Header h1 → keep `Apply, Track & Manage`; add small subtitle `Your licenses and permits`.
- Supporting line under search → `Apply for a new license or manage existing ones`.
- Metrics labels: `Total Applications`, `Payments Due`, `Active Licenses` (already present).
- Resume block copy: `Continue where you left off` / `Trade License Application` / `Step X of 5 · <Step Name>` / CTA arrow → `Resume application` (add explicit text label to button).
- Tiles: `Apply` / `My Applications` (`0 applications`) / `My Documents` (`0 documents — Saved documents you can reuse`).

### Instruction screen (`ApplicationIntro.tsx`)
- Already matches spec copy. Confirm CTA = `Start Application`, secondary link = `Save and continue later`. No change needed beyond verifying icons/items match the 5 listed.

### Wizard (`ApplicationForm.tsx`) — major refactor

Replace single-section-per-step with **sub-screens within each step**. Introduce a `subStep` state alongside `currentStep`. Hard-code a sub-screen map (no schema changes to `formSections`); the existing field IDs are reused, only grouped differently for display.

Sub-screen plan (12 wizard screens + Review + Success):

| Step | Sub | Title | Fields |
|------|-----|-------|--------|
| 1 Applicant | 1.1 | Let's start with your name | `fullName` |
| 1 Applicant | 1.2 | How can we reach you? | `mobile`, `email` |
| 1 Applicant | 1.3 | Add your ID details | `idType`, `idNumber` (helper text changes by idType) |
| 2 Business | 2.1 | What kind of business are you running? | `businessName`, `tradeType`, `businessCategory` |
| 2 Business | 2.2 | Who owns the business? + Add a few more details (optional) | `ownershipType`, `employees`, `turnover` — footer shows `Skip` inline link for the optional pair |
| 3 Location | 3.1 | Where is your business located? | Map placeholder (static SVG/image stub with "Long press to drop pin" hint) — `Confirm Location` / `Skip` inline |
| 3 Location | 3.2 | Is this your business address? | `addr1`, `addr2`, `city`, `zone`, `pincode` (with helper "We've filled this based on your location…") |
| 4 Operational | 4.1 | When did your business start? | `startDate` |
| 4 Operational | 4.2 | Tell us a bit about your operations | `shopArea`, `isHazardous`, conditional `hazardType` (same screen) |
| 5 Documents | 5.1 | Upload documents to complete your application | `docId`, `docAddr`, `docBusiness` |
| Review | — | Review your application | All sections, expanded, edit-per-section |
| Declaration | — | Sticky footer with checkbox + Submit | `declaration` |

Wizard mechanics:
- `WizardProgress` shows `step` 1–5 + step name based on `currentStep` (not subStep).
- `Next` validates only the visible sub-screen's fields (subset of section).
- `Back` walks backwards through sub-screens, then crosses step boundaries.
- "Edit" links from Review jump to the relevant sub-screen.
- The standalone `sec-6` declaration section becomes integrated into the Review screen as a sticky-footer checkbox; remove the separate "Declaration" wizard step from the indicator.

### Declaration scroll-to-enable
On the Review screen:
- Track scroll position of the review scroll container.
- Checkbox is `disabled` until `scrollTop + clientHeight >= scrollHeight - 8`.
- `Submit` button is `disabled` until checkbox checked.
- Show small helper text under checkbox while disabled: `Scroll to the bottom to confirm`.

### Success screen (`SuccessScreen.tsx`)
- Title → `Your application has been submitted`.
- Show Application ID with copy-to-clipboard button (lucide `Copy` icon, `toast.success("Copied")`).

## 3. Files to edit

- `src/components/preview/citizen/_shell/CitizenScreenShell.tsx` — ensure footer slot supports the `[Back][Next]` pattern (no structural change; already has `footer` slot).
- `src/components/preview/citizen/ServiceCatalogue.tsx` — copy tweaks.
- `src/components/preview/citizen/CitizenHome.tsx` — subtitle + tile copy.
- `src/components/preview/citizen/ApplicationForm.tsx` — **major rewrite**: introduce sub-step state machine, render via `CitizenScreenShell` + `WizardProgress` with question card + sticky footer, integrate declaration into Review, scroll-gating logic.
- `src/components/preview/citizen/SuccessScreen.tsx` — title + copy ID button.

## 4. Out of scope

- No changes to `PreviewContext` form schema or validation rules — sub-screen grouping is presentational only.
- No real map integration; Step 3.1 uses a static map placeholder with a "Drop pin" affordance.
- Employee screens, payment, license views unchanged.
- No backend or data-model changes.

## 5. Risks

- Sub-screen validation must reuse `validateSection`'s per-field logic on a filtered field list — extracted into a small helper to avoid duplication.
- Resume-draft logic currently keys off `currentStep`; remap to persist `{ currentStep, subStep }` so Resume returns to the exact sub-screen.
- Conditional fields (`hazardType`, dependent dropdowns) must remain on the same sub-screen as the trigger to satisfy the "Do NOT move conditional logic to separate screens" rule.
