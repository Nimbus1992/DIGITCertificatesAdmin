## Add new category from trades table

In `MasterTemplateConfigurator.tsx`, inside the existing trades table (`setup.hasCategories && categoriesList.length > 0` block):

1. Add local state `newCategory: string` for the inline input.
2. Append a footer row to the `<Table>` containing:
   - `<TableCell>` with an `<Input>` (placeholder "Add category…", Enter key submits)
   - `<TableCell>` with a ghost icon `<Button>` showing a `Plus` icon (lucide-react)
3. On submit: trim, dedupe (case-insensitive) against `categoriesList`, then `setSetup(s => ({ ...s, categoriesList: [...(s.categoriesList ?? []), trimmed] }))`, clear input. Show toast on duplicate/empty.
4. If `setup.hasSubcategories`, leave the subcategory column of the new row blank — the new category just has no subs yet (existing render logic handles `subs.length === 0` with "—").

No changes to subcategories, CSV upload flow, save logic, or other files. Visual + state only; persists on existing "Save" action.
