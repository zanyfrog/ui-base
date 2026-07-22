# Shared package consumption

App Manager consumes reusable UI Base UI packages as **local source package folders** in this repository.

This keeps the App Manager zip installable without requiring a sibling design-system workspace or a private npm registry.

## Local source packages

```text
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
```

`package.json` and `apps/manager/package.json` reference these packages with `file:packages/...` paths.

## Why this changed

The previous App Manager zip consumed some packages from package archives or a sibling repository. If `@ui-base/*` packages were not published to a registry, npm could try to resolve them remotely and fail.

This workspace keeps the shared packages as source folders, so local demos and the app manager can resolve them from the zip without generated package archives.

## Package ownership remains the same

| Package | Owns |
| --- | --- |
| `@ui-base/ui` | Generic UI primitives and shared styles. |
| `@ui-base/hero` | Visitor-facing `<uib-hero>` renderer. |
| `@ui-base/assets` | Reusable `<uib-asset-picker>` and asset UI components. |
| `@ui-base/tour-ui` | Tour reservation/action-flow components. |
| `@ui-base/app-manager-ui` | Admin/configuration components for ORM resources. |

The App Manager-specific components `<uib-hero-action-button>` and `<uib-hero-action-buttons>` remain in `@ui-base/app-manager-ui` because they edit configuration; they do not render the public website Hero.

## Hero Details asset picker update

Edit Hero > Details uses `<uib-asset-picker>` from `@ui-base/assets` in simple single-select mode. Detail rows save only `iconAssetId`; the live preview resolves the asset through the ORM Asset API and enriches the preview copy with the current asset URL.

Relevant files:

```text
packages/app-manager-ui/src/components/uib-application-hero-editor.ts
packages/app-manager-ui/src/components/uib-application-hero-preview.ts
packages/ui-base-assets
```
