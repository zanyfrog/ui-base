# UI Base Package Guide

This workspace contains reusable npm packages for generic UI Base applications.

## Package architecture

```text
@ui-base/core             shared base classes, utilities, validation, metadata
@ui-base/design-system    design principles, accessibility, lifecycle docs
@ui-base/theme            default, dark, and sample-tour theme CSS variables
@ui-base/icons            icon registry and uib-icon
@ui-base/ui               generic UI primitives and shared styles
@ui-base/forms            forms and form controls
@ui-base/assets           asset browser, picker, upload, metadata, versioning, usage, permissions
@ui-base/calendar         calendar views
@ui-base/hero             visitor-facing uib-hero renderer
@ui-base/tour-ui          tour reservation/action-flow components
```

## Ownership rules

- `@ui-base/assets` owns asset browsing, picking, upload forms, metadata editing, version history, usage display, and permission summary components.
- `@ui-base/hero` owns `<uib-hero>`.
- `@ui-base/tour-ui` owns reservation/action components such as `<uib-new-reservation>` and `<uib-book-group-reservation>`.
- `@ui-base/ui` owns generic UI primitives and compatibility wrappers for `@ui-base/ui/hero` and `@ui-base/ui/reservations/*` imports.
- App-specific admin/configuration components belong in the consuming app workspace, such as `@ui-base/app-manager-ui`.

## Source package folders

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

The folder names use `ui-base-*` for filesystem safety. The npm package names remain scoped as `@ui-base/*`.

## Assets package demo

The demo website includes a package-by-package testing dashboard at `/package-tests/` and configurable asset package routes:

```text
/component-tests/
/assets-demo/
/assets-demo/simple
/assets-demo/browser
/assets-demo/picker
/assets-demo/manage
/assets-demo/permissions
/assets-demo/versions
/assets-demo/usage
```

`/component-tests/` is the interactive developer documentation route. It covers every package, uses live fixtures where possible, reflects registered Web Component `observedAttributes`, and exposes stable `data-test-id` hooks that a future browser smoke suite can reuse.

`@ui-base/assets` remains backend-neutral through provider objects such as `MockAssetProvider` and `OrmAssetProvider`.

## Build and pack packages

From the workspace root:

```bash
npm install
npm run check
npm run build
npm run package:pack
```

`npm run package:pack` creates generated npm package archives in `package-output/`. That folder is ignored and should not be committed or included in the source zip.

## Separate app local development

For adjacent local repositories, use `file:` dependencies that point to source package folders in this workspace:

```json
{
  "dependencies": {
    "@ui-base/core": "file:../ui-base-workspace/packages/ui-base-core",
    "@ui-base/design-system": "file:../ui-base-workspace/packages/ui-base-design-system",
    "@ui-base/theme": "file:../ui-base-workspace/packages/ui-base-theme",
    "@ui-base/icons": "file:../ui-base-workspace/packages/ui-base-icons",
    "@ui-base/ui": "file:../ui-base-workspace/packages/ui-base-ui",
    "@ui-base/forms": "file:../ui-base-workspace/packages/ui-base-forms",
    "@ui-base/calendar": "file:../ui-base-workspace/packages/ui-base-calendar",
    "@ui-base/hero": "file:../ui-base-workspace/packages/ui-base-hero",
    "@ui-base/tour-ui": "file:../ui-base-workspace/packages/ui-base-tour-ui",
    "@ui-base/assets": "file:../ui-base-workspace/packages/ui-base-assets"
  }
}
```

Once packages are published to a private registry, switch to normal version ranges such as `"@ui-base/core": "^0.1.0"`.
