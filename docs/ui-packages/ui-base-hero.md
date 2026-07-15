# @ui.base/hero

**Version:** `0.2.3`  
**Package path:** `packages/ui-base-hero`

## Purpose

Framework-neutral UI Base Hero Web Component for landing pages and tour pages.

## When to use it

Use this package when a project needs the components, styles, or utilities listed below without copying implementation code into the application.

## Primary imports

```js
import '@ui.base/hero';
// <uib-hero></uib-hero>
```

## Components

- `<uib-hero></uib-hero>`

## CSS files

- None.

## Supporting modules

- `src/defaults.js`

## Package exports

- `.` -> `./src/index.js`
- `./uib-hero` -> `./src/uib-hero.js`
- `./defaults` -> `./src/defaults.js`

## Notes

- Keep package-specific behavior in this package and consume it through npm imports.
- Prefer Web Component attributes/properties for application configuration.
- Keep app-specific data and ORM integration in the calling application or provider layer.
