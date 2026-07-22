# @ui-base/core

**Version:** `0.1.0`  
**Package path:** `packages/ui-base-core`

## Purpose

Shared UI Base Web Component base classes, accessibility helpers, validation, localization, and utilities.

## When to use it

Use this package when a project needs the components, styles, or utilities listed below without copying implementation code into the application.

## Primary imports

```js
import '@ui-base/core';
```

## Components

- No custom element components are exported directly from this package.

## CSS files

- None.

## Supporting modules

- `src/base-element.js`
- `src/localization.js`
- `src/metadata.js`
- `src/utils.js`
- `src/validation.js`

## Package exports

- `.` -> `./src/index.js`
- `./base` -> `./src/base-element.js`
- `./utils` -> `./src/utils.js`
- `./validation` -> `./src/validation.js`
- `./localization` -> `./src/localization.js`
- `./metadata` -> `./src/metadata.js`

## Notes

- Keep package-specific behavior in this package and consume it through npm imports.
- Prefer Web Component attributes/properties for application configuration.
- Keep app-specific data and ORM integration in the calling application or provider layer.
