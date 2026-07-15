export type StorageRecord = Record<string, string>;

export interface ShapedRecord<TRecord = Record<string, unknown>> {
  record: TRecord;
  storageRecord: StorageRecord;
}

export interface ListResponse<TRecord = Record<string, unknown>> {
  count: number;
  records: ShapedRecord<TRecord>[];
  applicationKey?: string;
}

export interface ApiClientOptions {
  ormBaseUrl: string;
  iamBaseUrl: string;
  actorId: string;
  token: string;
}

export interface HeroDetailItem {
  label?: string;
  value?: string;
  icon?: string;
  iconAssetId?: string;
  iconUrl?: string;
  iconAlt?: string;
  iconSrc?: string;
  icon_url?: string;
  iconurl?: string;
  [key: string]: unknown;
}

export interface AssetUploadMetadata {
  assetKey?: string;
  assetType?: string;
  altText?: string;
  caption?: string;
  description?: string;
  tags?: string | string[];
  usageContext?: string;
  isPublic?: boolean | string;
  width?: number | string;
  height?: number | string;
  [key: string]: unknown;
}

export interface DetailIconUploadResponse {
  url: string;
  iconUrl: string;
  iconAssetId?: string;
  assetId?: string;
  publicUrl?: string;
  downloadUrl?: string;
  relativeUrl: string;
  fileName: string;
  originalFileName?: string;
  contentType: string;
  size: number;
  fieldName: 'iconUrl';
  asset?: ShapedRecord;
  hero?: ShapedRecord;
}

export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function encodePath(value: string): string {
  return encodeURIComponent(value);
}

function isListResponse(value: ShapedRecord | ListResponse): value is ListResponse {
  return Boolean(value && typeof value === 'object' && 'records' in value && Array.isArray((value as ListResponse).records));
}

function storageUrl(baseUrl: string, value: string | undefined): string {
  if (!value) return '';
  return value.startsWith('/') ? `${baseUrl}${value}` : value;
}

function slugLike(value: string): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeMetadataFormValue(storageKey: string, value: unknown): string {
  if (storageKey === 'tags') return Array.isArray(value) ? JSON.stringify(value) : String(value);
  const text = Array.isArray(value) ? JSON.stringify(value) : String(value);
  if (storageKey === 'asset_key') return slugLike(text);
  if (storageKey === 'asset_type') return slugLike(text).replaceAll('-', '_');
  return text;
}

function appendMetadata(formData: FormData, metadata: AssetUploadMetadata = {}) {
  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined || value === null || value === '') continue;
    const storageKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    const formValue = normalizeMetadataFormValue(storageKey, value);
    if (!formValue) continue;
    formData.append(storageKey, formValue);
  }
}

function cleanedFileLabel(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
}

function recordTextValue(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== '') return String(value);
  }
  return '';
}

function parseResponseBodyText(text: string): unknown {
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function bodyErrorsText(body: unknown): string {
  if (!body || typeof body !== 'object' || !('errors' in body)) return '';
  const errors = (body as { errors: unknown }).errors;
  if (Array.isArray(errors)) return errors.map((item) => String(item)).filter(Boolean).join('; ');
  if (errors && typeof errors === 'object') return Object.entries(errors).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join('; ');
  return errors ? String(errors) : '';
}

function errorMessageFromBody(body: unknown, fallback: string): string {
  const details = bodyErrorsText(body);
  let base = fallback;
  if (body && typeof body === 'object' && 'error' in body) base = String((body as { error: unknown }).error);
  else if (body && typeof body === 'object' && 'message' in body) base = String((body as { message: unknown }).message);
  else if (typeof body === 'string' && body.trim()) base = body.trim().slice(0, 300);
  return details ? `${base}: ${details}` : base;
}

function requestErrorMessage(method: string, url: string, status: number, body: unknown, action: string): string {
  const baseMessage = errorMessageFromBody(body, `${action} failed: ${status}`);
  return `${baseMessage} (${method} ${url})`;
}

export class AppManagerApiClient {
  readonly ormBaseUrl: string;
  readonly iamBaseUrl: string;
  readonly actorId: string;
  readonly token: string;

  constructor(options: ApiClientOptions) {
    this.ormBaseUrl = trimTrailingSlash(options.ormBaseUrl || 'http://localhost:4020');
    this.iamBaseUrl = trimTrailingSlash(options.iamBaseUrl || 'http://localhost:4010');
    this.actorId = options.actorId || 'original-creator';
    this.token = options.token || 'dev-token';
  }

  private headers(includeContentType = true): HeadersInit {
    return {
      ...(includeContentType ? { 'Content-Type': 'application/json' } : {}),
      'Authorization': this.token.startsWith('Bearer ') ? this.token : `Bearer ${this.token}`,
      'X-Actor-Id': this.actorId,
    };
  }

  private async request<T>(baseUrl: string, path: string, init: RequestInit = {}): Promise<T> {
    const method = init.method || 'GET';
    const requestUrl = `${baseUrl}${path}`;
    const response = await fetch(requestUrl, {
      ...init,
      headers: {
        ...this.headers(),
        ...(init.headers ?? {}),
      },
    });

    const bodyText = await response.text();
    const body = parseResponseBodyText(bodyText);
    if (!response.ok) {
      const message = requestErrorMessage(method, requestUrl, response.status, body, 'Request');
      throw new ApiError(message, response.status, { path, method, requestUrl, body });
    }
    return body as T;
  }

  private async multipartRequest<T>(path: string, formData: FormData, method = 'POST'): Promise<T> {
    const requestUrl = `${this.ormBaseUrl}${path}`;
    const response = await fetch(requestUrl, {
      method,
      headers: this.headers(false),
      body: formData,
    });

    const bodyText = await response.text();
    const body = parseResponseBodyText(bodyText);
    if (!response.ok) {
      const message = requestErrorMessage(method, requestUrl, response.status, body, 'Upload');
      throw new ApiError(message, response.status, { path, method, requestUrl, body });
    }

    return body as T;
  }

  private endpointNotFoundError(applicationKey: string, fileName: string, assetError: unknown, legacyError?: unknown): ApiError {
    return new ApiError(
      `Icon upload endpoint was not found for ${applicationKey}. Tried POST /applications/${encodePath(applicationKey)}/assets${legacyError ? ' and POST /uploads/detail-icons' : ''}. Replace and restart the ORM service with the application_asset patch, then refresh App Management.`,
      404,
      { applicationKey, fileName, assetError, legacyError },
    );
  }

  private async legacyDetailIconUpload(file: File, context: { applicationKey?: string; heroKey?: string; detailIndex?: number; altText?: string } = {}): Promise<DetailIconUploadResponse> {
    const applicationKey = context.applicationKey || '_shared';
    const formData = new FormData();
    formData.append('file', file);
    appendMetadata(formData, {
      applicationKey,
      heroKey: context.heroKey || '',
      detailIndex: context.detailIndex ?? '',
      assetType: 'icon',
      usageContext: 'hero_detail_icon',
      assetKey: `${context.heroKey || 'hero'}-detail-${context.detailIndex ?? 'icon'}-${cleanedFileLabel(file.name)}`,
      altText: context.altText || cleanedFileLabel(file.name),
      tags: ['hero_detail_icon'],
      isPublic: true,
    });

    const result = await this.multipartRequest<DetailIconUploadResponse>('/uploads/detail-icons', formData, 'POST');
    const iconUrl = storageUrl(this.ormBaseUrl, result.iconUrl || result.url || result.relativeUrl);
    return {
      ...result,
      url: iconUrl,
      iconUrl,
      publicUrl: iconUrl,
      relativeUrl: result.relativeUrl || iconUrl,
      fieldName: 'iconUrl',
    };
  }

  listApplications(): Promise<ListResponse> {
    return this.request<ListResponse>(this.ormBaseUrl, '/applications');
  }

  getApplication(applicationKey: string): Promise<ShapedRecord> {
    return this.request<ShapedRecord>(this.ormBaseUrl, `/applications/${encodePath(applicationKey)}`);
  }

  createApplication(record: StorageRecord): Promise<ShapedRecord & { iamBootstrap?: unknown }> {
    return this.request<ShapedRecord & { iamBootstrap?: unknown }>(this.ormBaseUrl, '/applications', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  updateApplication(applicationKey: string, record: StorageRecord): Promise<ShapedRecord & { iamBootstrap?: unknown }> {
    return this.request<ShapedRecord & { iamBootstrap?: unknown }>(this.ormBaseUrl, `/applications/${encodePath(applicationKey)}`, {
      method: 'PATCH',
      body: JSON.stringify(record),
    });
  }

  deleteApplication(applicationKey: string): Promise<ShapedRecord & { removed: boolean; mode: string }> {
    return this.request<ShapedRecord & { removed: boolean; mode: string }>(this.ormBaseUrl, `/applications/${encodePath(applicationKey)}`, {
      method: 'DELETE',
    });
  }

  getSchema(schemaName: string): Promise<unknown> {
    return this.request<unknown>(this.ormBaseUrl, `/schemas/${encodePath(schemaName)}`);
  }

  listHeroes(applicationKey: string): Promise<ListResponse> {
    return this.request<ListResponse>(this.ormBaseUrl, `/applications/${encodePath(applicationKey)}/heroes`);
  }

  async getHero(applicationKey: string, heroKey: string): Promise<ShapedRecord> {
    const result = await this.request<ShapedRecord | ListResponse>(this.ormBaseUrl, `/applications/${encodePath(applicationKey)}/heroes/${encodePath(heroKey)}`);

    if (isListResponse(result)) {
      const record = result.records.find((item) => item.storageRecord?.application_key === applicationKey && item.storageRecord?.hero_key === heroKey)
        ?? result.records.find((item) => item.storageRecord?.hero_key === heroKey)
        ?? result.records[0];

      if (!record) {
        throw new ApiError(`Hero not found: ${applicationKey}/${heroKey}`, 404, result);
      }

      return record;
    }

    return result;
  }

  createHero(applicationKey: string, record: StorageRecord): Promise<ShapedRecord> {
    return this.request<ShapedRecord>(this.ormBaseUrl, `/applications/${encodePath(applicationKey)}/heroes`, {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  updateHero(applicationKey: string, heroKey: string, record: StorageRecord): Promise<ShapedRecord> {
    return this.request<ShapedRecord>(this.ormBaseUrl, `/applications/${encodePath(applicationKey)}/heroes/${encodePath(heroKey)}`, {
      method: 'PATCH',
      body: JSON.stringify(record),
    });
  }


  async updateHeroActionButtons(applicationKey: string, heroKey: string, actions: unknown[]): Promise<ShapedRecord> {
    const heroActionButtons = JSON.stringify(Array.isArray(actions) ? actions : []);
    try {
      return await this.request<ShapedRecord>(this.ormBaseUrl, `/applications/${encodePath(applicationKey)}/heroes/${encodePath(heroKey)}/action-buttons`, {
        method: 'PATCH',
        body: JSON.stringify({ 'action-components': heroActionButtons, action_components: heroActionButtons, hero_action_buttons: heroActionButtons, actions: heroActionButtons }),
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return this.updateHero(applicationKey, heroKey, { 'action-components': heroActionButtons, action_components: heroActionButtons, hero_action_buttons: heroActionButtons, actions: heroActionButtons });
      }
      throw error;
    }
  }
  deleteHero(applicationKey: string, heroKey: string): Promise<ShapedRecord & { removed: boolean; mode: string }> {
    return this.request<ShapedRecord & { removed: boolean; mode: string }>(this.ormBaseUrl, `/applications/${encodePath(applicationKey)}/heroes/${encodePath(heroKey)}`, {
      method: 'DELETE',
    });
  }

  listAssets(applicationKey: string): Promise<ListResponse> {
    return this.request<ListResponse>(this.ormBaseUrl, `/applications/${encodePath(applicationKey)}/assets`);
  }

  getAsset(applicationKey: string, assetId: string): Promise<ShapedRecord> {
    return this.request<ShapedRecord>(this.ormBaseUrl, `/applications/${encodePath(applicationKey)}/assets/${encodePath(assetId)}`);
  }

  uploadAsset(applicationKey: string, file: File, metadata: AssetUploadMetadata = {}): Promise<ShapedRecord> {
    const formData = new FormData();
    formData.append('file', file);
    appendMetadata(formData, metadata);
    return this.multipartRequest<ShapedRecord>(`/applications/${encodePath(applicationKey)}/assets`, formData, 'POST');
  }

  replaceAssetFile(applicationKey: string, assetId: string, file: File, metadata: AssetUploadMetadata = {}): Promise<ShapedRecord> {
    const formData = new FormData();
    formData.append('file', file);
    appendMetadata(formData, metadata);
    return this.multipartRequest<ShapedRecord>(`/applications/${encodePath(applicationKey)}/assets/${encodePath(assetId)}`, formData, 'PATCH');
  }

  uploadHeroDetailIcon(applicationKey: string, heroKey: string, detailIndex: number, file: File, metadata: AssetUploadMetadata & { heroRecord?: StorageRecord } = {}): Promise<DetailIconUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const { heroRecord, ...assetMetadata } = metadata;
    appendMetadata(formData, assetMetadata);
    if (heroRecord) formData.append('hero_record', JSON.stringify(heroRecord));
    return this.multipartRequest<DetailIconUploadResponse>(`/applications/${encodePath(applicationKey)}/heroes/${encodePath(heroKey)}/details/${detailIndex}/icon`, formData, 'POST');
  }

  updateAsset(applicationKey: string, assetId: string, record: StorageRecord): Promise<ShapedRecord> {
    return this.request<ShapedRecord>(this.ormBaseUrl, `/applications/${encodePath(applicationKey)}/assets/${encodePath(assetId)}`, {
      method: 'PATCH',
      body: JSON.stringify(record),
    });
  }

  deleteAsset(applicationKey: string, assetId: string): Promise<ShapedRecord & { removed: boolean; mode: string }> {
    return this.request<ShapedRecord & { removed: boolean; mode: string }>(this.ormBaseUrl, `/applications/${encodePath(applicationKey)}/assets/${encodePath(assetId)}`, {
      method: 'DELETE',
    });
  }

  async uploadDetailIcon(file: File, context: { applicationKey?: string; heroKey?: string; detailIndex?: number; altText?: string; heroRecord?: StorageRecord } = {}): Promise<DetailIconUploadResponse> {
    const applicationKey = context.applicationKey || '_shared';
    const detailIndex = context.detailIndex ?? 0;
    const baseMetadata = {
      assetType: 'icon',
      usageContext: 'hero_detail_icon',
      assetKey: `${context.heroKey || 'hero'}-detail-${detailIndex}-${cleanedFileLabel(file.name)}`,
      altText: context.altText || cleanedFileLabel(file.name),
      tags: ['hero_detail_icon'],
      isPublic: true,
    };

    if (context.heroKey && context.heroKey !== 'new' && applicationKey && applicationKey !== '_shared') {
      try {
        const direct = await this.uploadHeroDetailIcon(applicationKey, context.heroKey, detailIndex, file, {
          ...baseMetadata,
          heroRecord: context.heroRecord,
        });
        const iconUrl = storageUrl(this.ormBaseUrl, direct.iconUrl || direct.url || direct.publicUrl || direct.relativeUrl);
        return {
          ...direct,
          url: iconUrl,
          iconUrl,
          publicUrl: iconUrl,
          fieldName: 'iconUrl',
        };
      } catch (directError) {
        if (!(directError instanceof ApiError) || directError.status !== 404) throw directError;
        // Older ORM builds do not include the atomic hero-detail icon route. Fall through to asset upload.
      }
    }

    let result: ShapedRecord;

    try {
      result = await this.uploadAsset(applicationKey, file, baseMetadata);
    } catch (assetError) {
      if (!(assetError instanceof ApiError) || assetError.status !== 404) throw assetError;

      try {
        return await this.legacyDetailIconUpload(file, { ...context, applicationKey, detailIndex });
      } catch (legacyError) {
        if (legacyError instanceof ApiError && legacyError.status === 404) {
          throw this.endpointNotFoundError(applicationKey, file.name, assetError, legacyError);
        }
        throw legacyError;
      }
    }

    const storage = result.storageRecord ?? {};
    const record = result.record as Record<string, unknown>;
    const iconUrl = storageUrl(this.ormBaseUrl, storage.public_url || recordTextValue(record, 'public_url', 'publicUrl'));
    const downloadUrl = storageUrl(this.ormBaseUrl, storage.download_url || recordTextValue(record, 'download_url', 'downloadUrl'));
    const assetId = storage.asset_id || recordTextValue(record, 'asset_id', 'assetId');

    if (!iconUrl) {
      throw new ApiError('Asset upload completed, but ORM did not return a public icon URL.', 500, result);
    }

    return {
      url: iconUrl,
      iconUrl,
      iconAssetId: assetId,
      assetId,
      publicUrl: iconUrl,
      downloadUrl,
      relativeUrl: storage.public_url || recordTextValue(record, 'public_url', 'publicUrl') || iconUrl,
      fileName: storage.stored_file_name || recordTextValue(record, 'stored_file_name', 'storedFileName') || file.name,
      originalFileName: storage.original_file_name || recordTextValue(record, 'original_file_name', 'originalFileName') || file.name,
      contentType: storage.mime_type || recordTextValue(record, 'mime_type', 'mimeType') || file.type,
      size: Number(storage.file_size_bytes || recordTextValue(record, 'file_size_bytes', 'fileSizeBytes') || file.size || 0),
      fieldName: 'iconUrl',
      asset: result,
    };
  }

  bootstrapApplication(applicationKey: string, applicationName?: string): Promise<unknown> {
    return this.request<unknown>(this.iamBaseUrl, '/admin/applications/bootstrap', {
      method: 'POST',
      body: JSON.stringify({ applicationKey, applicationName, actorId: this.actorId }),
    });
  }
}

export function createAppManagerApiClient(options: Partial<ApiClientOptions> = {}): AppManagerApiClient {
  return new AppManagerApiClient({
    ormBaseUrl: options.ormBaseUrl ?? 'http://localhost:4020',
    iamBaseUrl: options.iamBaseUrl ?? 'http://localhost:4010',
    actorId: options.actorId ?? 'original-creator',
    token: options.token ?? 'dev-token',
  });
}
