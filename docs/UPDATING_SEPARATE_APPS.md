# Updating Separate Apps

A separate app should consume UI Base packages through `package.json`, not by copying package source files into the app.

## Preferred local source-package process

When the design-system workspace and the consuming app are checked out beside each other, use `file:` dependencies that point to the owning package folders.

```text
Organization-apps/
  ui-base-npm-workspace-calendar-routes-hero/
  ui-base-app-manager/
```

Example consuming app dependencies from the app root:

```json
{
  "dependencies": {
    "@ui-base/core": "file:../ui-base-npm-workspace-calendar-routes-hero/packages/ui-base-core",
    "@ui-base/design-system": "file:../ui-base-npm-workspace-calendar-routes-hero/packages/ui-base-design-system",
    "@ui-base/theme": "file:../ui-base-npm-workspace-calendar-routes-hero/packages/ui-base-theme",
    "@ui-base/icons": "file:../ui-base-npm-workspace-calendar-routes-hero/packages/ui-base-icons",
    "@ui-base/ui": "file:../ui-base-npm-workspace-calendar-routes-hero/packages/ui-base-ui",
    "@ui-base/forms": "file:../ui-base-npm-workspace-calendar-routes-hero/packages/ui-base-forms",
    "@ui-base/calendar": "file:../ui-base-npm-workspace-calendar-routes-hero/packages/ui-base-calendar",
    "@ui-base/hero": "file:../ui-base-npm-workspace-calendar-routes-hero/packages/ui-base-hero",
    "@ui-base/tour-ui": "file:../ui-base-npm-workspace-calendar-routes-hero/packages/ui-base-tour-ui"
  }
}
```

Then run:

```bash
npm install
```

## Package ownership reminder

- Import generic controls and styles from `@ui-base/ui`.
- Import `<uib-hero>` from `@ui-base/hero`.
- Import tour reservation/action components from `@ui-base/tour-ui`.
- Keep app-specific admin/configuration components in the app workspace, such as `@ui-base/app-manager-ui`.

## Local package process

Build and pack the workspace:

```bash
cd ui-base-npm-workspace-calendar-routes-hero
npm run check
npm run build
npm run package:pack
```

Then install the package packages into the separate app:

```bash
cd ../my-consuming-app
npm install ../ui-base-workspace/packages/ui-base-core
npm install ../ui-base-workspace/packages/ui-base-design-system
npm install ../ui-base-workspace/packages/ui-base-theme
npm install ../ui-base-workspace/packages/ui-base-icons
npm install ../ui-base-workspace/packages/ui-base-hero
npm install ../ui-base-workspace/packages/ui-base-tour-ui
npm install ../ui-base-workspace/packages/ui-base-ui
npm install ../ui-base-workspace/packages/ui-base-forms
npm install ../ui-base-workspace/packages/ui-base-calendar
```

## Future private registry process

Once the packages are published to a private registry, the app can use semantic versions instead:

```json
{
  "dependencies": {
    "@ui-base/core": "^0.1.0",
    "@ui-base/design-system": "^0.1.0",
    "@ui-base/theme": "^0.1.0",
    "@ui-base/icons": "^0.1.0",
    "@ui-base/ui": "^0.5.1",
    "@ui-base/forms": "^0.1.0",
    "@ui-base/calendar": "^0.2.0",
    "@ui-base/hero": "^0.2.1",
    "@ui-base/tour-ui": "^0.1.1"
  }
}
```

Then update with:

```bash
npm update @ui-base/ui @ui-base/forms @ui-base/hero @ui-base/tour-ui
```
