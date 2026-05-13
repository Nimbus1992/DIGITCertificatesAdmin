## Refactor Modules row → secondary workspace navigation

**File:** `src/pages/ServiceConfig.tsx` (lines ~263-288)

### Changes

1. **Remove the "Modules" uppercase label.** The nav itself communicates context.
2. **Drop pill/chip styling.** Replace `rounded-full bg-muted/bg-accent` buttons with a flat tab bar: a thin bottom border container with underline-on-active items.
3. **Remove the Check/AlertCircle icons** from each module button. Status no longer rides along with navigation. (If status indication is still desired, replace with a tiny 6px neutral dot — but default is to remove entirely for calmer hierarchy.)
4. **Active state:** `text-foreground font-medium` + 2px primary underline (`border-b-2 border-primary -mb-px`).
   **Inactive state:** `text-muted-foreground hover:text-foreground` with transparent bottom border. Still fully clickable (not disabled-looking).
5. **Spacing:** items use `px-1 py-3` with `gap-6` between, sitting on a container with `border-b border-border/60`. No background fills.
6. Keep the existing `setSelectedModule` + `setActiveTile(null)` click behavior and the `modules` data source unchanged.

### Resulting markup sketch

```tsx
<nav className="flex items-center gap-6 border-b border-border/60">
  {modules.map((m) => {
    const isActive = m.id === selectedModule;
    return (
      <button
        key={m.id}
        onClick={() => { setSelectedModule(m.id); setActiveTile(null); }}
        className={`-mb-px border-b-2 px-1 py-3 text-sm transition-colors ${
          isActive
            ? "border-primary text-foreground font-medium"
            : "border-transparent text-muted-foreground hover:text-foreground"
        }`}
      >
        {m.name}
      </button>
    );
  })}
</nav>
```

### Out of scope

- `moduleStatusGlyph` helper stays defined (used only here today); can be removed if confirmed unused after the change.
- No changes to Setup Journey, header, or other sections.
