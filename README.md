# UI Base Workspace

A standalone npm workspace for generic UI Base Web Components, demos, and an application manager shell.

## Repository role

This repository contains reusable source packages plus the static demo/testing website under `dist/`. Package output archives, vendor tarballs, and dependency folders are intentionally not included in the zip.

Reusable UI packages live as normal source folders under `packages/` and use scoped npm names such as `@ui.base/core`, `@ui.base/ui`, and `@ui.base/assets`. Component tags and source files use the `uib-` prefix, for example `<uib-hero>` and `uib-asset-picker.js`.

## Workspace layout

```text
apps/demo
  Documentation and live demos for the generic UI packages.

apps/manager
  Vite app shell and hash router for managing applications, heroes, and assets.

packages/app-manager-ui
  Framework-neutral app-manager Web Components.

packages/app-manager-api-client
  Fetch client for ORM and I-AM endpoints.

packages/app-manager-design-tokens
  Manager-specific admin tokens layered over @ui.base/ui.

packages/ui-base-core
packages/ui-base-design-system
packages/ui-base-theme
packages/ui-base-icons
packages/ui-base-ui
packages/ui-base-forms
packages/ui-base-calendar
packages/ui-base-hero
packages/ui-base-tour-ui
packages/ui-base-assets
  Generic reusable UI Base source packages.
```

## Local development

```bash
npm install
npm run check
npm run dev
```

The default dev command starts the package demo/testing website. Use `npm run dev:manager` when you specifically want the app manager shell.

```bash
npm run dev          # package demo/testing website
npm run dev:manager  # app manager shell
```

Default app env values in `apps/manager/.env.example` point at local service defaults:

```text
VITE_ORM_BASE_URL=http://localhost:4020
VITE_IAM_BASE_URL=http://localhost:4010
VITE_DEV_ACTOR_ID=original-creator
VITE_DEV_TOKEN=dev-token
```

## Demo routes

The demo app keeps the reusable component demos:

```text
/package-tests/
/component-tests/
/design-system/
/components/
/assets-demo/
/assets-demo/simple
/assets-demo/browser
/assets-demo/picker
/assets-demo/manage
/assets-demo/permissions
/assets-demo/versions
/assets-demo/usage
/calendar-demo/
/ui-controls/
/hero/
/hero/organization
/hero/sample-site
/tour-ui/
/tour-ui/new-reservation
/tour-ui/cancel-reservation
/tour-ui/find-reservation
/tour-ui/book-group-reservation
```

## App manager routes

The manager uses hash routes so it can run locally without server-side routing:

```text
#/applications
#/applications/:application_key/heroes
#/applications/:application_key/heroes/new
#/applications/:application_key/heroes/:hero_key
#/applications/:application_key/assets
#/applications/:application_key/assets/:asset_id
```

## Core behavior

- `/component-tests/` is the primary interactive developer documentation route. It covers every package, shows live fixtures where possible, reflects registered component `observedAttributes`, documents events and styling hooks, and provides stable `data-test-id` anchors for future smoke tests.
- Application, hero, and asset list actions appear at the beginning of each row.
- Deletes are soft deletes where the ORM schema supports inactive records.
- Hero editing exposes all CSV/schema fields.
- Hero editing includes live preview, dirty/saved state, autosave, and manual save.
- Navigation items and details are editable as structured repeatable rows with raw JSON fallback.
- Detail icons are asset-backed through `iconAssetId` and the ORM Asset API.
- Detail rows use `<uib-asset-picker>` from `@ui.base/assets` to select existing assets or upload a new one.

## Useful commands

```bash
npm run check
npm run build
npm run build:static-demo
npm run package:pack
```

`npm run package:pack` creates generated npm package archives in `package-output/`. That folder is ignored and not included in the source zip.
