# @ui-base/ui-layout

`@ui-base/ui-layout` provides source-backed layout tools for visualizing and safely editing the structure of HTML fragments and UI Base Web Components.

The package is built around one rule: analyze source content first, then produce controlled operations and reviewable diffs. It does not mutate a live DOM and reverse-engineer the result.

## What It Does

- Accepts source content from a parent app, plus optional file metadata.
- Analyzes plain HTML and TypeScript/JavaScript template strings.
- Detects static elements, custom elements, text nodes, and dynamic `${...}` template expressions.
- Marks risky dynamic areas as read-only.
- Provides `uib-layout-manager` for tree, preview, properties, diff, dirty state, and save request workflows.
- Provides `uib-layout-editor` for opening files, editing layout/JSON structure, autosave, backups, undo/redo, and event logging.
- Returns original source, updated source, and a diff when the user requests save.

## What It Does Not Do Yet

- It does not execute component source.
- It does not write files from the Web Component UI.
- It does not modify imports or event handler code.
- It does not support JSX, Lit, Vue, or Svelte-specific syntax yet.
- It does not enable move, wrap, or unwrap save-back operations yet.

## Usage

For the static workspace demo server, build the browser-runtime files first:

```bash
node scripts/build-ui-layout-browser.mjs
```

The static demos load `packages/ui-layout/browser/index.js` because the simple demo server does not transpile TypeScript.

```ts
import '@ui-base/ui-layout';

const manager = document.querySelector('uib-layout-manager');
manager.sourceText = sourceFromParent;
manager.fileName = 'example-component.ts';

manager.addEventListener('ui-layout-dirty-changed', (event) => {
  console.log(event.detail.dirty, event.detail.operations);
});

manager.addEventListener('ui-layout-save-requested', (event) => {
  console.log(event.detail.originalText);
  console.log(event.detail.updatedText);
  console.log(event.detail.diffText);
});
```

## Editor Component

```html
<uib-layout-editor startfolder="packages/"></uib-layout-editor>
```

The editor supports:

- Browser File System Access API folder picking when available.
- Event-based parent file-provider fallback.
- `.js`, `.ts`, `.html`, `.htm`, and `.json` files.
- Drag-and-drop static sibling layout moves.
- `Alt+ArrowUp` / `Alt+ArrowDown` keyboard reordering in the layout tree.
- Inline class, text, and attribute editing.
- JSON tree viewing with inline key/value edits.
- Undo/redo with standard OS shortcuts.
- Autosave after 2 seconds without changes.
- One timestamped `.bak` backup beside the file before the first dirty autosave.
- External timestamp change detection before autosave.
- User-focused event log export as JSON lines.

Parent file-provider events:

```ts
editor.addEventListener('ui-layout-editor-list-files-requested', (event) => {
  event.detail.resolve([{ path: 'packages/example.ts', name: 'example.ts', lastModified: Date.now() }]);
});

editor.addEventListener('ui-layout-editor-read-file-requested', (event) => {
  event.detail.resolve({ content: sourceText, fileName: 'example.ts', lastModified });
});

editor.addEventListener('ui-layout-editor-write-file-requested', (event) => {
  event.detail.resolve({ lastModified: Date.now() });
});

editor.addEventListener('ui-layout-editor-create-backup-requested', (event) => {
  event.detail.resolve();
});

editor.addEventListener('ui-layout-editor-stat-file-requested', (event) => {
  event.detail.resolve({ lastModified });
});
```

## Programmatic Analysis

```ts
import { analyzeComponentSource } from '@ui-base/ui-layout';

const analysis = analyzeComponentSource({
  sourceText,
  fileName: 'component.ts'
});
```

## Programmatic Patch

```ts
import { applyLayoutOperationsToSource } from '@ui-base/ui-layout';

const result = applyLayoutOperationsToSource(sourceText, [
  {
    id: 'op_001',
    type: 'add-class',
    nodeId: 'node_id',
    className: 'is-highlighted'
  }
], {
  fileName: 'component.ts'
});
```

The result contains:

```ts
{
  originalText,
  updatedText,
  diffText,
  changed,
  warnings
}
```

## CLI

The CLI accepts files for local developer workflows. It only writes when `--write` is passed.

```bash
mt-layout analyze src/component.ts --out layout-analysis.json
mt-layout patch src/component.ts --ops layout-operations.json --dry-run
mt-layout patch src/component.ts --ops layout-operations.json --write
```

## Layout Markers

The analyzer prefers explicit layout markers when present:

```html
<section
  class="workspace"
  data-layout-id="hero-workspace"
  data-layout-role="workspace"
  data-layout-edit="container"
  data-layout-label="Hero workspace"
></section>
```

Supported marker values for `data-layout-edit` include `container`, `section`, `panel`, `toolbar`, `field`, `field-group`, `text`, `repeatable`, `component`, and `readonly`.

## Safety Notes

- Dynamic expressions are represented as read-only nodes unless later source mapping support can prove they are safe.
- Save requests always include a diff.
- The Web Component UI never writes files by itself.
- The patcher only supports static class, static attribute, and static text operations in this MVP.

## Future Framework Support

Additional analyzers can be added by converting framework-specific source into the same `LayoutAnalysis` model. JSX, Lit, Vue, Svelte, and iframe-backed preview rendering should be separate analyzer/preview adapters rather than changes to the core node model.
