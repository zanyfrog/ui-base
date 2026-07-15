# @ui.base/ui

Framework-neutral UI primitives for UI Base applications.

## Ownership

`@ui.base/ui` owns generic controls, labels, help text, menus, layout primitives, and shared CSS. It no longer owns the Hero or Tour reservation implementations.

Compatibility exports remain available so older imports continue to work:

```js
import '@ui.base/ui/hero';          // re-exports @ui.base/hero
import '@ui.base/ui/reservations';  // re-exports @ui.base/tour-ui
```

New code should import the owning packages directly:

```js
import '@ui.base/ui/styles.css';
import '@ui.base/hero';
import '@ui.base/tour-ui';
```

## Components owned by this package

- `uib-help`
- `uib-label`
- `uib-toggle`
- `uib-checkbox`
- `uib-menu`
- `uib-menuitem`
- `uib-detail-item`
- `uib-detail-item-edit`
- `uib-detail-list`
- `uib-detail-list-editor`
- `uib-stack`
- `uib-grid`
- `uib-row`
- `uib-column`
- `uib-panel`
- `uib-card`
- `uib-dialog`
- `uib-accordion`
- `uib-tabs`
- `uib-splitter`

## Import

```js
import '@ui.base/ui';
import '@ui.base/ui/styles.css';
```

Or import one entry at a time:

```js
import '@ui.base/ui/toggle';
import '@ui.base/ui/menu';
```

## Toggle example

```html
<uib-toggle
  name="published"
  label="Published"
  value="true"
  help="Use the toggle for true/false values."
></uib-toggle>
```

## Hero and Tour compatibility

The following still works for existing apps, but it is a forwarding layer only:

```js
import '@ui.base/ui/hero';
import '@ui.base/ui/reservations/new-reservation';
```

Prefer:

```js
import '@ui.base/hero';
import '@ui.base/tour-ui/new-reservation';
```
