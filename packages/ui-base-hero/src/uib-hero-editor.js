import '@ui.base/assets/components/uib-visual-source-control';
import '@ui.base/ui/detail-list-editor';
import './uib-hero-preview.js';
import {
  CTA_KEYS,
  CTA_VARIANTS,
  HERO_FIELD_DEFINITIONS,
  applyHeroActionsToRecord,
  cloneRecord,
  createDefaultHeroRecord,
  dispatch,
  escapeHtml,
  heroActionsForRecord,
  normalizeHeroAction,
  normalizeHeroRecord,
  parseArray,
  parseObject,
  registerHeroElement,
  recordsEqual
} from './hero-data.js';

const EDIT_SECTIONS = ['Identity', 'Content', 'Visual', 'Rich Slots'];

function fieldValue(form, name) {
  return form.elements[name]?.value ?? '';
}

function actionLabel(index) {
  const key = CTA_KEYS[index];
  return key ? `${key.slice(0, 1).toUpperCase()}${key.slice(1)} CTA` : `Action ${index + 1}`;
}

export class UibHeroEditor extends HTMLElement {
  static get observedAttributes() {
    return ['hero-data', 'hero-json', 'asset-map', 'application-key', 'brand-label', 'brand-mark', 'autosave'];
  }

  constructor() {
    super();
    this.originalRecord = createDefaultHeroRecord();
    this.currentRecord = cloneRecord(this.originalRecord);
    this.state = 'clean';
    this.error = '';
    this.editorPanelOpen = true;
    this.autosaveTimer = 0;
  }

  connectedCallback() {
    this.loadFromAttributes();
    this.render();
  }

  disconnectedCallback() {
    if (this.autosaveTimer) window.clearTimeout(this.autosaveTimer);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'hero-data' || name === 'hero-json' || name === 'application-key') {
      this.loadFromAttributes();
    }
    if (this.isConnected) this.render();
  }

  set heroData(value) {
    const record = normalizeHeroRecord(value && typeof value === 'object' ? value : parseObject(value));
    this.originalRecord = cloneRecord(record);
    this.currentRecord = cloneRecord(record);
    this.state = 'clean';
    this.error = '';
    if (this.isConnected) this.render();
  }

  get heroData() {
    return cloneRecord(this.currentRecord);
  }

  set value(value) {
    this.heroData = value;
  }

  get value() {
    return this.heroData;
  }

  loadHeroData(value) {
    this.heroData = value;
  }

  loadFromAttributes() {
    const raw = this.getAttribute('hero-data') || this.getAttribute('hero-json') || '';
    if (raw) {
      this.heroData = parseObject(raw);
      return;
    }
    if (!Object.keys(this.currentRecord || {}).length) this.heroData = createDefaultHeroRecord();
    const appKey = this.getAttribute('application-key');
    if (appKey && (!this.currentRecord.application_key || this.currentRecord.application_key === 'sample')) {
      this.currentRecord.application_key = appKey;
      this.originalRecord.application_key = appKey;
      if (!this.currentRecord.route_path || this.currentRecord.route_path === '/sample') this.currentRecord.route_path = `/${appKey}`;
      if (!this.originalRecord.route_path || this.originalRecord.route_path === '/sample') this.originalRecord.route_path = `/${appKey}`;
    }
  }

  get autosave() {
    return this.hasAttribute('autosave') && this.getAttribute('autosave') !== 'false';
  }

  stateLabel() {
    if (this.state === 'dirty') return 'dirty';
    if (this.state === 'saved') return 'saved';
    if (this.state === 'saving') return 'saving';
    if (this.state === 'error') return 'needs attention';
    return 'clean';
  }

  collectFormRecord() {
    const form = this.querySelector('form');
    if (!form) return cloneRecord(this.currentRecord);
    const next = cloneRecord(this.currentRecord);
    HERO_FIELD_DEFINITIONS.forEach((field) => {
      next[field.name] = fieldValue(form, field.name);
    });
    next.nav_items = JSON.stringify(this.collectNavRows());
    next.details = JSON.stringify(this.detailsEditor()?.details || parseArray(next.details));
    const visual = this.querySelector('uib-visual-source-control')?.value?.();
    next.visual_source = visual?.visualSource || next.visual_source || 'none';
    next.visual_role = visual?.visualRole || next.visual_role || 'image';
    next.visual_src = visual?.visualSrc || '';
    next.visual_asset_id = visual?.visualAssetId || '';
    next.visual_alt = visual?.visualAlt || '';
    return normalizeHeroRecord(next);
  }

  detailsEditor() {
    return this.querySelector('uib-detail-list-editor');
  }

  collectNavRows() {
    const rows = [...this.querySelectorAll('[data-nav-row]')];
    if (!rows.length) return parseArray(this.currentRecord.nav_items);
    return rows.map((row) => ({
      label: row.querySelector('[data-nav-label]')?.value || '',
      href: row.querySelector('[data-nav-href]')?.value || ''
    })).filter((row) => row.label || row.href);
  }

  setCurrentFromForm(options = {}) {
    const previous = cloneRecord(this.currentRecord);
    this.currentRecord = this.collectFormRecord();
    this.state = recordsEqual(this.currentRecord, this.originalRecord) ? 'clean' : 'dirty';
    this.error = '';
    this.updatePreview();
    this.renderFooterOnly();
    if (JSON.stringify(previous) !== JSON.stringify(this.currentRecord)) {
      dispatch(this, 'change', { oldValue: previous, newValue: this.heroData, record: this.heroData });
      dispatch(this, 'uib-hero-editor-change', { oldValue: previous, newValue: this.heroData, record: this.heroData });
    }
    if (options.autosave) this.queueAutosave();
  }

  queueAutosave() {
    if (this.autosaveTimer) window.clearTimeout(this.autosaveTimer);
    if (!this.autosave || this.state !== 'dirty') return;
    this.autosaveTimer = window.setTimeout(() => this.save('autosave'), 1200);
  }

  updatePreview() {
    const preview = this.querySelector('uib-hero-preview');
    if (preview) preview.record = this.currentRecord;
  }

  renderFooterOnly() {
    const footer = this.querySelector('.uib-hero-editor__footer');
    if (footer) footer.outerHTML = this.footerMarkup();
    this.bindFooter();
  }

  validate() {
    const errors = [];
    if (!String(this.currentRecord.headline || '').trim()) errors.push('Headline is required.');
    if (!String(this.currentRecord.name || '').trim()) errors.push('Name is required.');
    return errors;
  }

  save(trigger = 'manual') {
    this.setCurrentFromForm();
    const errors = this.validate();
    if (errors.length) {
      this.state = 'error';
      this.error = errors.join(' ');
      this.renderFooterOnly();
      return;
    }
    this.originalRecord = cloneRecord(this.currentRecord);
    this.state = 'saved';
    this.error = '';
    this.renderFooterOnly();
    dispatch(this, 'uib-hero-editor-save', { record: this.heroData, value: this.heroData, trigger });
  }

  addNavRow() {
    this.setCurrentFromForm();
    const rows = parseArray(this.currentRecord.nav_items);
    rows.push({ label: 'New link', href: '#' });
    this.currentRecord.nav_items = JSON.stringify(rows);
    this.state = 'dirty';
    this.render();
  }

  removeNavRow(index) {
    this.setCurrentFromForm();
    const rows = parseArray(this.currentRecord.nav_items);
    rows.splice(index, 1);
    this.currentRecord.nav_items = JSON.stringify(rows);
    this.state = 'dirty';
    this.render();
  }

  moveNavRow(index, direction) {
    this.setCurrentFromForm();
    const rows = parseArray(this.currentRecord.nav_items);
    const target = Math.max(0, Math.min(rows.length - 1, index + direction));
    if (target === index) return;
    const [row] = rows.splice(index, 1);
    rows.splice(target, 0, row);
    this.currentRecord.nav_items = JSON.stringify(rows);
    this.state = 'dirty';
    this.render();
  }

  addAction() {
    this.setCurrentFromForm();
    const actions = heroActionsForRecord(this.currentRecord);
    actions.push(normalizeHeroAction({ label: `Action ${actions.length + 1}`, value: '#', variant: 'secondary' }, actions.length));
    applyHeroActionsToRecord(this.currentRecord, actions);
    this.state = 'dirty';
    this.render();
  }

  removeAction(index) {
    this.setCurrentFromForm();
    const actions = heroActionsForRecord(this.currentRecord);
    actions.splice(index, 1);
    applyHeroActionsToRecord(this.currentRecord, actions);
    this.state = 'dirty';
    this.render();
  }

  moveAction(index, direction) {
    this.setCurrentFromForm();
    const actions = heroActionsForRecord(this.currentRecord);
    const target = Math.max(0, Math.min(actions.length - 1, index + direction));
    if (target === index) return;
    const [action] = actions.splice(index, 1);
    actions.splice(target, 0, action);
    applyHeroActionsToRecord(this.currentRecord, actions);
    this.state = 'dirty';
    this.render();
  }

  updateActionFromInput(input) {
    const card = input.closest('[data-action-row]');
    if (!card) return;
    const index = Number(card.dataset.actionRow || 0);
    const actions = heroActionsForRecord(this.currentRecord);
    actions[index] = normalizeHeroAction({
      ...actions[index],
      id: card.querySelector('[data-action-field="id"]')?.value || '',
      name: card.querySelector('[data-action-field="name"]')?.value || '',
      label: card.querySelector('[data-action-field="label"]')?.value || '',
      type: card.querySelector('[data-action-field="type"]')?.value || 'link',
      value: card.querySelector('[data-action-field="value"]')?.value || '',
      variant: card.querySelector('[data-action-field="variant"]')?.value || 'secondary',
      show: card.querySelector('[data-action-field="show"]')?.checked || false,
      disabled: card.querySelector('[data-action-field="disabled"]')?.checked || false,
      ariaLabel: card.querySelector('[data-action-field="ariaLabel"]')?.value || '',
      target: card.querySelector('[data-action-field="target"]')?.value || '',
      rel: card.querySelector('[data-action-field="rel"]')?.value || ''
    }, index);
    applyHeroActionsToRecord(this.currentRecord, actions);
    this.state = recordsEqual(this.currentRecord, this.originalRecord) ? 'clean' : 'dirty';
    this.updatePreview();
    this.renderFooterOnly();
    dispatch(this, 'uib-hero-editor-change', { record: this.heroData, value: this.heroData });
    this.queueAutosave();
  }

  bind() {
    const form = this.querySelector('form');
    form?.addEventListener('input', (event) => {
      if (event.target?.closest?.('[data-action-row]')) return;
      this.setCurrentFromForm({ autosave: true });
    });
    form?.addEventListener('change', (event) => {
      if (event.target?.closest?.('[data-action-row]')) return;
      this.setCurrentFromForm({ autosave: true });
    });
    this.querySelector('[data-toggle-editor]')?.addEventListener('click', () => {
      if (this.editorPanelOpen) this.setCurrentFromForm();
      this.editorPanelOpen = !this.editorPanelOpen;
      this.render();
    });
    this.querySelector('[data-add-nav]')?.addEventListener('click', () => this.addNavRow());
    this.querySelectorAll('[data-remove-nav]').forEach((button) => button.addEventListener('click', () => this.removeNavRow(Number(button.dataset.removeNav))));
    this.querySelectorAll('[data-move-nav]').forEach((button) => button.addEventListener('click', () => this.moveNavRow(Number(button.dataset.moveNav), Number(button.dataset.direction))));
    this.querySelector('[data-add-action]')?.addEventListener('click', () => this.addAction());
    this.querySelectorAll('[data-remove-action]').forEach((button) => button.addEventListener('click', () => this.removeAction(Number(button.dataset.removeAction))));
    this.querySelectorAll('[data-move-action]').forEach((button) => button.addEventListener('click', () => this.moveAction(Number(button.dataset.moveAction), Number(button.dataset.direction))));
    this.querySelectorAll('[data-action-field]').forEach((input) => {
      input.addEventListener(input.type === 'text' || input.tagName === 'TEXTAREA' ? 'input' : 'change', () => this.updateActionFromInput(input));
    });
    this.querySelector('uib-visual-source-control')?.addEventListener('uib-visual-source-change', (event) => {
      event.stopPropagation();
      this.setCurrentFromForm({ autosave: true });
    });
    this.detailsEditor()?.addEventListener('uib-detail-list-editor-change', (event) => {
      event.stopPropagation();
      this.setCurrentFromForm({ autosave: true });
    });
    this.bindFooter();
    this.updatePreview();
  }

  bindFooter() {
    this.querySelector('[data-save-hero]')?.addEventListener('click', () => this.save('manual'));
    this.querySelector('[data-reset-hero]')?.addEventListener('click', () => {
      this.currentRecord = cloneRecord(this.originalRecord);
      this.state = 'clean';
      this.error = '';
      this.render();
      dispatch(this, 'uib-hero-editor-reset', { record: this.heroData, value: this.heroData });
    });
  }

  fieldMarkup(field) {
    const value = this.currentRecord[field.name] || '';
    const base = `name="${escapeHtml(field.name)}" ${field.required ? 'required' : ''}`;
    if (field.kind === 'textarea' || field.kind === 'html') {
      return (
  `<label class="field field--wide">` +
  `<span>` +
  (escapeHtml(field.label)) +
  `</span>` +
  `<textarea ` +
  (base) +
  ` rows="` +
  (field.kind === 'html' ? 5 : 3) +
  `">` +
  (escapeHtml(value)) +
  `</textarea>` +
  `</label>`
);
    }
    if (field.kind === 'select') {
      return (
  `<label class="field">` +
  `<span>` +
  (escapeHtml(field.label)) +
  `</span>` +
  `<select ` +
  (base) +
  `>` +
  (field.options.map((option) => `<option value="${escapeHtml(option)}" ${value === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')) +
  `</select>` +
  `</label>`
);
    }
    return (
  `<label class="field">` +
  `<span>` +
  (escapeHtml(field.label)) +
  `</span>` +
  `<input ` +
  (base) +
  ` type="` +
  (field.kind === 'number' ? 'number' : 'text') +
  `" value="` +
  (escapeHtml(value)) +
  `" ` +
  (field.name === 'layout_opacity' ? 'step="0.05" min="0" max="1"' : '') +
  `>` +
  `</label>`
);
  }

  sectionMarkup(section) {
    const fields = HERO_FIELD_DEFINITIONS.filter((field) => field.section === section);
    return (
  `<details class="section" open>` +
  `<summary>` +
  (escapeHtml(section)) +
  `</summary>` +
  `<div class="section-body">` +
  ` ` +
  (fields.map((field) => this.fieldMarkup(field)).join('')) +
  ` ` +
  `</div>` +
  `</details>`
);
  }

  visualControlMarkup() {
    return (
  `<details class="section" open>` +
  `<summary>` +
  `Visual source` +
  `</summary>` +
  `<div class="section-body section-body--single">` +
  `<uib-visual-source-control label="Hero visual" visual-source="` +
  (escapeHtml(this.currentRecord.visual_source || 'none')) +
  `" visual-role="` +
  (escapeHtml(this.currentRecord.visual_role || 'image')) +
  `" src="` +
  (escapeHtml(this.currentRecord.visual_src || '')) +
  `" asset-id="` +
  (escapeHtml(this.currentRecord.visual_asset_id || '')) +
  `" alt="` +
  (escapeHtml(this.currentRecord.visual_alt || '')) +
  `" application-key="` +
  (escapeHtml(this.currentRecord.application_key || this.getAttribute('application-key') || '')) +
  `" >` +
  `</uib-visual-source-control>` +
  `</div>` +
  `</details>`
);
  }

  actionsMarkup() {
    const actions = heroActionsForRecord(this.currentRecord);
    return (
  `<details class="section" open>` +
  `<summary>` +
  ` Actions ` +
  `</summary>` +
  `<div class="section-body section-body--single">` +
  `<div class="toolbar">` +
  `<p>` +
  ` Configure the Hero action buttons. Link values become hrefs; Action values are emitted for the parent application. ` +
  `</p>` +
  `<button class="button button--primary" type="button" data-add-action>` +
  ` Add action ` +
  `</button>` +
  `</div>` +
  `<div class="action-list">` +
  ` ` +
  (actions.length ? actions.map((action, index) => this.actionMarkup(action, index, actions.length)).join('') : '<p class="empty">No actions configured.</p>') +
  ` ` +
  `</div>` +
  `</div>` +
  `</details>`
);
  }

  actionMarkup(action, index, length) {
    const valueLabel = action.type === 'action' ? 'Action token' : 'Href';
    return (
  `<article class="action-card" data-action-row="` +
  (index) +
  `">` +
  `<div class="action-head">` +
  `<strong>` +
  (escapeHtml(actionLabel(index))) +
  `</strong>` +
  `<div class="button-row">` +
  `<button class="icon-button" type="button" data-move-action="` +
  (index) +
  `" data-direction="-1" ` +
  (index === 0 ? 'disabled' : '') +
  ` aria-label="Move action up">↑` +
  `</button>` +
  `<button class="icon-button" type="button" data-move-action="` +
  (index) +
  `" data-direction="1" ` +
  (index === length - 1 ? 'disabled' : '') +
  ` aria-label="Move action down">↓` +
  `</button>` +
  `<button class="icon-button icon-button--danger" type="button" data-remove-action="` +
  (index) +
  `" aria-label="Remove action">×` +
  `</button>` +
  `</div>` +
  `</div>` +
  `<div class="action-grid">` +
  `<label class="field">` +
  `<span>` +
  `Label` +
  `</span>` +
  `<input data-action-field="label" type="text" value="` +
  (escapeHtml(action.label)) +
  `">` +
  `</label>` +
  `<label class="field">` +
  `<span>` +
  `Type` +
  `</span>` +
  `<select data-action-field="type">` +
  `<option value="link" ` +
  (action.type === 'link' ? 'selected' : '') +
  `>Link` +
  `</option>` +
  `<option value="action" ` +
  (action.type === 'action' ? 'selected' : '') +
  `>Action` +
  `</option>` +
  `</select>` +
  `</label>` +
  `<label class="field field--wide">` +
  `<span>` +
  (escapeHtml(valueLabel)) +
  `</span>` +
  `<input data-action-field="value" type="text" value="` +
  (escapeHtml(action.value)) +
  `">` +
  `</label>` +
  `<label class="field">` +
  `<span>` +
  `Variant` +
  `</span>` +
  `<select data-action-field="variant">` +
  (CTA_VARIANTS.map((variant) => `<option value="${escapeHtml(variant)}" ${action.variant === variant ? 'selected' : ''}>${escapeHtml(variant)}</option>`).join('')) +
  `</select>` +
  `</label>` +
  `<div class="check-row">` +
  `<label>` +
  `<input data-action-field="show" type="checkbox" ` +
  (action.show ? 'checked' : '') +
  `> Show` +
  `</label>` +
  `<label>` +
  `<input data-action-field="disabled" type="checkbox" ` +
  (action.disabled ? 'checked' : '') +
  `> Disabled` +
  `</label>` +
  `</div>` +
  `<details class="advanced">` +
  `<summary>` +
  `Advanced` +
  `</summary>` +
  `<div class="action-grid">` +
  `<label class="field">` +
  `<span>` +
  `ID` +
  `</span>` +
  `<input data-action-field="id" type="text" value="` +
  (escapeHtml(action.id)) +
  `">` +
  `</label>` +
  `<label class="field">` +
  `<span>` +
  `Name` +
  `</span>` +
  `<input data-action-field="name" type="text" value="` +
  (escapeHtml(action.name)) +
  `">` +
  `</label>` +
  `<label class="field">` +
  `<span>` +
  `Accessible text` +
  `</span>` +
  `<input data-action-field="ariaLabel" type="text" value="` +
  (escapeHtml(action.ariaLabel)) +
  `">` +
  `</label>` +
  `<label class="field">` +
  `<span>` +
  `Target` +
  `</span>` +
  `<input data-action-field="target" type="text" value="` +
  (escapeHtml(action.target)) +
  `">` +
  `</label>` +
  `<label class="field">` +
  `<span>` +
  `Rel` +
  `</span>` +
  `<input data-action-field="rel" type="text" value="` +
  (escapeHtml(action.rel)) +
  `">` +
  `</label>` +
  `</div>` +
  `</details>` +
  `</div>` +
  `</article>`
);
  }

  navigationMarkup() {
    const rows = parseArray(this.currentRecord.nav_items);
    return (
  `<details class="section" open>` +
  `<summary>` +
  ` Navigation ` +
  `</summary>` +
  `<div class="section-body section-body--single">` +
  `<div class="toolbar">` +
  `<p>` +
  ` Edit generated navigation links. ` +
  `</p>` +
  `<button class="button button--primary" type="button" data-add-nav>` +
  ` Add link ` +
  `</button>` +
  `</div>` +
  `<div class="row-list">` +
  ` ` +
  (rows.length ? rows.map((row, index) => `
            <div class="nav-row" data-nav-row>
            <label class="field"><span>Label</span><input data-nav-label type="text" value="${escapeHtml(row.label || '')}"></label>
            <label class="field"><span>Href</span><input data-nav-href type="text" value="${escapeHtml(row.href || '')}"></label>
            <div class="button-row">
            <button class="icon-button" type="button" data-move-nav="${index}" data-direction="-1" ${index === 0 ? 'disabled' : ''} aria-label="Move link up">↑</button>
            <button class="icon-button" type="button" data-move-nav="${index}" data-direction="1" ${index === rows.length - 1 ? 'disabled' : ''} aria-label="Move link down">↓</button>
            <button class="icon-button icon-button--danger" type="button" data-remove-nav="${index}" aria-label="Remove link">×</button>
            </div>
            </div>`).join('') : '<p class="empty">No navigation links configured.</p>') +
  ` ` +
  `</div>` +
  `</div>` +
  `</details>`
);
  }

  detailsMarkup() {
    return (
  `<details class="section" open>` +
  `<summary>` +
  `Details` +
  `</summary>` +
  `<div class="section-body section-body--single">` +
  `<uib-detail-list-editor data-details-editor label="Hero details" details="` +
  (escapeHtml(this.currentRecord.details || '[]')) +
  `" asset-map="` +
  (escapeHtml(this.getAttribute('asset-map') || this.currentRecord.asset_map || '')) +
  `" application-key="` +
  (escapeHtml(this.currentRecord.application_key || this.getAttribute('application-key') || '')) +
  `" >` +
  `</uib-detail-list-editor>` +
  `</div>` +
  `</details>`
);
  }

  footerMarkup() {
    return (
  `<div class="uib-hero-editor__footer">` +
  `<div class="status">` +
  `<span class="badge badge--` +
  (escapeHtml(this.state)) +
  `">` +
  (escapeHtml(this.stateLabel())) +
  `</span>` +
  `<span>` +
  (this.autosave ? 'Autosave is enabled.' : 'Save emits an event for the parent app.') +
  `</span>` +
  ` ` +
  (this.error ? `<span class="error" role="alert">${escapeHtml(this.error)}</span>` : '') +
  ` ` +
  `</div>` +
  `<div class="button-row">` +
  `<button class="button" type="button" data-reset-hero ` +
  (this.state === 'clean' ? 'disabled' : '') +
  `>Reset` +
  `</button>` +
  `<button class="button button--primary" type="button" data-save-hero>` +
  `Save` +
  `</button>` +
  `</div>` +
  `</div>`
);
  }

  toolbarMarkup() {
    return (
  `<div class="uib-hero-editor__toolbar">` +
  `<div class="status">` +
  `<span class="badge badge--` +
  (escapeHtml(this.state)) +
  `">` +
  (escapeHtml(this.stateLabel())) +
  `</span>` +
  `<span>` +
  (escapeHtml(this.currentRecord.application_key || this.getAttribute('application-key') || 'hero')) +
  `</span>` +
  `<span>` +
  `/` +
  `</span>` +
  `<span>` +
  (escapeHtml(this.currentRecord.hero_key || 'home')) +
  `</span>` +
  `</div>` +
  `<button class="button" type="button" data-toggle-editor>` +
  (this.editorPanelOpen ? 'Hide editing panel' : 'Open editing panel') +
  `</button>` +
  `</div>`
);
  }

  styles() {
    return (
  `<style>` +
  ` :host{display:block;color:var(--uib-hero-editor-text,#13294b);font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)} *,*::before,*::after{box-sizing:border-box} .uib-hero-editor{display:grid;gap:1rem} .uib-hero-editor__toolbar,.uib-hero-editor__footer,.toolbar,.action-head{display:flex;align-items:center;justify-content:space-between;gap:.85rem;flex-wrap:wrap} .workspace{display:grid;grid-template-columns:minmax(20rem,28rem) minmax(0,1fr);gap:1rem;align-items:start} .workspace--preview-only{grid-template-columns:1fr} aside{display:grid;gap:.75rem;max-height:calc(100vh - 8rem);overflow:auto;padding:1rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:1rem;background:var(--uib-color-surface,#fff)} .preview-panel{min-width:0;padding:1rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:1rem;background:var(--uib-color-surface,#fff)} .section{border:1px solid var(--uib-color-border,#d9e2f0);border-radius:.85rem;background:var(--uib-color-surface-soft,#f8fbff);overflow:hidden} summary{padding:.85rem 1rem;color:var(--uib-color-primary,#174a8b);font-weight:900;cursor:pointer} .section-body{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.85rem;padding:0 1rem 1rem} .section-body--single{grid-template-columns:1fr} .field{display:grid;gap:.35rem;min-width:0;color:var(--uib-color-ink,#13294b);font-size:.9rem;font-weight:850} .field--wide{grid-column:1/-1} input,textarea,select{width:100%;min-height:2.45rem;padding:.55rem .68rem;border:1px solid var(--uib-color-border-strong,#aab8cc);border-radius:.65rem;background:var(--uib-color-surface,#fff);color:inherit;font:inherit;font-weight:500} textarea{resize:vertical;line-height:1.4} input:focus-visible,textarea:focus-visible,select:focus-visible,button:focus-visible{outline:3px solid color-mix(in srgb,var(--uib-color-primary,#174a8b) 28%,transparent);outline-offset:2px} .button,.icon-button{display:inline-flex;align-items:center;justify-content:center;min-height:2.35rem;padding:.5rem .75rem;border:1px solid var(--uib-color-border-strong,#aab8cc);border-radius:999px;background:var(--uib-color-surface,#fff);color:var(--uib-color-primary,#174a8b);font:inherit;font-weight:850;cursor:pointer} .button--primary{border-color:var(--uib-color-primary,#174a8b);background:var(--uib-color-primary,#174a8b);color:#fff} .icon-button{width:2.2rem;padding:.35rem;font-size:1rem} .icon-button--danger{border-color:rgba(180,35,42,.35);color:var(--uib-color-danger,#b4232a)} button:disabled{cursor:not-allowed;opacity:.52} .status,.button-row,.check-row{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap} .status{color:var(--uib-color-muted,#53657f);font-size:.88rem;font-weight:750} .badge{display:inline-flex;align-items:center;min-height:1.55rem;padding:.16rem .58rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:999px;background:var(--uib-color-surface-soft,#f8fbff);color:var(--uib-color-primary,#174a8b);font-size:.74rem;font-weight:900;text-transform:uppercase} .badge--dirty,.badge--error{border-color:rgba(180,35,42,.28);background:#fff6ed;color:#9a3412} .badge--saved{border-color:rgba(22,101,52,.28);background:#f0fdf4;color:#166534} .error{color:var(--uib-color-danger,#b4232a)} .row-list,.action-list{display:grid;gap:.75rem} .nav-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:.65rem;align-items:end;padding:.75rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:.85rem;background:var(--uib-color-surface,#fff)} .action-card{display:grid;gap:.75rem;padding:.85rem;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:.85rem;background:var(--uib-color-surface,#fff)} .action-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem} .advanced{grid-column:1/-1;border:1px solid var(--uib-color-border,#d9e2f0);border-radius:.75rem;background:var(--uib-color-surface-soft,#f8fbff)} .advanced .action-grid{padding:0 .85rem .85rem} .empty,p{margin:0;color:var(--uib-color-muted,#53657f);line-height:1.45} @media(max-width:980px){.workspace{grid-template-columns:1fr}aside{max-height:none}.nav-row,.action-grid,.section-body{grid-template-columns:1fr}} ` +
  `</style>`
);
  }

  render() {
    const layoutClass = this.editorPanelOpen ? 'workspace' : 'workspace workspace--preview-only';
    this.innerHTML = (
  ` ` +
  (this.styles()) +
  ` ` +
  `<section class="uib-hero-editor">` +
  ` ` +
  (this.toolbarMarkup()) +
  ` <section class="` +
  (layoutClass) +
  `"> ` +
  (this.editorPanelOpen ? `
            <aside>
              <form novalidate>
                ${EDIT_SECTIONS.map((section) => this.sectionMarkup(section)).join('')}
                ${this.visualControlMarkup()}
                ${this.actionsMarkup()}
                ${this.navigationMarkup()}
                ${this.detailsMarkup()}
                ${this.footerMarkup()}
              </form>
            </aside>` : '') +
  ` ` +
  `<div class="preview-panel">` +
  `<uib-hero-preview asset-map="` +
  (escapeHtml(this.getAttribute('asset-map') || this.currentRecord.asset_map || '')) +
  `" application-key="` +
  (escapeHtml(this.currentRecord.application_key || this.getAttribute('application-key') || '')) +
  `" brand-label="` +
  (escapeHtml(this.getAttribute('brand-label') || '')) +
  `" brand-mark="` +
  (escapeHtml(this.getAttribute('brand-mark') || '')) +
  `" >` +
  `</uib-hero-preview>` +
  `</div>` +
  `</section>` +
  `</section>`
);
    this.bind();
  }
}

registerHeroElement('uib-hero-editor', UibHeroEditor);
