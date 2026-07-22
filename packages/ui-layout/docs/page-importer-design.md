# PageImporter Design Notes

## Purpose

`PageImporter` is a planned component for `@ui-base/ui-layout` that helps modernize existing web pages by importing a URL, extracting rendered front-end structure, and turning the result into an editable `PageImportArtifact`.

The first version should focus on form-based user interface pages and provide enough structure for users to review extracted fields, assets, layout information, and early database planning metadata. Later versions can use the same artifact to generate modernized pages with `@ui-base/forms`, `@ui-base/ui`, and `@ui-base/ui-layout`.

## First Milestone

The first usable milestone should support this flow:

1. User enters a URL.
2. A backend extraction service renders the page in a browser environment.
3. The service returns raw and rendered source information.
4. `PageImporter` separates the information into editable HTML, CSS, and JavaScript source panels.
5. The component displays extracted page pieces in editable flat lists.
6. The component preserves a tree model for page, section, container, and item relationships.
7. The component provides a reconstructed preview based on extracted and edited items.
8. The component tracks an event log and edit history.
9. The component stores the artifact in IndexedDB first.
10. The component can import/export the artifact as a file.
11. Hourly timestamped versions are persisted only when user edits have occurred.

The artifact schema and TypeScript types should be created before the UI panels so the mock extractor, IndexedDB storage, editor panels, and import/export flow all share the same model.

Schema migration helpers should be included from the first implementation, not deferred until a second schema version exists.

## Input Model

The first supported input is a URL.

The URL is expected to be public or already available to the user's browser/session. Authentication workflows, login automation, and credential handling are deferred.

The extraction service should use a browser-rendered DOM, likely through Playwright or an equivalent backend service. Raw HTML should also be preserved, but rendered DOM is the preferred source for classification because many maintained sites may generate forms, dashboards, and controls with JavaScript.

## Source Capture

The artifact should preserve enough original and rendered information to allow future versions of `PageImporter` to reprocess the page without requiring the original URL.

Source capture should include:

- Original URL, when known.
- Raw response HTML.
- Rendered DOM HTML.
- Captured original source that remains available after later edits.
- Editable working HTML, CSS, and JavaScript source.
- Discovered CSS.
- Discovered JavaScript.
- Script and stylesheet URLs.
- Asset URLs for images, icons, fonts, downloads, and other resources.
- Element selectors, DOM paths, source snippets, CSS classes, and attributes.
- Position information, including bounding boxes and inferred grid/column placement.
- Dependency and tooling versions used during extraction.

## Artifact Strategy

The first saved entity should be a single editable `PageImportArtifact`.

`PageImporter` should be exported from `@ui-base/ui-layout` immediately rather than kept internal. The artifact schema can still evolve through explicit schema versions and migrations.

Artifact IDs should use UUIDs, with project, route, page, source URL, and version metadata stored as searchable indexes.

The artifact should contain:

- Source capture.
- Extraction results.
- Editable item models.
- Page tree.
- Flat working lists.
- Deduplicated asset references.
- JavaScript behavior categories.
- Database planning metadata.
- Matching rule overrides.
- Extraction rule overrides.
- Event log.
- Edit history.
- Version metadata.

Artifact files should be timestamped. A likely folder shape is:

```text
modernization-projects/{projectName}/{routeOrSubProject}/imports/{pageSlug}/versions/{timestamp}/page-import-artifact.json
```

A stable latest pointer or index can be added later.

Older versions should open in a read-only review mode. A user may restore an older version as the latest, which should create a new editable version derived from that older artifact.

## Local Editing And Autosave

The first editing state should live locally in the browser, using IndexedDB because artifacts may contain large source strings, logs, and future screenshots.

IndexedDB records should be stored by artifact ID, with searchable and sortable project, route, page, and version metadata indexes rather than a strictly nested storage shape.

Hourly versioning should only persist a new version when user edits have occurred. Loading, viewing, preview refreshes, and passive logs should not create new timestamped versions by themselves.

The UI should also support manual artifact import and export.

Source edits should not automatically trigger reclassification. Users should explicitly run a reclassify action so reviewed edits are not disrupted by incidental source changes.

Reclassification should support both per-item and full-artifact actions. Per-item reclassification helps correct a single field or control, while full reclassification supports broader source, extraction rule, or matching rule changes.

Per-item reclassification may overwrite an item after user confirmation. Full-artifact reclassification should create a proposed changes view so users can accept, reject, or compare updates without losing reviewed edits.

The proposed changes view should compare all derived data, including extracted items, database planning, layout positions, matching results, behavior categories, and asset usage.

Source edits should invalidate derived database planning suggestions until the affected items are reclassified.

Stale database suggestions should be visually marked in the UI until affected items are reclassified or manually confirmed.

## Extracted Page Pieces

The importer should separate page content by purpose. The first pass should display mostly flat lists, while preserving a tree for reconstruction and context.

Item categories should include:

- Instructions and help text.
- Heroes and page introductions.
- Labels and inputs combined as one field item.
- Labels and static values.
- Buttons and actions.
- Field groups.
- Tables, lists, cards, and repeated structures.
- Dashboard panels and generated output.
- Images and media.
- Navigation items.
- Unknown or unsupported controls.

Unknown controls should be preserved as raw HTML, listed as unknown, and mapped to a generic component where practical so the user can decide how to handle them.

Hidden items remain editable and searchable, but they should not appear in reconstructed preview or final generated HTML, JavaScript, or CSS artifacts.

## Field Items

Label and input sets should be represented as one combined editable item.

Field items should capture:

- Label text.
- Original label text when useful.
- Input type.
- Name.
- ID.
- Placeholder.
- Value or default value.
- Required state.
- Disabled/read-only state.
- Validation attributes such as `min`, `max`, `maxlength`, `pattern`, and `step`.
- ARIA attributes.
- Help text.
- Validation messages.
- Options for select, radio, checkbox groups, and similar controls.
- Nearby instructions.
- Source selector and DOM path.
- Source HTML snippet.
- CSS classes and attributes.
- Position and inferred grid placement.
- Matched `@ui-base/forms` or `@ui-base/ui` component.
- Database planning metadata.
- Notes.

## Component Matching

`PageImporter` should use components from `@ui-base/forms` and `@ui-base/ui`.

Matching rules should be editable. Project-level defaults should apply first, and artifact-level overrides should handle page-specific differences.

The forms and UI packages should eventually expose component registries describing supported HTML patterns, props, validation options, and metadata hints. `PageImporter` can then match extracted items against these registries instead of hardcoding every rule.

Users should be able to save reusable mappings from edits. For example, after mapping an imported telephone field to a specific phone input component, the user should be able to apply that mapping to the item, the page, or the project defaults.

## Extraction And Matching Rules

Extraction rules and matching rules should be stored separately.

Extraction rules answer: what is on the original page?

Matching rules answer: which modern UI Base component should represent this extracted item?

Both project defaults and artifact overrides should be supported.

A project-level rules file may be stored separately from page artifacts:

```text
modernization-projects/{projectName}/project-import-rules.json
```

## Reconstructed Preview

The first preview should show the extraction and edited items, not the original page in an iframe.

The preview should aim for structural similarity rather than exact pixel replication. It should use inferred rows, columns, sections, and item order to show what the modernized page currently looks like.

Hidden items should disappear entirely from preview.

## Database Planning

The first version should include the minimum needed for database connection planning.

Database metadata should initially be inferred from input `name` or `id`, with editable values. Later versions may connect to known database schemas so users can map extracted fields to tables and columns.

Database planning should support:

- Inferred entity, based primarily on form name or page route.
- Suggested table name.
- Suggested column name.
- Data type.
- Required flag.
- Sample value.
- Field name.
- Label.
- Validation notes.
- Relationship notes.
- Multi-field mappings for cases like full name or address widgets.
- Non-field data needs such as lookup values, permissions, workflow states, audit fields, and dashboard/report query needs.

For the first version, review workflow states such as `reviewed`, `needs review`, and `ready` are deferred.

The minimum useful database planning set for version one is field name, label, type, sample value, entity/table guess, and required flag.

## JavaScript Preservation

The artifact should preserve most discovered JavaScript so it can be reused or reworked later.

The importer should categorize JavaScript where practical:

- Validation.
- Navigation.
- Visibility rules.
- Calculations.
- Data loading.
- Dashboard or chart logic.
- Unknown/general scripts.

Categorization is advisory. The original scripts should remain available even when categorization is incomplete.

## Asset References

Asset URLs should be deduplicated within the artifact. Each asset should have one record that can be referenced by multiple page items, scripts, stylesheets, or sections.

Asset records should include `usedBy` references back to item IDs, sections, scripts, stylesheets, or other artifact records that use them.

## Logs And History

The UI should include a scrollable event/log panel.

The artifact should store:

- Backend extraction events.
- Classification and warning messages.
- User edit history.
- Source edit history.
- Item edit history.
- Version creation events.
- Import/export events.

Field-level edit tracking should capture which properties changed and when. User/session metadata can be added later if needed.

## UI Shape

The first UI should use tabs, but panels should be modular so they can later move into split panes or dockable workspace layouts.

Initial panels:

- Import/source.
- Extracted items.
- Tree.
- Reconstructed preview.
- Database plan.
- Assets.
- Logs.
- Raw artifact text.

Users should be able to edit through structured forms, drag/drop or move controls in lists, and raw artifact text, with synchronization between those views.

Search should scroll to matching items across panels. Filtering can be added later.

## Backend Service Contract

The first implementation should define the service request and response shape, even if the backend is mocked.

Initial REST endpoints should include:

- `GET /health`
- `POST /extract`
- `POST /reclassify`

`POST /extract` should return an extraction result rather than a complete artifact. `PageImporter` should own artifact creation, version metadata, local state, and persistence.

The extraction result type should be named `PageExtractionResult`.

`POST /reclassify` should support both full-artifact requests and narrow item/source/rule requests so the UI can reclassify one item or the whole artifact.

Reclassification results should include both replacement objects for easy application and patch/diff data for review.

Item IDs should remain stable across reclassification whenever possible so edit history, database mappings, and asset usage references remain durable.

The mocked extractor should return realistic imperfect data so the UI can exercise correction workflows, unknown controls, hidden items, asset references, logs, and database field guesses.

The extraction service should live as a separate local service package from the beginning rather than inside `@ui-base/ui-layout`. The package should be named `@ui-base/page-import-service`.

The backend service should perform initial classification because it has access to the rendered DOM, computed styles, layout positions, and browser execution context. `PageImporter` should still allow browser-side reclassification later when rules or source text change.

The service should expose both a REST API for the component and a CLI for batch importing, local testing, and future automation.

The CLI should output or export JSON for another tool to save. It should not own artifact persistence directly, keeping extraction and storage responsibilities compartmentalized.

The first implementation should focus on one URL at a time. Batch importing multiple URLs is deferred until the single-page workflow is solid.

The first demo fixture should include instructions, hero content, an image, form fields, select/radio/checkbox controls, static label/value pairs, buttons, a small table, dashboard tiles, and one intentionally unknown control.

The first demo should allow switching between mock and real extraction services.

The service should support configurable wait conditions, including network idle, selector waits, fixed delay, and later a custom JavaScript readiness expression.

The service does not need to return screenshots in version one.

The service may access external assets directly to inspect metadata such as content type, dimensions, or basic availability, while the artifact initially stores original URLs rather than downloaded copies.

A future real service should:

- Render the URL in a browser.
- Wait for the page to settle.
- Capture raw and rendered source.
- Capture computed element metadata.
- Capture asset URLs.
- Capture bounding boxes and layout information.
- Return extraction logs and warnings.

## Open Questions

1. How much of the component registry should live in `@ui-base/forms` and `@ui-base/ui` versus a neutral importer configuration file?
2. What should the first schema package/module be named inside this package?
3. Should migration helpers mutate artifacts in place or return upgraded copies?
4. Should asset inspection failures be warnings, errors, or non-blocking log entries?
5. Should stable item IDs be based on source location, semantic fingerprint, UUID, or a combination?
