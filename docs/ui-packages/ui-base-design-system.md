# @ui-base/design-system

**Version:** `0.1.0`  
**Package path:** `packages/ui-base-design-system`

## Purpose

UI Base design system principles, tokens, accessibility standards, component specification template, and governance documentation.

## When to use it

Use this package when a project needs the components, styles, or utilities listed below without copying implementation code into the application.

## Primary imports

```js
import '@ui-base/design-system';
```

## Components

- No custom element components are exported directly from this package.

## CSS files

- `src/a11y.css`
- `src/tokens.css`

## Supporting modules

- None.

## Package exports

- `.` -> `./src/index.js`
- `./tokens.css` -> `./src/tokens.css`
- `./a11y.css` -> `./src/a11y.css`

## Notes

- Keep package-specific behavior in this package and consume it through npm imports.
- Prefer Web Component attributes/properties for application configuration.
- Keep app-specific data and ORM integration in the calling application or provider layer.
