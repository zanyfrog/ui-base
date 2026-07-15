# @ui.base/icons

**Version:** `0.1.0`  
**Package path:** `packages/ui-base-icons`

## Purpose

UI Base SVG icon registry, URL icon support, and the uib-icon Web Component.

## When to use it

Use this package when a project needs the components, styles, or utilities listed below without copying implementation code into the application.

## Primary imports

```js
import '@ui.base/icons';
```

## Components

- `<uib-icon></uib-icon>`

## CSS files

- None.

## Supporting modules

- `src/icon-registry.js`

## Package exports

- `.` -> `./src/index.js`
- `./icon` -> `./src/uib-icon.js`
- `./registry` -> `./src/icon-registry.js`

## Notes

- Keep package-specific behavior in this package and consume it through npm imports.
- Prefer Web Component attributes/properties for application configuration.
- Keep app-specific data and ORM integration in the calling application or provider layer.
