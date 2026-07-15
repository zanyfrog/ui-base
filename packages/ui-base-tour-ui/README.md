# @ui.base/tour-ui

Framework-neutral Web Components for tour reservation actions. This package sits beside `@ui.base/ui` and `@ui.base/calendar` in the UI Base npm workspace.

## Components

- `uib-new-reservation`: Start a new tour reservation.
- `uib-cancel-reservation`: Cancel an existing reservation.
- `uib-find-reservation`: Find or look up an existing reservation.
- `uib-book-group-reservation`: Start a group tour reservation request.

Each component renders an action card and displays an accessible toast-style alert when the component is called.

## Import

```js
import '@ui.base/tour-ui';
```

Or import one component at a time:

```js
import '@ui.base/tour-ui/new-reservation';
import '@ui.base/tour-ui/cancel-reservation';
import '@ui.base/tour-ui/find-reservation';
import '@ui.base/tour-ui/book-group-reservation';
```

## Basic usage

```html
<uib-new-reservation></uib-new-reservation>
<uib-cancel-reservation></uib-cancel-reservation>
<uib-find-reservation></uib-find-reservation>
<uib-book-group-reservation></uib-book-group-reservation>
```

## Customized usage

```html
<uib-new-reservation
  heading="Reserve a Organization tour"
  description="Choose a tour location, date, time, and visitor details."
  action-label="Start Reservation"
  toast-message="Starting a new Organization tour reservation."
></uib-new-reservation>
```

## Parent-controlled call

```js
const newReservation = document.querySelector('uib-new-reservation');
newReservation.call({ tourLocation: 'sample-site' });
```

Calling the component displays the toast-style alert and emits both a generic event and a component-specific event.

## Shared attributes and properties

| Attribute / property | Purpose |
| --- | --- |
| `heading` | Main title displayed in the component card. |
| `eyebrow` | Small label above the heading. |
| `description` | Supporting text that explains the action. |
| `action-label` / `actionLabel` | Text for the action button. |
| `toast-message` / `toastMessage` | Message displayed in the toast-style alert when the component is called. |
| `toast-duration` / `toastDuration` | Milliseconds before the toast hides. Defaults to `4200`. Set to `0` to keep it visible. |
| `disabled` | Disables the action button when present or truthy. |
| `variant` | Optional visual variant. Defaults are `new`, `cancel`, `find`, and `group`. |

## Shared methods

| Method | Purpose |
| --- | --- |
| `call(optionalDetail)` | Programmatically calls the component action, displays the toast, and emits events. |
| `showToast(message, duration)` | Displays a toast-style alert without a button click. |
| `hideToast()` | Hides the current toast. |

## Events

Every component emits:

```text
uib-tour-reservation-action
```

Each component also emits a specific event:

```text
uib-tour-new-reservation
uib-tour-cancel-reservation
uib-tour-find-reservation
uib-tour-book-group-reservation
```

The toast output uses `role="alert"` and `aria-live="assertive"`, so action feedback is announced by assistive technologies.
