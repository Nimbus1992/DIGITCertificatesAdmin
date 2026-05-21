## 1. Enlarge mobile device preview

**`src/components/preview/MobileFrame.tsx`**
- Replace fixed `max-h-[750px] aspect-[375/750]` with responsive sizing:
  - Container: `h-full w-full flex items-center justify-center` with `py-6` (was `py-4`).
  - Device: use inline `style={{ height: 'clamp(720px, 85vh, 920px)' }}` and derive width from the iPhone aspect ratio (`aspectRatio: '375 / 812'`).
  - Increase shadow (`shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]`) and bump bezel padding to `p-3.5` so the frame scales proportionally.
  - Notch and home indicator already absolutely positioned — keep, they scale naturally.
- Result: phone is ~20% larger on typical screens, occupies up to 85vh, never clips on short screens (min 720, max 920), and remains aspect-correct.

**`src/components/preview/ServicePreview.tsx`**
- In the mobile branch of `PreviewContent`, change wrapper from `flex-1 bg-[#444] overflow-hidden` to `flex-1 bg-[#444] overflow-auto flex items-center justify-center` so the phone stays perfectly centered and small viewports can scroll instead of clip.
- No change to desktop/tablet branch.

## 2. Map permissions to roles (Users & Access)

The defaults already exist in `DEFAULT_ROLE_PERMISSIONS`, but two issues make roles look "unmapped":
- Stale localStorage from earlier sessions can hold empty permission maps.
- Role cards on the Roles tab show no permission summary, so users can't see what's mapped without opening the sheet.

**`src/data/usersAccess.ts`**
- Bump `STORAGE_KEY` from `users-access:v1` → `users-access:v2` to reset stale state once.
- Export a small helper `getRolePermissions(roleId, override?)` that merges `DEFAULT_ROLE_PERMISSIONS[roleId]` with any saved overrides so missing keys always fall back to the seeded default (never blank).
- Export `summarizePermissions(perms)` returning `{ enabled: number; total: number; topGroups: string[] }` — counts any level !== "none" and lists up to 3 group labels with at least one enabled permission. Used on role cards.

**`src/pages/UsersAccess.tsx`**
- When loading persisted state, deep-merge `rolePerms` with `DEFAULT_ROLE_PERMISSIONS` so every role always has a complete permission map even if saved data is partial.
- Pass `getRolePermissions(activeRole.id, state.rolePerms[activeRole.id])` to `RoleDetailSheet` instead of `|| {}`.
- On each role card, add a compact permission summary line between the user-count row and the action buttons:
  - `Shield` icon + `"{enabled}/{total} permissions"` + up to 3 small group badges (e.g. `Documents`, `Workflow`, `Reports`).
  - Uses `text-xs text-muted-foreground`, tight spacing — matches the existing card density.

**`src/components/users-access/RoleDetailSheet.tsx`**
- No behavior change needed; it already reads `permissions[p.key] || "none"`, which will now receive a full map.

## Out of scope

- No backend / RLS changes.
- No new permission keys; only mapping + display fixes.
- Sidebar, routes, and other pages untouched.
