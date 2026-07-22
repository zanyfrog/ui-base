# @ui-base/hero

Framework-neutral UI Base Hero Web Component for landing pages, tour pages, and other high-value entry points.

`@ui-base/hero` is the sole owner of `<uib-hero>`. The older `@ui-base/ui/hero` entry is a compatibility wrapper that re-exports this package.

## Import

```js
import '@ui-base/hero';
```

The package also exposes the reusable editor and preview components:

```js
import '@ui-base/hero/uib-hero-editor';
import '@ui-base/hero/uib-hero-preview';
```

The package also exports helper functions for applying package-owned defaults:

```js
import { applyHeroDefaults, createSampleTourHeroDefaults } from '@ui-base/hero';
```

## Basic example

```html
<uib-hero
  eyebrow="Visit the Sample Visitor Center"
  headline="Tour the Sample Visitor Center"
  subheadline="Go behind the scenes and see how the visitor experience is delivered."
  action-components='[
    { "id": "book-tour", "name": "primaryCta", "kind": "primary", "label": "Book a Tour", "type": "link", "value": "#booking", "show": true, "disabled": false, "variant": "primary" },
    { "id": "plan-visit", "name": "secondaryCta", "kind": "secondary", "label": "Plan Your Visit", "type": "link", "value": "#visit", "show": true, "disabled": false, "variant": "secondary" }
  ]'
  trust-signal="Advance reservations are required. Closed federal holidays."
  visual-mode="background"
  layout-opacity="0.8"
  brand-label="Sample Organization"
  brand-mark="M"
  theme="dark"
></uib-hero>
```

## Hero Action Components

The Hero supports the App Manager Action Components model through the `action-components` attribute. This is the preferred runtime model when loading Hero records from ORM.

```html
<uib-hero
  headline="Tour the Sample Department Main Building"
  action-components='[
    {
      "id": "book-tour",
      "name": "primaryCta",
      "label": "Book a Tour",
      "type": "action",
      "value": "BOOK_TOUR",
      "show": true,
      "disabled": false,
      "variant": "primary",
      "ariaLabel": "Book a Tour"
    },
    {
      "id": "plan-visit",
      "name": "secondaryCta",
      "label": "Plan Your Visit",
      "type": "link",
      "value": "/visit",
      "show": true,
      "disabled": false,
      "variant": "secondary"
    }
  ]'
></uib-hero>
```

The compatibility `hero-action-buttons`, `actions`, and `action-buttons` attributes are also accepted. Fixed attributes such as `primary-cta-label`, `primary-cta-href`, and `primary-cta-action-token` are still supported for older pages.

For an action button with `type: "action"`, the value is emitted as `event.detail.actionToken` and `event.detail.action`. For `type: "link"`, the value is used as the rendered link href.

## Parent-owned behavior

`uib-hero` does not navigate, open modals, or submit requests by itself. It emits CTA events and lets the parent website decide what happens next.

```js
const hero = document.querySelector('uib-hero');

hero.addEventListener('uib-hero-cta', (event) => {
  event.preventDefault();
  if (event.detail.disabled) return;

  switch (event.detail.actionToken) {
    case 'BOOK_TOUR':
      // Parent app opens the booking flow.
      break;
    case 'PLAN_VISIT':
      // Parent app routes or opens a panel.
      break;
  }
});
```

Legacy events are still emitted:

```text
uib-hero-primary-cta
uib-hero-secondary-cta
uib-hero-third-cta
uib-hero-fourth-cta
```

## Loading Hero JSON from ORM/App Manager

Use the `heroData` property or `loadHeroData(data)` when a parent application receives an ORM response.

```js
const hero = document.querySelector('uib-hero');
const record = await fetch('/applications/sample-tour/heroes/home').then((response) => response.json());
hero.loadHeroData(record);
```

The loader accepts direct Hero objects and common wrappers such as `{ hero: {...} }`, `{ data: {...} }`, and `{ config: {...} }`. Action arrays may be named `actionComponents`, `action-components`, `action_components`, `heroActionButtons`, `hero_action_buttons`, `actions`, `callToActions`, `buttons`, or `actionButtons`.

## Editing Hero JSON

Use `<uib-hero-editor>` when a demo or parent application owns persistence but wants a reusable Hero editing UI. Set `heroData` from JavaScript or pass a `hero-data` JSON attribute. The editor emits `uib-hero-editor-change` while editing and `uib-hero-editor-save` when the user saves.

```html
<uib-hero-editor application-key="sample"></uib-hero-editor>
```

```js
const editor = document.querySelector('uib-hero-editor');
editor.heroData = record;
editor.addEventListener('uib-hero-editor-save', (event) => {
  saveHeroRecord(event.detail.record);
});
```

The component breakdown diagram is stored at `docs/uib-hero-editor-components.svg` in this repository.

## Detail icons

Tour detail bullets support text badges and image icons. Use `iconUrl` or `iconSrc` for an image URL.

```js
hero.details = [
  { label: 'Tour Length', value: '45 minutes', iconUrl: '/assets/icons/tour-length.svg', iconAlt: 'Tour length' },
  { label: 'Cost', value: 'Free', iconUrl: '/assets/icons/cost.svg', iconAlt: 'Cost' }
];
```

## Sample Tour defaults

```js
import { applyHeroDefaults, createSampleTourHeroDefaults } from '@ui-base/hero';

const hero = document.querySelector('uib-hero');
const defaults = createSampleTourHeroDefaults({ iconBasePath: '/assets/icons' });
applyHeroDefaults(hero, defaults);
```

## Hero Action Component variants

When `action-components` is provided, each item's `variant` controls the rendered button marker and class. For example, an action with `"variant":"destructive"` renders with `data-uib-hero-action="destructive"` and `uib-hero__button--destructive`, independent of whether the item is first, second, third, or fourth in the ordered list. The action slot/key is still emitted separately for event compatibility.
