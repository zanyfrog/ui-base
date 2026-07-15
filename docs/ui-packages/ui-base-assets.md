# @ui.base/assets

**Version:** `0.1.5`  
**Package path:** `packages/ui-base-assets`

## Purpose

Framework-neutral UI Base asset browser, picker, upload, permission, usage, and version Web Components.

## When to use it

Use this package when a project needs the components, styles, or utilities listed below without copying implementation code into the application.

## Primary imports

```js
import '@ui.base/assets';
// <uib-asset-picker application-key="demo-app" allow-upload></uib-asset-picker>
```

## Components

- `<uib-asset-browser></uib-asset-browser>`
- `<uib-asset-details></uib-asset-details>`
- `<uib-asset-filter-bar></uib-asset-filter-bar>`
- `<uib-asset-grid></uib-asset-grid>`
- `<uib-asset-list></uib-asset-list>`
- `<uib-asset-metadata-editor></uib-asset-metadata-editor>`
- `<uib-asset-permission-panel></uib-asset-permission-panel>`
- `<uib-asset-permission-set-picker></uib-asset-permission-set-picker>`
- `<uib-asset-picker-dialog></uib-asset-picker-dialog>`
- `<uib-asset-picker></uib-asset-picker>`
- `<uib-asset-preview></uib-asset-preview>`
- `<uib-asset-search></uib-asset-search>`
- `<uib-asset-thumbnail></uib-asset-thumbnail>`
- `<uib-asset-uploader></uib-asset-uploader>`
- `<uib-asset-usage></uib-asset-usage>`
- `<uib-asset-version-history></uib-asset-version-history>`

## CSS files

- None.

## Supporting modules

- `src/asset-core.js`
- `src/providers/mock-asset-provider.js`
- `src/providers/orm-asset-provider.js`

## Package exports

- `.` -> `./src/index.js`
- `./providers` -> `./src/providers/index.js`
- `./models` -> `./src/models/index.js`
- `./components/uib-asset-browser` -> `./src/components/uib-asset-browser.js`
- `./components/uib-asset-picker` -> `./src/components/uib-asset-picker.js`
- `./components/uib-asset-picker-dialog` -> `./src/components/uib-asset-picker-dialog.js`

## Notes

- Keep package-specific behavior in this package and consume it through npm imports.
- Prefer Web Component attributes/properties for application configuration.
- Keep app-specific data and ORM integration in the calling application or provider layer.
