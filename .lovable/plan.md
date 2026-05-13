## Goal
Replace the current text-heavy "View details" page for a template with a tight, infographic-style overview. Less prose, more visual structure, and every block populated from the actual template data so nothing on the page is generic filler.

## Layout (single scroll, ~one viewport on desktop)

```text
┌────────────────────────────────────────────────────────────┐
│  [icon]  Business License                  [Use Template]  │
│          One-line description                [Preview]      │
│                                              [Back]         │
├────────────────────────────────────────────────────────────┤
│  AT A GLANCE  (4 stat tiles)                                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │ 2 Flows│ │ 4 Roles│ │ 2 Forms│ │ 5 min  │               │
│  └────────┘ └────────┘ └────────┘ └────────┘               │
├────────────────────────────────────────────────────────────┤
│  HOW IT WORKS  (horizontal stepper, icons + 1-word labels) │
│  Apply → Review → Approve → Issue → Renew                   │
├────────────────────────────────────────────────────────────┤
│  FLOWS               │  ROLES                               │
│  • Application  ▸ 5  │  Citizen · Reviewer ·                │
│  • Renewal      ▸ 5  │  Approver · Admin                    │
│  (collapsible chips) │  (avatar chips, hover = duties)      │
├────────────────────────────────────────────────────────────┤
│  FORMS                  │  NOTIFICATIONS                    │
│  Application · Renewal  │  5 events (bell chips)            │
│  (chips listing field   │                                   │
│   groups)               │                                   │
├────────────────────────────────────────────────────────────┤
│  CUSTOMIZE  (single row of 6 small icon chips)              │
└────────────────────────────────────────────────────────────┘
```

No "What is …" paragraphs, no "You Can Customize Everything" tagline, no "Watch demo" placeholder, no duplicate footer button row.

## Section rules

- **Header** — icon tile, name, one-line description, action row (`Use Template`, `Preview Application` outline, `Back to Templates` ghost). Action row sits on the right at desktop width, stacks under the title on mobile.
- **At a glance** — 4 stat tiles auto-derived: `flows.length`, `roles.length`, `forms.length`, `estimatedSetupTime`. Each tile is one number + one label, no description.
- **How it works** — single horizontal stepper. Steps come from a new `template.howItWorks` array (icon + 1–2 word label). Chevrons between, no card around it.
- **Flows** — for each flow, a row: bold name + small count badge (number of steps). Steps render as inline pill chips beneath, wrapped. No paragraph descriptions.
- **Roles** — horizontal row of role pills (icon + name). Tooltip on hover shows the role's responsibilities. Pulls from `getServiceRoles(template.id)`.
- **Forms** — for each form, name + chip list of field groups. No checkmark bullets.
- **Notifications** — single row of bell chips, one per notification event.
- **Customize** — single row of 6 small icon-only chips with tooltip labels (Forms, Roles, Fields, Workflow, Notifications, Documents). Replaces the verbose "You Can Customize Everything" block.

All sections hide automatically when their data is missing — Coming Soon templates collapse to header + "At a glance" only.

## Data changes — `src/data/serviceTemplates.ts`

Add optional, presentation-only fields:

```ts
howItWorks?: { icon: LucideIcon; label: string }[];   // 4–6 items max
flows?:      { name: string; steps: string[] }[];     // step labels only
forms?:      { name: string; groups: string[] }[];    // field-group names
notifications?: string[];                             // event labels
```

Drop `workflows` and `capabilities` from the previous plan — `flows` already conveys the workflow, and capabilities were redundant with flow steps.

Populate these for `tradeTemplate` only, using the screenshots' content but trimmed:
- `howItWorks`: Apply, Review, Approve, Issue, Renew.
- `flows`: Application (Submit, Upload docs, Review, Decision, Issue) and Renewal (Renew, Verify expiry, Review, Approve, Re-issue).
- `forms`: Application (Business, Owner, Address, Documents), Renewal (License No., Updates, Documents).
- `notifications`: Submitted, Approved, Rejected, Issued, Renewal due.

`buildingPermitsTemplate` and `fireNocTemplate` stay data-light; they render header + stats only.

Roles continue to come from `getServiceRoles(template.id)` — no duplication in template data.

## File changes

- `src/data/serviceTemplates.ts` — extend interface; populate `tradeTemplate`.
- `src/components/onboarding/TemplateIntroduction.tsx` — rewrite as the infographic layout above. Widen container `max-w-2xl` → `max-w-4xl`. Use existing semantic tokens only (no hard-coded colors), Tooltip from `@/components/ui/tooltip` for role/customize chips.

No routing, state, or backend changes. Existing handlers (`onUseTemplate`, `onPreview`, `onBack`) stay as-is.
