import { escapeHtml } from '@ui-base/core';
import { sanitizeRichTextHtml } from '@ui-base/ui';
import { UibFormControlBase, defineFormControl, formControlStyles } from '../form-control-base.js';

const styles = `
${formControlStyles}
.rich-text{display:grid;gap:.5rem}.toolbar{display:flex;flex-wrap:wrap;gap:.25rem;padding:.35rem;border:1px solid var(--uib-color-border-strong,#aab8cc);border-radius:var(--uib-radius-md,.75rem);background:var(--uib-color-surface-soft,#f8fbff)}.toolbar__group{display:flex;gap:.15rem;padding-inline-end:.35rem;border-inline-end:1px solid var(--uib-color-border,#d8e0eb)}.toolbar__group:last-child{padding:0;border:0}.tool{min-width:2.2rem;min-height:2.2rem;border:1px solid transparent;border-radius:.4rem;background:transparent;color:var(--uib-color-ink,#13294b);cursor:pointer;font:inherit;font-weight:750}.tool:hover{background:var(--uib-color-surface,#fff);border-color:var(--uib-color-border-strong,#aab8cc)}.tool:focus-visible,.editor:focus-visible,.source:focus-visible{outline:none;box-shadow:var(--uib-focus-ring,0 0 0 4px rgba(23,74,139,.25))}.tool[aria-pressed=true]{border-color:var(--uib-color-primary,#174a8b);background:color-mix(in srgb,var(--uib-color-primary,#174a8b) 13%,white);color:var(--uib-color-primary,#174a8b)}.block-select{min-height:2.2rem;border:1px solid transparent;border-radius:.4rem;background:transparent;color:inherit;font:inherit;cursor:pointer}.editor,.source,.preview{min-height:var(--uib-forms-rich-text-min-height,12rem);padding:var(--uib-forms-control-padding,.75rem);border:1px solid var(--uib-color-border-strong,#aab8cc);border-radius:var(--uib-radius-md,.75rem);background:var(--uib-color-surface,#fff);line-height:1.55}.editor[contenteditable=true]{cursor:text}.editor:empty::before{content:attr(data-placeholder);color:var(--uib-color-muted,#53657f);pointer-events:none}.source{width:100%;resize:vertical;font-family:var(--uib-font-family-mono,ui-monospace,SFMono-Regular,Consolas,monospace);font-size:.875rem}.mode-tabs{display:flex;gap:.2rem}.mode-tab{min-height:2.15rem;padding-inline:.8rem;border:1px solid var(--uib-color-border-strong,#aab8cc);background:var(--uib-color-surface,#fff);color:inherit;cursor:pointer;font:inherit}.mode-tab:first-child{border-radius:.45rem 0 0 .45rem}.mode-tab:last-child{border-radius:0 .45rem .45rem 0}.mode-tab[aria-selected=true]{background:var(--uib-color-primary,#174a8b);border-color:var(--uib-color-primary,#174a8b);color:var(--uib-color-primary-contrast,#fff)}.preview{overflow:auto}.preview uib-rich-text{display:block}.error{color:var(--uib-color-danger,#b4232a);font-size:var(--uib-font-size-sm,.875rem)}:host([disabled]){opacity:.62}.toolbar[aria-disabled=true] .tool,.toolbar[aria-disabled=true] .block-select{cursor:not-allowed}@media(max-width:480px){.toolbar__group{padding-inline-end:.15rem}.tool{min-width:2rem}.block-select{max-width:7rem}}
`;

const commands = [
  ['bold', 'B', 'Bold (Ctrl+B)', 'bold'], ['italic', 'I', 'Italic (Ctrl+I)', 'italic'], ['underline', 'U', 'Underline (Ctrl+U)', 'underline'],
  ['unordered', '•≡', 'Bulleted list', 'insertUnorderedList'], ['ordered', '1≡', 'Numbered list', 'insertOrderedList'],
  ['outdent', '⇤', 'Outdent', 'outdent'], ['indent', '⇥', 'Indent', 'indent'], ['link', '↗', 'Add link', 'link'],
  ['quote', '❝', 'Block quote', 'formatBlock:blockquote'], ['undo', '↶', 'Undo', 'undo'], ['redo', '↷', 'Redo', 'redo']
];

export class UibFormsRichText extends UibFormControlBase {
  static inputType = 'text';
  static defaultLabel = 'Rich text';

  static get observedAttributes() {
    return [...super.observedAttributes, 'mode'];
  }

  constructor() {
    super();
    this._mode = this.getAttribute('mode') || 'visual';
    this._committedValue = this.value;
  }

  connectedCallback() {
    if (!this._initialized) {
      const sanitized = sanitizeRichTextHtml(this.getAttribute('value') || '', this.ownerDocument);
      this._value = sanitized;
      this._initialized = true;
      if (this.getAttribute('value') !== sanitized) {
        this._reflecting = true;
        this.setAttribute('value', sanitized);
        this._reflecting = false;
      }
    }
    super.connectedCallback();
    this._committedValue = this._value;
    this._updateFormValue();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'value' && oldValue !== newValue && !this._reflecting) {
      const sanitized = sanitizeRichTextHtml(newValue, this.ownerDocument);
      if (sanitized !== (newValue || '')) {
        this._reflecting = true;
        this.setAttribute('value', sanitized);
        this._reflecting = false;
        newValue = sanitized;
      }
    }
    if (name === 'mode' && oldValue !== newValue) this._mode = ['visual', 'source', 'preview'].includes(newValue) ? newValue : 'visual';
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  get value() {
    return super.value;
  }

  set value(value) {
    super.value = sanitizeRichTextHtml(value, this.ownerDocument);
  }

  get mode() {
    return this._mode;
  }

  set mode(value) {
    this.setAttribute('mode', ['visual', 'source', 'preview'].includes(value) ? value : 'visual');
  }

  _setUserValue(value) {
    const oldValue = this.value;
    const newValue = sanitizeRichTextHtml(value, this.ownerDocument);
    this._value = newValue;
    this._reflecting = true;
    this.setAttribute('value', newValue);
    this._reflecting = false;
    this._updateFormValue();
    if (oldValue !== newValue) this.emitMtEvent('input', { name: this.name, oldValue, newValue });
    return newValue;
  }

  _commitValue() {
    if (this._committedValue === this.value) return;
    const oldValue = this._committedValue;
    this._committedValue = this.value;
    this.checkValidity();
    this.emitValueChange('uib-forms-rich-text-change', oldValue, this.value);
  }

  _editorInput(event) {
    const editor = event.currentTarget;
    const normalized = this._setUserValue(editor.innerHTML);
    if (editor.innerHTML !== normalized) editor.innerHTML = normalized;
  }

  _sourceInput(event) {
    const source = event.currentTarget;
    const normalized = this._setUserValue(source.value);
    if (source.value !== normalized) source.value = normalized;
  }

  _runCommand(command) {
    const editor = this.shadowRoot.querySelector('[data-editor]');
    if (!editor || this.disabled || this.readonly) return;
    editor.focus();
    if (command === 'link') {
      const href = globalThis.prompt?.('Link URL');
      if (!href) return;
      this.ownerDocument.execCommand('createLink', false, href);
    } else if (command.startsWith('formatBlock:')) {
      this.ownerDocument.execCommand('formatBlock', false, command.slice('formatBlock:'.length));
    } else {
      this.ownerDocument.execCommand(command, false);
    }
    this._setUserValue(editor.innerHTML);
  }

  _setBlock(event) {
    const editor = this.shadowRoot.querySelector('[data-editor]');
    if (!editor || this.disabled || this.readonly) return;
    editor.focus();
    this.ownerDocument.execCommand('formatBlock', false, event.currentTarget.value);
    this._setUserValue(editor.innerHTML);
  }

  _keyDown(event) {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    const shortcuts = { b: 'bold', i: 'italic', u: 'underline' };
    if (!shortcuts[key]) return;
    event.preventDefault();
    this._runCommand(shortcuts[key]);
  }

  _modeMarkup() {
    return ['visual', 'source', 'preview'].map((mode) => `<button class="mode-tab" type="button" role="tab" aria-selected="${this.mode === mode}" data-mode="${mode}">${mode === 'source' ? 'HTML source' : mode[0].toUpperCase() + mode.slice(1)}</button>`).join('');
  }

  render() {
    const inputId = `${this.componentId}-editor`;
    const helpId = this.help ? `${this.componentId}-help` : '';
    const validation = this._validation();
    const shouldShowError = this.invalid || !validation.valid;
    const errorText = this.error || validation.message;
    const errorId = shouldShowError && errorText ? `${this.componentId}-error` : '';
    const describedBy = this.describedBy(helpId, errorId);
    const label = this.label || this.name || this.constructor.defaultLabel;
    const disabled = this.disabled || this.readonly;
    const toolbarButtons = (items) => items.map(([, icon, labelText, command]) => `<button class="tool" type="button" data-command="${command}" aria-label="${labelText}" title="${labelText}" ${disabled ? 'disabled' : ''}>${icon}</button>`).join('');
    const toolbar = `<div class="toolbar" part="toolbar" aria-disabled="${disabled}"><span class="toolbar__group">${toolbarButtons(commands.slice(0, 3))}</span><span class="toolbar__group"><select class="block-select" data-block aria-label="Text style" ${disabled ? 'disabled' : ''}><option value="p">Paragraph</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option></select></span><span class="toolbar__group">${toolbarButtons(commands.slice(3))}</span></div>`;
    this.shadowRoot.innerHTML = `<style>${styles}</style><div class="uib-field rich-text" part="field"><span class="uib-field__label" part="label"><slot name="label"><uib-label for="${inputId}" text="${escapeHtml(label)}"></uib-label></slot>${this.required ? '<span class="uib-field__required" part="required" aria-hidden="true">*</span>' : ''}</span><div class="mode-tabs" role="tablist" aria-label="Rich text mode">${this._modeMarkup()}</div>${this.mode === 'visual' ? `${toolbar}<div id="${inputId}" class="editor" part="control editor" data-editor contenteditable="${disabled ? 'false' : 'true'}" role="textbox" aria-multiline="true" aria-describedby="${escapeHtml(describedBy)}" data-placeholder="${escapeHtml(this.placeholder)}"></div>` : this.mode === 'source' ? `<textarea id="${inputId}" class="source" part="control source" data-source aria-describedby="${escapeHtml(describedBy)}" ${disabled ? 'disabled' : ''}></textarea>` : `<div class="preview" part="control preview"><uib-rich-text data-preview></uib-rich-text></div>`}${this.help ? `<span id="${helpId}" class="uib-field__help" part="help"><uib-help text="${escapeHtml(this.help)}" mode="${escapeHtml(this.helpMode || 'tooltip')}"></uib-help></span>` : ''}${errorId ? `<div id="${errorId}" class="error" part="error">${escapeHtml(errorText)}</div>` : ''}</div>`;
    const editor = this.shadowRoot.querySelector('[data-editor]');
    const source = this.shadowRoot.querySelector('[data-source]');
    const preview = this.shadowRoot.querySelector('[data-preview]');
    if (editor) { editor.innerHTML = this.value; editor.addEventListener('input', (event) => this._editorInput(event)); editor.addEventListener('blur', () => this._commitValue()); editor.addEventListener('keydown', (event) => this._keyDown(event)); }
    if (source) { source.value = this.value; source.addEventListener('input', (event) => this._sourceInput(event)); source.addEventListener('blur', () => this._commitValue()); }
    if (preview) preview.html = this.value;
    this.shadowRoot.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => { this._commitValue(); this.mode = button.dataset.mode; }));
    this.shadowRoot.querySelectorAll('[data-command]').forEach((button) => { button.addEventListener('mousedown', (event) => event.preventDefault()); button.addEventListener('click', () => this._runCommand(button.dataset.command)); });
    this.shadowRoot.querySelector('[data-block]')?.addEventListener('change', (event) => this._setBlock(event));
  }
}

defineFormControl('uib-forms-rich-text', UibFormsRichText);
