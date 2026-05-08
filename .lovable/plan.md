## Goal

Redesign the **employee dashboard** (`EmployeeHome.tsx`) to match the clean, enterprise government-operations look in the reference screenshot — restrained colors, compact spacing, structured tables — while keeping all current functionality. **All numbers, statuses, and rows are derived live from `usePreview()` state** (no hardcoded values, no mock counts).

Applies to all employee roles: Document Verifier, Field Inspector, Approver. Header role label adapts to current role.

## Scope

Single file rewrite: `src/components/preview/employee/EmployeeHome.tsx`.
No changes to `PreviewContext`, routing, `InboxView`, or any data model.

## Dynamic data sources (everything on screen)

All values are computed from `applications` in `PreviewContext` — which already updates as citizens submit and as employees act on applications via `transitionApplication`, `payApplication`, `issueLicense`, etc.

| UI element | Source |
|---|---|
| Role label (top eyebrow) | `role` from context |
| Total Applications count | `applications.length` |
| Pending Review count | `applications.filter(a => rolePendingStates[role].includes(a.currentStateId)).length` |
| Approved count | `applications.filter(a => ["s6","s9"].includes(a.currentStateId)).length` |
| Rejected count | `applications.filter(a => a.currentStateId === "s8").length` |
| Business License "pending review" count | same `rolePendingStates[role]` filter (or all in-progress states for the service) |
| Business License Inbox CTA count | same as above |
| Building Permit / Event Permit | static `0` + disabled (no service in data yet) |
| Recent Activity rows | latest N applications sorted by most recent `timeline[last].at`, mapped live |
| Applicant column | `app.formData.fullName` (fallback `"—"`) |
| Service column | `serviceName` from context |
| Status pill | bucket derived from `app.currentStateId` |
| Last Updated | most recent `timeline[*].at` formatted |
| Action label | `Review` if status bucket === pending, else `View` |

If `applications.length === 0`, all metrics render `0`, table shows a single neutral "No recent activity yet." row, and the Inbox CTA shows `Inbox · 0`.

## Layout

```text
DOCUMENT VERIFIER                                ← role eyebrow
Licenses & Permits                               ← h1
Review and process applications across services  ← subtitle

[ Total {n} ] [ Pending {n} ] [ Approved {n} ] [ Rejected {n} ]   ← clickable filter cards

SERVICES
[ Business License · {n} pending · Inbox·{n} ]  [ Building Permit · Soon ]  [ Event Permit · Soon ]

RECENT ACTIVITY                                                    View inbox →
┌ App ID │ Applicant │ Service │ Status │ Last Updated │ Action ┐
│ rows from latest applications…                                  │
└────────────────────────────────────────────────────────────────┘
```

## Visual language

- Background: solid `bg-background` (no gradient, no blobs, no decorative SVGs).
- Cards: `bg-card`, `border border-border`, `rounded-lg`, `p-5`.
- Section labels: uppercase, tracking-wider, `text-xs text-muted-foreground`.
- Status accents only via small dot/icon: green (Approved `s6/s9`), amber (Pending), red (Rejected `s8`), neutral primary (Total / In Progress).
- Typography: h1 `text-3xl font-bold tracking-tight`; subtitle `text-sm text-muted-foreground`.
- Compact table rows (`py-3`), subtle `hover:bg-muted/40`.

## Metric cards (click-to-filter, dynamic counts)

Four equal cards in a 4-column grid. Each card:
- Top row: label (`text-sm text-muted-foreground`) + small status icon top-right (FileText / Clock / CheckCircle2 / XCircle) tinted with the accent color.
- Big number: `text-4xl font-bold` driven by the live count above.
- Hover: border shifts to accent; `cursor-pointer`.
- onClick → `setScreen({ type: "inbox", filterStates, filterLabel })`:
  - Total → no filter
  - Pending → `rolePendingStates[role]`
  - Approved → `["s6","s9"]`
  - Rejected → `["s8"]`

## Services section (3 cards)

- **Business License** (active): icon tile, title, dynamic subtitle `"{N} pending review"`, primary CTA `Inbox · {N}` → `setScreen({ type: "inbox" })`. Small icon button (BarChart3) beside it.
- **Building Permit / Event Permit**: muted, subtitle `"No pending items"`, disabled `Inbox · 0` button.

## Recent Activity table (dynamic rows)

Columns: `APPLICATION ID` · `APPLICANT` · `SERVICE` · `STATUS` · `LAST UPDATED` · `ACTION`.

- Source: `applications` sorted by latest `timeline[*].at`, slice top 6.
- Status bucket helper `mapStateToBucket(stateId)`:
  - `s1`, `s_dv`, `s_ip`, `s3` → **Pending Review** (amber)
  - `s4`, `s5`, `s7` → **In Progress** (blue)
  - `s6`, `s9` → **Approved** (green)
  - `s8` → **Rejected** (red)
- Action: `Review` for Pending Review bucket, `View` otherwise. Both → `setScreen({ type: "application_review", applicationId })`.
- `View inbox →` link top-right → `setScreen({ type: "inbox" })`.
- Empty state: single row "No recent activity yet."

## Technical notes

- Touched file: `src/components/preview/employee/EmployeeHome.tsx` only.
- Imports added: `Table*` from `@/components/ui/table`, `FileText`, `Clock`, `CheckCircle2`, `XCircle`, `BarChart3`, `Building2`, `CalendarDays`, `Store`.
- Imports dropped: `WorkbenchIllustration`, `CornerBlob`, `IndianRupee`, `Activity`, gradient-only icons.
- All counts and rows wrapped in `useMemo` keyed on `applications` and `role` so they re-render automatically whenever a citizen submits or an employee performs a transition.
- No new state, no new context fields, no static fixtures.

## Out of scope

- Inbox/ApplicationReview redesign.
- Adding real Building/Event Permit services (they remain disabled placeholders).
- Backend, schema, or workflow changes.
