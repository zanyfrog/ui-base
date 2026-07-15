# @ui.base/ui

**Version:** `0.5.1`  
**Package path:** `packages/ui-base-ui`

## Purpose

Framework-neutral UI Base UI primitives with compatibility exports for Hero and Tour UI.

## When to use it

Use this package when a project needs the components, styles, or utilities listed below without copying implementation code into the application.

## Primary imports

```js
import '@ui.base/ui';
import '@ui.base/ui/styles.css';
```

## Components

- `<uib-checkbox></uib-checkbox>`
- `<uib-toggle></uib-toggle>`
- `<uib-help></uib-help>`
- `<uib-hero></uib-hero>`
- `<uib-label></uib-label>`
- `<uib-accordion></uib-accordion>`
- `<uib-card></uib-card>`
- `<uib-column></uib-column>`
- `<uib-dialog></uib-dialog>`
- `<uib-grid></uib-grid>`
- `<uib-panel></uib-panel>`
- `<uib-row></uib-row>`
- `<uib-splitter></uib-splitter>`
- `<uib-stack></uib-stack>`
- `<uib-tabs></uib-tabs>`
- `<uib-menu></uib-menu>`
- `<uib-menuitem></uib-menuitem>`
- `<uib-book-group-reservation></uib-book-group-reservation>`
- `<uib-cancel-reservation></uib-cancel-reservation>`
- `<uib-find-reservation></uib-find-reservation>`
- `<uib-new-reservation></uib-new-reservation>`

## CSS files

- `src/styles.css`

## Supporting modules

- `src/reservations/base-tour-reservation.js`

## Package exports

- `.` -> `./src/index.js`
- `./styles.css` -> `./src/styles.css`
- `./toggle` -> `./src/forms/uib-toggle.js`
- `./checkbox` -> `./src/forms/uib-checkbox.js`
- `./label` -> `./src/label/uib-label.js`
- `./help` -> `./src/help/uib-help.js`
- `./menu` -> `./src/navigation/uib-menu.js`
- `./menuitem` -> `./src/navigation/uib-menuitem.js`
- `./layout` -> `./src/layout/index.js`
- `./hero` -> `./src/hero/uib-hero.js`
- `./reservations` -> `./src/reservations/index.js`
- `./reservations/new-reservation` -> `./src/reservations/uib-new-reservation.js`
- `./reservations/cancel-reservation` -> `./src/reservations/uib-cancel-reservation.js`
- `./reservations/find-reservation` -> `./src/reservations/uib-find-reservation.js`
- `./reservations/book-group-reservation` -> `./src/reservations/uib-book-group-reservation.js`

## Notes

- Keep package-specific behavior in this package and consume it through npm imports.
- Prefer Web Component attributes/properties for application configuration.
- Keep app-specific data and ORM integration in the calling application or provider layer.
