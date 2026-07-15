import '@ui.base/hero/uib-hero-preview';
import { BaseHTMLElement, attr, defineAppManagerElement } from '../utils/dom.js';

export type HeroRecord = Record<string, string>;

export class UibApplicationHeroPreview extends BaseHTMLElement {
  static get observedAttributes() {
    return ['application-key', 'asset-map', 'brand-label', 'brand-mark'];
  }

  private heroRecord: HeroRecord = {};

  set record(value: HeroRecord) {
    this.heroRecord = { ...value };
    this.updatePreview();
  }

  get record(): HeroRecord {
    return { ...this.heroRecord };
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  private updatePreview() {
    const preview = this.querySelector('uib-hero-preview') as HTMLElement & { record?: HeroRecord };
    if (preview) preview.record = this.heroRecord;
  }

  render() {
    this.innerHTML = `
      <uib-hero-preview
        application-key="${attr(this.heroRecord.application_key || this.getAttribute('application-key') || '')}"
        asset-map="${attr(this.getAttribute('asset-map') || '')}"
        brand-label="${attr(this.getAttribute('brand-label') || '')}"
        brand-mark="${attr(this.getAttribute('brand-mark') || '')}"
      ></uib-hero-preview>
    `;
    this.updatePreview();
  }
}

defineAppManagerElement('uib-application-hero-preview', UibApplicationHeroPreview);
