## Plan: Rebrand to "City of Cape Town" with new logo

### Changes
1. **Copy logo asset** → `src/assets/city-of-cape-town-logo.png` (from uploaded image).
2. **`src/hooks/useBranding.ts`** — update `DEFAULT_BRANDING`:
   - `portalName: "City of Cape Town"`
   - `logoDataUrl: <imported asset>` (ES6 import at top)
3. **`src/lib/pdfBranding.ts`** — update default `portalName` to `"City of Cape Town"` (PDFs).
4. **`src/components/onboarding/AuthShell.tsx`** line 92 — replace hardcoded `"Government Services Portal"` with `"City of Cape Town"`.

### Coverage
- Sidebar (`AppSidebar`), citizen/employee preview top bars, and Branding Theme page already read from `branding.portalName` / `logoDataUrl`, so they pick up the new default automatically.
- PDFs (license, invoice, demand notice) get the new portal name via `pdfBranding`.

### Notes
- Users who previously set a custom org name/logo via Branding Theme still override the default (precedence: defaults < legacy < platform < service).
