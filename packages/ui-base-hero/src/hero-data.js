export const CTA_KEYS = ['primary', 'secondary', 'third', 'fourth'];
export const CTA_VARIANTS = ['primary', 'secondary', 'tertiary', 'destructive'];

export const HERO_FIELD_DEFINITIONS = [
  { name: 'id', label: 'ID', section: 'Identity', kind: 'text' },
  { name: 'application_key', label: 'Application key', section: 'Identity', kind: 'text' },
  { name: 'hero_key', label: 'Hero key', section: 'Identity', kind: 'text' },
  { name: 'page_key', label: 'Page key', section: 'Identity', kind: 'text' },
  { name: 'route_path', label: 'Route path', section: 'Identity', kind: 'text' },
  { name: 'placement', label: 'Placement', section: 'Identity', kind: 'text' },
  { name: 'name', label: 'Name', section: 'Content', kind: 'text', required: true },
  { name: 'description', label: 'Description', section: 'Content', kind: 'textarea' },
  { name: 'eyebrow', label: 'Eyebrow', section: 'Content', kind: 'text' },
  { name: 'headline', label: 'Headline', section: 'Content', kind: 'textarea', required: true },
  { name: 'subheadline', label: 'Subheadline', section: 'Content', kind: 'textarea' },
  { name: 'trust_signal', label: 'Trust signal', section: 'Content', kind: 'textarea' },
  { name: 'theme', label: 'Theme', section: 'Visual', kind: 'select', options: ['organization', 'light', 'dark'] },
  { name: 'size', label: 'Size', section: 'Visual', kind: 'select', options: ['compact', 'default', 'large'] },
  { name: 'visual_mode', label: 'Visual mode', section: 'Visual', kind: 'select', options: ['panel-right', 'panel-left', 'background'] },
  { name: 'layout_opacity', label: 'Layout opacity', section: 'Visual', kind: 'number' },
  { name: 'navigation_slot_mode', label: 'Navigation slot mode', section: 'Rich Slots', kind: 'select', options: ['empty', 'custom'] },
  { name: 'navigation_slot', label: 'Navigation slot', section: 'Rich Slots', kind: 'html' },
  { name: 'visual_slot_mode', label: 'Visual slot mode', section: 'Rich Slots', kind: 'select', options: ['empty', 'custom'] },
  { name: 'visual_slot', label: 'Visual slot', section: 'Rich Slots', kind: 'html' },
  { name: 'trust_slot_mode', label: 'Trust slot mode', section: 'Rich Slots', kind: 'select', options: ['empty', 'custom'] },
  { name: 'trust_slot', label: 'Trust slot', section: 'Rich Slots', kind: 'html' },
  { name: 'after_content_slot_mode', label: 'After content slot mode', section: 'Rich Slots', kind: 'select', options: ['empty', 'custom'] },
  { name: 'after_content_slot', label: 'After content slot', section: 'Rich Slots', kind: 'html' }
];

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function cssClassTokens(element) {
  return String(element?.getAttribute?.('css-class') ?? element?.cssClass ?? '')
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function applyCssClassToRoot(element) {
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

export function registerHeroElement(tagName, elementClass) {
  const prototype = elementClass?.prototype;
  if (prototype && !Object.getOwnPropertyDescriptor(prototype, 'cssClass')) {
    Object.defineProperty(prototype, 'cssClass', {
      configurable: true,
      enumerable: true,
      get() { return this.getAttribute('css-class') || ''; },
      set(value) {
        if (value === null || value === undefined || value === false) this.removeAttribute('css-class');
        else this.setAttribute('css-class', String(value));
      }
    });
  }

  const observed = Array.isArray(elementClass.observedAttributes) ? elementClass.observedAttributes : [];
  if (!observed.includes('css-class')) {
    Object.defineProperty(elementClass, 'observedAttributes', {
      configurable: true,
      value: [...observed, 'css-class']
    });
  }

  if (prototype && typeof prototype.render === 'function' && !prototype.__uibCssClassRenderWrapped) {
    const render = prototype.render;
    prototype.render = function renderWithCssClass(...args) {
      const result = render.apply(this, args);
      applyCssClassToRoot(this);
      return result;
    };
    prototype.__uibCssClassRenderWrapped = true;
  }

  if (typeof customElements !== 'undefined' && !customElements.get(tagName)) {
    customElements.define(tagName, elementClass);
  }
  return elementClass;
}

export function parseBoolean(value, fallback = false) {
  if (value === true || value === false) return value;
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
  return fallback;
}

export function parseJson(value, fallback) {
  if (Array.isArray(value) || (value && typeof value === 'object')) return value;
  if (!value) return fallback;
  try {
    return JSON.parse(String(value));
  } catch {
    return fallback;
  }
}

export function parseArray(value) {
  const parsed = parseJson(value, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function parseObject(value) {
  const parsed = parseJson(value, {});
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
}

export function cloneRecord(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

export function recordsEqual(left, right) {
  return JSON.stringify(normalizeHeroRecord(left || {})) === JSON.stringify(normalizeHeroRecord(right || {}));
}

export function dispatch(element, type, detail) {
  element.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
}

function stringValue(value) {
  return value === null || value === undefined ? '' : String(value);
}

function slugify(value) {
  return stringValue(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeHeroVisualToken(value) {
  const raw = String(value || '').trim().toLowerCase().replaceAll('_', '-');
  if (!raw) return '';
  if (raw === 'background' || raw === 'bg' || raw === 'image-background') return 'background';
  if (['panel-left', 'left', 'image-left', 'visual-left'].includes(raw)) return 'panel-left';
  if (['panel-right', 'right', 'image-right', 'visual-right'].includes(raw)) return 'panel-right';
  return '';
}

export function visualPositionForMode(mode) {
  const normalized = normalizeHeroVisualToken(mode);
  if (normalized === 'background') return 'background';
  if (normalized === 'panel-left') return 'left';
  return 'right';
}

export function resolveHeroVisualMode(record = {}) {
  const role = String(record.visual_role || '').trim().toLowerCase();
  if (role === 'background') return 'background';
  return normalizeHeroVisualToken(record.visual_mode) || normalizeHeroVisualToken(record.visual_position) || 'panel-right';
}

export function normalizeHeroVisualFields(record) {
  const next = record;
  const hasUrl = Boolean(stringValue(next.visual_src).trim());
  const hasAsset = Boolean(stringValue(next.visual_asset_id).trim());
  const source = hasUrl ? 'url' : hasAsset ? 'asset' : String(next.visual_source || 'none').toLowerCase();
  next.visual_source = ['none', 'url', 'asset'].includes(source) ? source : 'none';
  next.visual_role = ['image', 'icon', 'background', 'svg'].includes(String(next.visual_role || '').toLowerCase())
    ? String(next.visual_role).toLowerCase()
    : resolveHeroVisualMode(next) === 'background'
      ? 'background'
      : 'image';
  next.visual_mode = next.visual_role === 'background' ? 'background' : resolveHeroVisualMode(next);
  next.visual_position = visualPositionForMode(next.visual_mode);
  return next;
}

export function normalizeHeroAction(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const key = CTA_KEYS[index] || `action${index + 1}`;
  const type = String(source.type || source.kind || source.actionType || '').toLowerCase() === 'action' ? 'action' : 'link';
  const explicitValue = source.value ?? source.href ?? source.url ?? source.actionToken ?? source.token ?? source.action;
  return {
    id: stringValue(source.id ?? source.actionId ?? source.buttonId) || `${key}HeroAction`,
    name: stringValue(source.name ?? source.key) || `${key}Cta`,
    label: stringValue(source.label ?? source.text ?? source.buttonLabel),
    type,
    value: stringValue(explicitValue),
    show: parseBoolean(source.show ?? source.shown ?? source.visible ?? source.isVisible, true),
    disabled: parseBoolean(source.disabled ?? source.buttonDisabled ?? source.actionDisabled, false),
    variant: CTA_VARIANTS.includes(String(source.variant || '').toLowerCase())
      ? String(source.variant).toLowerCase()
      : index === 0
        ? 'primary'
        : index === 2
          ? 'destructive'
          : 'secondary',
    help: stringValue(source.help ?? source.helpText),
    title: stringValue(source.title) || `${key.slice(0, 1).toUpperCase()}${key.slice(1)} CTA`,
    ariaLabel: stringValue(source.ariaLabel ?? source['aria-label'] ?? source.accessibleText ?? source.label ?? ''),
    target: stringValue(source.target),
    rel: stringValue(source.rel)
  };
}

export function normalizeHeroActionList(value) {
  if (typeof value === 'string') return parseArray(value).map((item, index) => normalizeHeroAction(item, index));
  if (Array.isArray(value)) return value.map((item, index) => normalizeHeroAction(item, index));
  if (value && typeof value === 'object') return [normalizeHeroAction(value, 0)];
  return [];
}

function ctaFieldName(key, field) {
  return field === 'disabled' ? `${key}_cta_disabled` : `${key}_cta_${field}`;
}

function ctaShowFieldName(key) {
  return `show_${key}_cta`;
}

function legacyActionHasValue(record, key) {
  return [
    ctaFieldName(key, 'label'),
    ctaFieldName(key, 'href'),
    ctaFieldName(key, 'action_token'),
    ctaFieldName(key, 'id'),
    ctaFieldName(key, 'name')
  ].some((field) => Boolean(stringValue(record[field]).trim()));
}

function legacyActionForRecord(record, key, index) {
  const explicitType = String(record[ctaFieldName(key, 'type')] || '').toLowerCase();
  const type = explicitType === 'action' || (!record[ctaFieldName(key, 'href')] && record[ctaFieldName(key, 'action_token')])
    ? 'action'
    : 'link';
  return normalizeHeroAction({
    id: record[ctaFieldName(key, 'id')],
    name: record[ctaFieldName(key, 'name')],
    label: record[ctaFieldName(key, 'label')],
    type,
    value: type === 'action' ? record[ctaFieldName(key, 'action_token')] : record[ctaFieldName(key, 'href')],
    show: record[ctaShowFieldName(key)] === undefined ? true : record[ctaShowFieldName(key)],
    disabled: record[ctaFieldName(key, 'disabled')],
    variant: record[ctaFieldName(key, 'variant')],
    help: record[ctaFieldName(key, 'help')],
    title: record[ctaFieldName(key, 'title')],
    ariaLabel: record[ctaFieldName(key, 'aria_label')],
    target: record[ctaFieldName(key, 'target')],
    rel: record[ctaFieldName(key, 'rel')]
  }, index);
}

export function heroActionsForRecord(record = {}) {
  const canonical =
    stringValue(record['action-components']).trim()
    || stringValue(record.action_components).trim()
    || stringValue(record.hero_action_buttons).trim()
    || stringValue(record.actions).trim();
  if (canonical) return normalizeHeroActionList(canonical);
  return CTA_KEYS
    .filter((key) => legacyActionHasValue(record, key))
    .map((key, index) => legacyActionForRecord(record, key, index));
}

export function applyHeroActionsToRecord(record, value) {
  const actions = normalizeHeroActionList(value);
  const json = JSON.stringify(actions);
  record['action-components'] = json;
  record.action_components = json;
  record.hero_action_buttons = json;
  record.actions = json;
  CTA_KEYS.forEach((key, index) => {
    const action = actions[index];
    record[ctaFieldName(key, 'label')] = action?.label || '';
    record[ctaFieldName(key, 'type')] = action?.type || '';
    record[ctaFieldName(key, 'href')] = action?.type === 'link' ? action.value : '';
    record[ctaFieldName(key, 'action_token')] = action?.type === 'action' ? action.value : '';
    record[ctaShowFieldName(key)] = action?.show ? 'true' : 'false';
    record[ctaFieldName(key, 'disabled')] = action?.disabled ? 'true' : 'false';
    record[ctaFieldName(key, 'variant')] = action?.variant || '';
    record[ctaFieldName(key, 'id')] = action?.id || '';
    record[ctaFieldName(key, 'name')] = action?.name || '';
    record[ctaFieldName(key, 'help')] = action?.help || '';
    record[ctaFieldName(key, 'title')] = action?.title || '';
    record[ctaFieldName(key, 'aria_label')] = action?.ariaLabel || '';
    record[ctaFieldName(key, 'target')] = action?.target || '';
    record[ctaFieldName(key, 'rel')] = action?.rel || '';
  });
  return record;
}

export function normalizeHeroRecord(value = {}) {
  const record = {};
  for (const [key, raw] of Object.entries(value || {})) {
    if (raw === undefined || raw === null) record[key] = '';
    else if (typeof raw === 'string') record[key] = raw;
    else if (typeof raw === 'boolean') record[key] = raw ? 'true' : 'false';
    else if (typeof raw === 'number') record[key] = String(raw);
    else record[key] = JSON.stringify(raw);
  }
  if (!record.name && record.headline) record.name = record.headline;
  if (!record.hero_key && record.name) record.hero_key = slugify(record.name);
  if (!record.page_key) record.page_key = 'home';
  if (!record.route_path && record.application_key) record.route_path = `/${record.application_key}`;
  if (!record.placement) record.placement = 'primary';
  if (!record.theme) record.theme = 'organization';
  if (!record.size) record.size = 'large';
  if (!record.layout_opacity) record.layout_opacity = '0.8';
  if (!record.nav_items) record.nav_items = '[]';
  if (!record.details) record.details = '[]';
  normalizeHeroVisualFields(record);
  applyHeroActionsToRecord(record, heroActionsForRecord(record));
  return record;
}

export function createDefaultHeroRecord() {
  return normalizeHeroRecord({
    id: 'hero_sample_home',
    application_key: 'sample',
    hero_key: 'home',
    page_key: 'home',
    route_path: '/sample',
    placement: 'primary',
    name: 'Home Hero',
    eyebrow: 'Featured experience',
    headline: 'Explore the sample application',
    subheadline: 'Use this generic Hero as a starting point for a landing page, tour page, or application entry point.',
    trust_signal: 'This reusable editor emits events so the parent demo or application owns persistence.',
    visual_source: 'url',
    visual_role: 'background',
    visual_mode: 'background',
    visual_src: genericHeroVisualDataUri('UI Base Hero'),
    visual_alt: 'Generic UI Base hero visual',
    nav_items: JSON.stringify([
      { label: 'Overview', href: '#overview' },
      { label: 'Services', href: '#services' },
      { label: 'Reports', href: '#reports' },
      { label: 'Contact', href: '#contact' }
    ]),
    details: JSON.stringify([
      { label: 'Duration', value: '60 minutes', icon: '60' },
      { label: 'Capacity', value: 'Up to 20 people', icon: '20' },
      { label: 'Availability', value: 'Weekdays', icon: 'WD' },
      { label: 'Cost', value: 'Free', icon: '$' }
    ]),
    actions: JSON.stringify([
      { id: 'primaryHeroAction', name: 'primaryCta', label: 'Start Request', type: 'action', value: 'START_REQUEST', show: true, disabled: false, variant: 'primary' },
      { id: 'secondaryHeroAction', name: 'secondaryCta', label: 'Learn More', type: 'link', value: '#overview', show: true, disabled: false, variant: 'secondary' }
    ])
  });
}

function genericHeroVisualDataUri(label) {
  const safeLabel = encodeURIComponent(label);
  return `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='960'%20height='540'%20viewBox='0%200%20960%20540'%3E%3Crect%20width='960'%20height='540'%20rx='42'%20fill='%23eef4fb'/%3E%3Ccircle%20cx='770'%20cy='130'%20r='92'%20fill='%23f4bd46'%20opacity='.7'/%3E%3Crect%20x='96'%20y='110'%20width='360'%20height='56'%20rx='28'%20fill='%23174a8b'%20opacity='.92'/%3E%3Crect%20x='96'%20y='205'%20width='650'%20height='30'%20rx='15'%20fill='%2313294b'%20opacity='.22'/%3E%3Crect%20x='96'%20y='260'%20width='520'%20height='30'%20rx='15'%20fill='%2313294b'%20opacity='.16'/%3E%3Ctext%20x='96'%20y='485'%20fill='%2313294b'%20font-family='Arial,sans-serif'%20font-size='34'%20font-weight='700'%3E${safeLabel}%3C/text%3E%3C/svg%3E`;
}
