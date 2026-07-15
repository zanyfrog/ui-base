import { baseAssetStyles, escapeHtml, normalizeAsset, parseJson, registerElement } from '../asset-core.js';
import { safeMediaSrc } from '@ui.base/ui/media';
import '@ui.base/ui/media';

const styles = `
${baseAssetStyles}
:host{display:block;inline-size:100%;block-size:100%}.asset-image{inline-size:100%;block-size:100%;min-block-size:var(--uib-asset-image-min-height,0)}.asset-image uib-media{inline-size:100%;block-size:100%}.asset-image--unresolved{display:grid;place-items:center;min-block-size:var(--uib-asset-image-placeholder-height,4rem);padding:.75rem;border:1px dashed var(--uib-assets-border-strong);border-radius:var(--uib-assets-radius-sm);background:var(--uib-assets-surface-soft);color:var(--uib-assets-muted);text-align:center;font-size:.8rem;font-weight:850}.asset-image--icon{max-inline-size:var(--uib-asset-image-icon-size,4rem);aspect-ratio:1}.asset-image--background{position:absolute;inset:0;min-block-size:100%}.asset-image--background uib-media{position:absolute;inset:0}
`;
function valueFrom(record,keys){if(!record||typeof record!=='object')return '';for(const key of keys){const value=record[key];if(value!==undefined&&value!==null&&value!=='')return String(value);}return '';}
function normalizeAssetMap(value){if(!value)return {};if(typeof value==='object')return value;return parseJson(value,{})||{};}
function sourceFromAssetMap(assetMap,assetId){if(!assetId||!assetMap||typeof assetMap!=='object')return '';const entry=assetMap[assetId];if(!entry)return '';if(typeof entry==='string')return entry;return valueFrom(entry,['url','src','publicUrl','public_url','downloadUrl','download_url','thumbnailUrl','thumbnail_url']);}
function altFromAssetMap(assetMap,assetId){if(!assetId||!assetMap||typeof assetMap!=='object')return '';const entry=assetMap[assetId];if(!entry||typeof entry==='string')return '';return valueFrom(entry,['alt','altText','alt_text','name','label']);}
export class UibAssetImage extends HTMLElement {
  static get observedAttributes(){return ['src','asset-id','asset','asset-map','alt','fit','role','visual-role','ratio','fallback-label'];}
  constructor(){super();this._asset=undefined;this._assetMap=undefined;this._assetResolver=undefined;this._resolvedSrc='';this._resolveToken=0;this.attachShadow({mode:'open'});}
  connectedCallback(){this.render();void this.resolveAsync();}
  attributeChangedCallback(){if(!this.isConnected)return;this.render();void this.resolveAsync();}
  get assetId(){return this.getAttribute('asset-id')||'';}
  set assetId(value){if(value===undefined||value===null||value==='')this.removeAttribute('asset-id');else this.setAttribute('asset-id',String(value));}
  get asset(){if(this._asset)return this._asset;return parseJson(this.getAttribute('asset'),null);}
  set asset(value){this._asset=value;if(this.isConnected){this.render();void this.resolveAsync();}}
  get assetMap(){return normalizeAssetMap(this._assetMap||this.getAttribute('asset-map'));}
  set assetMap(value){this._assetMap=value;if(this.isConnected){this.render();void this.resolveAsync();}}
  get assetResolver(){return this._assetResolver;}
  set assetResolver(value){this._assetResolver=typeof value==='function'?value:undefined;if(this.isConnected)void this.resolveAsync();}
  currentSource(){const explicitSrc=safeMediaSrc(this.getAttribute('src')||'');if(explicitSrc)return explicitSrc;const asset=this.asset;if(asset){const normalized=normalizeAsset(asset);const assetSrc=safeMediaSrc(normalized.publicUrl||normalized.url||normalized.downloadUrl||normalized.thumbnailUrl||'');if(assetSrc)return assetSrc;}const mapped=safeMediaSrc(sourceFromAssetMap(this.assetMap,this.assetId));if(mapped)return mapped;return safeMediaSrc(this._resolvedSrc);}
  currentAlt(){const explicitAlt=this.getAttribute('alt')||'';if(explicitAlt)return explicitAlt;const asset=this.asset;if(asset)return normalizeAsset(asset).altText||normalizeAsset(asset).name||'';return altFromAssetMap(this.assetMap,this.assetId)||this.assetId||'';}
  async resolveAsync(){if(!this.assetId||this.currentSource()||typeof this.assetResolver!=='function')return;const token=++this._resolveToken;try{const result=await this.assetResolver(this.assetId,this);if(token!==this._resolveToken)return;if(typeof result==='string')this._resolvedSrc=result;else if(result&&typeof result==='object'){this._asset=result;this._resolvedSrc=valueFrom(result,['url','src','publicUrl','public_url','downloadUrl','download_url','thumbnailUrl','thumbnail_url']);}this.render();}catch(error){this.dispatchEvent(new CustomEvent('uib-asset-image-resolution-error',{bubbles:true,composed:true,detail:{assetId:this.assetId,error}}));}}
  render(){const role=this.getAttribute('visual-role')||this.getAttribute('role')||'image';const src=this.currentSource();const alt=this.currentAlt();const fit=this.getAttribute('fit')||(role==='icon'||role==='svg'?'contain':'cover');const ratio=this.getAttribute('ratio')||(role==='icon'?'1/1':'16/9');const fallback=this.getAttribute('fallback-label')||(this.assetId?`Asset ${this.assetId}`:'No image selected');this.shadowRoot.innerHTML=`<style>${styles}</style><div class="asset-image asset-image--${escapeHtml(role)}" part="container">${src?`<uib-media src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" role="${escapeHtml(role)}" fit="${escapeHtml(fit)}" ratio="${escapeHtml(ratio)}"></uib-media>`:`<div class="asset-image--unresolved" part="placeholder">${escapeHtml(fallback)}</div>`}</div>`;}
}
registerElement('uib-asset-image',UibAssetImage);
