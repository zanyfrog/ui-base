# @ui-base/assets

`@ui-base/assets` is a framework-neutral Web Component package for browsing, picking, uploading, editing, permission-checking, previewing, versioning, and tracking usage of reusable assets.

It is designed to be used with `@ui-base/ui` design tokens and with ORM as the first backend provider, while remaining reusable with any asset service.

## Components

```txt
uib-asset-browser
uib-asset-picker
uib-asset-list
uib-asset-grid
uib-asset-preview
uib-asset-details
uib-asset-filter-bar
uib-asset-search
uib-asset-picker-dialog
uib-asset-thumbnail
uib-asset-uploader
uib-asset-metadata-editor
uib-asset-version-history
uib-asset-usage
uib-asset-permission-panel
uib-asset-permission-set-picker
```

## Basic browser usage

```js
import '@ui-base/ui';
import '@ui-base/ui/styles.css';
import {
  createMockAssetProvider,
  createOrmAssetProvider
} from '@ui-base/assets';
import '@ui-base/assets';

const browser = document.querySelector('uib-asset-browser');

browser.provider = createMockAssetProvider({
  applicationKey: 'demo-app',
  actorProfile: 'admin'
});
```

```html
<uib-asset-browser
  mode="manage"
  application-key="demo-app"
  selection-mode="single"
  view="grid"
></uib-asset-browser>
```


## Asset picker for forms

Use `uib-asset-picker` when a form field needs to attach an image, file, or reusable asset. It renders as an inline form slot that shows the selected thumbnail and name. The user clicks Browse to open a search-first modal asset browser, or Upload when `allow-upload` is enabled.

```html
<uib-asset-picker
  name="heroIconAssetId"
  label="Hero icon asset"
  value="asset_tour_size"
  application-key="demo-app"
  api-base-url="http://localhost:4020"
  selection-mode="single"
  default-layout="list"
  allow-upload
  insertable-only>
</uib-asset-picker>
```

```js
const picker = document.querySelector('uib-asset-picker');

picker.headers = {
  'X-Application-Admin': 'demo-app'
};

picker.addEventListener('asset-selected', (event) => {
  // event.detail.value is the selected assetId.
  // event.detail.asset is the normalized asset object.
  console.log(event.detail);
});
```

The form value is the selected `assetId`. In multiple mode, the submitted value is a JSON array string.

```html
<uib-asset-picker
  name="detailAssetIds"
  application-key="demo-app"
  selection-mode="multiple"
  max-selection="5"
  allow-upload
  insertable-only>
</uib-asset-picker>
```

```js
picker.addEventListener('assets-selected', (event) => {
  console.log(event.detail.value);  // JSON array string of asset ids
  console.log(event.detail.assets); // insertion payloads
});
```

### Picker modal behavior

```txt
Closed field:
  selected thumbnail/name + Browse + optional Upload + optional Clear

Modal:
  search box is always visible
  every result shows thumbnail/icon + name
  filters stay behind a small Filters button
  upload appears as a fallback when allow-upload is set
  single-select chooses and closes immediately
  multi-select requires Use Selected
```

The filter panel includes:

```txt
application
category
file type
scope
visibility
status
```

### Picker upload defaults

```txt
allow-upload: false unless set
insertable-only: true unless set to false
insertable file types: image, icon, document, svg, pdf by default
accepted upload types: image/*, application/pdf, text/plain
upload asset_type: inferred from MIME type/file name
upload reuse_scope: global unless a scope/default-scope/current scope filter is set
upload asset_visibility: public unless a visibility/default-visibility/current visibility filter is set
upload category: current/default category, then general
upload status: active
selection behavior: copy shared/global assets into the current app when the provider supports copyAssetToApplication
```

The parent may pass local-dev/admin headers through the `headers` property or assign a provider directly.

## Simple browser compatibility

`uib-asset-browser variant="simple"` is a compatibility alias that delegates to `uib-asset-picker`, which now uses the inline slot plus search-first modal behavior. Use it only when existing markup already references the browser. New form fields should prefer `uib-asset-picker`.

```html
<uib-asset-browser
  variant="simple"
  name="heroIconAssetId"
  application-key="demo-app"
  selection-mode="single"
  allow-upload
  insertable-only>
</uib-asset-browser>
```


## Configurable picker dialog

`uib-asset-picker-dialog` now accepts the same common picker/browser settings used by the demo harness. The `data-picker-mode` or `picker-mode` attribute controls the internal browser mode.

```html
<uib-asset-picker-dialog
  application-key="demo-app"
  data-picker-mode="pick"
  selection-mode="single"
  view="grid"
  layout="split"
  default-layout="list"
  default-asset-type="image"
  default-reuse-scope="global"
  default-visibility="public"
  allow-upload
  insertable-only>
</uib-asset-picker-dialog>
```

Supported `data-picker-mode` values are:

```txt
pick
browse
manage
simple
```

The package demo route `/assets-demo/picker` exposes these settings as dropdowns and checkboxes so testers can change the dialog configuration without editing markup.

## ORM provider usage

```js
import { createOrmAssetProvider } from '@ui-base/assets';

const provider = createOrmAssetProvider({
  baseUrl: 'http://localhost:4020',
  applicationKey: 'demo-app',
  getAuthHeaders: () => ({
    'x-actor-id': currentActorId,
    authorization: `Bearer ${token}`
  })
});

assetBrowser.provider = provider;
```

## Selection result

The package returns a structured selection object instead of only a URL.

```js
assetBrowser.addEventListener('uib-asset-select', (event) => {
  console.log(event.detail.selection);
});
```

```json
{
  "assetId": "asset_sample_site_hero",
  "assetKey": "sample-site-hero",
  "versionMode": "pinned",
  "versionId": "assetver_sample_site_hero_v3",
  "versionNumber": 3,
  "name": "Sample Visitor Center Hero Image",
  "fileType": "image",
  "assetType": "image",
  "mimeType": "image/webp",
  "applicationKey": "demo-app",
  "ownerApplicationKey": "demo-app",
  "reuseScope": "application",
  "assetVisibility": "application_private",
  "publicUrl": "...",
  "downloadUrl": "...",
  "altText": "...",
  "description": "...",
  "url": "..."
}
```

## Permission behavior

ORM should calculate effective permissions and return them on each asset.

The UI package does not decide whether a user is allowed to perform CRUD. It only hides or disables actions based on resolved permissions.

Unauthorized assets should be hidden from browser/search results by the provider. Restricted fields should be returned with `maskedFields`, and this package displays them as `Restricted` instead of blank.

## Events

```txt
asset-selected
assets-selected
asset-upload-request
asset-uploaded
asset-selection-change
asset-cleared
uib-asset-select
uib-assets-select
uib-asset-open
uib-asset-upload-request
uib-asset-update-request
uib-asset-archive-request
uib-asset-restore-request
uib-asset-delete-request
uib-asset-version-submit-request
uib-asset-version-approve-request
uib-asset-version-reject-request
uib-asset-permission-change-request
uib-asset-copy-to-app-request
```

## Versioning defaults

```txt
Application-private assets:
  latest by default

Shared/global assets:
  ask the user, with pinned selected by default

Managed global brand assets:
  latest is allowed when explicitly configured
```

For shared/global assets, replacements should create a new version and only become latest after approval.
