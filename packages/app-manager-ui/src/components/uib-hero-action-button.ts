import { BaseHTMLElement, attr, defineAppManagerElement, dispatch, escapeHtml } from '../utils/dom.js';
import {
  type HeroActionConfig,
  type HeroActionType,
  HERO_ACTION_VARIANTS,
  cloneHeroAction,
  normalizeHeroAction,
  normalizeHeroActionType,
  parseBoolean,
  parseHeroActionJson,
} from './hero-action-config.js';

const TYPE_LABELS: Record<HeroActionType, string> = {
  link: 'Link',
  action: 'Action',
};

const VARIANT_LABELS: Record<HeroActionConfig['variant'], string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  tertiary: 'Tertiary',
  destructive: 'Destructive',
};

let heroActionButtonId = 0;

function attributeBoolean(element: HTMLElement, name: string, fallback = false): boolean {
  if (!element.hasAttribute(name)) return fallback;
  const value = element.getAttribute(name);
  if (value === '') return true;
  return parseBoolean(value, true);
}

function fieldValue(root: ShadowRoot, selector: string): string {
  const input = root.querySelector<HTMLInputElement | HTMLSelectElement>(selector);
  return input?.value ?? '';
}

function checkedValue(root: ShadowRoot, selector: string, fallback = false): boolean {
  const input = root.querySelector<HTMLInputElement>(selector);
  return input ? input.checked : fallback;
}

export class UibHeroActionButton extends BaseHTMLElement {
  static get observedAttributes() {
    return [
      'action',
      'action-id',
      'button-id',
      'name',
      'label',
      'type',
      'value',
      'show',
      'action-disabled',
      'button-disabled',
      'variant',
      'help',
      'title',
      'aria-label',
      'target',
      'rel',
      'heading',
      'default-action-token',
      'show-preview',
      'disabled',
      'readonly',
      'invalid',
      'error',
    ];
  }

  private internalAction: HeroActionConfig | null = null;
  private componentId = `uib-hero-action-button-${++heroActionButtonId}`;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.internalAction) this.internalAction = this.readActionFromAttributes();
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;
    if (name === 'action') this.internalAction = parseHeroActionJson(newValue);
    else if (this.internalAction) this.internalAction = this.readActionFromAttributes(this.internalAction);
    if (this.isConnected) this.render();
  }

  get action(): HeroActionConfig {
    if (!this.internalAction) this.internalAction = this.readActionFromAttributes();
    return cloneHeroAction(this.internalAction);
  }

  set action(value: Partial<HeroActionConfig> & Record<string, unknown>) {
    this.internalAction = normalizeHeroAction(value);
    if (this.isConnected) this.render();
  }

  get disabled(): boolean {
    return attributeBoolean(this, 'disabled', false);
  }

  get readonly(): boolean {
    return attributeBoolean(this, 'readonly', false);
  }

  get showPreview(): boolean {
    return attributeBoolean(this, 'show-preview', false);
  }

  get heading(): string {
    return this.getAttribute('heading') || this.action.title || 'Hero action button';
  }

  get defaultActionToken(): string {
    return this.getAttribute('default-action-token') || 'ACTION_TOKEN';
  }

  private readActionFromAttributes(existing: HeroActionConfig = normalizeHeroAction()): HeroActionConfig {
    if (this.hasAttribute('action')) return parseHeroActionJson(this.getAttribute('action'));
    return normalizeHeroAction({
      ...existing,
      id: this.getAttribute('action-id') || this.getAttribute('button-id') || existing.id,
      name: this.getAttribute('name') || existing.name,
      label: this.getAttribute('label') || existing.label,
      type: this.getAttribute('type') || existing.type,
      value: this.getAttribute('value') || existing.value,
      show: this.hasAttribute('show') ? this.getAttribute('show') : existing.show,
      disabled: this.hasAttribute('action-disabled')
        ? this.getAttribute('action-disabled')
        : this.hasAttribute('button-disabled')
          ? this.getAttribute('button-disabled')
          : existing.disabled,
      variant: this.getAttribute('variant') || existing.variant,
      help: this.getAttribute('help') || existing.help,
      title: this.getAttribute('title') || existing.title,
      ariaLabel: this.getAttribute('aria-label') || existing.ariaLabel,
      target: this.getAttribute('target') || existing.target,
      rel: this.getAttribute('rel') || existing.rel,
    });
  }

  private actionFromInputs(changedField = ''): HeroActionConfig {
    if (!this.shadowRoot) return this.action;
    const oldAction = this.action;
    const typeInput = this.shadowRoot.querySelector<HTMLInputElement>('input[name="type"]:checked');
    const nextType = normalizeHeroActionType(typeInput?.value || oldAction.type);
    const typeChanged = changedField === 'type' && nextType !== oldAction.type;

    return normalizeHeroAction({
      id: fieldValue(this.shadowRoot, '[data-field="id"]'),
      name: fieldValue(this.shadowRoot, '[data-field="name"]'),
      label: fieldValue(this.shadowRoot, '[data-field="label"]'),
      type: nextType,
      value: typeChanged ? (nextType === 'action' ? this.defaultActionToken : '') : fieldValue(this.shadowRoot, '[data-field="value"]'),
      show: checkedValue(this.shadowRoot, '[data-field="show"]', true),
      disabled: checkedValue(this.shadowRoot, '[data-field="disabled"]', false),
      variant: fieldValue(this.shadowRoot, '[data-field="variant"]'),
      help: fieldValue(this.shadowRoot, '[data-field="help"]'),
      title: fieldValue(this.shadowRoot, '[data-field="title"]'),
      ariaLabel: fieldValue(this.shadowRoot, '[data-field="ariaLabel"]'),
      target: fieldValue(this.shadowRoot, '[data-field="target"]'),
      rel: fieldValue(this.shadowRoot, '[data-field="rel"]'),
    });
  }

  private setAction(nextAction: HeroActionConfig, options: { emit?: boolean; render?: boolean } = {}) {
    const { emit = true, render = true } = options;
    const oldValue = this.action;
    const newValue = normalizeHeroAction(nextAction);
    this.internalAction = newValue;

    if (render && this.isConnected) this.render();
    else this.updatePreview();

    if (emit && JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      const detail = {
        name: newValue.name || oldValue.name || this.getAttribute('name') || '',
        oldValue,
        newValue: cloneHeroAction(newValue),
      };
      dispatch(this, 'change', detail);
      dispatch(this, 'uib-hero-action-button-change', detail);
    }
  }

  private updatePreview() {
    if (!this.showPreview || !this.shadowRoot) return;
    const preview = this.shadowRoot.querySelector('pre');
    if (preview) preview.textContent = JSON.stringify(this.action, null, 2);
  }

  private handleInput(fieldName: string) {
    if (this.disabled || this.readonly) return;
    this.setAction(this.actionFromInputs(fieldName), { render: fieldName === 'type' });
  }

  private bind() {
    const root = this.shadowRoot;
    if (!root) return;
    root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-field]').forEach((input) => {
      const field = input.getAttribute('data-field') || '';
      const eventName = input instanceof HTMLInputElement && input.type === 'text' ? 'input' : 'change';
      input.addEventListener(eventName, () => this.handleInput(field));
    });
  }

  render() {
    if (!this.shadowRoot) return;
    const action = this.action;
    const disabled = this.disabled || this.readonly;
    const descriptionId = `${this.componentId}-description`;
    const error = this.getAttribute('error') || '';
    const errorId = error || this.hasAttribute('invalid') ? `${this.componentId}-error` : '';
    const valueLabel = action.type === 'action' ? 'Action Token' : 'Href';
    const valueHelp = action.type === 'action'
      ? 'The parent application handles this action token.'
      : 'Use a relative path, hash anchor, or full URL.';

    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;color:var(--uibam-hero-action-text,var(--uib-color-ink,#13294b));font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}
        *,*::before,*::after{box-sizing:border-box}
        fieldset{display:block;margin:0;padding:var(--uibam-hero-action-padding,clamp(1rem,2vw,1.25rem));border:1px solid var(--uib-color-border,#d9e2f0);border-radius:var(--uib-radius-lg,1rem);background:var(--uib-color-surface,#fff);box-shadow:var(--uib-shadow-sm,0 8px 22px rgba(10,31,68,.08))}
        fieldset[aria-disabled="true"]{opacity:.7}
        legend{display:flex;width:100%;align-items:center;justify-content:space-between;gap:.75rem;padding:0;color:var(--uib-color-primary,#174a8b);font-size:1rem;font-weight:900}
        .badge{display:inline-flex;align-items:center;min-height:1.45rem;padding:.15rem .55rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:999px;background:var(--uib-color-surface-tint,#eef4fb);color:var(--uib-color-muted,#53657f);font-size:.72rem;font-weight:850;text-transform:uppercase;letter-spacing:.04em}
        .description{margin:.45rem 0 0;color:var(--uib-color-muted,#53657f);font-size:.9rem;line-height:1.45}
        .grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(16rem,.8fr);gap:.95rem;margin-top:1rem;align-items:start}
        .field{display:grid;gap:.35rem;min-width:0}
        .field--wide{grid-column:1 / -1}
        label,.field-label{display:inline-flex;align-items:center;gap:.35rem;color:var(--uib-color-ink,#13294b);font-weight:850;line-height:1.35}
        .hint{color:var(--uib-color-muted,#53657f);font-size:.83rem;line-height:1.35}
        input[type="text"],select{width:100%;min-height:2.55rem;padding:.55rem .7rem;border:1px solid var(--uib-color-border-strong,#aab8cc);border-radius:.65rem;background:var(--uib-color-surface,#fff);color:var(--uib-color-ink,#13294b);font:inherit;font-size:.95rem}
        input:focus-visible,select:focus-visible,.segmented input:focus-visible + span{outline:3px solid color-mix(in srgb,var(--uib-color-primary,#174a8b) 28%,transparent);outline-offset:2px}
        input:disabled,select:disabled{cursor:not-allowed;background:var(--uib-color-surface-soft,#f8fbff)}
        .segmented{display:inline-grid;grid-template-columns:repeat(2,minmax(5rem,1fr));overflow:hidden;border:1px solid var(--uib-color-border-strong,#aab8cc);border-radius:.75rem;background:var(--uib-color-surface-tint,#eef4fb)}
        .segmented label{position:relative;display:grid;min-width:0}
        .segmented input{position:absolute;inset:0;opacity:0;pointer-events:none}
        .segmented span{display:inline-flex;align-items:center;justify-content:center;min-height:2.55rem;padding:.55rem .85rem;color:var(--uib-color-primary,#174a8b);font-weight:900;text-align:center;cursor:pointer}
        .segmented label + label span{border-inline-start:1px solid var(--uib-color-border-strong,#aab8cc)}
        .segmented input:checked + span{background:var(--uib-color-primary,#174a8b);color:var(--uib-color-primary-contrast,#fff)}
        .segmented input:disabled + span{cursor:not-allowed;opacity:.66}
        .check-row{display:flex;align-items:flex-start;flex-wrap:wrap;gap:.75rem}
        .check{display:inline-flex;align-items:center;gap:.45rem;min-height:2.55rem;color:var(--uib-color-ink,#13294b);font-weight:850}
        .check input{width:1.08rem;height:1.08rem;margin:0;accent-color:var(--uib-color-primary,#174a8b);cursor:pointer}
        .check input:disabled{cursor:not-allowed}
        details{grid-column:1 / -1;margin-top:.15rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:.75rem;background:var(--uib-color-surface-soft,#f8fbff)}
        summary{padding:.75rem .85rem;font-weight:850;cursor:pointer}
        .advanced-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.9rem;padding:0 .85rem .85rem}
        pre{grid-column:1 / -1;margin:0;padding:.7rem .85rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:.75rem;background:var(--uib-color-surface-soft,#f8fbff);color:var(--uib-color-muted,#53657f);font-family:var(--uib-font-family-mono,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono",monospace);font-size:.82rem;line-height:1.45;white-space:pre-wrap;overflow:auto}
        .error{grid-column:1 / -1;color:var(--uib-color-danger,#b4232a);font-size:.88rem;line-height:1.4}
        :host([invalid]) fieldset{border-color:var(--uib-color-danger,#b4232a)}
        @media(max-width:760px){.grid,.advanced-grid{grid-template-columns:1fr}legend{align-items:flex-start;flex-direction:column}.segmented{width:100%}.check-row{display:grid;grid-template-columns:1fr}.check{min-height:2.25rem}}
        @media(max-width:380px){fieldset{padding:.85rem}.segmented{grid-template-columns:1fr}.segmented label + label span{border-inline-start:0;border-top:1px solid var(--uib-color-border-strong,#aab8cc)}}
      </style>
      <fieldset part="fieldset" aria-describedby="${descriptionId}${errorId ? ` ${errorId}` : ''}" aria-disabled="${disabled ? 'true' : 'false'}">
        <legend part="legend">
          <span>${escapeHtml(this.heading)}</span>
          <span class="badge" part="badge">${escapeHtml(TYPE_LABELS[action.type])}</span>
        </legend>
        <p id="${descriptionId}" class="description" part="description">Configure the Hero call-to-action button. Link and Action share one conditional value field.</p>
        <div class="grid" part="grid">
          <div class="field" part="field">
            <label part="label" for="${this.componentId}-label">Label</label>
            <input part="input" id="${this.componentId}-label" data-field="label" type="text" value="${attr(action.label)}" ${disabled ? 'disabled' : ''} />
          </div>
          <div class="field" part="field">
            <span class="field-label" part="field-label" id="${this.componentId}-type-label">Type</span>
            <div class="segmented" part="segmented" role="radiogroup" aria-labelledby="${this.componentId}-type-label">
              ${(Object.keys(TYPE_LABELS) as HeroActionType[]).map((type) => `
                <label>
                  <input data-field="type" name="type" type="radio" value="${attr(type)}" ${action.type === type ? 'checked' : ''} ${disabled ? 'disabled' : ''} />
                  <span>${escapeHtml(TYPE_LABELS[type])}</span>
                </label>`).join('')}
            </div>
          </div>
          <div class="field" part="field">
            <label part="label" for="${this.componentId}-value">${escapeHtml(valueLabel)}</label>
            <input part="input" id="${this.componentId}-value" data-field="value" type="text" value="${attr(action.value)}" placeholder="${attr(action.type === 'action' ? this.defaultActionToken : '#workflow or /example/visit')}" ${disabled ? 'disabled' : ''} />
            <span class="hint" part="hint">${escapeHtml(valueHelp)}</span>
          </div>
          <div class="field" part="field">
            <label part="label" for="${this.componentId}-variant">Variant</label>
            <select part="select" id="${this.componentId}-variant" data-field="variant" ${disabled ? 'disabled' : ''}>
              ${HERO_ACTION_VARIANTS.map((variant) => `<option value="${attr(variant)}" ${action.variant === variant ? 'selected' : ''}>${escapeHtml(VARIANT_LABELS[variant])}</option>`).join('')}
            </select>
          </div>
          <div class="check-row field--wide">
            <label class="check">
              <input data-field="show" type="checkbox" ${action.show ? 'checked' : ''} ${disabled ? 'disabled' : ''} />
              <span>Show</span>
            </label>
            <label class="check">
              <input data-field="disabled" type="checkbox" ${action.disabled ? 'checked' : ''} ${disabled ? 'disabled' : ''} />
              <span>Disabled</span>
            </label>
          </div>
          <details>
            <summary>Advanced accessibility and link settings</summary>
            <div class="advanced-grid">
              <div class="field">
                <label for="${this.componentId}-id">ID</label>
                <input id="${this.componentId}-id" data-field="id" type="text" value="${attr(action.id)}" ${disabled ? 'disabled' : ''} />
              </div>
              <div class="field">
                <label for="${this.componentId}-name">Name</label>
                <input id="${this.componentId}-name" data-field="name" type="text" value="${attr(action.name)}" ${disabled ? 'disabled' : ''} />
              </div>
              <div class="field">
                <label for="${this.componentId}-title">Title</label>
                <input id="${this.componentId}-title" data-field="title" type="text" value="${attr(action.title)}" ${disabled ? 'disabled' : ''} />
              </div>
              <div class="field">
                <label for="${this.componentId}-aria">Accessible text</label>
                <input id="${this.componentId}-aria" data-field="ariaLabel" type="text" value="${attr(action.ariaLabel)}" ${disabled ? 'disabled' : ''} />
              </div>
              <div class="field field--wide">
                <label for="${this.componentId}-help">Help text</label>
                <input id="${this.componentId}-help" data-field="help" type="text" value="${attr(action.help)}" ${disabled ? 'disabled' : ''} />
              </div>
              <div class="field">
                <label for="${this.componentId}-target">Target</label>
                <input id="${this.componentId}-target" data-field="target" type="text" value="${attr(action.target)}" placeholder="_self, _blank" ${disabled ? 'disabled' : ''} />
              </div>
              <div class="field">
                <label for="${this.componentId}-rel">Rel</label>
                <input id="${this.componentId}-rel" data-field="rel" type="text" value="${attr(action.rel)}" placeholder="noopener noreferrer" ${disabled ? 'disabled' : ''} />
              </div>
            </div>
          </details>
          ${this.showPreview ? `<pre aria-label="Saved value">${escapeHtml(JSON.stringify(action, null, 2))}</pre>` : ''}
          ${errorId ? `<p id="${errorId}" class="error" part="error" role="alert">${escapeHtml(error || `${this.heading} is invalid.`)}</p>` : ''}
        </div>
      </fieldset>
    `;
    this.bind();
  }
}

defineAppManagerElement('uib-hero-action-button', UibHeroActionButton);
