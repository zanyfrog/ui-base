import manifest from '../ui.component.json';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ComponentRegistry } from '../src/platform/registry.js';
import { ComponentWorkspaceStore, createMemoryWorkspaceStorage } from '../src/platform/workspace.js';
import { changeSetting, copySerializable, defaultSettings, validateDefinition, validateSettings } from '../src/platform/definition.js';
import { renderComponentInstance } from '../src/platform/renderer.js';
import { createPropertyEditor, createDefinitionEditor } from '../src/platform/property-editor.js';

const source = manifest.components.find(entry => entry.tagName === 'uib-card');
const setup = () => {
  const registry = new ComponentRegistry(); registry.registerManifest(manifest, { packageId: '@ui-base/ui' });
  let id = 0;
  const storage = createMemoryWorkspaceStorage();
  const store = new ComponentWorkspaceStore(registry, { storage, idFactory: () => String(++id) });
  return { registry, storage, store, definition: registry.resolve('uib-card') };
};
afterEach(() => document.body.replaceChildren());

describe('canonical definition and registry', () => {
  it('registers only the reference and resolves stable identity and compatibility exports', () => {
    const { registry, definition } = setup();
    expect(validateDefinition(source)).toEqual([]);
    expect(registry.discover()).toHaveLength(1);
    for (const route of [source.identity.componentId, 'uib-card', 'card', '@ui-base/ui/card', '@ui-base/ui#UibCard', '@ui-base/ui/layout#UibCard']) expect(registry.resolve(route)).toBe(definition);
    expect(Object.isFrozen(definition.builder.settings)).toBe(true);
    expect(registry.discover({ capability: 'selectable' })).toEqual([definition]);
  });
  it('requires an owner to disambiguate a tag shared by multiple packages', () => {
    const { registry, definition } = setup(); const other = copySerializable(source);
    other.identity.componentId = 'cmp_application_other'; other.ownership.scope = 'application'; other.ownership.package.packageId = '@app/components';
    other.implementation.importPath = '@app/components/card'; other.implementation.aliases = [];
    registry.registerManifest({ components: [other] }, { packageId: '@app/components', scope: 'application' });
    expect(() => registry.resolve('uib-card')).toThrow(/Ambiguous/);
    expect(registry.resolve('uib-card', { packageId: '@ui-base/ui', scope: 'platform' })).toBe(definition);
    expect(registry.resolve('uib-card', { scope: 'application' }).identity.componentId).toBe('cmp_application_other');
  });
  it('rejects a whole manifest before registration when one entry is invalid', () => {
    const registry = new ComponentRegistry(); const bad = copySerializable(source); bad.identity.componentId = 'other'; bad.builder.settings.href.binding.name = 'missing';
    expect(() => registry.registerManifest({ components: [source, bad] }, { packageId: '@ui-base/ui' })).toThrow(/unknown attribute/);
    expect(registry.discover()).toEqual([]);
    bad.builder.settings.href.binding = { kind: 'property', name: 'href' };
    expect(validateDefinition(bad).join(' ')).toMatch(/read-only/);
  });
  it('reports malformed envelopes instead of throwing while validating them', () => {
    for (const input of [null, [], {}, { ...source, builder: { settings: {}, groups: [null] } }, { ...source, capabilities: null }]) expect(validateDefinition(input).length).toBeGreaterThan(0);
    const changed = copySerializable(source); changed.implementation.runtimeBinding.tagName = 'other-card';
    expect(validateDefinition(changed).join(' ')).toMatch(/Runtime binding/);
  });
  it.each([() => {}, new Date(), document.createElement('div'), undefined, Infinity])('keeps runtime values outside serializable records (%s)', value => {
    expect(() => copySerializable({ value })).toThrow();
  });
  it('rejects cyclic and accessor payloads without invoking accessors', () => {
    const cycle = {}; cycle.self = cycle; expect(() => copySerializable(cycle)).toThrow(/cycle/);
    const getter = vi.fn(); const object = {}; Object.defineProperty(object, 'value', { get: getter });
    expect(() => copySerializable(object)).toThrow(/data field/); expect(getter).not.toHaveBeenCalled();
  });
});

describe('Builder interaction contract', () => {
  it('resets incompatible settings on mode change while rejecting ambiguous imported settings', () => {
    const initial = { ...defaultSettings(source), heading: 'Summary', interactionMode: 'link', href: '/next' };
    expect(validateSettings(source, initial)).toEqual([]);
    expect(validateSettings(source, { ...initial, selected: true }).join(' ')).toMatch(/not allowed/);
    const next = changeSetting(source, initial, 'interactionMode', 'selectable');
    expect(next.href).toBe(''); expect(validateSettings(source, next)).toEqual([]);
  });
  it('requires meaningful modes, accessible names, and safe URLs', () => {
    const values = defaultSettings(source);
    expect(validateSettings(source, { ...values, interactionMode: 'link' }).join(' ')).toMatch(/required/);
    expect(validateSettings(source, { ...values, interactionMode: 'action' }).join(' ')).toMatch(/action token/);
    expect(validateSettings(source, { ...values, interactionMode: 'selectable', heading: '', label: '', header: '', ariaLabel: '' }).join(' ')).toMatch(/accessible name/);
    for (const href of ['javascript:alert(1)', '//evil.test', 'https:\\evil.test']) expect(validateSettings(source, { ...values, interactionMode: 'link', href }).join(' ')).toMatch(/unsupported URL/);
    expect(validateSettings(source, { ...values, selected: 'false' }).join(' ')).toMatch(/boolean/);
  });
  it('resolves event references only at the runtime boundary', () => {
    const { registry } = setup(); const values = { ...defaultSettings(source), heading: 'Run', interactionMode: 'action', action: 'run', actionHandler: 'handler.run' };
    expect(validateSettings(source, values)).toEqual([]);
    expect(validateSettings(source, values, { registry, resolveHandlers: true })).toEqual(['Handler is not registered: handler.run.']);
    registry.registerHandler('handler.run', () => {});
    expect(validateSettings(source, values, { registry, resolveHandlers: true })).toEqual([]);
  });
});

describe('local workspace lifecycle', () => {
  it('creates, saves, reloads, clones, and deletes without changing component identity', () => {
    const { store, registry, storage } = setup(); const first = store.create('uib-card');
    first.definition.identity.displayName = 'Summary card'; first.instance.settings.heading = 'Saved heading';
    const saved = store.save(first.workspaceId, first, first.revision);
    expect(saved.revision).toBe(2); expect(registry.resolve('uib-card').identity.displayName).toBe('Card');
    const reopened = new ComponentWorkspaceStore(registry, { storage }).get(first.workspaceId);
    expect(reopened.instance.settings.heading).toBe('Saved heading');
    const clone = store.clone(first.workspaceId);
    expect(clone.componentId).toBe(first.componentId); expect(clone.instance.instanceId).not.toBe(first.instance.instanceId);
    expect(clone.workspaceId).not.toBe(first.workspaceId); expect(clone.revision).toBe(1);
    store.delete(clone.workspaceId, clone.revision); expect(store.list()).toHaveLength(1);
    store.delete(saved.workspaceId, saved.revision); expect(store.list()).toEqual([]);
    expect(store.publish).toBeUndefined();
  });
  it('rejects stale saves and deletes and preserves the saved record', () => {
    const { store } = setup(); const first = store.create('uib-card'); const saved = store.save(first.workspaceId, first, 1);
    expect(() => store.save(first.workspaceId, first, 1)).toThrow(/Reload/);
    expect(() => store.delete(first.workspaceId, 1)).toThrow(/Reload/);
    expect(store.get(first.workspaceId)).toEqual(saved);
  });
  it('prohibits code, identity, instance identity, publication and runtime objects in Save', () => {
    const { store } = setup(); const first = store.create('uib-card');
    for (const mutate of [item => { item.definition.implementation.module = './other.js'; }, item => { item.definition.identity.componentId = 'different'; }, item => { item.definition.lifecycle.state = 'published'; }, item => { item.instance.instanceId = 'different'; }, item => { item.instance.settings.actionHandler = () => {}; }, item => { item.instance.serviceRefs.unknown = {}; }]) {
      const changed = copySerializable(first); mutate(changed); expect(() => store.save(first.workspaceId, changed, 1)).toThrow();
      expect(store.get(first.workspaceId)).toEqual(first);
    }
  });
  it('does not overwrite unreadable storage or swallow persistence failures', () => {
    const { registry, storage } = setup(); storage.setItem('bad', '{broken');
    const bad = new ComponentWorkspaceStore(registry, { storage, key: 'bad' }); expect(() => bad.create('uib-card')).toThrow(/unreadable/); expect(storage.getItem('bad')).toBe('{broken');
    const denied = new ComponentWorkspaceStore(registry, { storage: { getItem: () => null, setItem: () => { throw new Error('quota'); } } });
    expect(() => denied.create('uib-card')).toThrow(/quota/);
    storage.setItem('bad', JSON.stringify({ schemaVersion: '1.0.0', records: { invalid: { workspaceId: 'invalid', revision: 1, lifecycle: { state: 'workspace' }, updatedAt: '' } } }));
    const original = storage.getItem('bad'); expect(() => bad.list()).toThrow(/incompatible/); expect(() => bad.create('uib-card')).toThrow(/incompatible/); expect(storage.getItem('bad')).toBe(original);
  });
});

describe('shared renderer and generated editor', () => {
  it('renders real cards, text slots and presence booleans without treating content as HTML', () => {
    const { store, registry, definition } = setup(); const record = store.create('uib-card');
    Object.assign(record.instance.settings, { heading: 'Summary', body: '<img onerror=alert(1)>', interactionMode: 'selectable', selected: true, disabled: false });
    const card = renderComponentInstance(definition, record.instance, { registry }); document.body.append(card);
    expect(card.constructor.name).toBe('UibCard'); expect(card.selected).toBe(true); expect(card.disabled).toBe(false);
    expect(card.querySelector('img')).toBeNull(); expect(card.textContent).toContain('<img onerror');
    expect(card.shadowRoot.querySelector('.uib-card').getAttribute('aria-pressed')).toBe('true');
  });
  it('uses in-memory handlers in runtime while preview only observes and cancels actions', () => {
    const { store, registry, definition } = setup(); const record = store.create('uib-card');
    const handler = vi.fn(() => false); const events = vi.fn(); registry.registerHandler('run', handler);
    Object.assign(record.instance.settings, { heading: 'Run', interactionMode: 'action', action: 'run', actionHandler: 'run' });
    const live = renderComponentInstance(definition, record.instance, { registry }); document.body.append(live);
    const click = () => new MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
    const activation = click(); live.shadowRoot.querySelector('.uib-card').dispatchEvent(activation);
    expect(handler).toHaveBeenCalledTimes(1); expect(activation.defaultPrevented).toBe(true);
    const preview = renderComponentInstance(definition, record.instance, { registry, preview: true, onEvent: events }); document.body.append(preview);
    preview.shadowRoot.querySelector('.uib-card').dispatchEvent(click());
    expect(handler).toHaveBeenCalledTimes(1); expect(events).toHaveBeenCalledWith(expect.objectContaining({ type: 'uib-card-action' }));
  });
  it('creates controls from bindings and exposes only the selected mode fields', () => {
    const values = defaultSettings(source); const changed = vi.fn();
    const form = createPropertyEditor(source, values, { onChange: changed });
    expect(form.querySelector('[data-setting="href"]')).toBeNull();
    const mode = form.querySelector('[data-setting="interactionMode"]'); mode.value = 'link'; mode.dispatchEvent(new Event('change'));
    const link = createPropertyEditor(source, changed.mock.calls[0][0]); expect(link.querySelector('[data-setting="href"]')).not.toBeNull();
    expect(link.querySelector('[data-setting="selected"]')).toBeNull();
    const metadata = createDefinitionEditor(source, { onChange: changed }); const name = metadata.querySelector('[data-setting="displayName"]');
    name.value = 'Changed'; name.dispatchEvent(new Event('change')); expect(changed).toHaveBeenLastCalledWith('identity.displayName', 'Changed');
  });
  it('preserves earlier field edits when subsequent controls change', () => {
    const changes = vi.fn(); const form = createPropertyEditor(source, defaultSettings(source), { onChange: changes });
    const edit = (name, value) => { const field = form.querySelector(`[data-setting="${name}"]`); field.value = value; field.dispatchEvent(new Event('change')); };
    edit('heading', 'First edit'); edit('body', 'Second edit'); edit('interactionMode', 'selectable');
    expect(changes.mock.lastCall[0]).toMatchObject({ heading: 'First edit', body: 'Second edit', interactionMode: 'selectable' });
  });
});
