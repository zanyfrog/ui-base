import type { ShapedRecord, StorageRecord } from '@ui.base/app-manager-api-client';
import { APPLICATION_INFO_FIELDS } from '../record-fields.js';
import { BaseHTMLElement, attr, clientFromElement, cloneRecord, defineAppManagerElement, dispatch, escapeHtml, formatError, recordsEqual, slugify } from '../utils/dom.js';
import { formToRecord, renderFieldGroups, validateRecord } from './record-form.js';

function defaultApplicationRecord(actorId: string): StorageRecord {
  const now = new Date().toISOString();
  return {
    id: '',
    application_key: '',
    name: '',
    description: '',
    is_active: 'true',
    publish_at: now,
    expire_at: '',
    application_slug: '',
    primary_domain: '',
    public_base_url: '',
    default_theme: 'organization',
    default_locale: 'en-US',
    default_hero_placement: 'primary',
    allowed_hero_placements: JSON.stringify(['primary', 'secondary', 'sidebar', 'footer', 'campaign'], null, 2),
    date_created: now,
    date_updated: now,
    created_by: actorId,
    updated_by: actorId,
  };
}

export class UibApplicationEditor extends BaseHTMLElement {
  static get observedAttributes() {
    return ['orm-base-url', 'iam-base-url', 'dev-actor-id', 'dev-token', 'mode'];
  }

  private originalRecord: StorageRecord = {};
  private currentRecord: StorageRecord = {};
  private state: 'clean' | 'dirty' | 'saving' | 'saved' | 'error' = 'clean';
  private error = '';
  private autosaveTimer: number | undefined;
  private hasInitialized = false;

  set record(value: StorageRecord) {
    this.originalRecord = cloneRecord(value);
    this.currentRecord = cloneRecord(value);
    this.hasInitialized = true;
    this.state = 'clean';
    this.error = '';
    if (this.isConnected) this.render();
  }

  get record(): StorageRecord {
    return cloneRecord(this.currentRecord);
  }

  connectedCallback() {
    if (!this.hasInitialized) {
      this.record = defaultApplicationRecord(this.getAttribute('dev-actor-id') || 'original-creator');
    }
    this.render();
  }

  disconnectedCallback() {
    if (this.autosaveTimer) window.clearTimeout(this.autosaveTimer);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  private get mode(): 'create' | 'edit' {
    return this.getAttribute('mode') === 'edit' ? 'edit' : 'create';
  }

  private updateFromForm() {
    const form = this.querySelector<HTMLFormElement>('form');
    if (!form) return;
    this.currentRecord = formToRecord(form, APPLICATION_INFO_FIELDS);
    if (!this.currentRecord.application_slug && this.currentRecord.application_key) {
      this.currentRecord.application_slug = slugify(this.currentRecord.application_key);
    }
    if (!this.currentRecord.public_base_url && this.currentRecord.application_key) {
      this.currentRecord.public_base_url = `/${slugify(this.currentRecord.application_key)}`;
    }
    if (!this.currentRecord.id && this.currentRecord.application_key) {
      this.currentRecord.id = `app_info_${slugify(this.currentRecord.application_key).replaceAll('-', '_')}`;
    }
    this.state = recordsEqual(this.currentRecord, this.originalRecord) ? 'clean' : 'dirty';
  }

  private onInput = () => {
    this.updateFromForm();
    this.error = '';
    this.renderFooterOnly();
    this.queueAutosave();
  };

  private queueAutosave() {
    if (this.autosaveTimer) window.clearTimeout(this.autosaveTimer);
    if (this.mode === 'create' || this.state !== 'dirty') return;
    this.autosaveTimer = window.setTimeout(() => {
      void this.save('autosave');
    }, 3000);
  }

  private async save(trigger: 'manual' | 'autosave' = 'manual') {
    this.updateFromForm();
    const errors = validateRecord(APPLICATION_INFO_FIELDS, this.currentRecord);
    if (errors.length) {
      this.state = 'error';
      this.error = errors.join(' ');
      this.render();
      return;
    }

    const client = clientFromElement(this);
    this.state = 'saving';
    this.error = '';
    this.renderFooterOnly();

    try {
      let result: ShapedRecord;
      if (this.mode === 'edit') {
        const key = this.originalRecord.application_key || this.currentRecord.application_key;
        result = await client.updateApplication(key, this.currentRecord);
      } else {
        result = await client.createApplication(this.currentRecord);
      }
      this.originalRecord = cloneRecord(result.storageRecord);
      this.currentRecord = cloneRecord(result.storageRecord);
      this.state = 'saved';
      dispatch(this, 'uib-application-saved', { record: this.currentRecord, trigger });
      this.render();
    } catch (error) {
      this.state = 'error';
      this.error = formatError(error);
      this.render();
    }
  }

  private renderFooterOnly() {
    const footer = this.querySelector<HTMLElement>('.uibam-form-footer');
    if (footer) footer.outerHTML = this.footerMarkup();
    this.bindFooter();
  }

  private footerMarkup(): string {
    const dirty = this.state === 'dirty';
    const saving = this.state === 'saving';
    const label = this.state === 'saved' ? 'saved' : this.state === 'dirty' ? 'dirty' : this.state === 'saving' ? 'saving' : this.state === 'error' ? 'needs attention' : 'clean';
    const badgeClass = this.state === 'dirty' ? 'uibam-badge--warning' : this.state === 'error' ? 'uibam-badge--warning' : this.state === 'saved' ? 'uibam-badge--success' : 'uibam-badge--muted';
    return `
      <div class="uibam-form-footer">
        <div class="uibam-status-line">
          <span class="uibam-badge ${badgeClass}">${escapeHtml(label)}</span>
          <span>${this.mode === 'edit' ? 'Autosaves after 3 seconds of inactivity.' : 'Create saves when you press Save.'}</span>
          ${this.error ? `<span role="alert">${escapeHtml(this.error)}</span>` : ''}
        </div>
        <button class="uibam-button" type="button" data-action="save" ${saving || (!dirty && this.mode === 'edit') ? 'disabled' : ''}>${saving ? 'Saving...' : this.mode === 'edit' ? 'Save changes' : 'Create application'}</button>
      </div>`;
  }

  private bindFooter() {
    this.querySelector('[data-action="save"]')?.addEventListener('click', () => void this.save('manual'));
  }

  render() {
    const title = this.mode === 'edit' ? `Edit ${this.currentRecord.name || this.currentRecord.application_key}` : 'Create application';
    this.innerHTML = `
      <section class="uibam-card" aria-label="${attr(title)}">
        <div class="uibam-card-header">
          <div>
            <h2>${escapeHtml(title)}</h2>
            <p class="uibam-subtitle">Every application_info CSV field is editable in this first version. Audit fields are visible and editable for dev workflows; ORM still refreshes update metadata on save.</p>
          </div>
        </div>
        <div class="uibam-card-body">
          <form class="uibam-form" novalidate>
            ${renderFieldGroups(APPLICATION_INFO_FIELDS, this.currentRecord, ['Identity', 'Routing', 'Defaults'])}
            ${this.footerMarkup()}
          </form>
        </div>
      </section>
    `;
    this.querySelector('form')?.addEventListener('input', this.onInput);
    this.querySelector('form')?.addEventListener('change', this.onInput);
    this.bindFooter();
  }
}

defineAppManagerElement('uib-application-editor', UibApplicationEditor);
