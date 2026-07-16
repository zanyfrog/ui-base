import { baseAssetStyles, escapeHtml, humanize, normalizeAsset, registerElement } from '../asset-core.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

function fileProfile(asset) {
  const mimeType = String(asset?.mimeType || '').toLowerCase();
  const fileName = String(asset?.fileName || asset?.name || '').toLowerCase();
  const fileType = String(asset?.fileType || asset?.assetType || 'other').toLowerCase();
  if (fileType === 'pdf' || mimeType.includes('pdf') || fileName.endsWith('.pdf')) return { label: 'PDF', title: 'PDF document', kind: 'pdf' };
  if (/\.(doc|docx|rtf)$/.test(fileName) || mimeType.includes('word') || mimeType.includes('officedocument.wordprocessingml')) return { label: 'DOC', title: 'Word document', kind: 'word' };
  if (/\.(xls|xlsx|csv)$/.test(fileName) || mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType.includes('csv')) return { label: 'XLS', title: 'Excel spreadsheet', kind: 'excel' };
  if (/\.(ppt|pptx)$/.test(fileName) || mimeType.includes('powerpoint') || mimeType.includes('presentation')) return { label: 'PPT', title: 'PowerPoint presentation', kind: 'powerpoint' };
  if (/\.(txt|md)$/.test(fileName) || mimeType.startsWith('text/')) return { label: 'TXT', title: 'Text document', kind: 'text' };
  if (/\.(json)$/.test(fileName) || mimeType.includes('json') || fileType === 'json') return { label: 'JSON', title: 'JSON asset', kind: 'json' };
  if (mimeType.startsWith('video/') || fileType === 'video') return { label: 'VID', title: 'Video asset', kind: 'video' };
  if (mimeType.startsWith('audio/') || fileType === 'audio') return { label: 'AUD', title: 'Audio asset', kind: 'audio' };
  if (fileType === 'document') return { label: 'DOC', title: 'Document', kind: 'document' };
  if (fileType === 'external_url') return { label: 'URL', title: 'External URL', kind: 'url' };
  return { label: String(fileType || 'file').slice(0, 4).toUpperCase(), title: humanize(fileType || 'file'), kind: 'file' };
}

export class UibAssetThumbnail extends BaseHTMLElement {
  static get observedAttributes() { return ['label', 'file-type', 'thumbnail-url', 'url', 'mime-type', 'file-name']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._asset = null;
  }

  set asset(value) { this._asset = value ? normalizeAsset(value) : null; if (this.isConnected) this.render(); }
  get asset() { return this._asset; }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  render() {
    const asset = this._asset || normalizeAsset({
      name: this.getAttribute('label') || 'Asset',
      fileType: this.getAttribute('file-type') || 'other',
      thumbnailUrl: this.getAttribute('thumbnail-url') || this.getAttribute('url') || '',
      url: this.getAttribute('url') || '',
      mimeType: this.getAttribute('mime-type') || '',
      fileName: this.getAttribute('file-name') || ''
    });
    const url = asset.thumbnailUrl || asset.url;
    const isImage = url && ['image', 'svg', 'icon'].includes(String(asset.fileType || '').toLowerCase());
    const profile = fileProfile(asset);
    this.shadowRoot.innerHTML = (
  `<style>` +
  (baseAssetStyles) +
  ` .thumb { overflow: hidden; width: 100%; min-height: 7rem; display: grid; place-items: center; border: 1px solid var(--uib-assets-border); border-radius: 0.9rem; background: linear-gradient(135deg, rgba(23, 74, 139, 0.08), rgba(244, 189, 70, 0.12)), var(--uib-assets-surface-soft); } img { width: 100%; height: 100%; min-height: 7rem; object-fit: cover; } .fallback { display: grid; gap: 0.35rem; place-items: center; padding: 0.85rem; color: var(--uib-assets-muted); text-align: center; } .file-icon { position: relative; width: 3.7rem; height: 4.4rem; display: grid; place-items: end center; padding: 0.45rem 0.3rem; border-radius: 0.35rem; border: 1px solid rgba(19, 41, 75, 0.18); background: var(--uib-assets-surface); color: var(--uib-assets-text); font-size: 0.82rem; font-weight: 950; line-height: 1; box-shadow: 0 8px 18px rgba(10, 31, 68, 0.08); } .file-icon::before { content: ''; position: absolute; top: -1px; right: -1px; border-top: 1.05rem solid var(--uib-assets-surface-soft); border-left: 1.05rem solid transparent; border-radius: 0 0.35rem 0 0; } .file-icon::after { content: ''; position: absolute; left: 0.48rem; right: 0.48rem; bottom: 1.45rem; height: 0.45rem; border-top: 2px solid currentColor; border-bottom: 2px solid currentColor; opacity: 0.42; } .file-icon[data-kind="pdf"] { color: #b4232a; } .file-icon[data-kind="word"] { color: #174a8b; } .file-icon[data-kind="excel"] { color: #2e7d32; } .file-icon[data-kind="powerpoint"] { color: #b85c00; } .file-icon[data-kind="video"] { color: #6c3dbb; } .file-icon[data-kind="audio"] { color: #7a4f00; } .file-label { font-size: 0.75rem; font-weight: 800; } ` +
  `</style>` +
  `<div class="thumb" role="img" aria-label="` +
  (escapeHtml(asset.name)) +
  ` thumbnail"> ` +
  (isImage ? `<img src="${escapeHtml(url)}" alt="${escapeHtml(asset.name)}" loading="lazy" />` : `
          <div class="fallback">
            <span class="file-icon" data-kind="${escapeHtml(profile.kind)}">${escapeHtml(profile.label)}</span>
            <span class="file-label">${escapeHtml(profile.title)}</span>
          </div>
        `) +
  ` ` +
  `</div>`
);
  }
}

registerElement('uib-asset-thumbnail', UibAssetThumbnail);
