import {
  DEFAULT_ASSET_UPLOAD_POLICY,
  MANAGER_ASSET_PERMISSIONS,
  VIEWER_ASSET_PERMISSIONS,
  assetSelection,
  clone,
  normalizeAsset
} from '../asset-core.js';

const now = '2026-06-27T12:00:00.000Z';

function id(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'asset';
}

function imageSvg(label, color = '#174a8b') {
  const safe = encodeURIComponent(String(label || 'Asset'));
  const svg = (
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">` +
  `<rect width="640" height="360" rx="32" fill="#eef4fb"/>` +
  `<circle cx="520" cy="80" r="86" fill="#f4bd46" opacity="0.72"/>` +
  `<rect x="56" y="76" width="300" height="48" rx="24" fill="` +
  (color) +
  `" opacity="0.95"/>` +
  `<rect x="56" y="150" width="480" height="24" rx="12" fill="#13294b" opacity="0.24"/>` +
  `<rect x="56" y="196" width="420" height="24" rx="12" fill="#13294b" opacity="0.16"/>` +
  `<text x="56" y="298" fill="#13294b" font-family="Arial, sans-serif" font-size="36" font-weight="700">` +
  (safe) +
  `</text>` +
  `</svg>`
);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const sampleAssets = [
  {
    id: 'asset_sample_site_hero',
    key: 'sample-site-hero',
    name: 'Sample Visitor Center Hero Image',
    description: 'Hero image used by the Sample App landing page.',
    fileName: 'sample-site-hero.webp',
    fileType: 'image',
    mimeType: 'image/webp',
    sourceType: 'local_file',
    url: imageSvg('Sample Visitor Center Hero'),
    thumbnailUrl: imageSvg('Sample Visitor Center Hero'),
    categories: ['hero', 'demo-app', 'image'],
    tags: ['sample', 'site', 'hero'],
    scope: 'application',
    visibility: 'application_private',
    applicationId: 'demo-app',
    ownerId: 'original-creator',
    permissionSetKey: 'demo-app-asset-admins',
    currentVersionId: 'assetver_sample_site_hero_v3',
    currentVersionNumber: 3,
    isActive: true,
    createdAt: '2026-06-01T12:00:00.000Z',
    updatedAt: now,
    lastUpdatedAt: now,
    fileSizeBytes: 482180,
    permissions: { ...MANAGER_ASSET_PERMISSIONS }
  },
  {
    id: 'asset_organization_seal',
    key: 'organization-seal',
    name: 'Organization Seal',
    description: 'Global seal used by official Organization-branded pages.',
    fileName: 'organization-seal.svg',
    fileType: 'svg',
    mimeType: 'image/svg+xml',
    sourceType: 'local_file',
    url: imageSvg('Organization Seal', '#0b2f63'),
    thumbnailUrl: imageSvg('Organization Seal', '#0b2f63'),
    categories: ['brand', 'seal', 'global'],
    tags: ['seal', 'brand'],
    scope: 'global',
    visibility: 'public',
    applicationId: '',
    ownerId: 'global-assets',
    permissionSetKey: 'global-brand-assets',
    currentVersionId: 'assetver_organization_seal_v1',
    currentVersionNumber: 1,
    isActive: true,
    createdAt: '2026-05-19T12:00:00.000Z',
    updatedAt: '2026-06-20T12:00:00.000Z',
    lastUpdatedAt: '2026-06-20T12:00:00.000Z',
    fileSizeBytes: 17380,
    permissions: { ...VIEWER_ASSET_PERMISSIONS, canCopyToApp: true }
  },
  {
    id: 'asset_calendar_icon',
    key: 'calendar-icon-url',
    name: 'Calendar Icon URL',
    description: 'External icon URL used by calendar and tour detail cards.',
    fileName: '',
    fileType: 'icon',
    mimeType: 'image/svg+xml',
    sourceType: 'icon_url',
    url: imageSvg('Calendar Icon', '#2e7d32'),
    thumbnailUrl: imageSvg('Calendar Icon', '#2e7d32'),
    categories: ['icon', 'calendar', 'tour-detail'],
    tags: ['calendar', 'icon'],
    scope: 'shared',
    visibility: 'shared_private',
    applicationId: '',
    ownerId: 'shared-assets',
    permissionSetKey: 'shared-asset-editors',
    currentVersionId: 'assetver_calendar_icon_v2',
    currentVersionNumber: 2,
    isActive: true,
    createdAt: '2026-06-10T12:00:00.000Z',
    updatedAt: '2026-06-26T12:00:00.000Z',
    lastUpdatedAt: '2026-06-26T12:00:00.000Z',
    fileSizeBytes: 8920,
    permissions: { ...MANAGER_ASSET_PERMISSIONS, canHardDelete: false }
  },
  {
    id: 'asset_sample_tour_hero_config',
    key: 'demo-app-hero-config',
    name: 'Sample App Hero Config',
    description: 'JSON configuration asset for a package-owned hero default override.',
    fileName: 'demo-app-hero-config.json',
    fileType: 'component_config',
    mimeType: 'application/json',
    sourceType: 'component_config',
    url: '',
    thumbnailUrl: '',
    categories: ['hero', 'configuration'],
    tags: ['hero', 'json'],
    scope: 'application',
    visibility: 'application_private',
    applicationId: 'demo-app',
    ownerId: 'demo-app-admin',
    permissionSetKey: 'demo-app-asset-admins',
    currentVersionId: 'assetver_sample_tour_hero_config_v1',
    currentVersionNumber: 1,
    isActive: true,
    createdAt: '2026-06-23T12:00:00.000Z',
    updatedAt: '2026-06-23T12:00:00.000Z',
    lastUpdatedAt: '2026-06-23T12:00:00.000Z',
    fileSizeBytes: 1874,
    permissions: { ...MANAGER_ASSET_PERMISSIONS },
    raw: {
      component: '@ui.base/hero',
      defaults: 'demo-app',
      visualMode: 'background'
    }
  },
  {
    id: 'asset_restricted_floorplan',
    key: 'restricted-floorplan',
    name: 'Restricted Floorplan',
    description: 'Visible metadata with restricted storage and usage fields.',
    fileName: 'floorplan.pdf',
    fileType: 'pdf',
    mimeType: 'application/pdf',
    sourceType: 'local_file',
    url: '',
    thumbnailUrl: '',
    categories: ['document', 'security'],
    tags: ['restricted'],
    scope: 'global',
    visibility: 'admin_only',
    applicationId: '',
    ownerId: 'security',
    permissionSetKey: 'admin-only-assets',
    currentVersionId: 'assetver_restricted_floorplan_v1',
    currentVersionNumber: 1,
    isActive: true,
    createdAt: '2026-06-11T12:00:00.000Z',
    updatedAt: '2026-06-11T12:00:00.000Z',
    lastUpdatedAt: '2026-06-11T12:00:00.000Z',
    fileSizeBytes: 218771,
    storagePath: 'data/uploads/assets/global/floorplan.pdf',
    maskedFields: ['storagePath', 'url', 'usage'],
    permissions: { ...VIEWER_ASSET_PERMISSIONS, canDownload: false, canViewUsage: false }
  }
];

const sampleCategories = [
  { key: 'hero', name: 'Hero', description: 'Hero images and hero configuration assets.' },
  { key: 'icon', name: 'Icon', description: 'Icons used in components.' },
  { key: 'brand', name: 'Brand', description: 'Official brand assets.' },
  { key: 'configuration', name: 'Configuration', description: 'JSON/component configuration assets.' },
  { key: 'document', name: 'Document', description: 'Documents and PDFs.' }
];

const samplePermissionSets = [
  { key: 'public-view', name: 'Public View', description: 'Anyone may view public files. Writes require admin permission.' },
  { key: 'demo-app-asset-admins', name: 'Sample App Asset Admins', description: 'Sample App application admins can manage app-owned assets.' },
  { key: 'shared-asset-editors', name: 'Shared Asset Editors', description: 'Trusted editors may update shared assets.' },
  { key: 'global-brand-assets', name: 'Global Brand Assets', description: 'Global brand assets are managed centrally and may be reused.' },
  { key: 'admin-only-assets', name: 'Admin Only Assets', description: 'Assets hidden unless the actor has elevated permission.' }
];

const sampleUsage = {
  asset_sample_site_hero: [
    { id: 'usage_sample_tour_home', applicationId: 'demo-app', applicationName: 'Sample App', entityType: 'hero', entityId: 'home', label: 'Sample App home hero background' },
    { id: 'usage_sample_tour_preview', applicationId: 'demo-app', applicationName: 'Sample App', entityType: 'page', entityId: 'tour-details', label: 'Tour detail promotional panel' }
  ],
  asset_organization_seal: [
    { id: 'usage_global_header', applicationId: 'organization', applicationName: 'Organization Portal', entityType: 'component', entityId: 'global-header', label: 'Global header brand seal' },
    { id: 'usage_sample_footer', applicationId: 'demo-app', applicationName: 'Sample App', entityType: 'component', entityId: 'footer', label: 'Footer official seal' }
  ],
  asset_calendar_icon: [
    { id: 'usage_calendar_filter', applicationId: 'demo-app', applicationName: 'Sample App', entityType: 'calendar', entityId: 'tour-calendar', label: 'Tour calendar icon' }
  ],
  asset_sample_tour_hero_config: [
    { id: 'usage_sample_config', applicationId: 'demo-app', applicationName: 'Sample App', entityType: 'hero', entityId: 'home', label: 'Sample App hero default config' }
  ]
};

const sampleVersions = {
  asset_sample_site_hero: [
    { id: 'assetver_sample_site_hero_v1', assetId: 'asset_sample_site_hero', versionNumber: 1, status: 'approved', fileName: 'sample-site-hero-v1.webp', createdAt: '2026-06-01T12:00:00.000Z', createdBy: 'original-creator', notes: 'Initial hero upload.' },
    { id: 'assetver_sample_site_hero_v2', assetId: 'asset_sample_site_hero', versionNumber: 2, status: 'approved', fileName: 'sample-site-hero-v2.webp', createdAt: '2026-06-11T12:00:00.000Z', createdBy: 'demo-app-admin', notes: 'Improved crop.' },
    { id: 'assetver_sample_site_hero_v3', assetId: 'asset_sample_site_hero', versionNumber: 3, status: 'pending_review', fileName: 'sample-site-hero-v3.webp', createdAt: now, createdBy: 'demo-app-admin', notes: 'Pending brand review.' }
  ],
  asset_organization_seal: [
    { id: 'assetver_organization_seal_v1', assetId: 'asset_organization_seal', versionNumber: 1, status: 'approved', fileName: 'organization-seal.svg', createdAt: '2026-05-19T12:00:00.000Z', createdBy: 'global-assets', notes: 'Approved brand asset.' }
  ],
  asset_calendar_icon: [
    { id: 'assetver_calendar_icon_v1', assetId: 'asset_calendar_icon', versionNumber: 1, status: 'approved', fileName: 'calendar-icon.svg', createdAt: '2026-06-10T12:00:00.000Z', createdBy: 'shared-assets', notes: 'Initial icon.' },
    { id: 'assetver_calendar_icon_v2', assetId: 'asset_calendar_icon', versionNumber: 2, status: 'approved', fileName: 'calendar-icon-v2.svg', createdAt: '2026-06-26T12:00:00.000Z', createdBy: 'shared-assets', notes: 'Updated line weight.' }
  ],
  asset_sample_tour_hero_config: [
    { id: 'assetver_sample_tour_hero_config_v1', assetId: 'asset_sample_tour_hero_config', versionNumber: 1, status: 'approved', fileName: 'demo-app-hero-config.json', createdAt: '2026-06-23T12:00:00.000Z', createdBy: 'demo-app-admin', notes: 'Initial config.' }
  ],
  asset_restricted_floorplan: [
    { id: 'assetver_restricted_floorplan_v1', assetId: 'asset_restricted_floorplan', versionNumber: 1, status: 'approved', fileName: 'floorplan.pdf', createdAt: '2026-06-11T12:00:00.000Z', createdBy: 'security', notes: 'Restricted.' }
  ]
};

function applyActorProfile(asset, actorProfile) {
  const next = clone(asset);
  if (actorProfile === 'viewer') {
    next.permissions = { ...VIEWER_ASSET_PERMISSIONS, canCopyToApp: asset.scope !== 'application' };
    if (next.visibility === 'admin_only') {
      next.permissions.canDownload = false;
      next.permissions.canViewUsage = false;
      next.maskedFields = Array.from(new Set([...(next.maskedFields || []), 'storagePath', 'usage', 'url']));
    }
  }
  if (actorProfile === 'admin') {
    next.permissions = { ...MANAGER_ASSET_PERMISSIONS, canHardDelete: asset.scope === 'application' };
  }
  if (actorProfile === 'restricted') {
    if (asset.visibility === 'admin_only') return null;
    next.permissions = { ...VIEWER_ASSET_PERMISSIONS, canDownload: asset.visibility === 'public' };
    if (asset.scope !== 'application') next.maskedFields = Array.from(new Set([...(next.maskedFields || []), 'storagePath']));
  }
  return next;
}

export class MockAssetProvider {
  constructor(options = {}) {
    this.actorProfile = options.actorProfile || 'admin';
    this.applicationKey = options.applicationKey || 'demo-app';
    this.assets = clone(options.assets || sampleAssets).map((asset) => normalizeAsset(asset));
    this.categories = clone(options.categories || sampleCategories);
    this.permissionSets = clone(options.permissionSets || samplePermissionSets);
    this.usage = clone(options.usage || sampleUsage);
    this.versions = clone(options.versions || sampleVersions);
    this.uploadPolicy = clone(options.uploadPolicy || DEFAULT_ASSET_UPLOAD_POLICY);
    this.supportsDirectFileUpload = true;
  }

  visibleAssets() {
    return this.assets
      .map((asset) => applyActorProfile(asset, this.actorProfile))
      .filter(Boolean)
      .map((asset) => normalizeAsset(asset));
  }

  async search(request = {}) {
    const query = String(request.query || '').trim().toLowerCase();
    const filters = request.filters || {};
    let records = this.visibleAssets();

    if (query) {
      records = records.filter((asset) => [asset.name, asset.key, asset.description, asset.fileName, ...(asset.categories || []), ...(asset.tags || [])]
        .some((value) => String(value || '').toLowerCase().includes(query)));
    }
    if (filters.fileType && filters.fileType !== 'all') records = records.filter((asset) => asset.fileType === filters.fileType);
    if (filters.scope && filters.scope !== 'all') records = records.filter((asset) => asset.scope === filters.scope);
    if (filters.visibility && filters.visibility !== 'all') records = records.filter((asset) => asset.visibility === filters.visibility);
    if (filters.category && filters.category !== 'all') records = records.filter((asset) => asset.categories.includes(filters.category));
    if (filters.status === 'active') records = records.filter((asset) => asset.isActive);
    if (filters.status === 'archived') records = records.filter((asset) => !asset.isActive);

    return { count: records.length, records };
  }

  async getAsset(assetId) {
    const asset = this.visibleAssets().find((item) => item.id === assetId || item.key === assetId);
    if (!asset) throw new Error(`Asset not found: ${assetId}`);
    return asset;
  }

  async createAsset(request = {}) {
    const key = slugify(request.key || request.assetKey || request.asset_key || request.name || request.fileName || 'new-asset');
    const file = request.file instanceof Blob ? request.file : null;
    const objectUrl = file && typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : '';
    const scope = request.reuseScope || request.reuse_scope || request.scope || 'global';
    const visibility = request.assetVisibility || request.asset_visibility || request.visibility || 'public';
    const category = request.category || request.categoryKey || request.category_key || request.categories?.[0] || 'general';
    const asset = normalizeAsset({
      id: id('asset'),
      key,
      name: request.name || request.fileName || key,
      description: request.description || '',
      fileName: request.fileName || request.originalFileName || request.original_file_name || '',
      fileType: request.fileType || request.assetType || request.asset_type || 'other',
      mimeType: request.mimeType || request.mime_type || file?.type || '',
      sourceType: request.sourceType || request.source_type || 'local_file',
      url: request.url || objectUrl,
      thumbnailUrl: request.thumbnailUrl || request.thumbnail_url || request.url || objectUrl,
      category,
      categories: request.categories || [category].filter(Boolean),
      tags: request.tags || [],
      scope,
      reuseScope: scope,
      visibility,
      assetVisibility: visibility,
      applicationId: request.applicationId || request.applicationKey || request.application_key || this.applicationKey,
      ownerApplicationKey: request.ownerApplicationKey || request.owner_application_key || request.applicationKey || request.application_key || this.applicationKey,
      permissionSetKey: request.permissionSetKey || request.permission_set_key || 'demo-app-asset-admins',
      currentVersionId: id('assetver'),
      currentVersionNumber: 1,
      isActive: request.isActive ?? request.is_active ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      fileSizeBytes: request.fileSizeBytes || request.file_size_bytes || file?.size || 0,
      altText: request.altText || request.alt_text || '',
      permissions: { ...MANAGER_ASSET_PERMISSIONS }
    });
    this.assets.unshift(asset);
    this.versions[asset.id] = [{ id: asset.currentVersionId, assetId: asset.id, versionNumber: 1, status: asset.scope === 'application' ? 'approved' : 'pending_review', fileName: asset.fileName, createdAt: asset.createdAt, createdBy: 'mock-user', notes: 'Created from mock provider.' }];
    return asset;
  }

  async updateAsset(assetId, patch = {}) {
    const index = this.assets.findIndex((asset) => asset.id === assetId || asset.key === assetId);
    if (index === -1) throw new Error(`Asset not found: ${assetId}`);
    const next = normalizeAsset({ ...this.assets[index], ...patch, updatedAt: new Date().toISOString(), lastUpdatedAt: new Date().toISOString() });
    this.assets[index] = next;
    return next;
  }

  async uploadAssetFile(assetId, file, options = {}) {
    const asset = await this.getAsset(assetId);
    const versionNumber = (this.versions[asset.id] || []).length + 1;
    const objectUrl = file && typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : '';
    const version = {
      id: id('assetver'),
      assetId: asset.id,
      versionNumber,
      status: asset.scope === 'application' ? 'approved' : 'pending_review',
      fileName: file?.name || asset.fileName || `${asset.key}.bin`,
      createdAt: new Date().toISOString(),
      createdBy: options.actorId || 'mock-user',
      notes: options.notes || 'Uploaded through mock provider.'
    };
    this.versions[asset.id] = [...(this.versions[asset.id] || []), version];
    await this.updateAsset(asset.id, {
      fileName: version.fileName,
      url: objectUrl || asset.url,
      thumbnailUrl: objectUrl || asset.thumbnailUrl,
      currentVersionId: version.id,
      currentVersionNumber: version.versionNumber,
      fileSizeBytes: file?.size || asset.fileSizeBytes
    });
    return version;
  }

  async copyAssetToApplication(assetId, applicationKey = this.applicationKey, options = {}) {
    const source = await this.getAsset(assetId);
    const key = slugify(options.key || `${source.key}-${applicationKey || 'app'}-copy`);
    const copy = normalizeAsset({
      ...source,
      raw: undefined,
      id: id('asset'),
      key,
      name: options.name || source.name,
      description: options.description ?? source.description,
      scope: 'application',
      reuseScope: 'application',
      visibility: source.visibility === 'public' ? 'public' : 'application_private',
      assetVisibility: source.visibility === 'public' ? 'public' : 'application_private',
      applicationId: applicationKey,
      applicationKey,
      ownerApplicationKey: applicationKey,
      currentVersionId: id('assetver'),
      currentVersionNumber: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      permissions: { ...MANAGER_ASSET_PERMISSIONS },
      copiedFromAssetId: source.id
    });
    this.assets.unshift(copy);
    this.versions[copy.id] = [{ id: copy.currentVersionId, assetId: copy.id, versionNumber: 1, status: 'approved', fileName: copy.fileName, createdAt: copy.createdAt, createdBy: 'mock-user', notes: `Copied from ${source.id}.` }];
    return copy;
  }

  async createExternalUrlAsset(request = {}) {
    return this.createAsset({ ...request, sourceType: request.sourceType || 'external_url', fileType: request.fileType || 'external_url', url: request.url });
  }

  async createJsonAsset(request = {}) {
    const body = typeof request.json === 'string' ? request.json : JSON.stringify(request.json || {}, null, 2);
    return this.createAsset({ ...request, sourceType: request.sourceType || 'json', fileType: request.fileType || 'json', mimeType: 'application/json', fileSizeBytes: body.length });
  }

  async archiveAsset(assetId, reason = '') {
    await this.updateAsset(assetId, { isActive: false, archivedAt: new Date().toISOString(), archivedBy: 'mock-user', archiveReason: reason });
  }

  async restoreAsset(assetId) {
    await this.updateAsset(assetId, { isActive: true, archivedAt: '', archivedBy: '' });
  }

  async hardDeleteAsset(assetId) {
    this.assets = this.assets.filter((asset) => asset.id !== assetId && asset.key !== assetId);
  }

  async submitVersion(assetId, versionId) {
    const version = (this.versions[assetId] || []).find((item) => item.id === versionId);
    if (version) version.status = 'pending_review';
    return version;
  }

  async approveVersion(assetId, versionId) {
    const version = (this.versions[assetId] || []).find((item) => item.id === versionId);
    if (version) version.status = 'approved';
    return version;
  }

  async rejectVersion(assetId, versionId, reason = '') {
    const version = (this.versions[assetId] || []).find((item) => item.id === versionId);
    if (version) {
      version.status = 'rejected';
      version.rejectionReason = reason;
    }
    return version;
  }

  async listCategories() { return clone(this.categories); }
  async listPermissionSets() { return clone(this.permissionSets); }
  async listUsage(assetId) { return clone(this.usage[assetId] || []); }
  async listVersions(assetId) { return clone(this.versions[assetId] || []); }
  async getUploadPolicy() { return clone(this.uploadPolicy); }
  createSelection(asset, versionMode = 'pinned') { return assetSelection(asset, versionMode); }
}

export function createMockAssetProvider(options = {}) {
  return new MockAssetProvider(options);
}
