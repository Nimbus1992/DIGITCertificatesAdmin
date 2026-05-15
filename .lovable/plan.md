# Make field deletion discoverable in Form Builder

## Problem

`FormBuilder.tsx` already has a working `deleteField` handler, but the only UI that calls it is a small `X` icon in the right-side "Fields in this sub-screen" list. When a field is selected, the right panel switches to "Field Properties" and the list (with its delete `X`) is no longer visible — so there is no obvious way to delete the currently selected field. Users assume delete is broken.

## Changes (single file: `src/components/service-config/FormBuilder.tsx`)

1. **Hover delete on canvas cards.** In `renderCanvasField`, add a small `Trash2` button positioned top-right on each field card. Use the existing `group` class plus `group-hover:opacity-100 opacity-0` so it appears on hover or when the card is selected. `onClick` calls `deleteField(field.id)` with `e.stopPropagation()`.

2. **Delete button in Field Properties panel.** At the bottom of the field-level properties block (around line 793, inside the `selectedField` branch), add a full-width destructive outline button: "Delete Field" with a `Trash2` icon, calling `deleteField(selectedField.id)`.

3. **Keyboard shortcut.** Add a `useEffect` that listens for `Delete` / `Backspace` on `window` and calls `deleteField(selectedFieldId)` when a field is selected and the active element is not an input/textarea/contenteditable (so typing in property inputs is unaffected).

4. **Toast confirmation.** After each deletion, fire `toast({ title: "Field deleted" })` for feedback (matching the existing pattern used by `deleteStep`).

No changes to storage, data model, or other components.
