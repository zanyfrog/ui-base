# PageImporter Phase 1

## Goal

Create the first version of `PageImporter` for `@ui-base/ui-layout`.

Phase 1 should import front-end code from a URL and separate the rendered page into useful editable component lists.

## Phase 1 Scope

The first version should:

1. Accept a URL.
2. Send the URL to `@ui-base/page-import-service`.
3. Use the service to load the page with a browser-rendered DOM.
4. Capture and display editable HTML, CSS, and JavaScript text areas.
5. Extract page pieces into simple lists.
6. Combine labels and inputs into one field item where possible.
7. Map detected controls to likely `@ui-base/forms` or `@ui-base/ui` components where practical.
8. Show a simple reconstructed preview from the extracted and edited items.
9. Store the working artifact locally in IndexedDB.
10. Allow manual artifact import/export as JSON.

## Extracted Lists

Phase 1 should focus on these lists:

- Fields: label plus input/control.
- Instructions/help text.
- Static label/value pairs.
- Buttons/actions.
- Images/assets by URL.
- Tables/lists/repeated blocks.
- Dashboard/output blocks.
- Unknown controls.

## Field Item Basics

Each field item should include:

- Label.
- Input type.
- Name.
- ID.
- Placeholder.
- Current/default value.
- Required flag.
- Options for select/radio/checkbox controls.
- Source selector or DOM path.
- Matched UI Base component, when known.

## First Artifact

Use one JSON artifact for Phase 1.

The artifact should include:

- Artifact ID.
- Project, route, and page metadata.
- Source URL.
- HTML/CSS/JS source.
- Extracted lists.
- Basic tree structure.
- Asset URLs.
- Basic database field suggestions.
- Event log.

## Database Planning Minimum

For Phase 1, database planning only needs:

- Field name.
- Label.
- Type.
- Required flag.
- Sample/default value.
- Entity/table guess from form name or route.

## Deferred

These are important, but not Phase 1:

- Multi-page import.
- Authentication flows.
- Pixel-perfect reconstruction.
- Saved generated replacement pages.
- Complex database schema mapping.
- Review workflow states.
- Screenshots.
- Batch import.
- Advanced merge/replay of edit history.

## Immediate Implementation Order

1. Define `PageImportArtifact` and `PageExtractionResult` types.
2. Define the `@ui-base/page-import-service` REST contract.
3. Build a mock extraction result.
4. Build `PageImporter` tabs for source, extracted lists, preview, assets, database, and logs.
5. Add IndexedDB draft storage.
6. Add JSON import/export.
7. Create the real `@ui-base/page-import-service` after the mock UI path is working.
8. Add the first demo route at `layout/pageimporter`.

## Local Service

Phase 1B adds `@ui-base/page-import-service`.

Start the demo app:

```bash
npm run dev:demo
```

Start the importer service in a second terminal:

```bash
npm run start -w @ui-base/page-import-service
```

The service listens on:

```text
http://localhost:4178
```

The `PageImporter` demo route is:

```text
http://localhost:5173/layout/pageimporter
```

Use **Import URL** to extract a rendered page through the local service, or **Load Mock** to use the built-in fixture.

## Immediate Questions

Resolved:

- Phase 1 starts with schema and UI using mocked extraction first.
- The real `@ui-base/page-import-service` should be created in the same phase, after the mock UI can consume the extraction shape.
- The first demo route should be `layout/pageimporter`.
