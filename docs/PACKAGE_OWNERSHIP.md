# UI Base package ownership

This workspace is the source of truth for reusable UI packages used by App Manager and website applications.

## Owning packages

| Package | Owns | Notes |
|---|---|---|
| `@ui-base/core` | base element utilities, validation, localization, metadata helpers | Shared dependency for packages. |
| `@ui-base/design-system` | design guidance and foundational CSS | Documentation and standards. |
| `@ui-base/theme` | default, dark, and sample-tour CSS variable themes | Theme-only package. |
| `@ui-base/icons` | icon registry and `<uib-icon>` | Supports URL icons and named icons. |
| `@ui-base/ui` | generic UI primitives and shared styles | Keeps compatibility re-exports for Hero and Tour UI, but does not own those implementations. |
| `@ui-base/forms` | form controls and form layout | Schema-driven editors can build on this package later. |
| `@ui-base/calendar` | calendar and date-window components | Calendar runtime package. |
| `@ui-base/hero` | public/runtime `<uib-hero>` rendering | Canonical owner of Hero display behavior, including action-button JSON. |
| `@ui-base/tour-ui` | tour reservation action components | Canonical owner of reservation action components. |

## Compatibility policy

`@ui-base/ui/hero` re-exports from `@ui-base/hero`.

`@ui-base/ui/new-reservation`, `@ui-base/ui/cancel-reservation`, `@ui-base/ui/find-reservation`, and `@ui-base/ui/book-group-reservation` re-export from `@ui-base/tour-ui`.

New code should import from the owning packages directly.

## App Manager

`ui-base-app-manager` should depend on this workspace instead of keeping copied `@ui-base/ui`, `@ui-base/calendar`, or `@ui-base/hero` packages inside its own `packages/` folder.
