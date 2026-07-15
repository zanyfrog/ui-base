export type HeroActionType = 'link' | 'action';
export type HeroActionVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type HeroActionStorageSlot = 'primary' | 'secondary' | 'third' | 'fourth';

export interface HeroActionConfig {
  [key: string]: unknown;
  id: string;
  name: string;
  label: string;
  type: HeroActionType;
  value: string;
  show: boolean;
  disabled: boolean;
  variant: HeroActionVariant;
  help: string;
  title: string;
  ariaLabel: string;
  target: string;
  rel: string;
}

export const HERO_ACTION_TYPES: HeroActionType[] = ['link', 'action'];
export const HERO_ACTION_VARIANTS: HeroActionVariant[] = ['primary', 'secondary', 'tertiary', 'destructive'];
export const HERO_ACTION_STORAGE_SLOTS: HeroActionStorageSlot[] = ['primary', 'secondary', 'third', 'fourth'];
export const HERO_ACTION_COMPONENT_FIELD_NAMES = ['action-components', 'action_components'] as const;
export const HERO_ACTION_EXTRA_FIELDS = ['variant', 'id', 'name', 'help', 'title', 'aria_label', 'target', 'rel'] as const;

export const DEFAULT_HERO_ACTION: HeroActionConfig = Object.freeze({
  id: '',
  name: '',
  label: '',
  type: 'link',
  value: '',
  show: true,
  disabled: false,
  variant: 'primary',
  help: '',
  title: '',
  ariaLabel: '',
  target: '',
  rel: '',
});

export const HERO_ACTION_SLOT_TITLES: Record<HeroActionStorageSlot, string> = Object.freeze({
  primary: 'Primary CTA',
  secondary: 'Secondary CTA',
  third: 'Third CTA',
  fourth: 'Fourth CTA',
});

export const HERO_ACTION_DEFAULT_TOKENS: Record<HeroActionStorageSlot, string> = Object.freeze({
  primary: 'BOOK_TOUR',
  secondary: 'PLAN_VISIT',
  third: 'CANCEL_RESERVATION',
  fourth: 'BOOK_GROUP_TOUR',
});

export const HERO_ACTION_DEFAULT_VARIANTS: Record<HeroActionStorageSlot, HeroActionVariant> = Object.freeze({
  primary: 'primary',
  secondary: 'secondary',
  third: 'destructive',
  fourth: 'secondary',
});

export type HeroActionRecord = Record<string, string | undefined>;

export function parseBoolean(value: unknown, fallback = false): boolean {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
  return fallback;
}

export function normalizeHeroActionType(value: unknown): HeroActionType {
  const normalized = String(value ?? '').trim().toLowerCase();
  return HERO_ACTION_TYPES.includes(normalized as HeroActionType) ? normalized as HeroActionType : DEFAULT_HERO_ACTION.type;
}

export function normalizeHeroActionVariant(value: unknown): HeroActionVariant {
  const normalized = String(value ?? '').trim().toLowerCase();
  return HERO_ACTION_VARIANTS.includes(normalized as HeroActionVariant) ? normalized as HeroActionVariant : DEFAULT_HERO_ACTION.variant;
}

export function normalizeHeroAction(value: Record<string, unknown> = {}): HeroActionConfig {
  const source = value && typeof value === 'object' ? value : {};
  const explicitValue = source.value ?? source.href ?? source.url ?? source.actionToken ?? source.token ?? source.action;

  return {
    ...DEFAULT_HERO_ACTION,
    id: stringValue(source.id ?? source.actionId ?? source.buttonId),
    name: stringValue(source.name ?? source.key),
    label: stringValue(source.label ?? source.text ?? source.buttonLabel),
    type: normalizeHeroActionType(source.type ?? source.kind ?? source.actionType),
    value: stringValue(explicitValue),
    show: parseBoolean(source.show ?? source.shown ?? source.visible ?? source.isVisible, DEFAULT_HERO_ACTION.show),
    disabled: parseBoolean(source.disabled ?? source.buttonDisabled ?? source.actionDisabled, DEFAULT_HERO_ACTION.disabled),
    variant: normalizeHeroActionVariant(source.variant ?? source.style ?? source.tone),
    help: stringValue(source.help ?? source.helpText),
    title: stringValue(source.title),
    ariaLabel: stringValue(source.ariaLabel ?? source['aria-label'] ?? source.accessibleText),
    target: stringValue(source.target),
    rel: stringValue(source.rel),
  };
}

export function normalizeHeroActionList(value: unknown): HeroActionConfig[] {
  if (Array.isArray(value)) return value.map((item) => normalizeHeroAction(item as Record<string, unknown>));
  if (value && typeof value === 'object') return [normalizeHeroAction(value as Record<string, unknown>)];
  return [];
}

export function parseHeroActionJson(value: string | null | undefined): HeroActionConfig {
  if (!value) return normalizeHeroAction();
  try {
    return normalizeHeroAction(JSON.parse(value) as Record<string, unknown>);
  } catch {
    return normalizeHeroAction();
  }
}

export function parseHeroActionListJson(value: string | null | undefined): HeroActionConfig[] {
  if (!value) return [];
  try {
    return normalizeHeroActionList(JSON.parse(value));
  } catch {
    return [];
  }
}

export function heroActionToJson(value: Record<string, unknown>): string {
  return JSON.stringify(normalizeHeroAction(value));
}

export function heroActionsToJson(value: unknown): string {
  return JSON.stringify(normalizeHeroActionList(value));
}

export function cloneHeroAction(value: HeroActionConfig): HeroActionConfig {
  return normalizeHeroAction(JSON.parse(JSON.stringify(value)) as Record<string, unknown>);
}

export function heroActionFieldName(slot: HeroActionStorageSlot, field: 'label' | 'href' | 'type' | 'action_token' | 'disabled' | (typeof HERO_ACTION_EXTRA_FIELDS)[number]): string {
  return field === 'disabled' ? `${slot}_cta_disabled` : `${slot}_cta_${field}`;
}

export function heroActionShowFieldName(slot: HeroActionStorageSlot): string {
  return `show_${slot}_cta`;
}

export function legacyHeroActionFieldNames(): string[] {
  return HERO_ACTION_STORAGE_SLOTS.flatMap((slot) => [
    heroActionFieldName(slot, 'label'),
    heroActionFieldName(slot, 'href'),
    heroActionFieldName(slot, 'type'),
    heroActionFieldName(slot, 'action_token'),
    heroActionShowFieldName(slot),
    heroActionFieldName(slot, 'disabled'),
    ...HERO_ACTION_EXTRA_FIELDS.map((field) => heroActionFieldName(slot, field)),
  ]);
}

function recordText(record: HeroActionRecord, key: string): string {
  return stringValue(record[key]).trim();
}

function legacyHeroActionHasMeaningfulValue(record: HeroActionRecord, slot: HeroActionStorageSlot): boolean {
  const coreFields = [
    heroActionFieldName(slot, 'label'),
    heroActionFieldName(slot, 'href'),
    heroActionFieldName(slot, 'action_token'),
    heroActionFieldName(slot, 'id'),
    heroActionFieldName(slot, 'name'),
    heroActionFieldName(slot, 'help'),
    heroActionFieldName(slot, 'title'),
    heroActionFieldName(slot, 'aria_label'),
    heroActionFieldName(slot, 'target'),
    heroActionFieldName(slot, 'rel'),
  ];
  if (coreFields.some((field) => Boolean(recordText(record, field)))) return true;

  const type = recordText(record, heroActionFieldName(slot, 'type')).toLowerCase();
  if (type === 'action') return true;

  const variant = recordText(record, heroActionFieldName(slot, 'variant')).toLowerCase();
  if (variant && variant !== HERO_ACTION_DEFAULT_VARIANTS[slot]) return true;

  return parseBoolean(record[heroActionShowFieldName(slot)], false) || parseBoolean(record[heroActionFieldName(slot, 'disabled')], false);
}

function legacyHeroActionType(record: HeroActionRecord, slot: HeroActionStorageSlot): HeroActionType {
  const explicit = String(record[heroActionFieldName(slot, 'type')] || '').trim().toLowerCase();
  if (explicit === 'action') return 'action';
  if (explicit === 'link') return 'link';
  const actionToken = recordText(record, heroActionFieldName(slot, 'action_token'));
  const href = recordText(record, heroActionFieldName(slot, 'href'));
  return actionToken && !href ? 'action' : 'link';
}

export function heroActionFromLegacyRecord(record: HeroActionRecord, slot: HeroActionStorageSlot): HeroActionConfig {
  const type = legacyHeroActionType(record, slot);
  const label = stringValue(record[heroActionFieldName(slot, 'label')]);
  const value = type === 'action'
    ? stringValue(record[heroActionFieldName(slot, 'action_token')] || HERO_ACTION_DEFAULT_TOKENS[slot])
    : stringValue(record[heroActionFieldName(slot, 'href')]);

  return normalizeHeroAction({
    id: record[heroActionFieldName(slot, 'id')] || `${slot}HeroAction`,
    name: record[heroActionFieldName(slot, 'name')] || `${slot}Cta`,
    label,
    type,
    value,
    show: parseBoolean(record[heroActionShowFieldName(slot)], true),
    disabled: parseBoolean(record[heroActionFieldName(slot, 'disabled')], false),
    variant: record[heroActionFieldName(slot, 'variant')] || HERO_ACTION_DEFAULT_VARIANTS[slot],
    help: record[heroActionFieldName(slot, 'help')] || '',
    title: record[heroActionFieldName(slot, 'title')] || HERO_ACTION_SLOT_TITLES[slot],
    ariaLabel: record[heroActionFieldName(slot, 'aria_label')] || label,
    target: record[heroActionFieldName(slot, 'target')] || '',
    rel: record[heroActionFieldName(slot, 'rel')] || '',
  });
}

export function heroActionsFromRecord(record: HeroActionRecord): HeroActionConfig[] {
  const actionsJson =
    stringValue(record['action-components']).trim()
    || stringValue(record.action_components).trim()
    || stringValue(record.actions).trim();
  if (actionsJson) return parseHeroActionListJson(actionsJson);

  const primaryActionJson = stringValue(record.primary_action).trim();
  if (primaryActionJson) return [parseHeroActionJson(primaryActionJson)];

  return HERO_ACTION_STORAGE_SLOTS
    .filter((slot) => legacyHeroActionHasMeaningfulValue(record, slot))
    .map((slot) => heroActionFromLegacyRecord(record, slot));
}

export function emptyHeroActionForLegacySlot(slot: HeroActionStorageSlot): HeroActionConfig {
  return normalizeHeroAction({
    id: '',
    name: '',
    label: '',
    type: 'link',
    value: '',
    show: false,
    disabled: false,
    variant: HERO_ACTION_DEFAULT_VARIANTS[slot],
    help: '',
    title: '',
    ariaLabel: '',
    target: '',
    rel: '',
  });
}

export function applyHeroActionToLegacyRecord(record: HeroActionRecord, slot: HeroActionStorageSlot, action: HeroActionConfig | undefined): HeroActionRecord {
  const normalized = action ? normalizeHeroAction(action) : emptyHeroActionForLegacySlot(slot);
  record[heroActionFieldName(slot, 'label')] = normalized.label;
  record[heroActionFieldName(slot, 'type')] = action ? normalized.type : '';
  record[heroActionFieldName(slot, 'href')] = action && normalized.type === 'link' ? normalized.value : '';
  record[heroActionFieldName(slot, 'action_token')] = action && normalized.type === 'action' ? normalized.value || HERO_ACTION_DEFAULT_TOKENS[slot] : '';
  record[heroActionShowFieldName(slot)] = normalized.show ? 'true' : 'false';
  record[heroActionFieldName(slot, 'disabled')] = normalized.disabled ? 'true' : 'false';
  record[heroActionFieldName(slot, 'variant')] = action ? normalized.variant : '';
  record[heroActionFieldName(slot, 'id')] = normalized.id;
  record[heroActionFieldName(slot, 'name')] = normalized.name;
  record[heroActionFieldName(slot, 'help')] = normalized.help;
  record[heroActionFieldName(slot, 'title')] = normalized.title;
  record[heroActionFieldName(slot, 'aria_label')] = normalized.ariaLabel;
  record[heroActionFieldName(slot, 'target')] = normalized.target;
  record[heroActionFieldName(slot, 'rel')] = normalized.rel;
  return record;
}

export function syncHeroActionsToRecord(record: HeroActionRecord, value?: unknown): HeroActionRecord {
  const actions = value === undefined ? heroActionsFromRecord(record) : normalizeHeroActionList(value);
  record['action-components'] = heroActionsToJson(actions);
  record.action_components = heroActionsToJson(actions);
  record.actions = heroActionsToJson(actions);
  HERO_ACTION_STORAGE_SLOTS.forEach((slot, index) => applyHeroActionToLegacyRecord(record, slot, actions[index]));
  return record;
}

function stringValue(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}
