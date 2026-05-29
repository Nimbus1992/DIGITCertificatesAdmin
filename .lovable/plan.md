## Overview: Use Template Name in Description

In `src/components/service-config/OverviewWorkspace.tsx`, the hero description currently references the dynamic `service.name`:

> "This service has been generated successfully from the **{service.name}** template."

This is misleading because `service.name` is the user-customized service title, not the template it was created from.

## Change

1. Import the `allTemplates` array and `ServiceTemplate` type from `@/data/serviceTemplates`.
2. Add a small lookup helper that resolves `service.templateId` → the template's `name` (e.g. "Business License").
3. Replace the `{service.name}` reference in the description paragraph with the resolved template name.
4. Add a graceful fallback (e.g. "selected template") if the template lookup fails.

## Out of scope
- No other UI changes.
- No state or data model changes.

## Files
- `src/components/service-config/OverviewWorkspace.tsx`