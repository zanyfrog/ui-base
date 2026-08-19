import { UibBaseElement, defineUiBaseElement, escapeHtml } from '@ui-base/core';

const VARIANTS = ['info', 'tip', 'warning', 'danger', 'success'];

const variantDefaults = {
  info: { marker: 'i', label: 'Information' },
  tip: { marker: '★', label: 'Tip' },
  warning: { marker: '!', label: 'Warning' },
  danger: { marker: '!', label: 'Important warning' },
  success: { marker: '✓', label: 'Success' }
};

const styles = `
:host{display:block;color:var(--uib-instruction-color,var(--uib-color-ink,#13294b));font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}
*,*::before,*::after{box-sizing:border-box}
.instruction{--uib-instruction-accent:var(--uib-color-info,var(--uib-color-primary,#174a8b));--uib-instruction-accent-soft:rgba(23,74,139,.1);display:block;overflow:hidden;border:1px solid var(--uib-instruction-border,var(--uib-color-border,#d9e2f0));border-inline-start:var(--uib-instruction-accent-width,5px) solid var(--uib-instruction-accent);border-radius:var(--uib-instruction-radius,var(--uib-radius-lg,1rem));background:var(--uib-instruction-bg,var(--uib-color-surface,#fff));box-shadow:var(--uib-instruction-shadow,var(--uib-shadow-sm,0 6px 18px rgba(10,31,68,.08)))}
.instruction--tip{--uib-instruction-accent:var(--uib-color-accent,#f4bd46);--uib-instruction-accent-soft:rgba(244,189,70,.18)}
.instruction--warning{--uib-instruction-accent:var(--uib-color-warning,#9f6500);--uib-instruction-accent-soft:rgba(159,101,0,.12)}
.instruction--danger{--uib-instruction-accent:var(--uib-color-danger,#b4232a);--uib-instruction-accent-soft:rgba(180,35,42,.12)}
.instruction--success{--uib-instruction-accent:var(--uib-color-success,#2e7d32);--uib-instruction-accent-soft:rgba(46,125,50,.12)}
.instruction--compact .instruction__summary,.instruction--compact .instruction__body,.instruction--compact .instruction__footer{padding:var(--uib-space-3,.75rem)}
.instruction--disabled{opacity:.58}
details.instruction{padding:0}
details.instruction:not([open]) .instruction__footer{display:none}
summary.instruction__summary{cursor:pointer;list-style:none}
summary.instruction__summary::-webkit-details-marker{display:none}
.instruction__summary{display:flex;gap:var(--uib-space-3,.75rem);align-items:flex-start;padding:var(--uib-space-4,1rem);background:linear-gradient(90deg,var(--uib-instruction-accent-soft),transparent)}
.instruction__summary:focus-visible{outline:none;box-shadow:var(--uib-focus-ring,0 0 0 4px rgba(23,74,139,.25))}
.instruction--disabled .instruction__summary{cursor:not-allowed}
.instruction__marker{display:inline-grid;flex:0 0 auto;width:2rem;height:2rem;place-items:center;border-radius:var(--uib-radius-pill,999px);background:var(--uib-instruction-accent);color:var(--uib-instruction-marker-color,var(--uib-color-primary-contrast,#fff));font-weight:900;line-height:1}
.instruction__header{min-width:0;display:grid;gap:.3rem;flex:1}
.instruction__title-row{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;justify-content:space-between}
.instruction__title{margin:0;color:var(--uib-instruction-heading-color,currentColor);font-size:var(--uib-instruction-heading-size,1.08rem);font-weight:900;line-height:1.2}
.instruction__description{margin:0;max-width:var(--uib-instruction-summary-width,68ch);color:var(--uib-instruction-muted,var(--uib-color-muted,#53657f));line-height:1.55}
.instruction__status{display:inline-flex;align-items:center;min-height:1.55rem;padding:.18rem .55rem;border-radius:var(--uib-radius-pill,999px);background:var(--uib-instruction-accent-soft);color:var(--uib-instruction-accent);font-size:var(--uib-font-size-xs,.75rem);font-weight:900;text-transform:uppercase;letter-spacing:.04em}
.instruction__body{display:grid;gap:var(--uib-space-4,1rem);padding:0 var(--uib-space-4,1rem) var(--uib-space-4,1rem)}
.instruction__copy{display:block;max-width:var(--uib-instruction-body-width,72ch);line-height:1.6}
.instruction__steps{display:grid;gap:var(--uib-space-3,.75rem)}
.instruction__step-list{display:grid;gap:var(--uib-space-3,.75rem);margin:0;padding:0;list-style-position:inside;counter-reset:instruction-step}
.instruction--numbered .instruction__step-list{padding-inline-start:1.2rem;list-style:decimal}
::slotted([slot="step"]){display:block;margin:0;padding:.78rem .85rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:var(--uib-radius-md,.75rem);background:var(--uib-color-surface-soft,#f8fbff);line-height:1.55}
:host([numbered]) ::slotted([slot="step"]){display:list-item}
::slotted([slot="step"][current]),::slotted([slot="step"][aria-current="step"]),::slotted([slot="step"][status="current"]){border-color:var(--uib-instruction-accent);box-shadow:inset 0 0 0 1px var(--uib-instruction-accent)}
::slotted([slot="step"][complete]),::slotted([slot="step"][status="complete"]){border-color:rgba(46,125,50,.35);background:rgba(46,125,50,.08)}
::slotted([slot="step"][disabled]),::slotted([slot="step"][aria-disabled="true"]),::slotted([slot="step"][status="disabled"]){opacity:.58}
.instruction__progress{display:grid;gap:.35rem}
.instruction__progress-label{display:flex;justify-content:space-between;gap:var(--uib-space-2,.5rem);color:var(--uib-color-muted,#53657f);font-size:var(--uib-font-size-sm,.875rem);font-weight:800}
.instruction__progress-track{overflow:hidden;height:.45rem;border-radius:var(--uib-radius-pill,999px);background:var(--uib-color-border,#d9e2f0)}
.instruction__progress-value{height:100%;width:var(--uib-instruction-progress-value,0%);border-radius:inherit;background:var(--uib-instruction-accent)}
.instruction__actions{display:flex;flex-wrap:wrap;gap:var(--uib-space-2,.5rem);align-items:center}
.instruction__actions[hidden],.instruction__footer[hidden],.instruction__steps[hidden],.instruction__progress[hidden]{display:none!important}
.instruction__footer{padding:var(--uib-space-4,1rem);border-top:1px solid var(--uib-color-border,#d9e2f0);background:var(--uib-color-surface-soft,#f8fbff);color:var(--uib-color-muted,#53657f);font-size:var(--uib-font-size-sm,.875rem)}
`;

function hasNamedSlot(element, name) {
  return Array.from(element.children).some((child) => child.getAttribute?.('slot') === name);
}

function stepStatus(step) {
  const status = (step.getAttribute?.('status') || '').toLowerCase();
  if (step.hasAttribute?.('complete') || status === 'complete') return 'complete';
  if (step.hasAttribute?.('current') || step.getAttribute?.('aria-current') === 'step' || status === 'current') return 'current';
  if (step.hasAttribute?.('disabled') || step.getAttribute?.('aria-disabled') === 'true' || status === 'disabled') return 'disabled';
  return '';
}

export class UibInstruction extends UibBaseElement {
  static get observedAttributes() {
    return [
      ...UibBaseElement.commonAttributes,
      'heading',
      'summary',
      'variant',
      'icon',
      'collapsible',
      'open',
      'density',
      'numbered',
      'complete',
      'current',
      'show-progress'
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._observer = null;
  }

  connectedCallback() {
    this.render();
    this._connectObserver();
  }

  disconnectedCallback() {
    this._observer?.disconnect();
    this._observer = null;
  }

  get heading() { return this.getAttribute('heading') || this.label || 'Instruction'; }
  get summary() { return this.getAttribute('summary') || ''; }
  get variant() {
    const value = (this.getAttribute('variant') || 'info').toLowerCase();
    return VARIANTS.includes(value) ? value : 'info';
  }
  get collapsible() { return this.hasAttribute('collapsible'); }
  get open() { return !this.collapsible || this.hasAttribute('open'); }
  set open(value) { this.toggleAttribute('open', Boolean(value)); }
  get density() { return this.getAttribute('density') === 'compact' ? 'compact' : 'comfortable'; }
  get numbered() { return this.hasAttribute('numbered'); }
  get complete() { return this.hasAttribute('complete'); }
  get current() { return this.hasAttribute('current'); }
  get showProgress() { return this.hasAttribute('show-progress'); }

  _connectObserver() {
    this._observer?.disconnect();
    this._observer = new MutationObserver(() => {
      if (this.isConnected) this.render();
    });
    this._observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['slot', 'complete', 'current', 'disabled', 'status', 'aria-current', 'aria-disabled']
    });
  }

  _steps() {
    return Array.from(this.children).filter((child) => child.getAttribute?.('slot') === 'step');
  }

  _progress() {
    const steps = this._steps();
    const total = steps.length;
    const complete = steps.filter((step) => stepStatus(step) === 'complete').length;
    const currentIndex = steps.findIndex((step) => stepStatus(step) === 'current');
    const percent = total ? Math.round((complete / total) * 100) : 0;
    return { total, complete, currentIndex, percent };
  }

  _statusLabel(progress) {
    if (this.complete) return 'Complete';
    if (this.current) return 'Current';
    if (progress.total) return `${progress.complete}/${progress.total} done`;
    return variantDefaults[this.variant].label;
  }

  _summaryContent(progress) {
    const marker = this.getAttribute('icon') || variantDefaults[this.variant].marker;
    const summary = this.summary;
    return (
      `<span class="instruction__marker" part="marker" aria-hidden="true">${escapeHtml(marker)}</span>` +
      `<span class="instruction__header" part="header">` +
      `<span class="instruction__title-row">` +
      `<span class="instruction__title" part="title">${escapeHtml(this.heading)}</span>` +
      `<span class="instruction__status" part="status">${escapeHtml(this._statusLabel(progress))}</span>` +
      `</span>` +
      (summary ? `<span class="instruction__description" part="description">${escapeHtml(summary)}</span>` : '') +
      `</span>`
    );
  }

  _bodyContent(progress) {
    const hasSteps = progress.total > 0;
    const hasActions = hasNamedSlot(this, 'actions');
    const hasFooter = hasNamedSlot(this, 'footer');
    const showProgress = this.showProgress || hasSteps;
    return (
      `<div class="instruction__body" part="body">` +
      `<div class="instruction__copy" part="content"><slot></slot></div>` +
      `<div class="instruction__steps" part="steps" ${hasSteps ? '' : 'hidden'}>` +
      `<ol class="instruction__step-list" part="step-list"><slot name="step"></slot></ol>` +
      `</div>` +
      `<div class="instruction__progress" part="progress" ${showProgress ? '' : 'hidden'} style="--uib-instruction-progress-value:${progress.percent}%">` +
      `<div class="instruction__progress-label">` +
      `<span>${progress.total ? 'Step progress' : 'Progress'}</span>` +
      `<span>${progress.total ? `${progress.complete} of ${progress.total}` : `${progress.percent}%`}</span>` +
      `</div>` +
      `<div class="instruction__progress-track" aria-hidden="true"><div class="instruction__progress-value"></div></div>` +
      `</div>` +
      `<div class="instruction__actions" part="actions" ${hasActions ? '' : 'hidden'}><slot name="actions"></slot></div>` +
      `</div>` +
      `<div class="instruction__footer" part="footer" ${hasFooter ? '' : 'hidden'}><slot name="footer"></slot></div>`
    );
  }

  _classes() {
    return [
      'instruction',
      `instruction--${this.variant}`,
      `instruction--${this.density}`,
      this.numbered ? 'instruction--numbered' : '',
      this.complete ? 'instruction--complete' : '',
      this.current ? 'instruction--current' : '',
      this.disabled ? 'instruction--disabled' : '',
      this.cssClass
    ].filter(Boolean).join(' ');
  }

  _handleToggle(event) {
    if (this.disabled) {
      event.currentTarget.open = this.open;
      return;
    }
    const oldValue = this.open;
    const newValue = event.currentTarget.open;
    if (oldValue === newValue) return;
    this.open = newValue;
    this.emitValueChange('uib-instruction-toggle', oldValue, newValue, {
      variant: this.variant,
      complete: this.complete,
      current: this.current
    });
  }

  render() {
    const progress = this._progress();
    const classes = this._classes();
    const summary = `<slot name="summary">${this._summaryContent(progress)}</slot>`;
    const body = this._bodyContent(progress);
    const ariaLabel = this.ariaLabel ? ` aria-label="${escapeHtml(this.ariaLabel)}"` : '';
    const describedBy = this.describedBy();
    const ariaDescribedBy = describedBy ? ` aria-describedby="${escapeHtml(describedBy)}"` : '';
    const disabled = this.disabled ? ' aria-disabled="true"' : '';

    this.shadowRoot.innerHTML = this.collapsible
      ? (
        `<style>${styles}</style>` +
        `<details class="${classes}" part="base" ${this.open ? 'open' : ''}${ariaLabel}${ariaDescribedBy}${disabled}>` +
        `<summary class="instruction__summary" part="summary">${summary}</summary>` +
        body +
        `</details>`
      )
      : (
        `<style>${styles}</style>` +
        `<section class="${classes}" part="base" role="note"${ariaLabel}${ariaDescribedBy}${disabled}>` +
        `<div class="instruction__summary" part="summary">${summary}</div>` +
        body +
        `</section>`
      );

    const details = this.shadowRoot.querySelector('details');
    details?.addEventListener('toggle', (event) => this._handleToggle(event));
    details?.querySelector('summary')?.addEventListener('click', (event) => {
      if (this.disabled) event.preventDefault();
    });
  }
}

defineUiBaseElement('uib-instruction', UibInstruction);
