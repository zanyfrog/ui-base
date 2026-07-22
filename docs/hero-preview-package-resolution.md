# Hero preview package resolution

The App Manager live preview uses `<uib-hero>` from `@ui-base/hero`.

Use `@ui-base/hero` version `0.2.3` or newer for Hero Action Button variants to render by each action item's `variant` value.

Check the installed package from the App Manager workspace:

```powershell
npm ls @ui-base/hero -w @ui-base/app-manager
```

Then verify the installed source includes the variant attributes:

```powershell
Select-String -Path .\node_modules\@ui-base\hero\src\uib-hero.js -Pattern "data-uib-hero-cta-variant"
```

If you see no result, App Manager is not using the patched Hero package.

Important: previous App Manager builds depended on the sibling design-system source package:

```text
../ui-base-npm-workspace-calendar-routes-hero/packages/ui-base-hero
```

Installing a package manually at the root may not affect the nested `@ui-base/app-manager` workspace if its package.json still points at the sibling source package. This patch points App Manager to:

```text
../ui-base-workspace/packages/ui-base-hero
```

The live preview also now passes legacy compatibility attributes such as:

```html
primary-cta-variant="destructive"
secondary-cta-variant="tertiary"
```

while still passing the canonical `hero-action-buttons` JSON.
