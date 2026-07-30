# PageImporter Continuation Notes - 2026-07-29

## Current State

`PageImporter` has a first working flow for importing a URL through `@ui-base/page-import-service`, displaying extracted items, preview, database suggestions, assets, tree, logs, artifact JSON, and source in tabs.

The demo route is:

```text
http://localhost:5173/layout/pageimporter
```

The local extraction service is:

```text
http://localhost:4178
```

The active live test URL has been:

```text
https://apps-treas2--qa.sandbox.my.site.com/MintTour/s/
```

## Recent Fixes And Decisions

### URL Panel Layout

The PageImporter URL action panel should preserve the package layout rule:

- The URL input uses 6 of 12 columns on laptop/desktop width.
- The action icons use the remaining 6 columns.
- The layout collapses to one column only at smaller widths.

This is implemented in the component's local shadow styles so the demo does not break if the global package stylesheet is not loaded.

### Loading And Logs

When `Import URL` runs:

- A visible loading icon/status should show while the URL is loading and parsing.
- The loading state should clear after extraction finishes or fails.
- Logs should include:
  - Start loading web page.
  - Web page loaded.
  - Started parsing web page into Extracted Items.
  - Finished parsing web page into Extracted Items.

### Text Extraction

For imported URLs:

- Paragraphs, spans, divs, and headings with meaningful text should become instructional items when they are visible page content.
- The extracted record should preserve the text, source snippet, CSS snippet, and position.
- The preview should show the extracted and edited item list, not an iframe of the original page.

### Actions And Buttons

Buttons and role-button elements should be extracted as action components.

Examples from the MintTour page:

- `Make a reservation`
- `Cancel a reservation`
- `Book a Group Tour`

Framework-only/error-overlay actions such as `dismissError` should be preserved in raw metadata but hidden from normal preview and final generated page output.

## Accessibility Hidden Content

Salesforce includes a `Skip to Main Content` accessibility link:

```html
<a class="forceSkipLink" href="javascript:void(0);">Skip to Main Content</a>
```

On the MintTour page, it is not normally visible because Salesforce clips it visually with CSS similar to:

```css
position: absolute;
overflow: hidden;
clip: rect(1px, 1px, 1px, 1px);
width: 24px;
height: 12px;
```

Important decision:

- Items with class `forceSkipLink` should remain accessible.
- They should keep their original extracted kind, usually `action`.
- They should use `componentTag: "aria-hidden"`.
- In this project, `aria-hidden` means visually hidden but screen-reader accessible.
- They should appear under "Show hidden/accessibility items" by default, while preserving original page order.
- They should not be mixed into the normal visible business-content list.
- They should not be discarded.

This naming is project-specific and differs from the standard ARIA meaning of `aria-hidden="true"`, which normally hides content from assistive technology. Here, the component name means an accessibility-supporting visually hidden component.

## Hidden Detection Rules

The extractor should mark items as hidden/accessibility/system items when rendered CSS indicates they are not visible page content.

Current and desired checks include:

- `display: none`
- `visibility: hidden`
- `visibility: collapse`
- `opacity: 0`
- `clip` other than `auto`
- `clip-path` other than `none`
- Tiny rendered bounds.
- Offscreen rendered bounds.
- Known framework-only controls such as Salesforce Aura error overlay actions.
- Known accessibility skip links such as `.forceSkipLink`.

The extracted item should include a note explaining why it was hidden, and its CSS snippet should preserve the hiding evidence such as `overflow`, `clip`, and `clip-path`.

## Salesforce `c-*` Subcomponents

Any custom element whose tag starts with `c-` should be treated as an application subcomponent.

Example:

```html
<c-mint-tour-name></c-mint-tour-name>
```

Should become:

- `kind`: likely `unknown` or a future subcomponent kind.
- `componentTag`: `ui-subcomponent`.
- Application component name: replace only the first `c-` with `app-`.
- Example output name: `app-mint-tour-name`.

These components are expected to live under a local application component service, likely named:

```text
@app-components
```

or a local service named:

```text
app-components
```

Decision:

- A `c-*` element should become a `ui-subcomponent` placeholder in the main PageImporter artifact.
- The placeholder remains in the current page artifact as a separate instance, preserving position, label, hidden state, source snippet, CSS snippet, attributes, and usage metadata.
- Children inside the `c-*` component should not be stored directly in the parent page's normal item list.
- The child extraction should be stored in a separate local `app-extraction` artifact for that application component.
- The user should be able to open/view the separate app extraction from the subcomponent card.
- Duplicate `c-*` tags should store one shared component definition, but the current page artifact should keep separate usage instances because each usage may have different position/props.

## Open Questions To Resume With

1. Should the main `ui-subcomponent` card show a child summary such as `4 fields, 2 actions, 3 instructions`?
2. Should each `ui-subcomponent` instance expose editable instance metadata such as label, route position, hidden state, and bound props in the first pass?
3. Should the shared app component definition store extracted child structure once, while each PageImporter instance stores only usage, position, and props?
4. When the user opens a `ui-subcomponent`, should it open in a PageImporter-like editor or a simpler component detail panel first?
5. Should the separate `app-extraction` artifact include raw HTML/CSS/JS for the `c-*` subtree, or only classified child items?

## Suggested Next Phase

Implement the subcomponent/accessibility classification layer in `@ui-base/page-import-service`.

First implementation tasks:

1. Update the extraction schema to allow item metadata for:
   - `componentTag: "aria-hidden"`
   - `componentTag: "ui-subcomponent"`
   - `applicationComponentName`
   - `appExtractionId`
   - `serviceName`
   - `hiddenReason`
   - `accessibilityRole`
2. Change `.forceSkipLink` handling so it sets `componentTag: "aria-hidden"` and remains under hidden/accessibility items.
3. Extract `c-*` custom elements as parent `ui-subcomponent` records.
4. Prevent child items inside `c-*` components from appearing in the parent page's main extracted list.
5. Create a separate local `app-extraction` artifact shape for the child extraction.
6. Deduplicate shared app component definitions by original custom tag name.
7. Preserve separate usage instances in the page artifact.
8. Add PageImporter UI affordance to view/open the linked app extraction from a subcomponent item card.

## Validation Targets

Use the MintTour URL to confirm:

- `Skip to Main Content` is extracted, ordered correctly, marked hidden/accessibility, and uses `componentTag: "aria-hidden"`.
- `Make a reservation` and other visible buttons remain normal action components.
- `dismissError` remains hidden as framework/system UI.
- Any `c-*` Salesforce custom elements become `ui-subcomponent` records.
- Child items inside `c-*` components move to the separate app extraction artifact instead of cluttering the parent page item list.

