# UI Base Design System

The UI Base Design System is the consistency layer for every app that uses UI Base packages.

## Goals

- Create reusable framework-neutral Web Components.
- Make accessibility the default behavior, not an afterthought.
- Give every component a shared API, event model, slot model, CSS part model, and responsive behavior.
- Use CSS custom properties so one base stylesheet can be overridden by a second application-specific stylesheet.
- Keep packages separate so applications can install only what they need.

## Shared component rules

Every component should use common attributes where applicable:

```text
id, name, label, help, help-mode, title,
disabled, readonly, required, hidden,
invalid, error, class, style,
aria-label, aria-describedby
```

Components that change state emit a native-style event and a component-specific event. Event details use this shape:

```js
{
  name: 'fieldName',
  oldValue: null,
  newValue: true
}
```

## Packages added in this version

- `@ui.base/core`
- `@ui.base/design-system`
- `@ui.base/theme`
- `@ui.base/icons`
- `@ui.base/forms`

`@ui.base/ui` was also enhanced with `uib-label`, `uib-help`, `uib-menu`, `uib-menuitem`, layout stubs, and an improved compact `uib-toggle`.
