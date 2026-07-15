export type FieldKind = 'text' | 'textarea' | 'boolean' | 'number' | 'datetime' | 'json' | 'url' | 'select' | 'html';

export interface FieldDefinition {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  section: string;
  options?: string[];
  help?: string;
}

function label(name: string): string {
  return name.split('_').map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`).join(' ');
}

function field(name: string, section: string, kind: FieldKind = 'text', extra: Partial<FieldDefinition> = {}): FieldDefinition {
  return { name, label: label(name), kind, section, ...extra };
}

export const APPLICATION_INFO_FIELDS: FieldDefinition[] = [
  field('id', 'Identity', 'text', { required: true }),
  field('application_key', 'Identity', 'text', { required: true, help: 'Lowercase letters, numbers, and hyphens.' }),
  field('name', 'Identity', 'text', { required: true }),
  field('description', 'Identity', 'textarea'),
  field('is_active', 'Lifecycle', 'boolean'),
  field('publish_at', 'Lifecycle', 'datetime'),
  field('expire_at', 'Lifecycle', 'datetime'),
  field('application_slug', 'Routing', 'text'),
  field('primary_domain', 'Routing', 'text'),
  field('public_base_url', 'Routing', 'url'),
  field('default_theme', 'Defaults', 'select', { options: ['organization', 'light', 'dark'] }),
  field('default_locale', 'Defaults', 'text'),
  field('default_hero_placement', 'Defaults', 'text'),
  field('allowed_hero_placements', 'Defaults', 'json'),
  field('date_created', 'System', 'datetime'),
  field('date_updated', 'System', 'datetime'),
  field('created_by', 'System', 'text'),
  field('updated_by', 'System', 'text'),
];

export const APPLICATION_HERO_FIELDS: FieldDefinition[] = [
  field('id', 'Identity', 'text', { required: true }),
  field('application_key', 'Identity', 'text', { required: true }),
  field('hero_key', 'Identity', 'text', { required: true, help: 'Lowercase letters, numbers, and hyphens.' }),
  field('page_key', 'Identity', 'text', { required: true }),
  field('route_path', 'Identity', 'text', { required: true }),
  field('placement', 'Identity', 'text', { required: true }),
  field('audience_type', 'Audience', 'select', { options: ['public', 'logged_in', 'role', 'permission_set', 'custom'] }),
  field('audience_key', 'Audience', 'text'),
  field('audience_refs', 'Audience', 'json'),
  field('audience_match', 'Audience', 'select', { options: ['any', 'all'] }),
  field('audience_rules', 'Audience', 'json'),
  field('audience_expression', 'Audience', 'json'),
  field('sort_order', 'Lifecycle', 'number'),
  field('name', 'Content', 'text', { required: true }),
  field('description', 'Content', 'textarea'),
  field('is_active', 'Lifecycle', 'boolean'),
  field('publish_at', 'Lifecycle', 'datetime'),
  field('expire_at', 'Lifecycle', 'datetime'),
  field('eyebrow', 'Content', 'text'),
  field('headline', 'Content', 'textarea', { required: true }),
  field('subheadline', 'Content', 'textarea'),
  field('action-components', 'Calls to Action', 'json', { label: 'Action Components', help: 'Canonical JSON array of Hero Action Component objects.' }),
  field('action_components', 'Calls to Action', 'json', { label: 'Action Components', help: 'Underscore alias for action-components.' }),
  field('hero_action_buttons', 'Calls to Action', 'json', { help: 'Compatibility alias for action-components.' }),
  field('actions', 'Calls to Action', 'json', { help: 'Compatibility alias for action-components. Legacy *_cta fields are derived for older ORM schemas.' }),
  field('primary_cta_label', 'Calls to Action', 'text'),
  field('primary_cta_href', 'Calls to Action', 'url'),
  field('primary_cta_type', 'Calls to Action', 'select', { options: ['link', 'action'], help: 'Choose Link to use href, or Action to emit an action token event.' }),
  field('primary_cta_action_token', 'Calls to Action', 'text', { help: 'Used when Primary CTA Type is action. Example: BOOK_TOUR.' }),
  field('show_primary_cta', 'Calls to Action', 'boolean'),
  field('primary_cta_disabled', 'Calls to Action', 'boolean'),
  field('primary_cta_variant', 'Calls to Action', 'select', { options: ['primary', 'secondary', 'tertiary', 'destructive'] }),
  field('primary_cta_id', 'Calls to Action', 'text'),
  field('primary_cta_name', 'Calls to Action', 'text'),
  field('primary_cta_help', 'Calls to Action', 'text'),
  field('primary_cta_title', 'Calls to Action', 'text'),
  field('primary_cta_aria_label', 'Calls to Action', 'text'),
  field('primary_cta_target', 'Calls to Action', 'text'),
  field('primary_cta_rel', 'Calls to Action', 'text'),
  field('secondary_cta_label', 'Calls to Action', 'text'),
  field('secondary_cta_href', 'Calls to Action', 'url'),
  field('secondary_cta_type', 'Calls to Action', 'select', { options: ['link', 'action'], help: 'Choose Link to use href, or Action to emit an action token event.' }),
  field('secondary_cta_action_token', 'Calls to Action', 'text', { help: 'Used when Secondary CTA Type is action. Example: PLAN_VISIT.' }),
  field('show_secondary_cta', 'Calls to Action', 'boolean'),
  field('secondary_cta_disabled', 'Calls to Action', 'boolean'),
  field('secondary_cta_variant', 'Calls to Action', 'select', { options: ['primary', 'secondary', 'tertiary', 'destructive'] }),
  field('secondary_cta_id', 'Calls to Action', 'text'),
  field('secondary_cta_name', 'Calls to Action', 'text'),
  field('secondary_cta_help', 'Calls to Action', 'text'),
  field('secondary_cta_title', 'Calls to Action', 'text'),
  field('secondary_cta_aria_label', 'Calls to Action', 'text'),
  field('secondary_cta_target', 'Calls to Action', 'text'),
  field('secondary_cta_rel', 'Calls to Action', 'text'),
  field('third_cta_label', 'Calls to Action', 'text'),
  field('third_cta_href', 'Calls to Action', 'url'),
  field('third_cta_type', 'Calls to Action', 'select', { options: ['link', 'action'], help: 'Choose Link to use href, or Action to emit an action token event.' }),
  field('third_cta_action_token', 'Calls to Action', 'text', { help: 'Used when Third CTA Type is action. Example: CANCEL_RESERVATION.' }),
  field('show_third_cta', 'Calls to Action', 'boolean'),
  field('third_cta_disabled', 'Calls to Action', 'boolean'),
  field('third_cta_variant', 'Calls to Action', 'select', { options: ['primary', 'secondary', 'tertiary', 'destructive'] }),
  field('third_cta_id', 'Calls to Action', 'text'),
  field('third_cta_name', 'Calls to Action', 'text'),
  field('third_cta_help', 'Calls to Action', 'text'),
  field('third_cta_title', 'Calls to Action', 'text'),
  field('third_cta_aria_label', 'Calls to Action', 'text'),
  field('third_cta_target', 'Calls to Action', 'text'),
  field('third_cta_rel', 'Calls to Action', 'text'),
  field('fourth_cta_label', 'Calls to Action', 'text'),
  field('fourth_cta_href', 'Calls to Action', 'url'),
  field('fourth_cta_type', 'Calls to Action', 'select', { options: ['link', 'action'], help: 'Choose Link to use href, or Action to emit an action token event.' }),
  field('fourth_cta_action_token', 'Calls to Action', 'text', { help: 'Used when Fourth CTA Type is action. Example: BOOK_GROUP_TOUR.' }),
  field('show_fourth_cta', 'Calls to Action', 'boolean'),
  field('fourth_cta_disabled', 'Calls to Action', 'boolean'),
  field('fourth_cta_variant', 'Calls to Action', 'select', { options: ['primary', 'secondary', 'tertiary', 'destructive'] }),
  field('fourth_cta_id', 'Calls to Action', 'text'),
  field('fourth_cta_name', 'Calls to Action', 'text'),
  field('fourth_cta_help', 'Calls to Action', 'text'),
  field('fourth_cta_title', 'Calls to Action', 'text'),
  field('fourth_cta_aria_label', 'Calls to Action', 'text'),
  field('fourth_cta_target', 'Calls to Action', 'text'),
  field('fourth_cta_rel', 'Calls to Action', 'text'),
  field('visual_source', 'Visual', 'select', { options: ['none', 'url', 'asset'], help: 'Source of the visual. URL wins whenever visual_src has a value.' }),
  field('visual_role', 'Visual', 'select', { options: ['image', 'icon', 'background', 'svg'], help: 'Presentation role. Use background when the Hero image should sit behind the content.' }),
  field('visual_src', 'Visual', 'url'),
  field('visual_asset_id', 'Visual', 'text'),
  field('visual_alt', 'Visual', 'text'),
  field('visual_mode', 'Visual', 'select', { options: ['panel-right', 'panel-left', 'background'], help: 'Derived compatibility placement. visual_role=background forces background mode.' }),
  field('visual_position', 'Visual', 'select', { options: ['right', 'left', 'background'] }),
  field('layout_opacity', 'Visual', 'number'),
  field('trust_signal', 'Content', 'textarea'),
  field('nav_items', 'Navigation and Details', 'json'),
  field('details', 'Navigation and Details', 'json'),
  field('theme', 'Visual', 'select', { options: ['organization', 'light', 'dark'] }),
  field('size', 'Visual', 'select', { options: ['compact', 'default', 'large'] }),
  field('navigation_slot_mode', 'Rich Slots', 'select', { options: ['empty', 'custom', 'generated'] }),
  field('visual_slot_mode', 'Rich Slots', 'select', { options: ['empty', 'custom', 'generated'] }),
  field('trust_slot_mode', 'Rich Slots', 'select', { options: ['empty', 'custom', 'generated'] }),
  field('after_content_slot_mode', 'Rich Slots', 'select', { options: ['empty', 'custom', 'generated'] }),
  field('navigation_slot', 'Rich Slots', 'html'),
  field('visual_slot', 'Rich Slots', 'html'),
  field('trust_slot', 'Rich Slots', 'html'),
  field('after_content_slot', 'Rich Slots', 'html'),
  field('date_created', 'System', 'datetime'),
  field('date_updated', 'System', 'datetime'),
  field('created_by', 'System', 'text'),
  field('updated_by', 'System', 'text'),
];


export const APPLICATION_ASSET_FIELDS: FieldDefinition[] = [
  field('id', 'Identity', 'text', { required: true }),
  field('application_key', 'Identity', 'text', { required: true }),
  field('asset_id', 'Identity', 'text', { required: true, help: 'Stable public asset identifier used by display/download routes.' }),
  field('asset_key', 'Identity', 'text', { required: true, help: 'Lowercase letters, numbers, and hyphens.' }),
  field('asset_type', 'Identity', 'select', { required: true, options: ['image', 'icon', 'document', 'video', 'audio', 'text', 'other'] }),
  field('mime_type', 'File', 'select', { required: true, options: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif', 'application/pdf', 'text/plain', 'text/css', 'application/json'] }),
  field('file_extension', 'File', 'text'),
  field('original_file_name', 'File', 'text'),
  field('stored_file_name', 'File', 'text'),
  field('storage_provider', 'Storage', 'text'),
  field('storage_path', 'Storage', 'text', { help: 'Local development storage path; browsers should use public_url or download_url.' }),
  field('public_url', 'URLs', 'url', { required: true, help: 'Direct display URL for images/assets on web pages.' }),
  field('download_url', 'URLs', 'url'),
  field('file_size_bytes', 'File', 'number', { required: true }),
  field('checksum_sha256', 'File', 'text'),
  field('width', 'Image Metadata', 'number'),
  field('height', 'Image Metadata', 'number'),
  field('alt_text', 'Metadata', 'text'),
  field('caption', 'Metadata', 'textarea'),
  field('description', 'Metadata', 'textarea'),
  field('tags', 'Metadata', 'json', { help: 'JSON array, for example ["hero", "icon"].' }),
  field('usage_context', 'Metadata', 'text', { help: 'Examples: hero_detail_icon, hero_image, logo, document, general.' }),
  field('is_public', 'Lifecycle', 'boolean'),
  field('is_active', 'Lifecycle', 'boolean'),
  field('asset_version', 'Lifecycle', 'number'),
  field('date_created', 'System', 'datetime'),
  field('date_updated', 'System', 'datetime'),
  field('date_deleted', 'System', 'datetime'),
  field('created_by', 'System', 'text'),
  field('updated_by', 'System', 'text'),
  field('deleted_by', 'System', 'text'),
];

export function groupFields(fields: FieldDefinition[]): Map<string, FieldDefinition[]> {
  const groups = new Map<string, FieldDefinition[]>();
  for (const fieldDef of fields) {
    const current = groups.get(fieldDef.section) ?? [];
    current.push(fieldDef);
    groups.set(fieldDef.section, current);
  }
  return groups;
}

export const ALL_RECORD_FIELDS = APPLICATION_INFO_FIELDS.concat(APPLICATION_HERO_FIELDS, APPLICATION_ASSET_FIELDS);
export const JSON_FIELD_NAMES = new Set(ALL_RECORD_FIELDS.filter((fieldDef) => fieldDef.kind === 'json').map((fieldDef) => fieldDef.name));
export const URL_FIELD_NAMES = new Set(ALL_RECORD_FIELDS.filter((fieldDef) => fieldDef.kind === 'url').map((fieldDef) => fieldDef.name));
export const DATE_FIELD_NAMES = new Set(ALL_RECORD_FIELDS.filter((fieldDef) => fieldDef.kind === 'datetime').map((fieldDef) => fieldDef.name));
