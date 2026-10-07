import { loadCardRegistry, ComponentWorkspaceStore, copySerializable, validateDefinition, validateSettings,
  createDefinitionEditor, createPropertyEditor, renderComponentInstance } from '../../../../packages/ui-base-ui/src/platform/index.js';

export async function renderCardReferenceRoute(main) {
  main.innerHTML = '<section class="page-heading"><h1>Card component workspace</h1><p>Loading the component definition…</p></section>';
  let registry, store;
  try {
    registry = await loadCardRegistry();
    store = new ComponentWorkspaceStore(registry);
    store.list();
  } catch (error) {
    if (main.isConnected) { const message = document.createElement('p'); message.setAttribute('role', 'alert'); message.textContent = error.message; main.append(message); }
    return;
  }
  if (!main.isConnected) return;
  const definition = registry.resolve('uib-card', { packageId: '@ui-base/ui', scope: 'platform' });
  main.innerHTML = `
    <section class="page-heading"><p class="eyebrow">Reference Platform Component</p><h1>Card component workspace</h1>
      <p>Edit component metadata and example settings, preview the real card, then save your workspace in this browser.</p></section>
    <section class="reference-workspace" aria-label="Card workspace">
      <div class="reference-toolbar">
        <label>Workspace <select data-workspace-list aria-label="Workspace"></select></label>
        <button type="button" class="secondary-button" data-new-workspace>New workspace</button>
        <button type="button" class="secondary-button" data-clone-workspace>Duplicate</button>
        <button type="button" class="secondary-button" data-reload-workspace>Reload saved</button>
        <button type="button" class="secondary-button" data-delete-workspace>Delete</button>
        <button type="button" class="secondary-button" data-validate-workspace>Validate</button>
        <button type="button" class="primary-button" data-save-workspace>Save workspace</button>
        <button type="button" class="secondary-button" disabled title="Publication is a later stage">Check In / Publish</button>
      </div>
      <p class="reference-status" role="status" data-workspace-status>No workspace open. Create one to begin.</p>
      <div class="reference-columns">
        <section aria-label="Component editor" data-workspace-editor></section>
        <section class="reference-preview-panel"><h2>Live preview</h2><p>Links stay in the preview. Actions are logged below.</p>
          <div data-component-preview></div><h3>Preview events</h3><pre data-preview-events aria-live="polite">No events yet.</pre>
        </section>
      </div>
      <p>Save keeps a local workspace. Publishing and shared storage are outside this reference stage.</p>
    </section>`;
  const list = main.querySelector('[data-workspace-list]');
  const editor = main.querySelector('[data-workspace-editor]');
  const preview = main.querySelector('[data-component-preview]');
  const status = main.querySelector('[data-workspace-status]');
  const eventLog = main.querySelector('[data-preview-events]');
  let draft = null; let dirty = false; const events = [];
  const message = (text, error = false) => { status.textContent = text; status.setAttribute('role', error ? 'alert' : 'status'); };
  const discard = () => !dirty || window.confirm('Discard unsaved workspace changes?');
  const run = action => { try { action(); } catch (error) { message(error.message, true); } };
  const refreshList = () => {
    list.replaceChildren();
    const records = store.list();
    if (!records.length) { const option = document.createElement('option'); option.textContent = 'No workspaces'; option.value = ''; list.append(option); }
    for (const record of records) { const option = document.createElement('option'); option.value = record.workspaceId; option.textContent = record.definition.identity.displayName; list.append(option); }
    if (draft) list.value = draft.workspaceId;
    for (const name of ['clone', 'reload', 'delete', 'validate', 'save']) main.querySelector(`[data-${name}-workspace]`).disabled = !draft;
  };
  const updatePreview = () => {
    preview.replaceChildren();
    if (!draft) return;
    const errors = validateDefinition(draft.definition).concat(validateSettings(draft.definition, draft.instance.settings));
    if (errors.length) { const warning = document.createElement('p'); warning.textContent = errors.join(' '); warning.setAttribute('role', 'alert'); preview.append(warning); return; }
    preview.append(renderComponentInstance(draft.definition, draft.instance, { registry, preview: true, onEvent: event => {
      events.push(event); if (events.length > 12) events.shift(); eventLog.textContent = events.map(item => JSON.stringify(item, null, 2)).join('\n');
    } }));
  };
  const renderEditor = () => {
    editor.replaceChildren();
    if (!draft) return;
    editor.append(createDefinitionEditor(draft.definition, { onChange: (path, value) => {
      const [section, property] = path.split('.'); draft.definition[section][property] = value; dirty = true; message('Unsaved changes.'); updatePreview();
    } }));
    const title = document.createElement('h2'); title.textContent = 'Example settings'; editor.append(title);
    editor.append(createPropertyEditor(draft.definition, draft.instance.settings, { onChange: (settings, name) => {
      draft.instance.settings = settings; dirty = true; message('Unsaved changes.'); updatePreview();
      if (name === 'interactionMode') { renderEditor(); editor.querySelector('[data-setting="interactionMode"]')?.focus(); }
    } }));
  };
  const open = record => {
    draft = copySerializable(record); dirty = false; events.length = 0; eventLog.textContent = 'No events yet.';
    renderEditor(); updatePreview(); refreshList(); message(`Workspace open. Saved locally · revision ${draft.revision}.`);
  };
  main.querySelector('[data-new-workspace]').addEventListener('click', () => run(() => { if (discard()) open(store.create(definition.identity.componentId)); }));
  list.addEventListener('change', () => run(() => { if (list.value && discard()) open(store.get(list.value)); else refreshList(); }));
  main.querySelector('[data-clone-workspace]').addEventListener('click', () => run(() => { if (discard()) open(store.clone(draft.workspaceId)); }));
  main.querySelector('[data-reload-workspace]').addEventListener('click', () => run(() => { if (discard()) open(store.get(draft.workspaceId)); }));
  main.querySelector('[data-delete-workspace]').addEventListener('click', () => run(() => {
    if (!window.confirm('Delete this saved workspace?')) return;
    store.delete(draft.workspaceId, draft.revision); draft = null; dirty = false;
    const remaining = store.list(); if (remaining.length) open(remaining[0]);
    else { renderEditor(); updatePreview(); refreshList(); message('Workspace deleted.'); }
  }));
  main.querySelector('[data-save-workspace]').addEventListener('click', () => run(() => {
    open(store.save(draft.workspaceId, { definition: draft.definition, instance: draft.instance }, draft.revision));
    message(`Workspace saved locally · revision ${draft.revision}. Nothing was published.`);
  }));
  main.querySelector('[data-validate-workspace]').addEventListener('click', () => run(() => {
    const errors = validateDefinition(draft.definition).concat(validateSettings(draft.definition, draft.instance.settings, { registry, resolveHandlers: true }));
    message(errors.length ? errors.join(' ') : 'Definition and example settings are valid. Publication remains unavailable.', errors.length > 0);
  }));
  const existing = store.list(); if (existing.length) open(existing[0]); else refreshList();
}
