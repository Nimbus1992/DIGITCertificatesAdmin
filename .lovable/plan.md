## Document Designer — wire form fields as document variables

### Problem

Today `DocumentDesigner.tsx` has a hardcoded `DYNAMIC_VARS` list (11 items like `businessName`, `licenseNumber`, etc.). Dynamic elements can only be mapped to those. The actual form is built per-service in FormBuilder and stored via `loadFormSteps(serviceId, moduleName)`. That means the Source Mapping dropdown is disconnected from the real fields users see — and the seeded **Application PDF** only includes a handful of variables instead of the full submitted form.

### Goal

1. Source Mapping for any dynamic element shows **every field from the current service's form**, grouped by step/sub-screen, plus a small set of system variables (application number, dates, license number, status).
2. The seeded **Application PDF** auto-populates with one labeled field per form field, so a freshly created service immediately has a complete PDF.

### Changes (single file: `src/components/service-config/DocumentDesigner.tsx`)

#### 1. Build the variable catalog from the live form

- Read the current service form on mount and whenever it changes:
  ```ts
  const { serviceId } = useParams();
  const issuance = loadFormSteps(serviceId ?? "", "Issuance");
  // listen for FORM_UPDATED_EVENT and refresh
  ```
- Flatten into a list of `{ value: field.id, label: field.label, group: `${step.name} › ${sub.title}` }`.
- Merge with a small **System Variables** group (kept from today): `applicationNumber`, `licenseNumber`, `approvalDate`, `expiryDate`, `applicationStatus`, `submittedOn`, `applicantName` (fallback).
- Replace `DYNAMIC_VARS` usage with this dynamic list. Render the Select with grouped `SelectGroup` + `SelectLabel` so users can scan by step.
- If a previously mapped field no longer exists (form edited), show it as "(removed) {id}" so it's still visible and can be re-mapped.

#### 2. Auto-populate the Application PDF on first creation

- Today `docs[1]` (Application PDF) is hand-written with ~6 dynamic rows. Replace its seed `elements` with a generator:
  ```ts
  buildApplicationPdfElements(formSteps) → DocumentElement[]
  ```
  which produces:
  - Header text "Application Form" + system row (App No., Submitted On).
  - For each step → a section heading (`text`, bold).
    - For each sub-screen → optional sub-heading.
      - For each field → a two-column row: label (`text`) on the left, dynamic placeholder (`dynamic`, `sourceMapping: field.id`, `content: "{field.id}"`) on the right. Auto-layout y, pagination by stacking; canvas already scrolls vertically.
  - Footer with signature placeholder.
- Run the generator only when the service has no saved Application PDF yet (i.e., during the initial seed in `useState` init). Existing saved docs are left untouched so user edits are preserved.

#### 3. Add a "Sync with form" action for Application PDF

- On the Application PDF doc only, add a small `Sync with form` button in the doc toolbar that re-runs `buildApplicationPdfElements` for the latest form. Confirm via existing `AlertDialog` ("This replaces the current Application PDF layout. Continue?"). This is how users pick up new form fields after editing the form.

#### 4. Misc

- When inserting a new Dynamic element from the toolbar, default `sourceMapping` to the first available form field (instead of hardcoded `businessName`).
- Keep VC `idMapping` options as today; not in scope.

### Out of scope

- Backend, storage schema, PDF rendering pipeline. The actual PDF generation (e.g., `applicationPdf.ts`) is not touched — this change is purely the designer's variable catalog and the seed of the Application PDF template.
- Renewal-form variables: Issuance form only, since one document set is shared. Can revisit if needed.
