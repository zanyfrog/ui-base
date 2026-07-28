# UIB Tabs

## Component Summary

- Tag names: `uib-tabs`, `uib-tab`, `uib-tab-panel`
- Package: `@ui-base/ui`
- Maturity: experimental
- Purpose: Provide an accessible tab list with coordinated panels, active state, disabled tab handling, keyboard navigation, and change events.
- Use cases: Settings pages, editor panels, detail views, admin sections, compact route-like content groups.
- Non-goals: Nested tab discovery, wrapper-based tab pairing, value-based tab-panel matching, async loading behavior.

## Import

```js
import '@ui-base/ui/tabs';
```

Individual entry points are also available:

```js
import '@ui-base/ui/tab';
import '@ui-base/ui/tab-panel';
```

## Basic Example

```html
<uib-tabs selected="0" orientation="horizontal">
  <uib-tab>Overview</uib-tab>
  <uib-tab disabled>Billing</uib-tab>
  <uib-tab>History</uib-tab>

  <uib-tab-panel>Overview content.</uib-tab-panel>
  <uib-tab-panel>Billing content.</uib-tab-panel>
  <uib-tab-panel>History content.</uib-tab-panel>
</uib-tabs>
```

Tabs and panels are paired by direct-child order. The first `uib-tab` controls the first `uib-tab-panel`, the second tab controls the second panel, and so on.

## Accessibility

- `uib-tabs` renders a `role="tablist"` wrapper.
- `uib-tab` elements receive `role="tab"`, `aria-selected`, `aria-disabled`, and `aria-controls`.
- `uib-tab-panel` elements receive `role="tabpanel"`, `aria-labelledby`, and managed `hidden`.
- `orientation="horizontal"` sets `aria-orientation="horizontal"`.
- `orientation="vertical"` sets `aria-orientation="vertical"`.
- Disabled tabs remain focusable by script and can carry `aria-disabled="true"`, but they reject activation.

## Keyboard Behavior

| Key | Horizontal | Vertical | Behavior |
| --- | --- | --- | --- |
| `ArrowRight` | yes | no | Moves focus to the next tab. Activates it if enabled. |
| `ArrowLeft` | yes | no | Moves focus to the previous tab. Activates it if enabled. |
| `ArrowDown` | no | yes | Moves focus to the next tab. Activates it if enabled. |
| `ArrowUp` | no | yes | Moves focus to the previous tab. Activates it if enabled. |
| `Home` | yes | yes | Focuses and activates the first enabled tab. |
| `End` | yes | yes | Focuses and activates the last enabled tab. |
| `Enter` | yes | yes | Activates the focused tab if enabled. |
| `Space` | yes | yes | Activates the focused tab if enabled. |

## Public API

### `uib-tabs` Attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `selected` | number string | first enabled tab | Zero-based selected tab index. Invalid, missing, or disabled indexes fall back to the first enabled tab. |
| `orientation` | `horizontal` or `vertical` | `horizontal` | Controls visual layout and arrow-key behavior. |
| `name` | string | empty | Included in change event detail. |

### `uib-tab` Attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `disabled` | boolean | false | Prevents the tab from being activated. |
| `aria-disabled` | `true` or `false` | `false` | Also treated as a disabled input when set to `true`. |
| `selected` | boolean | managed | Reflected by `uib-tabs` for the active tab. Authors should set `selected` on `uib-tabs`, not on individual tabs. |

### `uib-tab-panel` Attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `hidden` | boolean | managed | Applied to inactive panels. Removed from the active panel. |
| `selected` | boolean | managed | Reflected by `uib-tabs` for the active panel. |

## Events

`uib-tabs` emits both `change` and `uib-tabs-change` after a user interaction changes the selected tab.

```js
tabs.addEventListener('uib-tabs-change', (event) => {
  console.log(event.detail);
});
```

Event detail:

```js
{
  name: 'exampleTabs',
  oldValue: 0,
  newValue: 2
}
```

`oldValue` and `newValue` are numeric indexes. If every tab is disabled, no panel is shown and the selected value is cleared.

## Dynamic Behavior

`uib-tabs` watches direct child changes and disabled-state changes. Adding tabs, removing tabs, or toggling `disabled` / `aria-disabled` causes the tablist and panels to resync.

If the selected tab becomes disabled, `uib-tabs` selects the first enabled tab. If no enabled tabs exist, every panel is hidden.

## Vertical Example

```html
<uib-tabs selected="0" orientation="vertical" name="accountSections">
  <uib-tab>Profile</uib-tab>
  <uib-tab>Security</uib-tab>
  <uib-tab aria-disabled="true">Billing</uib-tab>

  <uib-tab-panel>Profile fields.</uib-tab-panel>
  <uib-tab-panel>Security settings.</uib-tab-panel>
  <uib-tab-panel>Billing settings.</uib-tab-panel>
</uib-tabs>
```

## Best Practices

- Keep `uib-tab` and `uib-tab-panel` as direct children of `uib-tabs`.
- Pair tabs and panels by order.
- Set `selected` only on `uib-tabs`.
- Use `disabled` for unavailable tabs and remove it when the tab becomes available.
- Keep each tab label short and descriptive.
