import { UibBaseElement, defineUiBaseElement, escapeHtml } from '@ui.base/core';
import '@ui.base/icons/icon';

const baseStyles = `
:host{display:block;color:var(--uib-color-ink,#13294b);font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}*,*::before,*::after{box-sizing:border-box}.placeholder{padding:.75rem;border:1px dashed var(--uib-color-border-strong,#aab8cc);border-radius:var(--uib-radius-md,.75rem);background:var(--uib-color-surface-soft,#f8fbff);color:var(--uib-color-muted,#53657f);font-size:var(--uib-font-size-sm,.875rem)}
`;

class UibLayoutBase extends UibBaseElement {
  connectedCallback() {
    this.render();
  }
}

export class UibStack extends UibLayoutBase {
  static get observedAttributes() { return [...UibBaseElement.commonAttributes, 'gap', 'direction', 'align', 'justify']; }
  render() {
    const gap = this.getAttribute('gap') || 'var(--uib-space-3,.75rem)';
    const direction = this.getAttribute('direction') || 'column';
    const align = this.getAttribute('align') || 'stretch';
    const justify = this.getAttribute('justify') || 'start';
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${baseStyles}.uib-stack{display:flex;flex-direction:${escapeHtml(direction)};gap:${escapeHtml(gap)};align-items:${escapeHtml(align)};justify-content:${escapeHtml(justify)}}@media(max-width:520px){.uib-stack{flex-wrap:wrap}}</style><div class="uib-stack" part="base"><slot></slot></div>`;
  }
}

export class UibGrid extends UibLayoutBase {
  static get observedAttributes() { return [...UibBaseElement.commonAttributes, 'columns', 'min', 'gap']; }
  render() {
    const columns = this.getAttribute('columns');
    const min = this.getAttribute('min') || '14rem';
    const gap = this.getAttribute('gap') || 'var(--uib-space-4,1rem)';
    const template = columns ? `repeat(${Number(columns) || 1}, minmax(0, 1fr))` : `repeat(auto-fit, minmax(${min}, 1fr))`;
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${baseStyles}.uib-grid{display:grid;grid-template-columns:${template};gap:${escapeHtml(gap)}}@media(max-width:520px){.uib-grid{grid-template-columns:1fr}}</style><div class="uib-grid" part="base"><slot></slot></div>`;
  }
}

export class UibRow extends UibLayoutBase {
  static get observedAttributes() { return [...UibBaseElement.commonAttributes, 'gap', 'align', 'justify', 'wrap']; }
  render() {
    const gap = this.getAttribute('gap') || 'var(--uib-space-3,.75rem)';
    const align = this.getAttribute('align') || 'center';
    const justify = this.getAttribute('justify') || 'start';
    const wrap = this.hasAttribute('wrap') ? 'wrap' : 'nowrap';
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${baseStyles}.uib-row{display:flex;flex-direction:row;gap:${escapeHtml(gap)};align-items:${escapeHtml(align)};justify-content:${escapeHtml(justify)};flex-wrap:${wrap}}@media(max-width:420px){.uib-row{flex-wrap:wrap}}</style><div class="uib-row" part="base"><slot></slot></div>`;
  }
}

export class UibColumn extends UibLayoutBase {
  static get observedAttributes() { return [...UibBaseElement.commonAttributes, 'gap', 'align', 'justify']; }
  render() {
    const gap = this.getAttribute('gap') || 'var(--uib-space-3,.75rem)';
    const align = this.getAttribute('align') || 'stretch';
    const justify = this.getAttribute('justify') || 'start';
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${baseStyles}.uib-column{display:flex;flex-direction:column;gap:${escapeHtml(gap)};align-items:${escapeHtml(align)};justify-content:${escapeHtml(justify)}}</style><div class="uib-column" part="base"><slot></slot></div>`;
  }
}

class UibSurfaceBase extends UibLayoutBase {
  surfaceName = 'surface';
  render() {
    const heading = this.label || this.getAttribute('heading') || '';
    const headingId = heading ? `${this.componentId}-heading` : '';
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${baseStyles}.uib-surface{display:block;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:var(--uib-radius-lg,1rem);background:var(--uib-color-surface,#fff);box-shadow:var(--uib-shadow-sm,0 6px 18px rgba(10,31,68,.08));overflow:hidden}.uib-surface__header,.uib-surface__body,.uib-surface__footer{padding:var(--uib-space-4,1rem)}.uib-surface__header{border-bottom:1px solid var(--uib-color-border,#d9e2f0);font-weight:850}.uib-surface__footer{border-top:1px solid var(--uib-color-border,#d9e2f0);background:var(--uib-color-surface-soft,#f8fbff)}</style><section class="uib-surface uib-${this.surfaceName}" part="base" ${headingId ? `aria-labelledby="${headingId}"` : ''}><div class="uib-surface__header" part="header" ${headingId ? `id="${headingId}"` : ''}><slot name="header">${escapeHtml(heading)}</slot></div><div class="uib-surface__body" part="body"><slot></slot></div><div class="uib-surface__footer" part="footer"><slot name="footer"></slot></div></section>`;
  }
}

export class UibPanel extends UibSurfaceBase { surfaceName = 'panel'; }
export class UibCard extends UibSurfaceBase { surfaceName = 'card'; }

export class UibDialog extends UibLayoutBase {
  static get observedAttributes() { return [...UibBaseElement.commonAttributes, 'open', 'heading']; }
  get open() { return this.hasAttribute('open'); }
  set open(value) { this.toggleAttribute('open', Boolean(value)); }
  show() { this.open = true; }
  close() { const oldValue = true; this.open = false; this.emitValueChange('uib-dialog-close', oldValue, false); }
  render() {
    const heading = this.label || this.getAttribute('heading') || 'Dialog';
    const headingId = `${this.componentId}-heading`;
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${baseStyles}:host{display:${this.open ? 'block' : 'none'}}.uib-dialog{position:fixed;inset:0;z-index:var(--uib-z-index-modal,1100);display:grid;place-items:center;padding:1rem;background:rgba(6,21,40,.48)}.uib-dialog__panel{width:min(42rem,100%);max-height:calc(100vh - 2rem);overflow:auto;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:var(--uib-radius-lg,1rem);background:var(--uib-color-surface,#fff);box-shadow:var(--uib-shadow-lg,0 24px 70px rgba(10,31,68,.14))}.uib-dialog__header{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem;border-bottom:1px solid var(--uib-color-border,#d9e2f0);font-weight:850}.uib-dialog__body{padding:1rem}.uib-dialog__footer{padding:1rem;border-top:1px solid var(--uib-color-border,#d9e2f0);background:var(--uib-color-surface-soft,#f8fbff)}button{border:1px solid var(--uib-color-border,#d9e2f0);border-radius:var(--uib-radius-pill,999px);background:var(--uib-color-surface,#fff);padding:.45rem .65rem;cursor:pointer}</style><div class="uib-dialog" part="backdrop"><section class="uib-dialog__panel" part="panel" role="dialog" aria-modal="true" aria-labelledby="${headingId}"><div class="uib-dialog__header" part="header"><span id="${headingId}"><slot name="header">${escapeHtml(heading)}</slot></span><button type="button" part="close-button" aria-label="Close"><uib-icon name="close" decorative></uib-icon></button></div><div class="uib-dialog__body" part="body"><slot></slot></div><div class="uib-dialog__footer" part="footer"><slot name="footer"></slot></div></section></div>`;
    this.shadowRoot.querySelector('button')?.addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('.uib-dialog')?.addEventListener('click', (event) => {
      if (event.target === event.currentTarget) this.close();
    });
  }
}

export class UibAccordion extends UibLayoutBase {
  static get observedAttributes() { return [...UibBaseElement.commonAttributes, 'open', 'heading']; }
  render() {
    const heading = this.label || this.getAttribute('heading') || 'Accordion';
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${baseStyles}details{border:1px solid var(--uib-color-border,#d9e2f0);border-radius:var(--uib-radius-lg,1rem);background:var(--uib-color-surface,#fff);overflow:hidden}summary{cursor:pointer;padding:1rem;font-weight:850}summary:focus-visible{outline:none;box-shadow:var(--uib-focus-ring,0 0 0 4px rgba(23,74,139,.25))}.uib-accordion__body{padding:0 1rem 1rem}</style><details part="base" ${this.hasAttribute('open') ? 'open' : ''}><summary part="summary"><slot name="summary">${escapeHtml(heading)}</slot></summary><div class="uib-accordion__body" part="body"><slot></slot></div></details>`;
    this.shadowRoot.querySelector('details')?.addEventListener('toggle', (event) => {
      const open = event.currentTarget.open;
      this.toggleAttribute('open', open);
      this.emitMtEvent('uib-accordion-toggle', { name: this.name, oldValue: !open, newValue: open });
    });
  }
}

export class UibTabs extends UibLayoutBase {
  render() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${baseStyles}.uib-tabs{display:grid;gap:.75rem}.uib-tabs__list{display:flex;gap:.35rem;flex-wrap:wrap}.uib-tabs__tab{padding:.55rem .75rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:var(--uib-radius-pill,999px);background:var(--uib-color-primary,#174a8b);color:var(--uib-color-primary-contrast,#fff);font-weight:850}.uib-tabs__panel{padding:1rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:var(--uib-radius-lg,1rem);background:var(--uib-color-surface,#fff)}</style><div class="uib-tabs" part="base"><div class="uib-tabs__list" part="tablist" role="tablist"><span class="uib-tabs__tab" part="tab" role="tab" aria-selected="true">${escapeHtml(this.label || 'Tab')}</span></div><div class="uib-tabs__panel" part="panel" role="tabpanel"><slot><div class="placeholder">uib-tabs is an experimental stub. Full tab-panel coordination will be implemented later.</div></slot></div></div>`;
  }
}

export class UibSplitter extends UibLayoutBase {
  static get observedAttributes() { return [...UibBaseElement.commonAttributes, 'position']; }
  render() {
    const position = this.getAttribute('position') || '1fr 1fr';
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${baseStyles}.uib-splitter{display:grid;grid-template-columns:${escapeHtml(position)};gap:var(--uib-space-4,1rem)}.uib-splitter__pane{min-width:0;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:var(--uib-radius-lg,1rem);background:var(--uib-color-surface,#fff);padding:1rem}@media(max-width:700px){.uib-splitter{grid-template-columns:1fr}}</style><div class="uib-splitter" part="base"><section class="uib-splitter__pane" part="pane-start"><slot name="start"></slot></section><section class="uib-splitter__pane" part="pane-end"><slot name="end"></slot><slot></slot></section></div>`;
  }
}

defineUiBaseElement('uib-stack', UibStack);
defineUiBaseElement('uib-grid', UibGrid);
defineUiBaseElement('uib-row', UibRow);
defineUiBaseElement('uib-column', UibColumn);
defineUiBaseElement('uib-panel', UibPanel);
defineUiBaseElement('uib-card', UibCard);
defineUiBaseElement('uib-dialog', UibDialog);
defineUiBaseElement('uib-accordion', UibAccordion);
defineUiBaseElement('uib-tabs', UibTabs);
defineUiBaseElement('uib-splitter', UibSplitter);
