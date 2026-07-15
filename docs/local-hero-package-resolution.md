# Local shared package resolution

The App Manager workspace includes local source package folders for the shared UI Base packages.

The Hero preview uses:

```text
packages/ui-base-hero
```

The simple asset picker uses:

```text
packages/ui-base-assets
```

The common UI styles come from:

```text
packages/ui-base-ui
```

This means `npm install` should not try to find `@ui.base/ui` or other `@ui.base/*` packages in the public npm registry.

To verify the patched Hero is installed:

```powershell
Select-String -Path .\node_modules\@ui.base\hero\src\uib-hero.js -Pattern "data-uib-hero-cta-variant"
```

To verify the local asset picker package is installed:

```powershell
npm ls @ui.base/assets -w @ui.base/app-manager
```
