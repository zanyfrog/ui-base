# Hero Action Components JSON model

The canonical field is:

```text
application_hero.action-components
```

`action-components` is a JSON array of Hero Action Component objects.

```json
[
  {
    "id": "book-tour",
    "name": "primaryCta",
    "label": "Book a Tour",
    "type": "action",
    "value": "BOOK_TOUR",
    "show": true,
    "disabled": false,
    "variant": "primary",
    "help": "",
    "title": "Primary CTA",
    "ariaLabel": "Book a Tour",
    "target": "",
    "rel": ""
  }
]
```

## Type behavior

```text
type = link
  value is rendered as href

type = action
  value is emitted as event.detail.actionToken and event.detail.action
```

## Compatibility aliases

The App Manager still writes `action_components`, `hero_action_buttons`, and `actions` as temporary aliases while older ORM builds and samples are being migrated. Fixed legacy CTA fields are also derived.

Read order:

1. `action-components`
2. `action_components`
3. `hero_action_buttons`
4. `actions`
5. legacy fixed CTA columns

Save behavior:

1. Maintain `action-components` in memory.
2. Derive `action_components`, `hero_action_buttons`, and `actions` aliases.
3. Derive legacy fields.
4. Submit only fields supported by `GET /schemas/application_hero` when that schema endpoint is available.
5. Retry once with the legacy-compatible payload if needed.

## Public Hero rendering

`@ui.base/hero` renders the canonical model through the `action-components` attribute:

```html
<uib-hero action-components='[...]'></uib-hero>
```
