## Changes

### 1) Global header branding
- `AppSidebar.tsx`: Replace dynamic `logoUrl`/`orgName` with hard-coded Cape Town logo (`src/assets/city-of-cape-town-logo.png`) and text "City of Cape Town" with subtitle "Admin Console".
- `AuthShell.tsx`: Already shows Cape Town logo + name — append "— Admin Console" to the header text.

### 2) Template aliases (aka)
- `src/data/serviceTemplates.ts`:
  - Add `aka?: string[]` to `ServiceTemplate` interface.
  - trade-license: `["Trade License","Business Registration","Single Business Permit","Business Operating Permit","Shop License"]`
  - building-permits: `["Construction Permit","Development Permit","Planning Permission","Works Approval"]` (using common synonyms — user message was truncated mid-sentence)
  - fire-noc: `["Fire Safety Certificate","Fire Permit","Fire Safety Approval"]`

### 3) Show aliases in template lists
- `TemplateCard.tsx`: render aka tags as small pills under the description.
- `TemplateIntroduction.tsx`: render aka tags as pills under the name/description block.

### 4) Visual-only action buttons on Template Introduction page
In `TemplateIntroduction.tsx`, add a non-functional `<Button variant="outline" size="sm">` inside each existing card:
- Forms card → "Add/Edit Fields"
- Roles card → "Add/Edit Roles"
- Flows card → "Modify Flows"
- Notifications card → "Add/Edit Notifications"
- Payments card → "Edit Payment Logic"

### 5) Trades table in Master Template Configuration
In `MasterTemplateConfigurator.tsx`, inside the Structure section, after the upload fields, render a `<Table>` listing the parsed categories + subcategories (columns: Category | Subcategory). Subcategories rows show parent in Category column; standalone categories with no subs show "—" in Subcategory column. Only shown when there's data.

### Notes
- All changes are visual/presentation only.
- Building Permit aliases: original user message was cut off — I'll use common synonyms. If you have a specific list, share it and I'll adjust.
