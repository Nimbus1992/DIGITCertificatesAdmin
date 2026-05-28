## Plan: Update favicon to uploaded shield image

### Goal
Replace the browser tab icon (favicon) in `index.html` with the uploaded shield crest image.

### Steps
1. Copy `user-uploads://image-5.png` to `public/favicon.png`.
2. Delete the existing `public/favicon.ico` (browsers auto-request `/favicon.ico` and it would override).
3. Update `index.html` line ~28:
   - From: `<link rel="icon" type="image/x-icon" href="/favicon.ico">`
   - To: `<link rel="icon" type="image/png" href="/favicon.png">`

### Notes
- Hard refresh may be needed to see the new favicon (browsers cache aggressively).
