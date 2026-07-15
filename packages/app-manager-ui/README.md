# @ui.base/app-manager-ui

Framework-neutral Web Components for the application manager.

Main components:

```html
<uib-application-manager></uib-application-manager>
<uib-application-list></uib-application-list>
<uib-application-editor></uib-application-editor>
<uib-application-hero-list></uib-application-hero-list>
<uib-application-hero-editor></uib-application-hero-editor>
<uib-application-hero-preview></uib-application-hero-preview>
```

The components are configured with these attributes:

```html
<uib-application-manager
  orm-base-url="http://localhost:4020"
  iam-base-url="http://localhost:4010"
  dev-actor-id="original-creator"
  dev-token="dev-token"
></uib-application-manager>
```


## Detail icon assets

`<uib-application-hero-editor>` separates Navigation and Details into separate panels. Each `details` row now uses the shared `<uib-asset-picker>` component in simple mode instead of exposing icon text/URL fields.

The saved detail row stores the selected asset id:

```json
{
  "label": "Tour Length",
  "value": "60 minutes",
  "iconAssetId": "asset_123"
}
```

The live preview calls the ORM Asset API to resolve the latest public file URL for `iconAssetId` and passes that URL to `<uib-hero>` as preview-only `iconUrl` data.

## Hero Action Components

The App Manager UI owns the Hero Action Component configuration controls:

```html
<uib-hero-action-button></uib-hero-action-button>
<uib-hero-action-buttons></uib-hero-action-buttons>
```

They intentionally live in `@ui.base/app-manager-ui`, not `@ui.base/hero`, because they are admin/configuration controls. The public Hero rendering remains in `@ui.base/hero`.

A single button config accepts either individual attributes or an `action` JSON object:

```html
<uib-hero-action-button
  heading="Primary CTA"
  default-action-token="BOOK_TOUR"
  action='{"id":"primaryHeroAction","name":"primaryCta","label":"Book a Tour","type":"action","value":"BOOK_TOUR","show":true,"disabled":false,"variant":"primary","help":"","title":"Primary CTA","ariaLabel":"Book a Tour","target":"","rel":""}'
></uib-hero-action-button>
```

The array editor accepts `actions` as either an array or a single object and normalizes the value to an array. It uses an Add icon, top-right delete icons, drag-and-drop reordering, and hides the raw JSON in the App Management editor:

```html
<uib-hero-action-buttons
  label="Action Components"
  allow-add
  allow-remove
></uib-hero-action-buttons>
```

Both components emit:

```text
change
uib-hero-action-button-change
uib-hero-action-buttons-change
```

with event details containing `name`, `oldValue`, and `newValue`.

## Hero Action Components JSON model

`uib-application-hero-editor` now treats `application_hero.action-components` as the canonical Hero Action Components model. The editor still derives `action_components`, `hero_action_buttons`, `actions`, and legacy `primary_cta_*`, `secondary_cta_*`, `third_cta_*`, and `fourth_cta_*` fields before saving so older ORM schemas continue to work.

Use `hero-action-model` helpers when code needs to translate between the canonical Action Components array and legacy ORM fields.


## Canonical Hero Action Components model

`<uib-application-hero-editor>` now treats `application_hero.action-components` as the canonical CTA model. The value is a JSON array of Hero Action Component objects. Legacy fields such as `primary_cta_label`, `primary_cta_href`, and `show_primary_cta` are derived for backward compatibility with older ORM schemas.

The editor reads `action-components` first. If it is missing, the editor reads `action_components`, `hero_action_buttons`, and `actions`, then derives the array from the older fixed CTA fields. On save, the editor submits `action-components` when the ORM schema supports it and falls back to legacy-compatible fields when needed.

## Preview variant rendering

The App Manager preview passes the ordered `action-components` array into `<uib-hero action-components="...">`. The public `@ui.base/hero` renderer must use each action item's `variant` for the rendered button class and action marker, for example:

```html
<button class="uib-hero__button uib-hero__button--destructive" data-uib-hero-action="destructive">Cancel reservation</button>
```

The action item's slot/key is preserved separately for event compatibility, but visual styling comes from `variant`, not from array position.

## Hero Details asset picker update

Edit Hero > Details now uses the UI Base `<uib-asset-picker>` from `@ui.base/assets` in simple single-select mode. Detail rows save only `iconAssetId`; the live preview resolves the asset through the ORM Asset API and enriches the preview copy with the current asset URL.

Relevant files:

```text
packages/app-manager-ui/src/components/uib-application-hero-editor.ts
packages/app-manager-ui/src/components/uib-application-hero-preview.ts
packages/ui-base-assets
```
