## Goal
When a question's field type is Dropdown, Radio, or Checkbox in the Checklist builder, allow the configurator to define the selectable options for that question.

## Changes (single file: `src/components/service-config/ChecklistBuilder.tsx`)

1. **Options editor sub-section** inside each question card, shown only when `fieldType` is `dropdown`, `radio`, or `checkbox`.
   - Renders a vertical list of option rows. Each row: a small index marker, an `Input` for the option label, and a trash icon to remove.
   - "Add option" outline button below the list.
   - When the field type switches to one of these three, auto-seed with two empty options (`["", ""]`) if `options` is missing/empty so the user sees the editor immediately.
   - When the field type switches to `text` or `file_upload`, clear `options` to `undefined`.

2. **Helpers** added inside the component:
   - `addOption(checklistId, questionId)` — append `""`.
   - `updateOption(checklistId, questionId, index, value)` — replace at index.
   - `removeOption(checklistId, questionId, index)` — splice; keep a minimum of 1 row (disable trash when only 1 left).

3. **Field-type change handler** wraps `updateQuestion` so it also resets/initializes `options` per rule above (instead of calling `updateQuestion` directly from the `Select`).

4. **Visual summary**: on the question header row, when options exist, show a tiny muted count (e.g. `3 options`) next to the type badge.

## Out of scope
- No changes to seed templates, preview rendering, or the checklist runtime dialog. Existing seeded questions already carry `options` and continue to work.
- No validation beyond the min-1 row rule (empty option strings are allowed while editing).
