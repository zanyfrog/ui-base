import {
  type HeroActionConfig,
  type HeroActionType,
  heroActionsToJson,
  normalizeHeroAction,
  normalizeHeroActionList,
  parseBoolean,
} from './hero-action-config.js';

export type HeroActionRecord = Record<string, string>;
export const CTA_KEYS = ['primary', 'secondary', 'third', 'fourth'] as const;
export type CtaKey = (typeof CTA_KEYS)[number];

export const CTA_TITLES: Record<CtaKey, string> = {
  primary: 'Primary CTA',
  secondary: 'Secondary CTA',
  third: 'Third CTA',
  fourth: 'Fourth CTA',
};

export const CTA_DEFAULT_ACTION_TOKENS: Record<CtaKey, string> = {
  primary: 'BOOK_TOUR',
  secondary: 'PLAN_VISIT',
  third: 'CANCEL_RESERVATION',
  fourth: 'BOOK_GROUP_TOUR',
};

export const CTA_DEFAULT_VARIANTS: Record<CtaKey, HeroActionConfig['variant']> = {
  primary: 'primary',
  secondary: 'secondary',
  third: 'destructive',
  fourth: 'secondary',
};

export const CTA_EXTRA_FIELDS = ['variant', 'id', 'name', 'help', 'title', 'aria_label', 'target', 'rel'] as const;
export type CtaStoredField = 'label' | 'href' | 'type' | 'action_token' | 'disabled' | (typeof CTA_EXTRA_FIELDS)[number];

export const ACTION_COMPONENT_FIELD_NAMES = ['action-components', 'action_components'] as const;
export const CTA_ACTION_JSON_FIELD_NAMES = new Set<string>([...ACTION_COMPONENT_FIELD_NAMES, 'hero_action_buttons', 'actions', 'primary_action']);

export const CTA_FIELD_NAMES = new Set(
  CTA_KEYS.flatMap((key) => [
    `${key}_cta_label`,
    `${key}_cta_href`,
    `${key}_cta_type`,
    `${key}_cta_action_token`,
    `show_${key}_cta`,
    `${key}_cta_disabled`,
    ...CTA_EXTRA_FIELDS.map((field) => `${key}_cta_${field}`),
  ]),
);

export const CTA_EXTRA_FIELD_NAMES = new Set(
  CTA_KEYS.flatMap((key) => CTA_EXTRA_FIELDS.map((field) => `${key}_cta_${field}`)),
);

export function ctaFieldName(key: CtaKey, field: CtaStoredField): string {
  return field === 'disabled' ? `${key}_cta_disabled` : `${key}_cta_${field}`;
}

export function ctaShowFieldName(key: CtaKey): string {
  return `show_${key}_cta`;
}

export function booleanFieldValue(value: string | undefined, fallback = false): boolean {
  return parseBoolean(value, fallback);
}

function stringValue(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

function recordText(record: HeroActionRecord, key: string): string {
  return stringValue(record[key]).trim();
}

function normalizeCtaType(value: string | undefined): HeroActionType | '' {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'action') return 'action';
  if (normalized === 'link') return 'link';
  return '';
}

function ctaTypeForLegacyRecord(record: HeroActionRecord, key: CtaKey): HeroActionType {
  const explicit = normalizeCtaType(record[ctaFieldName(key, 'type')]);
  if (explicit) return explicit;
  const actionToken = recordText(record, ctaFieldName(key, 'action_token'));
  const href = recordText(record, ctaFieldName(key, 'href'));
  return actionToken && !href ? 'action' : 'link';
}

function legacyHeroActionHasMeaningfulValue(record: HeroActionRecord, key: CtaKey): boolean {
  const coreFields = [
    ctaFieldName(key, 'label'),
    ctaFieldName(key, 'href'),
    ctaFieldName(key, 'action_token'),
    ctaFieldName(key, 'id'),
    ctaFieldName(key, 'name'),
    ctaFieldName(key, 'help'),
    ctaFieldName(key, 'title'),
    ctaFieldName(key, 'aria_label'),
    ctaFieldName(key, 'target'),
    ctaFieldName(key, 'rel'),
  ];
  if (coreFields.some((field) => Boolean(recordText(record, field)))) return true;

  const type = recordText(record, ctaFieldName(key, 'type')).toLowerCase();
  if (type === 'action') return true;

  const variant = recordText(record, ctaFieldName(key, 'variant')).toLowerCase();
  if (variant && variant !== CTA_DEFAULT_VARIANTS[key]) return true;

  return booleanFieldValue(record[ctaShowFieldName(key)], false) || booleanFieldValue(record[ctaFieldName(key, 'disabled')], false);
}

function actionDefaults(index: number): Partial<HeroActionConfig> {
  const key = CTA_KEYS[index];
  return {
    id: key ? `${key}HeroAction` : `heroAction${index + 1}`,
    name: key ? `${key}Cta` : `heroAction${index + 1}`,
    title: key ? CTA_TITLES[key] : `Hero Action ${index + 1}`,
    variant: key ? CTA_DEFAULT_VARIANTS[key] : (index === 0 ? 'primary' : 'secondary'),
  };
}

function normalizeActionWithDefaults(value: object, index: number): HeroActionConfig {
  return normalizeHeroAction({ ...actionDefaults(index), ...(value as Record<string, unknown>) });
}

function parseActionListJsonOrNull(value: string): HeroActionConfig[] | null {
  try {
    return normalizeHeroActionList(JSON.parse(value)).map((action, index) => normalizeActionWithDefaults(action, index));
  } catch {
    return null;
  }
}

function parseActionJsonOrNull(value: string): HeroActionConfig | null {
  try {
    return normalizeActionWithDefaults(JSON.parse(value) as Record<string, unknown>, 0);
  } catch {
    return null;
  }
}

export function legacyHeroActionForRecord(record: HeroActionRecord, key: CtaKey): HeroActionConfig {
  const index = CTA_KEYS.indexOf(key);
  const type = ctaTypeForLegacyRecord(record, key);
  const label = record[ctaFieldName(key, 'label')] || '';
  const value =
    type === 'action'
      ? record[ctaFieldName(key, 'action_token')] || CTA_DEFAULT_ACTION_TOKENS[key]
      : record[ctaFieldName(key, 'href')] || '';

  return normalizeActionWithDefaults({
    id: record[ctaFieldName(key, 'id')] || `${key}HeroAction`,
    name: record[ctaFieldName(key, 'name')] || `${key}Cta`,
    label,
    type,
    value,
    show: booleanFieldValue(record[ctaShowFieldName(key)], true),
    disabled: booleanFieldValue(record[ctaFieldName(key, 'disabled')], false),
    variant: record[ctaFieldName(key, 'variant')] || CTA_DEFAULT_VARIANTS[key],
    help: record[ctaFieldName(key, 'help')] || '',
    title: record[ctaFieldName(key, 'title')] || CTA_TITLES[key],
    ariaLabel: record[ctaFieldName(key, 'aria_label')] || label,
    target: record[ctaFieldName(key, 'target')] || '',
    rel: record[ctaFieldName(key, 'rel')] || '',
  }, index);
}

export function emptyHeroActionForSlot(key: CtaKey): HeroActionConfig {
  const index = CTA_KEYS.indexOf(key);
  return normalizeActionWithDefaults({
    id: '',
    name: '',
    label: '',
    type: 'link',
    value: '',
    show: false,
    disabled: false,
    variant: '',
    help: '',
    title: '',
    ariaLabel: '',
    target: '',
    rel: '',
  }, index);
}

export function heroActionsForRecord(record: HeroActionRecord): HeroActionConfig[] {
  const canonicalJson =
    recordText(record, 'action-components')
    || recordText(record, 'action_components')
    || recordText(record, 'hero_action_buttons')
    || recordText(record, 'actions');
  if (canonicalJson) {
    const canonical = parseActionListJsonOrNull(canonicalJson);
    if (canonical) return canonical;
  }

  const primaryActionJson = recordText(record, 'primary_action');
  if (primaryActionJson) {
    const primaryAction = parseActionJsonOrNull(primaryActionJson);
    if (primaryAction) return [primaryAction];
  }

  return CTA_KEYS
    .filter((key) => legacyHeroActionHasMeaningfulValue(record, key))
    .map((key) => legacyHeroActionForRecord(record, key));
}

export function heroActionForRecord(record: HeroActionRecord, key: CtaKey): HeroActionConfig {
  const index = CTA_KEYS.indexOf(key);
  const canonicalAction = heroActionsForRecord(record)[index];
  return canonicalAction ? normalizeActionWithDefaults(canonicalAction, index) : emptyHeroActionForSlot(key);
}

export function applyHeroActionToLegacyFields(record: HeroActionRecord, key: CtaKey, value: object | undefined): HeroActionRecord {
  const hasAction = value !== undefined;
  const action = hasAction ? normalizeActionWithDefaults(value, CTA_KEYS.indexOf(key)) : emptyHeroActionForSlot(key);
  record[ctaFieldName(key, 'label')] = hasAction ? action.label : '';
  record[ctaFieldName(key, 'type')] = hasAction ? action.type : '';
  record[ctaFieldName(key, 'href')] = hasAction && action.type === 'link' ? action.value : '';
  record[ctaFieldName(key, 'action_token')] = hasAction && action.type === 'action' ? action.value || CTA_DEFAULT_ACTION_TOKENS[key] : '';
  record[ctaShowFieldName(key)] = action.show ? 'true' : 'false';
  record[ctaFieldName(key, 'disabled')] = action.disabled ? 'true' : 'false';
  record[ctaFieldName(key, 'variant')] = hasAction ? action.variant : '';
  record[ctaFieldName(key, 'id')] = hasAction ? action.id : '';
  record[ctaFieldName(key, 'name')] = hasAction ? action.name : '';
  record[ctaFieldName(key, 'help')] = hasAction ? action.help : '';
  record[ctaFieldName(key, 'title')] = hasAction ? action.title : '';
  record[ctaFieldName(key, 'aria_label')] = hasAction ? action.ariaLabel : '';
  record[ctaFieldName(key, 'target')] = hasAction ? action.target : '';
  record[ctaFieldName(key, 'rel')] = hasAction ? action.rel : '';
  return record;
}

export function applyHeroActionsToRecord(record: HeroActionRecord, value: unknown): HeroActionRecord {
  const actions = normalizeHeroActionList(value).map((action, index) => normalizeActionWithDefaults(action, index));
  const actionsJson = heroActionsToJson(actions);
  record['action-components'] = actionsJson;
  record.action_components = actionsJson;
  record.hero_action_buttons = actionsJson;
  record.actions = actionsJson;

  CTA_KEYS.forEach((key, index) => {
    applyHeroActionToLegacyFields(record, key, actions[index]);
  });

  return record;
}

export function applyHeroActionToRecord(record: HeroActionRecord, key: CtaKey, value: object): HeroActionRecord {
  const index = CTA_KEYS.indexOf(key);
  const actions = heroActionsForRecord(record);
  while (actions.length <= index) {
    const missingKey = CTA_KEYS[actions.length] || key;
    actions.push(emptyHeroActionForSlot(missingKey));
  }
  actions[index] = normalizeActionWithDefaults(value, index);
  return applyHeroActionsToRecord(record, actions);
}

export function normalizeCtaFields(record: HeroActionRecord): HeroActionRecord {
  return applyHeroActionsToRecord(record, heroActionsForRecord(record));
}
