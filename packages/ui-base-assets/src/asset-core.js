export const ASSET_FILE_TYPES = [
  'image',
  'svg',
  'icon',
  'video',
  'audio',
  'pdf',
  'document',
  'json',
  'component_config',
  'external_url',
  'other'
];

export const ASSET_SCOPES = ['application', 'shared', 'global'];
export const ASSET_VISIBILITIES = ['public', 'application_private', 'shared_private', 'global_private', 'admin_only'];
export const ASSET_VERSION_STATUSES = ['draft', 'pending_review', 'approved', 'rejected', 'archived'];

export const DEFAULT_ASSET_UPLOAD_POLICY = {
  allowedMimeTypes: [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
    'application/json',
    'text/plain'
  ],
  maxFileSizeBytes: 10 * 1024 * 1024,
  allowExternalUrl: true,
  allowJsonAsset: true,
  allowSvg: true,
  allowComponentConfig: true
};

export const EMPTY_ASSET_PERMISSIONS = {
  canView: false,
  canSelect: false,
  canDownload: false,
  canCopyToApp: false,
  canCreate: false,
  canEditMetadata: false,
  canReplaceFile: false,
  canUploadNewVersion: false,
  canSubmitForReview: false,
  canApproveVersion: false,
  canRejectVersion: false,
  canArchive: false,
  canRestore: false,
  canHardDelete: false,
  canViewUsage: false,
  canManagePermissions: false
};

export const MANAGER_ASSET_PERMISSIONS = Object.fromEntries(
  Object.keys(EMPTY_ASSET_PERMISSIONS).map((key) => [key, true])
);

export const VIEWER_ASSET_PERMISSIONS = {
  ...EMPTY_ASSET_PERMISSIONS,
  canView: true,
  canSelect: true,
  canDownload: true,
  canViewUsage: true
};

export const baseAssetStyles = `
  :host {
    --uib-assets-text: var(--uib-color-ink, #13294b);
    --uib-assets-muted: var(--uib-color-muted, #53657f);
    --uib-assets-surface: var(--uib-color-surface, #ffffff);
    --uib-assets-surface-soft: var(--uib-color-surface-soft, #f8fbff);
    --uib-assets-surface-tint: var(--uib-color-surface-tint, #eaf2fc);
    --uib-assets-border: var(--uib-color-border, #d9e2f0);
    --uib-assets-border-strong: var(--uib-color-border-strong, #aab8cc);
    --uib-assets-primary: var(--uib-color-primary, #174a8b);
    --uib-assets-primary-hover: var(--uib-color-primary-hover, #0b2f63);
    --uib-assets-primary-contrast: var(--uib-color-primary-contrast, #ffffff);
    --uib-assets-accent: var(--uib-color-accent, #f4bd46);
    --uib-assets-danger: var(--uib-color-danger, #b4232a);
    --uib-assets-warning: var(--uib-color-warning, #9f6500);
    --uib-assets-success: var(--uib-color-success, #2e7d32);
    --uib-assets-radius: var(--uib-radius-lg, 1rem);
    --uib-assets-radius-sm: var(--uib-radius-md, 0.75rem);
    --uib-assets-shadow: var(--uib-shadow-sm, 0 6px 18px rgba(10, 31, 68, 0.08));
    display: block;
    color: var(--uib-assets-text);
    font-family: var(--uib-font-family-sans, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  }

  *, *::before, *::after { box-sizing: border-box; }
  [hidden] { display: none !important; }

  .asset-card {
    border: 1px solid var(--uib-assets-border);
    border-radius: var(--uib-assets-radius);
    background: var(--uib-assets-surface);
    box-shadow: var(--uib-assets-shadow);
  }

  .surface-soft {
    border: 1px solid var(--uib-assets-border);
    border-radius: var(--uib-assets-radius-sm);
    background: var(--uib-assets-surface-soft);
  }

  .stack { display: grid; gap: 0.85rem; }
  .stack-sm { display: grid; gap: 0.5rem; }
  .row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
  .row-between { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; justify-content: space-between; }
  .muted { color: var(--uib-assets-muted); }
  .small { font-size: 0.86rem; }
  .tiny { font-size: 0.76rem; }
  .title { margin: 0; color: var(--uib-assets-text); font-size: 1.1rem; line-height: 1.15; letter-spacing: -0.02em; }
  .subtitle { margin: 0.2rem 0 0; color: var(--uib-assets-muted); line-height: 1.45; }

  button,
  .asset-button,
  input,
  select,
  textarea { font: inherit; }

  button,
  .asset-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.35rem;
    padding: 0.58rem 0.85rem;
    border: 1px solid var(--uib-assets-border-strong);
    border-radius: 999px;
    background: var(--uib-assets-surface);
    color: var(--uib-assets-text);
    cursor: pointer;
    font-weight: 850;
    text-decoration: none;
  }

  button:hover,
  .asset-button:hover { border-color: var(--uib-assets-primary); color: var(--uib-assets-primary); }
  button.primary,
  .asset-button.primary { border-color: var(--uib-assets-primary); background: var(--uib-assets-primary); color: var(--uib-assets-primary-contrast); }
  button.primary:hover,
  .asset-button.primary:hover { border-color: var(--uib-assets-primary-hover); background: var(--uib-assets-primary-hover); color: var(--uib-assets-primary-contrast); }
  button.danger { border-color: rgba(180, 35, 42, 0.35); color: var(--uib-assets-danger); }
  button:disabled { cursor: not-allowed; opacity: 0.48; }

  input,
  select,
  textarea {
    width: 100%;
    min-height: 2.45rem;
    border: 1px solid var(--uib-assets-border);
    border-radius: 0.75rem;
    padding: 0.65rem 0.75rem;
    background: var(--uib-assets-surface);
    color: var(--uib-assets-text);
  }

  textarea { min-height: 7rem; resize: vertical; }
  label { display: grid; gap: 0.35rem; color: var(--uib-assets-muted); font-size: 0.85rem; font-weight: 850; }

  :is(button, input, select, textarea, [tabindex]):focus-visible {
    outline: none;
    box-shadow: var(--uib-focus-ring, 0 0 0 4px rgba(23, 74, 139, 0.25));
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    min-height: 1.55rem;
    padding: 0.22rem 0.5rem;
    border: 1px solid var(--uib-assets-border);
    border-radius: 999px;
    background: var(--uib-assets-surface-soft);
    color: var(--uib-assets-muted);
    font-size: 0.74rem;
    font-weight: 850;
    line-height: 1;
    white-space: nowrap;
  }

  .badge.strong { background: var(--uib-assets-surface-tint); color: var(--uib-assets-primary); border-color: rgba(23, 74, 139, 0.18); }
  .badge.warning { background: #fff7e6; color: var(--uib-assets-warning); border-color: rgba(159, 101, 0, 0.28); }
  .badge.success { background: #edf8ee; color: var(--uib-assets-success); border-color: rgba(46, 125, 50, 0.25); }
  .badge.danger { background: #fff1f1; color: var(--uib-assets-danger); border-color: rgba(180, 35, 42, 0.25); }

  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th,
  .data-table td { padding: 0.75rem; border-bottom: 1px solid var(--uib-assets-border); text-align: left; vertical-align: top; }
  .data-table th { color: var(--uib-assets-muted); font-size: 0.76rem; letter-spacing: 0.04em; text-transform: uppercase; }
  .data-table tbody tr { cursor: pointer; }
  .data-table tbody tr:hover { background: var(--uib-assets-surface-soft); }
  .data-table tbody tr[aria-selected="true"] { background: var(--uib-assets-surface-tint); }

  .empty-state {
    padding: 1.25rem;
    border: 1px dashed var(--uib-assets-border-strong);
    border-radius: var(--uib-assets-radius-sm);
    background: var(--uib-assets-surface-soft);
    color: var(--uib-assets-muted);
    text-align: center;
  }

  .restricted {
    color: var(--uib-assets-muted);
    font-style: italic;
  }

  .code-block {
    overflow: auto;
    padding: 0.85rem;
    border-radius: 0.75rem;
    background: #061528;
    color: #dce9ff;
    font-family: var(--uib-font-family-mono, Consolas, monospace);
    font-size: 0.84rem;
    line-height: 1.5;
  }
`;

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function parseJson(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  try { return JSON.parse(String(value)); } catch { return fallback; }
}

export function boolFromAttribute(value, defaultValue = false) {
  if (value === null || value === undefined) return defaultValue;
  return !['false', '0', 'no', 'off'].includes(String(value).trim().toLowerCase());
}

export function formatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function formatBytes(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = number;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
}

export function humanize(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function clone(value) {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value));
}

export function normalizeAsset(asset) {
  const shaped = asset && typeof asset === 'object' ? asset : {};
  const source = shaped?.storageRecord || shaped?.record
    ? { ...(shaped.storageRecord || {}), ...(shaped.record || {}), ...(shaped.asset || {}) }
    : (asset?.record || asset?.asset || asset || {});
  const hasPermissionPayload = source.permissions && typeof source.permissions === 'object';
  const permissions = hasPermissionPayload
    ? { ...EMPTY_ASSET_PERMISSIONS, ...source.permissions }
    : { ...VIEWER_ASSET_PERMISSIONS };
  const fileType = source.fileType || source.assetType || source.asset_type || source.type || 'other';
  const publicUrl = source.publicUrl || source.public_url || source.url || '';
  const downloadUrl = source.downloadUrl || source.download_url || '';
  const primaryUrl = publicUrl || downloadUrl;
  const category = source.category || source.categoryKey || source.category_key || '';
  const listFromValue = (value) => {
    if (Array.isArray(value)) return value;
    const parsed = parseJson(value, null);
    if (Array.isArray(parsed)) return parsed;
    if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
    return [];
  };
  const parsedCategories = [
    ...listFromValue(source.categories),
    ...listFromValue(source.categoriesJson),
    ...listFromValue(source.categories_json),
    ...listFromValue(source.tags)
  ];
  const tags = listFromValue(source.tags);
  const categories = Array.from(new Set([category, ...parsedCategories].filter(Boolean)));
  const applicationId = source.applicationId || source.application_id || source.applicationKey || source.application_key || '';
  const ownerApplicationKey = source.ownerApplicationKey || source.owner_application_key || applicationId;
  const scope = source.scope || source.reuseScope || source.reuse_scope || 'application';
  const visibility = source.visibility || source.assetVisibility || source.asset_visibility || (source.isPublic === true || source.is_public === true ? 'public' : 'application_private');

  return {
    id: source.id || source.assetId || source.asset_id || '',
    key: source.key || source.assetKey || source.asset_key || source.id || source.assetId || source.asset_id || '',
    name: source.name || source.displayName || source.display_name || source.fileName || source.originalFileName || source.original_file_name || source.key || source.assetKey || source.asset_key || 'Untitled asset',
    description: source.description || '',
    fileName: source.fileName || source.originalFileName || source.original_file_name || '',
    fileType,
    assetType: fileType,
    mimeType: source.mimeType || source.mime_type || '',
    sourceType: source.sourceType || source.source_type || 'local_file',
    url: primaryUrl,
    publicUrl,
    downloadUrl,
    thumbnailUrl: source.thumbnailUrl || source.thumbnail_url || source.previewUrl || source.preview_url || primaryUrl,
    categories,
    category: category || categories[0] || '',
    tags,
    folderPath: source.folderPath || source.folder_path || '',
    scope,
    reuseScope: scope,
    visibility,
    assetVisibility: visibility,
    applicationId,
    applicationKey: applicationId,
    ownerApplicationKey,
    ownerId: source.ownerId || source.owner_id || source.createdBy || source.created_by || '',
    permissionSetKey: source.permissionSetKey || source.permission_set_key || 'application-asset-manager',
    parentRecordId: source.parentRecordId || source.parent_record_id || '',
    parentRecordType: source.parentRecordType || source.parent_record_type || '',
    currentVersionId: source.currentVersionId || source.current_version_id || source.versionId || source.version_id || '',
    currentVersionNumber: Number(source.currentVersionNumber || source.current_version_number || source.assetVersion || source.asset_version || 1),
    isActive: source.isActive !== undefined ? Boolean(source.isActive) : source.is_active !== false,
    archivedAt: source.archivedAt || source.archived_at || source.dateDeleted || source.date_deleted || '',
    archivedBy: source.archivedBy || source.archived_by || source.deletedBy || source.deleted_by || '',
    lastUpdatedAt: source.lastUpdatedAt || source.last_updated_at || source.updatedAt || source.dateUpdated || source.date_updated || '',
    createdAt: source.createdAt || source.created_at || source.dateCreated || source.date_created || '',
    updatedAt: source.updatedAt || source.updated_at || source.dateUpdated || source.date_updated || '',
    fileSizeBytes: Number(source.fileSizeBytes || source.file_size_bytes || 0),
    checksumSha256: source.checksumSha256 || source.checksum_sha256 || '',
    storagePath: source.storagePath || source.storage_path || '',
    altText: source.altText || source.alt_text || source.alt || '',
    caption: source.caption || '',
    maskedFields: asArray(source.maskedFields || source.masked_fields),
    permissions,
    raw: source.raw || source
  };
}

export function normalizeAssets(assets) {
  return asArray(assets).map(normalizeAsset).filter((asset) => asset.permissions.canView !== false);
}

export function assetSelection(asset, versionMode = 'pinned') {
  const normalized = normalizeAsset(asset);
  return {
    assetId: normalized.id,
    assetKey: normalized.key,
    versionMode,
    versionId: versionMode === 'pinned' ? normalized.currentVersionId : undefined,
    versionNumber: versionMode === 'pinned' ? normalized.currentVersionNumber : undefined,
    name: normalized.name,
    fileType: normalized.fileType,
    assetType: normalized.assetType || normalized.fileType,
    mimeType: normalized.mimeType,
    applicationKey: normalized.applicationKey,
    ownerApplicationKey: normalized.ownerApplicationKey,
    reuseScope: normalized.reuseScope || normalized.scope,
    assetVisibility: normalized.assetVisibility || normalized.visibility,
    publicUrl: normalized.publicUrl || normalized.url,
    downloadUrl: normalized.downloadUrl,
    altText: normalized.altText,
    description: normalized.description,
    url: normalized.url
  };
}

export function emitAssetEvent(target, name, detail = {}) {
  target.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }));
}

export function cssClassTokens(element) {
  return String(element?.getAttribute?.('css-class') ?? element?.cssClass ?? '')
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function applyCssClassToShadowRoot(element) {
  if (!element) return;
  const root = element.shadowRoot || element;
  const target = root.querySelector('[data-uib-css-class-root]')
    || Array.from(root.children).find((child) => child instanceof HTMLElement && child.localName !== 'style');
  if (!target) return;
  target.classList.remove(...(element.__uibCssClassTokens || []));
  const next = cssClassTokens(element);
  if (next.length) target.classList.add(...next);
  element.__uibCssClassTokens = next;
}

export function installCssClassProperty(constructor) {
  const prototype = constructor?.prototype;
  if (!prototype) return constructor;
  if (!Object.getOwnPropertyDescriptor(prototype, 'cssClass')) {
    Object.defineProperty(prototype, 'cssClass', {
      configurable: true,
      enumerable: true,
      get() { return this.getAttribute('css-class') || ''; },
      set(value) {
        if (value === null || value === undefined || value === false) this.removeAttribute('css-class');
        else this.setAttribute('css-class', String(value));
      }
    });
  }

  const observed = Array.isArray(constructor.observedAttributes) ? constructor.observedAttributes : [];
  if (!observed.includes('css-class')) {
    Object.defineProperty(constructor, 'observedAttributes', {
      configurable: true,
      value: [...observed, 'css-class']
    });
  }

  if (typeof prototype.render === 'function' && !prototype.__uibCssClassRenderWrapped) {
    const render = prototype.render;
    prototype.render = function renderWithCssClass(...args) {
      const result = render.apply(this, args);
      applyCssClassToShadowRoot(this);
      return result;
    };
    prototype.__uibCssClassRenderWrapped = true;
  }

  return constructor;
}

export function maskedValue(asset, fieldName, value) {
  if (asArray(asset?.maskedFields).includes(fieldName)) return '<span class="restricted">Restricted</span>';
  return escapeHtml(value || 'Not set');
}

export function statusBadge(status) {
  const value = String(status || 'unknown');
  const className = value === 'approved' ? 'success' : value === 'pending_review' ? 'warning' : value === 'rejected' || value === 'archived' ? 'danger' : 'strong';
  return `<span class="badge ${className}">${escapeHtml(humanize(value))}</span>`;
}

export function permissionBadge(allowed, label) {
  return `<span class="badge ${allowed ? 'success' : ''}">${allowed ? 'Allowed' : 'Hidden'}: ${escapeHtml(label)}</span>`;
}

export function registerElement(name, constructor) {
  installCssClassProperty(constructor);
  if (typeof customElements !== 'undefined' && !customElements.get(name)) {
    customElements.define(name, constructor);
  }
}
