# @ui.base/theme

**Version:** `0.1.0`  
**Package path:** `packages/ui-base-theme`

## Purpose

Theme CSS files for UI Base applications using CSS custom property overrides.

## When to use it

Use this package when a project needs the components, styles, or utilities listed below without copying implementation code into the application.

## Primary imports

```js
import '@ui.base/theme/default.css';
```

## Components

- No custom element components are exported directly from this package.

## CSS files

- `src/dark.css`
- `src/default.css`
- `src/sample-tour.css`

## Supporting modules

- None.

## Package exports

- `.` -> `./src/index.js`
- `./default.css` -> `./src/default.css`
- `./dark.css` -> `./src/dark.css`
- `./sample-tour.css` -> `./src/sample-tour.css`

## Notes

- Keep package-specific behavior in this package and consume it through npm imports.
- Prefer Web Component attributes/properties for application configuration.
- Keep app-specific data and ORM integration in the calling application or provider layer.
