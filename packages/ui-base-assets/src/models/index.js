export {
  ASSET_FILE_TYPES,
  ASSET_SCOPES,
  ASSET_VISIBILITIES,
  ASSET_VERSION_STATUSES,
  DEFAULT_ASSET_UPLOAD_POLICY,
  EMPTY_ASSET_PERMISSIONS,
  MANAGER_ASSET_PERMISSIONS,
  VIEWER_ASSET_PERMISSIONS,
  assetSelection,
  normalizeAsset,
  normalizeAssets
} from '../asset-core.js';

/**
 * These JSDoc typedefs document the stable data contract used by the Web
 * Components. They are intentionally plain JavaScript so the package can be
 * consumed by React, Vue, Angular, vanilla JS, or server-rendered apps.
 *
 * @typedef {Object} Asset
 * @property {string} id Internal immutable record id.
 * @property {string} key Human-readable stable key.
 * @property {string} name Display name.
 * @property {string=} description Display description.
 * @property {string=} fileName Original or display file name.
 * @property {'image'|'svg'|'icon'|'video'|'audio'|'pdf'|'document'|'json'|'component_config'|'external_url'|'other'} fileType Asset classification.
 * @property {string=} mimeType MIME type.
 * @property {'local_file'|'external_url'|'icon_url'|'json'|'component_config'} sourceType Source type.
 * @property {string=} url Display URL.
 * @property {string=} thumbnailUrl Preview thumbnail URL.
 * @property {string[]} categories Controlled categories.
 * @property {string[]=} tags Search tags.
 * @property {string=} folderPath Optional future folder path.
 * @property {'application'|'shared'|'global'} scope Ownership scope.
 * @property {'public'|'application_private'|'shared_private'|'global_private'|'admin_only'} visibility Visibility class.
 * @property {string=} applicationId App owner when scope is application.
 * @property {string} permissionSetKey Permission set assigned to the asset.
 * @property {AssetPermissions} permissions ORM-resolved permissions for current actor.
 * @property {string[]=} maskedFields Field names hidden from the current actor.
 */

/**
 * @typedef {Object} AssetSelection
 * @property {string} assetId Asset id.
 * @property {string} assetKey Asset key.
 * @property {'latest'|'pinned'} versionMode Whether the consumer follows latest approved or pins a version.
 * @property {string=} versionId Version id when pinned.
 * @property {number=} versionNumber Version number when pinned.
 * @property {string} name Display name.
 * @property {string} fileType File type.
 * @property {string=} url Current URL when available.
 */

/**
 * @typedef {Object} AssetPermissions
 * @property {boolean} canView
 * @property {boolean} canSelect
 * @property {boolean} canDownload
 * @property {boolean} canCopyToApp
 * @property {boolean} canCreate
 * @property {boolean} canEditMetadata
 * @property {boolean} canReplaceFile
 * @property {boolean} canUploadNewVersion
 * @property {boolean} canSubmitForReview
 * @property {boolean} canApproveVersion
 * @property {boolean} canRejectVersion
 * @property {boolean} canArchive
 * @property {boolean} canRestore
 * @property {boolean} canHardDelete
 * @property {boolean} canViewUsage
 * @property {boolean} canManagePermissions
 */
