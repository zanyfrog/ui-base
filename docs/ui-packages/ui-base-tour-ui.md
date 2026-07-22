# @ui-base/tour-ui

**Version:** `0.1.1`  
**Package path:** `packages/ui-base-tour-ui`

## Purpose

Framework-neutral UI Base tour reservation Web Components.

## When to use it

Use this package when a project needs the components, styles, or utilities listed below without copying implementation code into the application.

## Primary imports

```js
import '@ui-base/tour-ui';
```

## Components

- `<uib-book-group-reservation></uib-book-group-reservation>`
- `<uib-cancel-reservation></uib-cancel-reservation>`
- `<uib-find-reservation></uib-find-reservation>`
- `<uib-new-reservation></uib-new-reservation>`

## CSS files

- None.

## Supporting modules

- `src/reservations/base-tour-reservation.js`

## Package exports

- `.` -> `./src/index.js`
- `./new-reservation` -> `./src/reservations/uib-new-reservation.js`
- `./cancel-reservation` -> `./src/reservations/uib-cancel-reservation.js`
- `./find-reservation` -> `./src/reservations/uib-find-reservation.js`
- `./book-group-reservation` -> `./src/reservations/uib-book-group-reservation.js`

## Notes

- Keep package-specific behavior in this package and consume it through npm imports.
- Prefer Web Component attributes/properties for application configuration.
- Keep app-specific data and ORM integration in the calling application or provider layer.
