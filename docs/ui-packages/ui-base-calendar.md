# @ui.base/calendar

**Version:** `0.2.0`  
**Package path:** `packages/ui-base-calendar`

## Purpose

Framework-neutral UI Base calendar Web Components.

## When to use it

Use this package when a project needs the components, styles, or utilities listed below without copying implementation code into the application.

## Primary imports

```js
import '@ui.base/calendar';
// <uib-calendar-month-view></uib-calendar-month-view>
```

## Components

- `<uib-calendar-day-view></uib-calendar-day-view>`
- `<uib-calendar-month-view></uib-calendar-month-view>`
- `<uib-calendar-week-view></uib-calendar-week-view>`
- `<uib-calendar-year-view></uib-calendar-year-view>`
- `<uib-date-window-view></uib-date-window-view>`
- `<uib-day-of-week-view></uib-day-of-week-view>`

## CSS files

- None.

## Supporting modules

- `src/components/calendar-utils.js`

## Package exports

- `.` -> `./src/index.js`

## Notes

- Keep package-specific behavior in this package and consume it through npm imports.
- Prefer Web Component attributes/properties for application configuration.
- Keep app-specific data and ORM integration in the calling application or provider layer.
