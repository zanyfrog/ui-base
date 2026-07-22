# @ui-base/forms

**Version:** `0.1.0`  
**Package path:** `packages/ui-base-forms`

## Purpose

UI Base form, validation, input, and form layout Web Components.

## When to use it

Use this package when a project needs the components, styles, or utilities listed below without copying implementation code into the application.

## Primary imports

```js
import '@ui-base/forms';
```

## Components

- `<uib-forms-date></uib-forms-date>`
- `<uib-forms-email></uib-forms-email>`
- `<uib-forms-number></uib-forms-number>`
- `<uib-forms-password></uib-forms-password>`
- `<uib-forms-phone></uib-forms-phone>`
- `<uib-forms-select></uib-forms-select>`
- `<uib-forms-textarea></uib-forms-textarea>`
- `<uib-forms-textbox></uib-forms-textbox>`
- `<uib-forms-field></uib-forms-field>`
- `<uib-forms-input-group></uib-forms-input-group>`
- `<uib-forms-wizard></uib-forms-wizard>`
- `<uib-forms-form></uib-forms-form>`

## CSS files

- None.

## Supporting modules

- `src/form-control-base.js`
- `src/metadata.js`

## Package exports

- `.` -> `./src/index.js`
- `./form` -> `./src/uib-forms-form.js`
- `./textbox` -> `./src/controls/uib-forms-textbox.js`
- `./number` -> `./src/controls/uib-forms-number.js`
- `./date` -> `./src/controls/uib-forms-date.js`
- `./email` -> `./src/controls/uib-forms-email.js`
- `./password` -> `./src/controls/uib-forms-password.js`
- `./phone` -> `./src/controls/uib-forms-phone.js`
- `./textarea` -> `./src/controls/uib-forms-textarea.js`
- `./select` -> `./src/controls/uib-forms-select.js`
- `./field` -> `./src/layout/uib-forms-field.js`
- `./input-group` -> `./src/layout/uib-forms-input-group.js`
- `./wizard` -> `./src/layout/uib-forms-wizard.js`
- `./metadata` -> `./src/metadata.js`

## Notes

- Keep package-specific behavior in this package and consume it through npm imports.
- Prefer Web Component attributes/properties for application configuration.
- Keep app-specific data and ORM integration in the calling application or provider layer.
