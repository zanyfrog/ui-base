# UI Base Asset Picker Connection

This workspace includes the local `@ui.base/assets` source package and uses its `<uib-asset-picker>` component in Edit Hero > Details.

The local source package is:

```text
packages/ui-base-assets
```

It is included as source for standalone App Manager installation so npm does not need to resolve `@ui.base/ui` from a public registry.

## Detail editor integration

`uib-application-hero-editor` imports the package root:

```ts
import '@ui.base/assets';
```

The picker is rendered inside each Details row and receives:

```text
api-base-url
application-key
dev auth headers through the element properties
```

The editor listens for both UI Base events:

```text
asset-selected
uib-asset-select
asset-cleared
uib-asset-clear
```

Selection updates the in-memory details array immediately, marks the form dirty, updates the live preview, and queues the existing 3-second autosave.

## ORM calls used

The picker uses the ORM asset provider to list and upload assets:

```text
GET  /applications/:application_key/assets
POST /applications/:application_key/assets
```

The preview resolves selected asset IDs through:

```text
GET /applications/:application_key/assets/:asset_id
```
