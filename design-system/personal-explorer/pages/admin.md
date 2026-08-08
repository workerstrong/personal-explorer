# Admin page override

This page inherits `../MASTER.md` and changes only the workspace experience.

- Pattern: fixed sidebar + content editor + live preview.
- Visual language: editorial utility; cream surfaces, black structure, blue primary action.
- Density: 7/10. Inputs remain at least 44px high and use an 8px spacing rhythm.
- Motion: 3/10. Only status, panel, and preview transitions; 150-250ms and reduced-motion safe.
- Primary action: Publish. Autosave is passive and always exposes a text status.
- Forms: persistent labels, helper text, blur validation, linked error messages, logical fieldsets.
- Responsive: desktop split view; under 900px, explicit Edit/Preview tabs replace simultaneous panes.
- Accessibility: keyboard reachable, visible focus, aria-live save/publish status, no color-only state.
- Anti-patterns: floating glass dashboard, metric-card clutter, unlabeled icons, placeholder-only fields.
