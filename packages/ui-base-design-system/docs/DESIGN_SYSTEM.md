# UI Base Design System

The UI Base Design System defines how reusable UI Base applications should look, behave, and evolve.

## Principles

1. **Accessible by default**: Components expose semantic markup, keyboard support, focus management, labels, descriptions, and validation state.
2. **Framework neutral**: Components are Web Components that can be used from plain HTML, React, Angular, Vue, Blazor, or server-rendered pages.
3. **Convention over configuration**: Every component follows shared naming, events, slots, CSS parts, and attributes.
4. **Responsive by default**: Components should work on desktop, tablet, and mobile without requiring every application to write custom media queries.
5. **Themeable by token**: Components use CSS custom properties instead of hard-coded styling.
6. **Stable lifecycle**: Components move from experimental to preview to stable before applications depend on them widely.

## Package roles

- `@ui-base/core`: base classes, accessibility helpers, localization, validation, and utilities.
- `@ui-base/design-system`: principles, tokens, standards, and documentation.
- `@ui-base/theme`: CSS theme files that set or override design tokens.
- `@ui-base/icons`: embedded SVG icon registry, URL icon support, and `uib-icon`.
- `@ui-base/ui`: reusable UI, navigation, layout, feedback, and overlay components.
- `@ui-base/forms`: form layout, validation, field wrappers, and input components.
- `@ui-base/calendar`: calendar views and scheduling components.
- `@ui-base/testing`: future test helpers and accessibility checks.
- `@ui-base/cli`: future command-line utility for creating, upgrading, and diagnosing UI Base apps.
