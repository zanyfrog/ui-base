# @ui.base/theme

CSS theme files for UI Base applications.

## Load order

CSS custom properties can be defined in one stylesheet and overridden by a later stylesheet.

```html
<link rel="stylesheet" href="/node_modules/@ui.base/theme/src/default.css">
<link rel="stylesheet" href="/site/theme-overrides.css">
```

The second stylesheet wins for any variables it redefines.

## Available files

- `@ui.base/theme/default.css`
- `@ui.base/theme/dark.css`
- `@ui.base/theme/sample-tour.css`
