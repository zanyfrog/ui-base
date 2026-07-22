import '@ui-base/hero/uib-hero-editor';
import { BaseHTMLElement, attr, clientFromElement, cloneRecord, defineAppManagerElement, dispatch, escapeHtml, formatError } from '../utils/dom.js';

type HeroRecord = Record<string, string>;

function genericHeroVisualDataUri(label = 'Application Hero'): string {
  const safeLabel = encodeURIComponent(label);
  return `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='960'%20height='540'%20viewBox='0%200%20960%20540'%3E%3Crect%20width='960'%20height='540'%20rx='42'%20fill='%23eef4fb'/%3E%3Ccircle%20cx='770'%20cy='130'%20r='92'%20fill='%23f4bd46'%20opacity='.7'/%3E%3Crect%20x='96'%20y='110'%20width='360'%20height='56'%20rx='28'%20fill='%23174a8b'%20opacity='.92'/%3E%3Crect%20x='96'%20y='205'%20width='650'%20height='30'%20rx='15'%20fill='%2313294b'%20opacity='.22'/%3E%3Crect%20x='96'%20y='260'%20width='520'%20height='30'%20rx='15'%20fill='%2313294b'%20opacity='.16'/%3E%3Ctext%20x='96'%20y='485'%20fill='%2313294b'%20font-family='Arial,sans-serif'%20font-size='34'%20font-weight='700'%3E${safeLabel}%3C/text%3E%3C/svg%3E`;
}

function defaultHeroRecord(applicationKey: string, actorId: string): HeroRecord {
  const now = new Date().toISOString();
  const heroKey = 'home';
  const actions = JSON.stringify([
    {
      id: 'primaryHeroAction',
      name: 'primaryCta',
      label: 'Start Request',
      type: 'action',
      value: 'START_REQUEST',
      show: true,
      disabled: false,
      variant: 'primary',
      title: 'Primary CTA',
      ariaLabel: 'Start Request',
    },
    {
      id: 'secondaryHeroAction',
      name: 'secondaryCta',
      label: 'Learn More',
      type: 'link',
      value: '#overview',
      show: true,
      disabled: false,
      variant: 'secondary',
      title: 'Secondary CTA',
      ariaLabel: 'Learn More',
    },
  ]);

  return {
    id: `hero_${applicationKey.replaceAll('-', '_')}_${heroKey}`,
    application_key: applicationKey,
    hero_key: heroKey,
    page_key: 'home',
    route_path: `/${applicationKey}`,
    placement: 'primary',
    audience_type: 'public',
    audience_key: 'public',
    audience_refs: '[]',
    audience_match: 'any',
    audience_rules: '',
    audience_expression: '',
    sort_order: '10',
    name: 'Home Hero',
    description: 'Primary application hero.',
    is_active: 'true',
    publish_at: now,
    expire_at: '',
    eyebrow: 'Featured experience',
    headline: 'Explore the sample application',
    subheadline: 'Use this generic Hero as a starting point for a new application landing page.',
    'action-components': actions,
    action_components: actions,
    hero_action_buttons: actions,
    actions,
    visual_source: 'url',
    visual_role: 'background',
    visual_src: genericHeroVisualDataUri('Application Hero'),
    visual_asset_id: '',
    visual_alt: 'Generic application visual',
    visual_mode: 'background',
    visual_position: 'background',
    layout_opacity: '0.8',
    trust_signal: 'This generic example is ready to connect to application-specific data and actions.',
    nav_items: JSON.stringify([
      { label: 'Overview', href: '#overview' },
      { label: 'Services', href: '#services' },
      { label: 'Reports', href: '#reports' },
      { label: 'Contact', href: '#contact' },
    ]),
    details: JSON.stringify([
      { label: 'Duration', value: '60 minutes', icon: '60' },
      { label: 'Capacity', value: 'Up to 20 people', icon: '20' },
      { label: 'Availability', value: 'Weekdays', icon: 'WD' },
      { label: 'Cost', value: 'Free', icon: '$' },
    ]),
    theme: 'organization',
    size: 'large',
    navigation_slot_mode: 'empty',
    visual_slot_mode: 'empty',
    trust_slot_mode: 'empty',
    after_content_slot_mode: 'empty',
    navigation_slot: '',
    visual_slot: '',
    trust_slot: '',
    after_content_slot: '',
    date_created: now,
    date_updated: now,
    created_by: actorId,
    updated_by: actorId,
  };
}

export class UibApplicationHeroEditor extends BaseHTMLElement {
  static get observedAttributes() {
    return ['orm-base-url', 'iam-base-url', 'dev-actor-id', 'dev-token', 'application-key', 'hero-key'];
  }

  private currentRecord: HeroRecord = {};
  private loading = false;
  private persisted = false;
  private error = '';
  private loadedKey = '';

  connectedCallback() {
    void this.load();
  }

  attributeChangedCallback() {
    if (this.isConnected) void this.load();
  }

  private get applicationKey(): string {
    return this.getAttribute('application-key') || '';
  }

  private get heroKey(): string {
    return this.getAttribute('hero-key') || 'new';
  }

  private get routeKey(): string {
    return `${this.applicationKey}:${this.heroKey}`;
  }

  private async load() {
    if (this.routeKey === this.loadedKey) return;
    this.loadedKey = this.routeKey;
    this.loading = true;
    this.error = '';
    this.render();

    try {
      if (!this.applicationKey) throw new Error('application-key is required.');
      if (this.heroKey === 'new') {
        this.currentRecord = defaultHeroRecord(this.applicationKey, this.getAttribute('dev-actor-id') || 'original-creator');
        this.persisted = false;
      } else {
        const result = await clientFromElement(this).getHero(this.applicationKey, this.heroKey);
        this.currentRecord = cloneRecord(result.storageRecord) as HeroRecord;
        this.persisted = true;
      }
      this.loading = false;
      this.render();
    } catch (error) {
      this.loading = false;
      this.error = formatError(error);
      this.loadedKey = '';
      this.render();
    }
  }

  private async persist(record: HeroRecord) {
    if (this.persisted) {
      return clientFromElement(this).updateHero(
        this.currentRecord.application_key || this.applicationKey,
        this.currentRecord.hero_key || this.heroKey,
        record,
      );
    }
    return clientFromElement(this).createHero(this.applicationKey, record);
  }

  private async handleSave(event: Event) {
    event.stopPropagation();
    const detail = (event as CustomEvent<{ record?: HeroRecord; value?: HeroRecord; trigger?: string }>).detail || {};
    const record = detail.record || detail.value || {};
    try {
      const result = await this.persist(record);
      this.currentRecord = cloneRecord(result.storageRecord) as HeroRecord;
      this.persisted = true;
      const editor = this.querySelector('uib-hero-editor') as HTMLElement & { heroData?: HeroRecord };
      if (editor) editor.heroData = this.currentRecord;
      dispatch(this, 'uib-hero-saved', { record: this.currentRecord, trigger: detail.trigger || 'manual' });
      dispatch(this, 'uib-application-hero-saved', { record: this.currentRecord, trigger: detail.trigger || 'manual' });
      if (this.heroKey === 'new') {
        dispatch(this, 'uib-hero-created', {
          applicationKey: this.currentRecord.application_key,
          heroKey: this.currentRecord.hero_key,
        });
      }
    } catch (error) {
      this.error = formatError(error);
      this.renderError();
    }
  }

  private bind() {
    const editor = this.querySelector('uib-hero-editor') as HTMLElement & { heroData?: HeroRecord };
    if (!editor) return;
    editor.heroData = this.currentRecord;
    editor.addEventListener('uib-hero-editor-save', (event) => void this.handleSave(event));
    editor.addEventListener('uib-hero-editor-change', (event) => {
      const detail = (event as CustomEvent<{ record?: HeroRecord; value?: HeroRecord }>).detail || {};
      this.currentRecord = cloneRecord(detail.record || detail.value || {}) as HeroRecord;
    });
  }

  private renderError() {
    const slot = this.querySelector<HTMLElement>('[data-wrapper-error]');
    if (slot) slot.textContent = this.error;
  }

  render() {
    if (this.loading) {
      this.innerHTML = '<div class="uibam-loading">Loading hero editor...</div>';
      return;
    }

    if (this.error && !Object.keys(this.currentRecord).length) {
      this.innerHTML = `<div class="uibam-error" role="alert">${escapeHtml(this.error)}</div>`;
      return;
    }

    this.innerHTML = `
      <div class="uibam-hero-editor-wrapper">
        <div data-wrapper-error class="uibam-error" role="alert">${this.error ? escapeHtml(this.error) : ''}</div>
        <uib-hero-editor
          application-key="${attr(this.currentRecord.application_key || this.applicationKey)}"
          brand-label="${attr(this.currentRecord.application_key || this.applicationKey)} preview"
          brand-mark="${attr((this.currentRecord.application_key || this.applicationKey || 'UIB').slice(0, 2).toUpperCase())}"
        ></uib-hero-editor>
      </div>
    `;
    this.bind();
  }
}

defineAppManagerElement('uib-application-hero-editor', UibApplicationHeroEditor);
