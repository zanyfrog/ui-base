# @ui.base/core

Shared infrastructure for the UI Base package ecosystem.

This package contains the common Web Component base class, shared attribute conventions, event helpers, localization, validation, component metadata helpers, and general utilities used by `@ui.base/ui`, `@ui.base/forms`, `@ui.base/icons`, and future packages.

## Common attributes

All UI Base UI components should support the same baseline attributes where applicable:

- `id`
- `name`
- `label`
- `help`
- `help-mode="tooltip|inline"`
- `title`
- `disabled`
- `readonly`
- `required`
- `hidden`
- `invalid`
- `error`
- `class`
- `style`
- `aria-label`
- `aria-describedby`

## Events

State-changing components emit both a native-style event and a component-specific event.

```js
{
  name: 'fieldName',
  oldValue: null,
  newValue: true
}
```

## Localization

English is the default locale. Applications can register or override messages:

```js
import { setUiBaseLocale } from '@ui.base/core';

setUiBaseLocale('es', {
  'toggle.null': 'N/D'
});
```
