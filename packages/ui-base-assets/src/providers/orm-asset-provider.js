import { MANAGER_ASSET_PERMISSIONS, normalizeAsset } from '../asset-core.js';

function joinUrl(baseUrl, path) {
  return `${String(baseUrl || '').replace(/\/$/, '')}${path}`;
}

function queryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') return;
    search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}

function unwrapRecord(value) {
  if (value?.storageRecord || value?.record) {
    return { ...(value.storageRecord || {}), ...(value.record || {}), ...(value.asset || {}) };
  }
  return value?.record || value?.asset || value;
}

function recordsFromBody(body) {
  if (Array.isArray(body)) return body.map(unwrapRecord);
  if (Array.isArray(body?.records)) return body.records.map(unwrapRecord);
  if (Array.isArray(body?.items)) return body.items.map(unwrapRecord);
  return [];
}

function normalizeCategory(category) {
  const record = unwrapRecord(category) || {};
  return {
    key: record.key || record.categoryKey || record.category_key || record.id || '',
    name: record.name || record.displayName || record.display_name || record.categoryKey || record.category_key || record.key || '',
    description: record.description || '',
    raw: record
  };
}

async function parseResponse(response) {
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!response.ok) {
    const error = new Error(body?.error || body?.message || `Request failed with ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

function appendFormValue(form, key, value) {
  if (value === undefined || value === null || value === '') return;
  if (Array.isArray(value)) form.append(key, JSON.stringify(value));
  else if (typeof value === 'object' && !(typeof Blob !== 'undefined' && value instanceof Blob)) form.append(key, JSON.stringify(value));
  else form.append(key, String(value));
}

function assetUpdatePayload(patch = {}) {
  const out = { ...patch };
  if (Object.prototype.hasOwnProperty.call(out, 'key') && !Object.prototype.hasOwnProperty.call(out, 'asset_key')) out.asset_key = out.key;
  if (Object.prototype.hasOwnProperty.call(out, 'assetKey') && !Object.prototype.hasOwnProperty.call(out, 'asset_key')) out.asset_key = out.assetKey;
  if (Object.prototype.hasOwnProperty.call(out, 'scope') && !Object.prototype.hasOwnProperty.call(out, 'reuse_scope')) out.reuse_scope = out.scope;
  if (Object.prototype.hasOwnProperty.call(out, 'reuseScope') && !Object.prototype.hasOwnProperty.call(out, 'reuse_scope')) out.reuse_scope = out.reuseScope;
  if (Object.prototype.hasOwnProperty.call(out, 'visibility') && !Object.prototype.hasOwnProperty.call(out, 'asset_visibility')) out.asset_visibility = out.visibility;
  if (Object.prototype.hasOwnProperty.call(out, 'assetVisibility') && !Object.prototype.hasOwnProperty.call(out, 'asset_visibility')) out.asset_visibility = out.assetVisibility;
  if (Array.isArray(out.categories) && !out.category) out.category = out.categories[0] || '';
  if (Array.isArray(out.tags)) out.tags = JSON.stringify(out.tags);
  delete out.key;
  delete out.assetKey;
  delete out.scope;
  delete out.reuseScope;
  delete out.visibility;
  delete out.assetVisibility;
  delete out.categories;
  return out;
}

function assetCreatePayload(request = {}) {
  const scope = request.reuseScope || request.reuse_scope || request.scope || 'global';
  const visibility = request.assetVisibility || request.asset_visibility || request.visibility || 'public';
  const fileType = request.assetType || request.asset_type || request.fileType || 'other';
  const category = request.category || request.categoryKey || request.category_key || request.categories?.[0] || 'general';
  return {
    asset_key: request.assetKey || request.asset_key || request.key,
    name: request.name,
    description: request.description,
    asset_type: fileType,
    fileType,
    mime_type: request.mimeType || request.mime_type,
    mimeType: request.mimeType || request.mime_type,
    category,
    categories: request.categories || [category].filter(Boolean),
    reuse_scope: scope,
    scope,
    asset_visibility: visibility,
    visibility,
    tags: request.tags || [],
    usage_context: request.usageContext || request.usage_context,
    alt_text: request.altText || request.alt_text,
    caption: request.caption,
    is_active: request.isActive ?? request.is_active ?? true,
    is_public: visibility === 'public',
    original_file_name: request.originalFileName || request.original_file_name || request.fileName,
    fileName: request.fileName,
    file_size_bytes: request.fileSizeBytes || request.file_size_bytes,
    application_key: request.applicationKey || request.application_key
  };
}

export class OrmAssetProvider {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || '';
    this.applicationKey = options.applicationKey || '';
    this.getAuthHeaders = options.getAuthHeaders || (() => ({}));
    this.fetchImpl = options.fetch || globalThis.fetch?.bind(globalThis);
    this.supportsDirectFileUpload = true;
    if (!this.fetchImpl) throw new Error('OrmAssetProvider requires fetch support or an options.fetch implementation.');
  }

  headers(extra = {}) {
    return { ...this.getAuthHeaders(), ...extra };
  }

  canManageFromHeaders() {
    const headers = this.headers();
    return ['X-Orm-Admin', 'X-Application-Admin', 'X-Shared-Asset-Admin', 'X-Global-Asset-Admin', 'X-Admin-Applications']
      .some((name) => Boolean(headers[name] || headers[name.toLowerCase()]));
  }

  normalizeAssetRecord(record) {
    const normalized = normalizeAsset(record);
    if (this.canManageFromHeaders()) normalized.permissions = { ...normalized.permissions, ...MANAGER_ASSET_PERMISSIONS };
    return normalized;
  }

  async request(path, options = {}) {
    const headers = this.headers(options.headers || {});
    if (options.body instanceof FormData) delete headers['Content-Type'];
    const response = await this.fetchImpl(joinUrl(this.baseUrl, path), {
      ...options,
      headers
    });
    return parseResponse(response);
  }

  assetsPath(assetId = '', suffix = '', applicationKey = this.applicationKey) {
    const scopePath = applicationKey ? `/applications/${encodeURIComponent(applicationKey)}/assets` : '/assets';
    return `${scopePath}${assetId ? `/${encodeURIComponent(assetId)}` : ''}${suffix}`;
  }

  async search(request = {}) {
    const filters = request.filters || {};
    const applicationKey = request.applicationKey ?? filters.applicationKey ?? this.applicationKey;
    const body = await this.request(`${this.assetsPath('', '', applicationKey)}${queryString({
      search: request.query,
      q: request.query,
      application_key: filters.applicationKey,
      asset_type: filters.fileType,
      fileType: filters.fileType,
      reuse_scope: filters.scope,
      scope: filters.scope,
      asset_visibility: filters.visibility,
      visibility: filters.visibility,
      category: filters.category,
      status: filters.status,
      includeShared: request.includeShared ? 'true' : '',
      includeInactive: filters.status === 'archived' || request.includeInactive ? 'true' : ''
    })}`);
    const records = recordsFromBody(body).map((record) => this.normalizeAssetRecord(record));
    return { count: body?.count ?? records.length, records, facets: body?.facets || {} };
  }

  async getAsset(assetId, applicationKey = this.applicationKey) {
    return this.normalizeAssetRecord(unwrapRecord(await this.request(this.assetsPath(assetId, '', applicationKey))));
  }

  async createAsset(request = {}) {
    const payload = assetCreatePayload(request);
    if (typeof Blob !== 'undefined' && request.file instanceof Blob) {
      const form = new FormData();
      form.append('file', request.file, request.fileName || request.file.name || 'asset');
      Object.entries(payload).forEach(([key, value]) => appendFormValue(form, key, value));
      const created = await this.request(this.assetsPath('', '', request.applicationKey || request.application_key || this.applicationKey), {
        method: 'POST',
        body: form
      });
      return this.normalizeAssetRecord(unwrapRecord(created));
    }

    return this.normalizeAssetRecord(unwrapRecord(await this.request(this.assetsPath('', '', request.applicationKey || request.application_key || this.applicationKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })));
  }

  async updateAsset(assetId, patch = {}) {
    const payload = assetUpdatePayload(patch);
    return this.normalizeAssetRecord(unwrapRecord(await this.request(this.assetsPath(assetId, '', patch.applicationKey || patch.application_key || this.applicationKey), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })));
  }

  async uploadAssetFile(assetId, file, options = {}) {
    const form = new FormData();
    form.append('file', file);
    Object.entries(options).forEach(([key, value]) => appendFormValue(form, key, value));
    return this.request(this.assetsPath(assetId, '/replace-file', options.applicationKey || this.applicationKey), { method: 'POST', body: form });
  }

  async copyAssetToApplication(assetId, applicationKey = this.applicationKey, options = {}) {
    const body = await this.request(this.assetsPath(assetId, '/copy', applicationKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    return this.normalizeAssetRecord(unwrapRecord(body));
  }

  async createExternalUrlAsset(request = {}) {
    return this.normalizeAssetRecord(unwrapRecord(await this.request(`${this.assetsPath('', '', request.applicationKey || request.application_key || this.applicationKey)}/external-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })));
  }

  async createJsonAsset(request = {}) {
    return this.normalizeAssetRecord(unwrapRecord(await this.request(`${this.assetsPath('', '', request.applicationKey || request.application_key || this.applicationKey)}/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })));
  }

  async archiveAsset(assetId, reason = '') {
    return this.request(`${this.assetsPath(assetId)}/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
  }

  async restoreAsset(assetId, reason = '') {
    return this.request(`${this.assetsPath(assetId)}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
  }

  async hardDeleteAsset(assetId, reason = '') {
    return this.request(`${this.assetsPath(assetId)}/hard-delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
  }

  async submitVersion(assetId, versionId, reason = '') {
    return this.request(`${this.assetsPath(assetId)}/versions/${encodeURIComponent(versionId)}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
  }

  async approveVersion(assetId, versionId, reason = '') {
    return this.request(`${this.assetsPath(assetId)}/versions/${encodeURIComponent(versionId)}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
  }

  async rejectVersion(assetId, versionId, reason = '') {
    return this.request(`${this.assetsPath(assetId)}/versions/${encodeURIComponent(versionId)}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
  }

  async listCategories() {
    try {
      const body = await this.request('/assets/categories');
      return recordsFromBody(body).map(normalizeCategory);
    } catch (error) {
      if (error.status !== 404) throw error;
      const fallback = await this.request('/asset-categories');
      return recordsFromBody(fallback).map(normalizeCategory);
    }
  }

  async listPermissionSets() {
    try {
      const body = await this.request('/assets/permission-sets');
      return recordsFromBody(body);
    } catch (error) {
      if (error.status === 404) return [];
      throw error;
    }
  }

  async listUsage(assetId) {
    try {
      const body = await this.request(`${this.assetsPath(assetId)}/usage`);
      return recordsFromBody(body);
    } catch (error) {
      if (error.status === 404) return [];
      throw error;
    }
  }

  async listVersions(assetId) {
    try {
      const body = await this.request(`${this.assetsPath(assetId)}/versions`);
      return recordsFromBody(body);
    } catch (error) {
      if (error.status === 404) return [];
      throw error;
    }
  }

  async getUploadPolicy() {
    try {
      return await this.request('/assets/upload-policy');
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }
}

export function createOrmAssetProvider(options = {}) {
  return new OrmAssetProvider(options);
}
