# Hero Detail Asset Picker

The Edit Hero route uses the UI Base `@ui.base/assets` package for the detail icon picker.

## Component used

```html
<uib-asset-picker></uib-asset-picker>
```

The App Manager does not use `uib-asset-browser` for Hero Details. It also does not use the older App Manager-local picker for this field. The App Manager-local picker remains registered as `uib-app-manager-asset-picker` only for compatibility with older screens.

## Saved detail shape

Each detail row stores the selected asset by id only:

```json
{
  "label": "Tour Size",
  "value": "20 people",
  "iconAssetId": "asset_..."
}
```

When a user selects or uploads a new asset, the editor removes legacy icon fields from that detail row:

```text
icon
iconUrl
iconAlt
iconurl
icon_url
iconSrc
uploadedIconUrl
iconHref
iconImage
assetId
icon_asset_id
```

## Picker defaults

The picker is configured in simple/single-select mode for the current application:

```html
<uib-asset-picker
  data-ui-basics-asset-picker="true"
  data-picker-mode="simple"
  selection-mode="single"
  view="list"
  default-layout="list"
  default-category="hero_detail_icon"
  usage-context="hero_detail_icon"
  default-asset-type="icon"
  default-file-type="icon"
  default-reuse-scope="application"
  default-visibility="public"
  allow-upload
  insertable-only
  include-shared="false"
  copy-on-select="false">
</uib-asset-picker>
```

## Preview behavior

The live preview reads `details[].iconAssetId`, calls the ORM asset API, and enriches only the preview copy of the details with `iconUrl`/`iconAlt`.

```text
GET /applications/:application_key/assets/:asset_id
```

The saved Hero record remains clean and stores only `iconAssetId`. If the asset file is replaced in ORM, the preview resolves the current file URL without requiring a Hero edit.

## Changed files

```text
packages/app-manager-ui/src/components/uib-application-hero-editor.ts
packages/app-manager-ui/src/components/uib-application-hero-preview.ts
packages/app-manager-ui/src/styles.css
packages/ui-base-assets
```
