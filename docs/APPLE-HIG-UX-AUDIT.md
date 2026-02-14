# Apple-style UI/UX audit and recommendations

Based on Apple Human Interface Guidelines (macOS), design principles (Clarity, Deference, Depth), and common research-backed practices.

---

## What we're doing well

- **System font stack** – `-apple-system, BlinkMacSystemFont` gives native typography on macOS.
- **Custom title bar** – `hiddenInset` + traffic lights with sensible position; Windows frameless with min/max/close.
- **Keyboard support** – Shortcuts (e.g. Copy), Escape to close dialogs; consider Tab order and focus trapping in modals.
- **Focus visibility** – Buttons/inputs use `focus-visible:ring` so keyboard users see where focus is.
- **Feedback** – Copy confirmation (“Copied”), hover states, selected state in sidebar/list.
- **Reduced motion** – `prefers-reduced-motion: reduce` respected globally (animations/transitions minimized).
- **Scrollbars** – On macOS, scrollbars hidden by default; content takes precedence.
- **Consistency** – Single Settings surface, consistent patterns for Edit/Settings (full-screen dialogs, same header style).

---

## Gaps and improvements

### 1. Typography and hierarchy (Clarity)

- **Title / body scale** – Use a clear type scale (e.g. 11/13/15/17px) and avoid one-off sizes. Ensure sufficient contrast (WCAG AA).
- **Line length** – Long lines in Edit/Settings should be capped (e.g. max-width ~65ch) for readability.
- **Label alignment** – Settings/forms: labels and controls aligned (we do left-align title/subtitle and close; keep that pattern everywhere).

### 2. Deference (content first)

- **Sidebar vs content** – Sidebar is already secondary (muted bg). Ensure list and detail panels don’t compete; selected state and “Copied” placement (e.g. bottom-right of card) help.
- **Empty states** – “No prompts yet” is good; add a short primary action (e.g. “Create your first prompt”) where it makes sense.
- **Dialogs** – Full-screen sheets with minimal chrome keep focus on content; avoid extra decorative elements.

### 3. Depth and hierarchy

- **Elevation** – Use subtle borders/shadows to separate title bar, sidebar, and content (already using borders; avoid overdoing shadows).
- **Lists** – Dividers and hover/selected states are clear; ensure focus ring is visible when navigating with keyboard.

### 4. Interaction and feedback

- **Click targets** – Buttons and list rows should be at least ~44pt where possible (sidebar nav, list rows, TopBar actions).
- **Loading** – If any async actions (save, delete, load) can take time, show a brief loading or “Saving…” state (e.g. auto-save already has Saving/Saved).
- **Destructive actions** – Delete in context menu is good; keep confirmation for destructive ops. Consider moving “Delete” to the end of the menu and using destructive styling (red) consistently.

### 5. Accessibility (Apple HIG + a11y)

- **Live regions** – “Copied” uses `aria-live="polite"` so screen readers announce it.
- **Labels** – All icon-only buttons should have `aria-label` (e.g. “Search”, “Edit”, “Minimize”, “Close”).
- **Focus trap** – In Settings and Edit dialogs, trap focus inside the modal and restore it on close; ensure Escape closes.
- **Contrast** – Muted text and borders should meet contrast guidelines in both light and dark themes.

### 6. Platform specifics (macOS)

- **Traffic lights** – Position (e.g. `y: 12`) should match system feel; no need to deviate from system spacing.
- **Scrollbars** – Hidden on macOS; visible on Windows/Linux is appropriate.
- **Window size** – Default size and min size are reasonable; consider remembering last bounds (optional).

### 7. Things to avoid

- **Heavy animation** – Avoid large motion on open/close; fade or minimal movement is enough (we use no slide/zoom on full-screen dialogs).
- **Dense controls** – Don’t pack too many actions into one row; TopBar and list row actions are already scoped.
- **Redundant chrome** – No extra toolbars or duplicate actions; single Settings and single Edit flow is good.

---

## Quick checklist for future changes

- [x] Empty state has primary actions (New prompt, Paste from clipboard).
- [x] List rows and sidebar nav use min ~44px touch targets.
- [x] Context menu: Copy / Edit, then separator, then Delete (destructive at end).
- [x] Edit and Settings content capped at max-w 65ch for readability.
- [x] Dialog close buttons have larger hit area (min 36px).
- [ ] New interactive elements have keyboard access and visible focus.
- [ ] New copy/feedback uses live region or equivalent for screen readers.
- [ ] Destructive actions are clearly marked and confirmed where appropriate.
- [ ] Spacing and type scale stay consistent with existing layout.
- [ ] Motion respects `prefers-reduced-motion`.

This doc can be updated as the app evolves and new patterns are adopted.
