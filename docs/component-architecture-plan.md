# Component Architecture Plan

## Workspace shape

```text
ui-base-app-manager/
  apps/
    manager/
  packages/
    app-manager-ui/
    app-manager-api-client/
    app-manager-design-tokens/
  packages/
    ui-base-core/
    ui-base-design-system/
    ui-base-theme/
    ui-base-icons/
    ui-base-ui/
    ui-base-forms/
    ui-base-calendar/
    ui-base-hero/
    ui-base-tour-ui/
    ui-base-assets/
  docs/
```

The manager uses npm workspaces and native Web Components. It follows the attached demo pattern by importing shared packages and styles from local source package folders:

```ts
import '@ui.base/ui/styles.css';
import '@ui.base/calendar';
import '@ui.base/hero';
```

## Packages

### apps/manager

Vite application shell. It owns environment variables and renders one root component:

```html
<uib-application-manager></uib-application-manager>
```

### packages/app-manager-api-client

Small typed fetch client for ORM and I-AM endpoints.

Responsibilities:

- Add dev actor headers.
- Call application_info endpoints.
- Call application_hero endpoints.
- Call I-AM bootstrap endpoint when needed.
- Normalize fetch errors into `ApiError`.

### packages/app-manager-ui

Reusable component library.

Components:

- `<uib-application-manager>`: shell, hash router, active application context.
- `<uib-application-list>`: loads and lists `application_info`, opens create/edit UI, dispatches selected application.
- `<uib-application-editor>`: full-field application editor.
- `<uib-application-hero-list>`: lists `application_hero` for selected application.
- `<uib-application-hero-editor>`: full-field hero editor with autosave and manual save.
- `<uib-application-hero-preview>`: maps current hero record into `<uib-hero>` attributes and slots.

### packages/app-manager-design-tokens

Manager-specific CSS variables layered on top of `@ui.base/ui` tokens.

## Data flow

```text
Browser component
  -> AppManagerApiClient
  -> ORM HTTP endpoint
  -> ORM CSV read/write
  -> optional I-AM bootstrap call
  -> I-AM CSV read/write
```

The UI works with ORM `storageRecord` values so every CSV field remains editable without waiting for a richer schema metadata service.

## Route flow

```text
#/applications
  uib-application-manager
    uib-application-list
      uib-application-editor when creating/editing

#/applications/:application_key/heroes
  uib-application-manager
    uib-application-hero-list

#/applications/:application_key/heroes/new
#/applications/:application_key/heroes/:hero_key
  uib-application-manager
    uib-application-hero-editor
      uib-application-hero-preview
        uib-hero
```

## Autosave state model

Hero editor state:

```text
clean -> dirty -> saving -> saved
             \-> error
```

- Dirty is set on any form input that changes the record.
- Autosave is scheduled 3 seconds after the last dirty input.
- Manual Save is enabled only when dirty.
- Autosave skips invalid/incomplete new hero forms until required fields are ready.

Application editor uses the same state UI. Existing application edits autosave; new application creation uses manual create first to avoid accidental empty app bootstrap.

## Deletion model

Deletes are soft deletes because both CSV resources include `is_active`.

```text
DELETE application -> is_active=false
DELETE hero -> is_active=false
```

The rows remain editable so the user can restore them by setting `is_active=true`.

## Hero Details asset picker update

Edit Hero > Details now uses the UI Base `<uib-asset-picker>` from `@ui.base/assets` in simple single-select mode. Detail rows save only `iconAssetId`; the live preview resolves the asset through the ORM Asset API and enriches the preview copy with the current asset URL.

Relevant files:

```text
packages/app-manager-ui/src/components/uib-application-hero-editor.ts
packages/app-manager-ui/src/components/uib-application-hero-preview.ts
packages/ui-base-assets
```

