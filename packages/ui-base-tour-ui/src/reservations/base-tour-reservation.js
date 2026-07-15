/**
 * Shared base for UI Base tour reservation action components.
 *
 * Attributes/properties:
 * - heading, eyebrow, description, action-label/actionLabel
 * - toast-message/toastMessage, toast-duration/toastDuration
 * - disabled, variant
 *
 * Methods:
 * - call(optionalDetail), showToast(message, duration), hideToast()
 *
 * Events:
 * - uib-tour-reservation-action
 * - component-specific events such as uib-tour-new-reservation
 */
const DEFAULT_TOAST_DURATION = 4200;
const FALSE_VALUES = new Set(['false', '0', 'no', 'off']);

const styles = `
:host{display:block;min-height:100%;color:var(--uib-color-ink,#13294b);font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}*,*::before,*::after{box-sizing:border-box}.uib-tour-card{position:relative;min-height:100%;display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--uib-space-4,1rem);overflow:hidden}.uib-tour-card--cancel{--uib-tour-accent:var(--uib-color-danger,#9d2b3a)}.uib-tour-card--find{--uib-tour-accent:var(--uib-color-success,#23634f)}.uib-tour-card--group{--uib-tour-accent:#6e4aa3}.uib-tour-card__icon{display:inline-grid;place-items:center}.uib-tour-card__content{min-width:0;display:grid;gap:var(--uib-space-3,.75rem)}.uib-tour-card__eyebrow,.uib-tour-card__heading,.uib-tour-card__description{margin:0}.uib-tour-card__action-row{display:flex;flex-wrap:wrap;gap:var(--uib-space-3,.75rem);align-items:center}.uib-tour-card__button{font:inherit;cursor:pointer}.uib-tour-card__button:disabled{cursor:not-allowed;opacity:.55}.uib-tour-toast{pointer-events:none;transition:opacity 180ms ease,transform 180ms ease}.uib-tour-toast:not(.uib-tour-toast--visible){transform:translateY(.8rem);opacity:0}.uib-tour-toast--visible{opacity:1;transform:translateY(0)}[hidden]{display:none!important}@media(max-width:540px){.uib-tour-card{grid-template-columns:1fr}.uib-tour-toast{grid-column:1/-1}}
`;

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
function cssClassTokens(element) {
  return String(element?.getAttribute?.('css-class') ?? element?.cssClass ?? '')
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean);
}
function applyCssClassToRoot(element) {
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
function enabledBoolean(value) {
  if (value === null) return false;
  return !FALSE_VALUES.has(String(value).trim().toLowerCase());
}
function parseDuration(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_TOAST_DURATION;
}

export class UibTourReservationBase extends HTMLElement {
  static get observedAttributes() {
    return ['heading', 'eyebrow', 'description', 'action-label', 'toast-message', 'toast-duration', 'disabled', 'variant', 'css-class'];
  }

  constructor(defaults) {
    super();
    this.defaults = defaults;
    this._toastVisible = false;
    this._toastMessage = '';
    this._toastTimer = undefined;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this.render(); }
  disconnectedCallback() { this.clearToastTimer(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  get heading() { return this.getAttribute('heading') || this.defaults.heading; }
  set heading(value) { this.setAttribute('heading', value); }
  get eyebrow() { return this.getAttribute('eyebrow') || this.defaults.eyebrow; }
  set eyebrow(value) { this.setAttribute('eyebrow', value); }
  get description() { return this.getAttribute('description') || this.defaults.description; }
  set description(value) { this.setAttribute('description', value); }
  get actionLabel() { return this.getAttribute('action-label') || this.defaults.actionLabel; }
  set actionLabel(value) { this.setAttribute('action-label', value); }
  get toastMessage() { return this.getAttribute('toast-message') || this.defaults.toastMessage; }
  set toastMessage(value) { this.setAttribute('toast-message', value); }
  get toastDuration() { return parseDuration(this.getAttribute('toast-duration')); }
  set toastDuration(value) { this.setAttribute('toast-duration', String(value)); }
  get disabled() { return enabledBoolean(this.getAttribute('disabled')); }
  set disabled(value) { if (value) this.setAttribute('disabled', ''); else this.removeAttribute('disabled'); }
  get variant() { return this.getAttribute('variant') || this.defaults.variant; }
  set variant(value) { this.setAttribute('variant', value); }
  get cssClass() { return this.getAttribute('css-class') || ''; }
  set cssClass(value) {
    if (value === null || value === undefined || value === false) this.removeAttribute('css-class');
    else this.setAttribute('css-class', String(value));
  }

  call(optionalDetail = {}) {
    const detail = { action: this.defaults.action, heading: this.heading, label: this.actionLabel, disabled: this.disabled, source: this, ...optionalDetail };
    if (this.disabled) {
      this.showToast(`${this.heading} is currently disabled.`, this.toastDuration);
      return detail;
    }
    this.dispatchEvent(new CustomEvent('uib-tour-reservation-action', { bubbles: true, composed: true, cancelable: true, detail }));
    this.dispatchEvent(new CustomEvent(this.defaults.eventName, { bubbles: true, composed: true, cancelable: true, detail }));
    this.showToast(this.toastMessage, this.toastDuration);
    return detail;
  }

  showToast(message = this.toastMessage, duration = this.toastDuration) {
    this.clearToastTimer();
    this._toastMessage = String(message || this.toastMessage);
    this._toastVisible = true;
    this.render();
    const normalizedDuration = parseDuration(duration);
    if (normalizedDuration > 0) this._toastTimer = window.setTimeout(() => this.hideToast(), normalizedDuration);
    this.dispatchEvent(new CustomEvent('uib-tour-toast-show', { bubbles: true, composed: true, detail: { action: this.defaults.action, message: this._toastMessage } }));
  }

  hideToast() {
    this.clearToastTimer();
    this._toastVisible = false;
    this.render();
  }

  clearToastTimer() {
    if (this._toastTimer) {
      window.clearTimeout(this._toastTimer);
      this._toastTimer = undefined;
    }
  }

  render() {
    const titleId = `${this.defaults.action}-title`;
    const descriptionId = `${this.defaults.action}-description`;
    const toastClass = this._toastVisible ? 'uib-tour-toast uib-tour-toast--visible' : 'uib-tour-toast';
    const toastText = this._toastMessage || this.toastMessage;
    this.shadowRoot.innerHTML = `<style>${styles}</style><section class="uib-tour-card uib-tour-card--${escapeHtml(this.variant)}" part="card" aria-labelledby="${titleId}" aria-describedby="${descriptionId}"><div class="uib-tour-card__icon" part="icon" aria-hidden="true">${escapeHtml(this.defaults.icon)}</div><div class="uib-tour-card__content" part="content"><p class="uib-tour-card__eyebrow" part="eyebrow">${escapeHtml(this.eyebrow)}</p><h3 id="${titleId}" class="uib-tour-card__heading" part="heading">${escapeHtml(this.heading)}</h3><p id="${descriptionId}" class="uib-tour-card__description" part="description">${escapeHtml(this.description)}</p><div class="uib-tour-card__action-row" part="action-row"><button class="uib-tour-card__button" part="button" type="button" ${this.disabled ? 'disabled' : ''}>${escapeHtml(this.actionLabel)}</button>${this.disabled ? '<span class="uib-tour-card__disabled-note" part="disabled-note">Action disabled by parent state.</span>' : ''}</div></div><div class="${toastClass}" part="toast" role="alert" aria-live="assertive" ${this._toastVisible ? '' : 'hidden'}>${escapeHtml(toastText)}</div></section>`;
    applyCssClassToRoot(this);
    this.shadowRoot.querySelector('button')?.addEventListener('click', () => this.call({ trigger: 'button' }));
  }
}

export function registerTourElement(tagName, elementClass) {
  if (typeof customElements !== 'undefined' && !customElements.get(tagName)) {
    customElements.define(tagName, elementClass);
  }
  return elementClass;
}
