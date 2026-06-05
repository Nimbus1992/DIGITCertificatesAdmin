## Change

In `src/pages/TemplatesDashboard.tsx`, the **Continue configuring** CTA on draft cards currently re-opens the template setup wizard (`/templates/:templateId/setup?serviceId=...`). Switch it to open the existing service workspace with the tabbed interface (Overview / Configure / Preview / Monitor and Manage / Users & Access).

## Implementation

- Update `onContinue` on `DraftServiceCard` (line 188) to call `goOverview(s)` instead of `goConfigure(s)`, which navigates to `/service/${s.id}/configure` with `state.mode = "overview"` — the same screen used elsewhere for live/draft services.
- Leave `goConfigure` defined for the template-setup entry points that still need to resume the wizard (e.g., from activate flow).

No other files change. The 4/5-tab `ServiceConfig` page already handles drafts vs. live.