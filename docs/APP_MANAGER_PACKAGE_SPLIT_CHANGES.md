# App Manager package split changes

This patch makes the shared design-system workspace the source of truth for reusable UI/runtime packages consumed by App Manager.

## Changed ownership

- `@ui.base/hero` now owns the canonical `<uib-hero>` runtime implementation.
- `@ui.base/ui/hero` is now a compatibility re-export to `@ui.base/hero`.
- `@ui.base/tour-ui` now owns the reservation action components.
- `@ui.base/ui/new-reservation`, `@ui.base/ui/cancel-reservation`, `@ui.base/ui/find-reservation`, and `@ui.base/ui/book-group-reservation` are compatibility re-exports.
- `@ui.base/ui` now exports generic primitives and `styles.css` explicitly.

## Package versions changed

- `@ui.base/ui`: `0.3.1`
- `@ui.base/hero`: `0.2.1`
- `@ui.base/tour-ui`: `0.1.1`

## Build output

`npm run build` and `npm run package:pack` were run after the changes. The `package-output/` folder now includes the `@ui.base/tour-ui` package.
