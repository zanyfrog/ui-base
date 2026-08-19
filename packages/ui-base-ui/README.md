# @ui-base/ui

Framework-neutral UI primitives for UI Base applications.

## Ownership

`@ui-base/ui` owns generic controls, labels, help text, menus, layout primitives, and shared CSS. It no longer owns the Hero or Tour reservation implementations.

Compatibility exports remain available so older imports continue to work:

```js
import '@ui-base/ui/hero';          // re-exports @ui-base/hero
import '@ui-base/ui/reservations';  // re-exports @ui-base/tour-ui
```

New code should import the owning packages directly:

```js
import '@ui-base/ui/styles.css';
import '@ui-base/hero';
import '@ui-base/tour-ui';
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
- `uib-instruction`
- `uib-rich-text`
- `uib-stack`
- `uib-grid`
- `uib-row`
- `uib-column`
- `uib-panel`
- `uib-card`
- `uib-dialog`
- `uib-accordion`
- `uib-tab`
- `uib-tab-panel`
- `uib-tabs`
- `uib-splitter`

## Import

```js
import '@ui-base/ui';
import '@ui-base/ui/styles.css';
```

Or import one entry at a time:

```js
import '@ui-base/ui/toggle';
import '@ui-base/ui/menu';
import '@ui-base/ui/card';
import '@ui-base/ui/panel';
import '@ui-base/ui/instruction';
import '@ui-base/ui/rich-text';
import '@ui-base/ui/tabs';
```

## Card and panel surfaces

`uib-card` and `uib-panel` share the same surface foundation, but they have different jobs.

Use `uib-card` for compact, repeatable content such as summaries, previews, and selectable grid/list items. It supports `slot="media"`, header/body/footer regions, `variant`, `density`, whole-card `href` links, action events, and selectable state.

Use `uib-panel` for larger structural regions such as settings sections, editor panes, dashboards, and form areas. It supports header/body/footer regions, `slot="actions"`, `variant`, `density`, and optional `collapsible` / `open` behavior. Panels are not collapsible by default.

## Rich text example

`uib-rich-text` renders trusted slotted content with readable spacing and safe external link defaults.

```html
<uib-rich-text>
  <p><strong>Reservations are required.</strong> Tours can be booked up to 30 days in advance.</p>
  <p><a href="https://example.com/details">Read details</a></p>
</uib-rich-text>
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
import '@ui-base/ui/hero';
import '@ui-base/ui/reservations/new-reservation';
```

Prefer:

```js
import '@ui-base/hero';
import '@ui-base/tour-ui/new-reservation';
```
