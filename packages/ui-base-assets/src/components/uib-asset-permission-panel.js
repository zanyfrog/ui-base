import { baseAssetStyles, escapeHtml, humanize, normalizeAsset, permissionBadge, registerElement } from '../asset-core.js';
import './uib-asset-permission-set-picker.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

const ACTION_LABELS = {
  canView: 'View',
  canSelect: 'Select',
  canDownload: 'Download',
  canCopyToApp: 'Copy to app',
  canCreate: 'Create',
  canEditMetadata: 'Edit metadata',
  canReplaceFile: 'Replace file',
  canUploadNewVersion: 'Upload new version',
  canSubmitForReview: 'Submit for review',
  canApproveVersion: 'Approve version',
  canRejectVersion: 'Reject version',
  canArchive: 'Archive',
  canRestore: 'Restore',
  canHardDelete: 'Hard delete',
  canViewUsage: 'View usage',
  canManagePermissions: 'Manage permissions'
};

export class UibAssetPermissionPanel extends BaseHTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._asset = null;
    this._permissionSets = [];
  }

  set asset(value) { this._asset = value ? normalizeAsset(value) : null; if (this.isConnected) this.render(); }
  get asset() { return this._asset; }
  set permissionSets(value) { this._permissionSets = Array.isArray(value) ? value : []; if (this.isConnected) this.render(); }
  get permissionSets() { return this._permissionSets; }
  connectedCallback() { this.render(); }

  render() {
    const asset = this._asset;
    this.shadowRoot.innerHTML = `
      <style>${baseAssetStyles}
        .permission-grid { display: flex; flex-wrap: wrap; gap: 0.45rem; }
      </style>
      <section class="stack-sm" aria-label="Asset permission summary">
        ${asset ? `
          <div class="surface-soft stack-sm" style="padding: 0.8rem;">
            <div class="row-between">
              <strong>${escapeHtml(asset.permissionSetKey || 'No permission set')}</strong>
              <span class="badge strong">${escapeHtml(humanize(asset.visibility))}</span>
            </div>
            <p class="subtitle small">Permissions are resolved by ORM. This package only shows allowed actions and emits requests.</p>
          </div>
          <uib-asset-permission-set-picker value="${escapeHtml(asset.permissionSetKey)}" ${asset.permissions.canManagePermissions ? '' : 'disabled'}></uib-asset-permission-set-picker>
          <div class="permission-grid">
            ${Object.entries(ACTION_LABELS).map(([key, label]) => permissionBadge(Boolean(asset.permissions[key]), label)).join('')}
          </div>
        ` : '<div class="empty-state">Open an asset to view its permission summary.</div>'}
      </section>
    `;
    const picker = this.shadowRoot.querySelector('uib-asset-permission-set-picker');
    if (picker) picker.permissionSets = this._permissionSets;
  }
}

registerElement('uib-asset-permission-panel', UibAssetPermissionPanel);
