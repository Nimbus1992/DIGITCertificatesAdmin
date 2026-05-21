## Fix scroll on Notifications screen (+ optional WorkflowDesigner loop)

### Issue
On `/service/:id/configure → Create Notifications`, the page does not scroll. `ServiceConfig.tsx` wraps every configurator in `flex-1 min-h-0 overflow-hidden`, but `NotificationsManager.tsx` uses `min-h-screen` with no internal scroll region, so the content gets clipped instead of scrolling.

### Fix
**`src/components/service-config/NotificationsManager.tsx`** (presentation only)
- Change root wrapper from `min-h-screen bg-background` to `h-full flex flex-col bg-background`.
- Add `shrink-0` to the `<header>`.
- Replace `<main className="max-w-6xl mx-auto px-6 py-6 space-y-5">` with:
  ```tsx
  <main className="flex-1 min-h-0 overflow-y-auto">
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
      {/* existing children */}
    </div>
  </main>
  ```
- No changes to logic, state, storage, or any other file.

### Optional companion fix — WorkflowDesigner infinite loop
Console shows `Maximum update depth exceeded` originating at `WorkflowDesigner.tsx:277` writing through `useModuleState` (moduleStorage.ts:44). A `useEffect` is calling `setState` with a freshly-built array on every render, so `useModuleState` persists → state change → re-render → repeat.

Fix: in that effect, compare against current state (or guard with a ref) before calling the setter, and ensure the dependency list does not include a freshly-allocated object. One file (`WorkflowDesigner.tsx`), ~10 lines.

### Out of scope
ServiceConfig shell refactor, badge unification, module-tab filtering — those stay in the larger plan we discussed.

### Question
Should I apply only the Notifications scroll fix, or both fixes in this turn?