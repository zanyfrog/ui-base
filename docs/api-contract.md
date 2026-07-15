# API Contract Added for App Manager

## ORM endpoints

### Application info

```text
GET    /applications
POST   /applications
GET    /applications/:application_key
PATCH  /applications/:application_key
DELETE /applications/:application_key
```

List response:

```json
{
  "count": 1,
  "records": [
    {
      "record": { "applicationKey": "demo-app" },
      "storageRecord": { "application_key": "demo-app" }
    }
  ]
}
```

Create/update request body uses CSV field names:

```json
{
  "application_key": "my-new-app",
  "name": "My New App",
  "is_active": "true"
}
```

Deletes are soft deletes via `is_active=false`.

### Application heroes

```text
GET    /applications/:application_key/heroes
POST   /applications/:application_key/heroes
GET    /applications/:application_key/heroes/:hero_key
PATCH  /applications/:application_key/heroes/:hero_key
DELETE /applications/:application_key/heroes/:hero_key
```

Create/update request body uses CSV field names:

```json
{
  "application_key": "my-new-app",
  "hero_key": "home",
  "page_key": "home",
  "route_path": "/my-new-app",
  "headline": "Tour the Sample Department Main Building"
}
```

### Schema helpers

```text
GET /schemas/application_info
GET /schemas/application_hero
```

These return CSV headers and simple inferred field metadata.

## I-AM endpoint

```text
POST /admin/applications/bootstrap
```

Request:

```json
{
  "applicationKey": "my-new-app",
  "applicationName": "My New App",
  "actorId": "original-creator"
}
```

Response:

```json
{
  "applicationKey": "my-new-app",
  "applicationName": "My New App",
  "actorId": "original-creator",
  "scope": "application:my-new-app",
  "appManagerRole": "my-new-app.app_manager",
  "created": [],
  "existing": []
}
```

The endpoint is idempotent and writes to the I-AM CSV files for scopes, roles, role permission set assignments, actors, and actor roles.


## Detail icon uploads

The app manager stores detail icons inside the existing `application_hero.details` JSON array. Each detail item supports:

```json
{
  "label": "Tour Length",
  "value": "45 minutes",
  "icon": "time",
  "iconUrl": "http://localhost:4020/uploads/detail-icons/example.svg",
  "iconAlt": "Clock"
}
```

Upload endpoint used by the UI:

```text
POST /uploads/detail-icons
Content-Type: multipart/form-data
form field: file
response field to save: iconUrl
```

The text `icon` field remains editable as a badge/fallback. `iconUrl` can be typed manually or filled by upload. Legacy aliases such as `iconurl`, `icon_url`, and `iconSrc` are preserved by the UI and supported by the preview component.


## Application asset endpoints

```text
GET    /applications/:application_key/assets
POST   /applications/:application_key/assets
GET    /applications/:application_key/assets/:asset_id
PATCH  /applications/:application_key/assets/:asset_id
DELETE /applications/:application_key/assets/:asset_id
GET    /applications/:application_key/assets/:asset_id/file
GET    /applications/:application_key/assets/:asset_id/download
GET    /schemas/application_asset
```

`POST` and file replacement `PATCH` accept `multipart/form-data` with a `file` field and optional metadata fields such as `asset_key`, `asset_type`, `alt_text`, `caption`, `description`, `tags`, `usage_context`, and `is_public`.


## application_hero action-components JSON

The App Manager now treats `application_hero.action-components` as the canonical JSON array for Hero Action Components. Legacy `primary_cta_*`, `secondary_cta_*`, `third_cta_*`, and `fourth_cta_*` fields remain compatibility fields and should be derived by the resource layer during migration.

### Action button compatibility

`action-components` is the preferred canonical field. The App Manager also writes `action_components`, `hero_action_buttons`, and `actions` as compatibility aliases while older ORM builds and samples are being migrated. Legacy fixed CTA columns remain derived compatibility fields.
