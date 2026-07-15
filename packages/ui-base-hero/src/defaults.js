const ACTIONS = [
  ['primary', 'primary-cta-label', 'primary-cta-href', 'show-primary-cta', 'primary-cta-disabled'],
  ['secondary', 'secondary-cta-label', 'secondary-cta-href', 'show-secondary-cta', 'secondary-cta-disabled'],
  ['third', 'third-cta-label', 'third-cta-href', 'show-third-cta', 'third-cta-disabled'],
  ['fourth', 'fourth-cta-label', 'fourth-cta-href', 'show-fourth-cta', 'fourth-cta-disabled']
];

const BASE_HERO_DEFAULTS = {
  eyebrow: '',
  headline: 'Page headline',
  subheadline: '',
  trustSignal: '',
  theme: 'light',
  size: 'default',
  brandLabel: '',
  brandMark: 'UIB',
  visualMode: 'panel-right',
  visualAlt: '',
  layoutOpacity: 0.8,
  actions: {
    primary: { label: '', href: '#', shown: true, disabled: false },
    secondary: { label: '', href: '#', shown: true, disabled: false },
    third: { label: '', href: '#', shown: true, disabled: false },
    fourth: { label: '', href: '#', shown: true, disabled: false }
  },
  navItems: [],
  details: []
};

const SAMPLE_TOUR_BASE_DETAILS = [
  { label: 'Tour Length', value: '45 minutes', icon: 'TL', iconFile: 'tour-length', iconAlt: 'Tour length' },
  { label: 'Tour Size', value: 'Up to 25 people', icon: 'TS', iconFile: 'tour-size', iconAlt: 'Tour size' },
  { label: 'Availability', value: 'Tue - Fri, 9:00 AM - 3:00 PM', icon: 'AV', iconFile: 'availability', iconAlt: 'Availability' },
  { label: 'Cost', value: 'Free', icon: 'CO', iconFile: 'cost', iconAlt: 'Cost' },
  { label: 'Ages', value: '8+ recommended', icon: 'AG', iconFile: 'ages', iconAlt: 'Ages' }
];

const SAMPLE_TOUR_NAV_ITEMS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Choose Date', href: '#booking' },
  { label: 'Visitor Info', href: '#visit' },
  { label: 'Reservation Help', href: '#reservation-help' }
];

export const HERO_DEFAULTS = deepFreeze(cloneDefaults(BASE_HERO_DEFAULTS));

export const SAMPLE_TOUR_HERO_DEFAULTS = deepFreeze(createSampleTourHeroDefaults());

export function createSampleTourHeroDefaults(options = {}) {
  const iconBasePath = trimTrailingSlash(options.iconBasePath || '');
  const details = SAMPLE_TOUR_BASE_DETAILS.map((detail) => {
    const { iconFile, ...publicDetail } = detail;
    if (!iconBasePath) return publicDetail;
    return {
      ...publicDetail,
      iconUrl: `${iconBasePath}/${iconFile}.svg`
    };
  });

  return cloneDefaults({
    ...BASE_HERO_DEFAULTS,
    eyebrow: 'Visit the Sample Visitor Center',
    headline: 'Tour the Sample Visitor Center',
    subheadline: 'Go behind the scenes and see how the visitor experience is delivered. Choose a public tour date, review visitor requirements, and begin a reservation flow.',
    trustSignal: 'Advance reservations are required. Closed federal holidays.',
    theme: 'dark',
    size: 'large',
    brandLabel: 'Sample Organization',
    brandMark: 'M',
    visualMode: 'background',
    layoutOpacity: 0.84,
    actions: {
      primary: { label: 'Book a Tour', href: '#booking', shown: true, disabled: false },
      secondary: { label: 'Plan Your Visit', href: '#visit', shown: true, disabled: false },
      third: { label: 'Cancel Reservation', href: '#reservation-help', shown: true, disabled: false },
      fourth: { label: 'Book Group Tour', href: '#reservation-help', shown: true, disabled: false }
    },
    navItems: SAMPLE_TOUR_NAV_ITEMS,
    details
  });
}

export function applyHeroDefaults(heroElement, defaults = HERO_DEFAULTS) {
  if (!heroElement) {
    throw new TypeError('applyHeroDefaults requires an uib-hero element.');
  }

  const config = normalizeHeroDefaults(defaults);
  setTextAttribute(heroElement, 'eyebrow', config.eyebrow);
  setTextAttribute(heroElement, 'headline', config.headline);
  setTextAttribute(heroElement, 'subheadline', config.subheadline);
  setTextAttribute(heroElement, 'trust-signal', config.trustSignal);
  setTextAttribute(heroElement, 'theme', config.theme);
  setTextAttribute(heroElement, 'size', config.size);
  setTextAttribute(heroElement, 'brand-label', config.brandLabel);
  setTextAttribute(heroElement, 'brand-mark', config.brandMark);
  setTextAttribute(heroElement, 'visual-mode', config.visualMode);
  setTextAttribute(heroElement, 'visual-src', config.visualSrc);
  setTextAttribute(heroElement, 'visual-alt', config.visualAlt);

  if (config.layoutOpacity === null || config.layoutOpacity === undefined || config.layoutOpacity === '') {
    heroElement.removeAttribute('layout-opacity');
  } else {
    heroElement.setAttribute('layout-opacity', String(config.layoutOpacity));
  }

  heroElement.setAttribute('action-components', JSON.stringify(actionsToComponents(config.actions)));
  for (const [key, labelAttribute, hrefAttribute, showAttribute, disabledAttribute] of ACTIONS) {
    heroElement.removeAttribute(labelAttribute);
    heroElement.removeAttribute(hrefAttribute);
    heroElement.removeAttribute(showAttribute);
    heroElement.removeAttribute(disabledAttribute);
  }

  heroElement.navItems = Array.isArray(config.navItems) ? cloneDefaults(config.navItems) : [];
  heroElement.details = Array.isArray(config.details) ? cloneDefaults(config.details) : [];
  return heroElement;
}

export function normalizeHeroDefaults(defaults = HERO_DEFAULTS) {
  const mergedActions = {};
  for (const [key] of ACTIONS) {
    mergedActions[key] = {
      ...(BASE_HERO_DEFAULTS.actions[key] || {}),
      ...(defaults.actions?.[key] || {})
    };
  }

  return {
    ...BASE_HERO_DEFAULTS,
    ...defaults,
    actions: mergedActions,
    navItems: Array.isArray(defaults.navItems) ? defaults.navItems : BASE_HERO_DEFAULTS.navItems,
    details: Array.isArray(defaults.details) ? defaults.details : BASE_HERO_DEFAULTS.details
  };
}

function cloneDefaults(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '');
}

function setTextAttribute(element, name, value) {
  const normalized = value === null || value === undefined ? '' : String(value);
  if (!normalized) element.removeAttribute(name);
  else element.setAttribute(name, normalized);
}

function setBooleanAttribute(element, name, value, fallback) {
  const normalized = value === null || value === undefined ? fallback : Boolean(value);
  element.setAttribute(name, normalized ? 'true' : 'false');
}

function actionsToComponents(actions = {}) {
  return ACTIONS.map(([key], index) => {
    const action = actions[key] || {};
    return {
      id: action.id || `${key}HeroAction`,
      name: action.name || `${key}Cta`,
      label: action.label || '',
      type: action.type || action.ctaType || (action.action ? 'action' : 'link'),
      value: action.action || action.actionToken || action.href || '',
      show: action.shown !== false,
      disabled: Boolean(action.disabled),
      variant: action.variant || (index === 0 ? 'primary' : index === 2 ? 'destructive' : 'secondary')
    };
  }).filter((action) => action.show && action.label);
}
