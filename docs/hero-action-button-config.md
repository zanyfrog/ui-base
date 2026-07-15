# Hero Action Component Configuration Components

The Hero action configuration components live in `@ui.base/app-manager-ui` because they are admin/configuration controls. The public website Hero renderer remains in `@ui.base/hero`.

## Package ownership

| Component | Package | Purpose |
|---|---|---|
| `<uib-hero-action-button>` | `@ui.base/app-manager-ui` | Admin/config editor for one Hero Action Component. |
| `<uib-hero-action-buttons>` | `@ui.base/app-manager-ui` | Admin/config editor for an ordered array of Hero Action Components. |
| `<uib-hero>` | `@ui.base/hero` | Visitor-facing Hero rendering component. |

## Editor behavior

`<uib-hero-action-buttons>` supports:

```text
Add icon button
Top-right delete icon on each action
Drag-and-drop ordering
Hidden raw JSON in the App Management screen
```

The drag order is the saved order of the `application_hero.action-components` array.

## Single action shape

```json
{
  "id": "primaryHeroAction",
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
```

## Supported type values

```text
link
action
```

When `type` is `link`, `value` maps to the legacy `*_cta_href` field.

When `type` is `action`, `value` maps to the legacy `*_cta_action_token` field.

## Supported variant values

```text
primary
secondary
tertiary
destructive
```

## Events

`<uib-hero-action-button>` emits:

```text
change
uib-hero-action-button-change
```

`<uib-hero-action-buttons>` emits:

```text
change
uib-hero-action-buttons-change
```

The event detail uses this shape:

```ts
{
  name: string;
  oldValue: HeroActionConfig | HeroActionConfig[];
  newValue: HeroActionConfig | HeroActionConfig[];
  actions?: HeroActionConfig[];
  action?: 'add' | 'remove' | 'reorder';
}
```

## App Manager integration

`<uib-application-hero-editor>` renders one `<uib-hero-action-buttons>` array editor. The editor stores the ordered array in the canonical `action-components` field.

The editor still derives and submits the legacy ORM fields for compatibility when the ORM schema requires them:

```text
primary_cta_label
primary_cta_href
primary_cta_type
primary_cta_action_token
show_primary_cta
primary_cta_disabled
```

and equivalent fields for secondary, third, and fourth CTAs.

## Canonical schema field

The preferred `application_hero` field is:

```text
action-components
```

`action-components` is a JSON array. `action_components`, `hero_action_buttons`, and `actions` are compatibility aliases. Fixed fields such as `primary_cta_label` and `secondary_cta_href` are compatibility fields.

## Preview variant rendering

The App Manager preview passes the ordered `action-components` array into `<uib-hero action-components="...">`. The public `@ui.base/hero` renderer must use each action item's `variant` for the rendered button class and action marker, for example:

```html
<button class="uib-hero__button uib-hero__button--destructive" data-uib-hero-action="destructive">Cancel reservation</button>
```

The action item's slot/key is preserved separately for event compatibility, but visual styling comes from `variant`, not from array position.



## Preview package resolution

If Hero Action Button variants do not appear in the live preview, see `docs/hero-preview-package-resolution.md`.
