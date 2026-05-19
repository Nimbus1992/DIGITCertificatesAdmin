## Document Designer — three changes

### 1. Gate Verifiable Credential on QR presence

In `DocumentDesigner.tsx`, the Verifiable Credential section in the right-side Document Settings panel currently shows the "Enable VC" toggle unconditionally and has a standalone "Include QR Code" switch. VCs only make sense if a QR code carries them, so:

- Compute `qrElements = activeDoc.elements.filter(e => e.type === "qrcode")`.
- **No QR on canvas:** hide the Enable VC toggle and show a muted helper line: *"Add a QR Code element to the document to enable Verifiable Credential."* If VC was previously enabled and the last QR was just removed, auto-disable VC and clear `mappedQrElementId`.
- **QR present:** show Enable VC. When enabled, render existing fields (Credential Type, Credential ID Mapping, Verification URL) plus a new **"Mapped QR Element"** dropdown listing each QR (label e.g. *"QR Code 1 (x, y)"*). Auto-select when there is only one QR.
- Remove the standalone "Include QR Code" switch — QR presence + mapping replaces it.
- Extend the `verifiableCredential` shape with `mappedQrElementId: string | null`. Keep the old `includeQR` field for back-compat but stop reading/writing it from the UI.
- When an element is deleted, if it matches `mappedQrElementId`, clear the mapping (and disable VC if no QRs remain).

### 2. Drop "Document Type" from the Create Document modal

The Document Type select in the create dialog (lines ~1122–1135) doesn't drive any template or canvas content — it only sets an icon and sub-label. It forces a meaningless decision up front.

- Remove the Document Type Select from the create modal and the `newDocType` state.
- New documents default to `type: "custom"`. Add `custom` to `DOC_TYPE_LABELS` ("Custom") and `DOC_TYPE_ICONS` (`FileText`).
- Keep the Document Type field in the right-side Document Settings panel (line ~1035) so users can re-categorize later if they want. Seeded documents are untouched.

### 3. Fix Edit / Duplicate / Delete overlapping the document name

In the left Documents list (lines ~735–769), the action buttons are absolutely positioned at `right-2 top-2` and appear on hover, so long names render under the icons.

- Restructure the row to a flex layout where the action cluster is a sibling element with `opacity-0 group-hover:opacity-100` and `shrink-0`, not absolutely positioned. The name area keeps `flex-1 min-w-0` + `truncate` so it shortens automatically when icons are visible, and there is no overlap on focus/keyboard reveal either.

### Scope

Single file: `src/components/service-config/DocumentDesigner.tsx`. No storage-schema migration beyond the added `mappedQrElementId` field landing in the same `localStorage` blob. No business-logic or backend changes.
