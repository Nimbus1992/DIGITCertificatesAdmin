## Refine Step 3 (Structure) of Template Setup

Two small UX improvements to `src/components/template-setup/Step3Structure.tsx`.

### 1. Conditional subcategories question
- Only render the "Do you have license subcategories?" card when `hasCategories === true`.
- When `hasCategories` is `false` or `null`, hide the subcategories card entirely and treat subcategories as not applicable.
- Update the Continue button's disabled rule:
  - Disabled if `hasCategories === null`
  - If `hasCategories === true`, also require `hasSubcategories !== null`
  - If `hasCategories === false`, allow continue regardless of subcategories
- When the user toggles categories from Yes → No, reset `hasSubcategories` and `subcategoriesFile` so stale state isn't carried forward.
- Wrap the subcategories card in `animate-accordion-down` for a smooth reveal, matching the existing dropzone reveal style.

### 2. Sample file format download
- Add a small "Download sample file" link inside each `Dropzone` (categories and subcategories), shown alongside the "CSV or Excel" hint.
- Generate the sample as a CSV blob on the fly (no new asset files, no dependencies):
  - Categories sample: header `Category Name, Code, Description` with 3 example rows (Retail, Manufacturing, Hospitality).
  - Subcategories sample: header `Subcategory Name, Parent Category, Code, Description` with 3 example rows (Restaurant → Hospitality, Bakery → Retail, Garment Factory → Manufacturing).
- Use a `<button>` styled as a link (`text-accent underline-offset-2 hover:underline`) with a `Download` lucide icon. Clicking creates a Blob, triggers an `<a download>` click, and revokes the URL.
- Helper extracted as a local `downloadSample(filename, csv)` function inside the file to keep both dropzones DRY.

### Out of scope
- No changes to parent `TemplateSetup.tsx` state shape — existing props remain. Reset of subcategories happens via the `setHasCategories` wrapper inside Step3.
- No changes to other steps, routing, or downstream configurator.

### Technical notes
- All styling continues to use semantic tokens (`text-accent`, `text-muted-foreground`, etc.).
- Sample CSV strings are inline constants at the top of the file.
- New imports: `Download` from `lucide-react`.
