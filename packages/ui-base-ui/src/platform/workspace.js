import { copySerializable, defaultSettings, validateDefinition, validateSettings } from './definition.js';

const STORAGE_KEY = 'ui-base:component-workspaces:v1';
export function createMemoryWorkspaceStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } };
}

export class ComponentWorkspaceStore {
  constructor(registry, { storage = globalThis.localStorage, key = STORAGE_KEY, idFactory = () => crypto.randomUUID(), now = () => new Date().toISOString() } = {}) {
    if (!storage) throw new Error('Workspace storage is unavailable.');
    this.registry = registry; this.storage = storage; this.key = key; this.idFactory = idFactory; this.now = now;
  }

  _read() {
    const raw = this.storage.getItem(this.key);
    if (raw === null) return { schemaVersion: '1.0.0', records: {} };
    let data;
    try { data = copySerializable(JSON.parse(raw)); } catch { throw new Error('Workspace storage is unreadable. Existing data has not been replaced.'); }
    if (!data || data.schemaVersion !== '1.0.0' || !data.records || typeof data.records !== 'object' || Array.isArray(data.records)) throw new Error('Unsupported workspace storage format.');
    for (const [id, record] of Object.entries(data.records)) {
      try {
        if (!record || record.workspaceId !== id || !Number.isSafeInteger(record.revision) || record.revision < 1
          || record.lifecycle?.state !== 'workspace' || typeof record.updatedAt !== 'string') throw new Error('Invalid workspace record.');
        this._validate(record);
      } catch (error) { throw new Error(`Workspace storage is incompatible: ${error.message} Existing data has not been replaced.`); }
    }
    return data;
  }
  _write(data) { this.storage.setItem(this.key, JSON.stringify(copySerializable(data))); }
  _record(data, id) {
    if (!Object.hasOwn(data.records, id)) throw new Error(`Workspace not found: ${id}.`);
    return data.records[id];
  }
  _check(record, expectedRevision) {
    if (record.lifecycle.state !== 'workspace') throw new Error('Published revisions cannot be edited or deleted.');
    if (record.revision !== expectedRevision) throw new Error('Workspace changed since it was opened. Reload before saving.');
  }
  _validate(record) {
    const definition = this.registry.resolve(record.componentId);
    if (!record.instance || typeof record.instance !== 'object' || Array.isArray(record.instance)) throw new Error('A Component instance is required.');
    const errors = validateDefinition(record.definition);
    if (errors.length) throw new Error(errors.join('\n'));
    errors.push(...validateSettings(record.definition, record.instance.settings));
    if (record.definition.lifecycle.state !== 'workspace') errors.push('Save cannot publish or mutate a published revision.');
    for (const key of Object.keys(record.instance)) if (!['instanceId', 'componentId', 'settings', 'serviceRefs'].includes(key)) errors.push(`Unknown instance field: ${key}.`);
    if (!record.instance.serviceRefs || typeof record.instance.serviceRefs !== 'object' || Array.isArray(record.instance.serviceRefs)) errors.push('Service references must be an object.');
    for (const [name, reference] of Object.entries(record.instance.serviceRefs || {})) {
      if (!(definition.dependencies.services || []).some(service => service.name === name) || typeof reference !== 'string') errors.push(`Invalid service reference: ${name}.`);
    }
    const fixed = input => {
      const value = copySerializable(input);
      delete value.identity.displayName; delete value.identity.description;
      value.lifecycle.state = 'installed';
      return JSON.stringify(value);
    };
    if (record.definition.identity.componentId !== record.componentId || fixed(record.definition) !== fixed(definition)) errors.push('Only display name and description can change in a reference definition workspace.');
    if (record.instance.componentId !== record.componentId || typeof record.instance.instanceId !== 'string' || !record.instance.instanceId) errors.push('Instance identity must refer to the owning Component.');
    if (errors.length) throw new Error(errors.join('\n'));
  }

  create(reference) {
    const definition = this.registry.resolve(reference);
    const data = this._read();
    const workspaceId = `ws_${this.idFactory()}`;
    if (Object.hasOwn(data.records, workspaceId)) throw new Error('Workspace ID collision.');
    const record = {
      workspaceId, componentId: definition.identity.componentId, basedOnRevisionId: definition.version.revisionId,
      revision: 1, lifecycle: { state: 'workspace' }, updatedAt: this.now(),
      definition: copySerializable(definition),
      instance: { instanceId: `inst_${this.idFactory()}`, componentId: definition.identity.componentId, settings: defaultSettings(definition), serviceRefs: {} }
    };
    record.definition.lifecycle.state = 'workspace';
    this._validate(record); data.records[workspaceId] = record; this._write(data);
    return copySerializable(record);
  }

  list() { return Object.values(this._read().records).map(record => copySerializable(record)); }
  get(id) { return copySerializable(this._record(this._read(), id)); }

  save(id, content, expectedRevision) {
    const data = this._read(); const current = this._record(data, id); this._check(current, expectedRevision);
    const { definition, instance } = copySerializable(content);
    const next = { ...current, definition, instance, revision: current.revision + 1, updatedAt: this.now() };
    if (instance?.instanceId !== current.instance.instanceId) throw new Error('Instance identity cannot be changed by Save.');
    this._validate(next); data.records[id] = next; this._write(data);
    return copySerializable(next);
  }

  clone(id) {
    const data = this._read(); const source = this._record(data, id);
    if (source.lifecycle.state !== 'workspace') throw new Error('Open a workspace before cloning.');
    const next = copySerializable(source);
    next.workspaceId = `ws_${this.idFactory()}`; next.instance.instanceId = `inst_${this.idFactory()}`;
    next.revision = 1; next.updatedAt = this.now();
    if (Object.hasOwn(data.records, next.workspaceId)) throw new Error('Workspace ID collision.');
    this._validate(next); data.records[next.workspaceId] = next; this._write(data);
    return copySerializable(next);
  }

  delete(id, expectedRevision) {
    const data = this._read(); const record = this._record(data, id); this._check(record, expectedRevision);
    delete data.records[id]; this._write(data);
  }
}
