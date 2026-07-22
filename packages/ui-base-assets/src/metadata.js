import { createComponentMetadata, MATURITY_LEVELS } from '@ui-base/core';

const descriptions = {
  'accepted-file-types': 'Comma-separated accept list used by upload controls.',
  'allow-upload': 'Allows users to upload new assets from the picker or browser.',
  alt: 'Accessible alternative text.',
  asset: 'Asset object or JSON asset payload.',
  'asset-id': 'Asset ID used to resolve an image from asset data or an asset map.',
  'asset-map': 'JSON map of asset IDs to URL and metadata objects.',
  assets: 'Array of normalized asset records.',
  'api-base-url': 'Base URL for an ORM-backed asset provider.',
  'application-key': 'Application key used for scoping provider requests.',
  category: 'Category filter or default category.',
  'copy-on-select': 'Copies a shared/global asset into the active application when selected.',
  'data-picker-mode': 'Dialog picker mode alias.',
  'default-application-key': 'Fallback application key used for provider requests.',
  'default-asset-type': 'Default asset type for upload or filter state.',
  'default-category': 'Default category for upload or filter state.',
  'default-file-type': 'Default file type filter.',
  'default-layout': 'Initial list/grid layout.',
  'default-reuse-scope': 'Default reuse scope for uploads.',
  'default-scope': 'Default scope filter alias.',
  'default-search': 'Initial search query.',
  'default-status': 'Initial active/archive status filter.',
  'default-visibility': 'Default visibility for uploads.',
  disabled: 'Disables user interaction.',
  fit: 'Object-fit mode for image rendering.',
  'file-name': 'File name shown by thumbnail components.',
  'file-type': 'Asset file type.',
  label: 'Visible label text.',
  layout: 'Browser layout mode.',
  'max-selection': 'Maximum number of assets that can be selected.',
  mode: 'Browser or dialog mode.',
  name: 'Form field name.',
  open: 'Dialog open state.',
  picker: 'Picker mode.',
  'picker-mode': 'Picker dialog mode.',
  placeholder: 'Placeholder text.',
  ratio: 'Aspect ratio for image rendering.',
  role: 'ARIA or visual role.',
  'reuse-scope': 'Reuse scope filter.',
  'asset-visibility': 'Visibility filter alias.',
  'selection-behavior': 'Behavior after selecting an asset.',
  'selection-mode': 'Single or multiple selection mode.',
  'selected-asset-id': 'Asset ID currently marked selected.',
  'show-upload': 'Shows upload UI in browser mode.',
  src: 'Direct image or asset URL.',
  tab: 'Active details tab.',
  'thumbnail-url': 'Thumbnail image URL.',
  url: 'Direct asset URL.',
  value: 'Current field value.',
  'view': 'List or grid view.',
  'visual-role': 'Visual source role.',
  'visual-source': 'Visual source mode.',
  'insertable-file-types': 'Comma-separated file types allowed for insertion.',
  'insertable-only': 'Limits results to insertable file types.',
  'include-shared': 'Includes shared/global reusable assets.',
  'fallback-label': 'Label shown when image resolution fails.',
  'mime-type': 'Asset MIME type.'
};

const propertyDescriptions = {
  asset: 'Gets or sets one asset record.',
  assetMap: 'Gets or sets the asset ID lookup map.',
  assetResolver: 'Async resolver callback used by asset image.',
  assets: 'Gets or sets an array of assets.',
  categories: 'Gets or sets available asset categories.',
  getAuthHeaders: 'Callback returning request headers for provider calls.',
  headers: 'Request headers used by ORM-backed provider calls.',
  permissionSets: 'Gets or sets available permission sets.',
  provider: 'Gets or sets the asset provider instance.',
  usage: 'Gets or sets usage records.',
  value: 'Gets or sets the current value.',
  versions: 'Gets or sets version records.'
};

const eventDescriptions = {
  'asset-cleared': 'Fires when picker selection is cleared.',
  'asset-selected': 'Fires when a single asset is selected.',
  'assets-selected': 'Fires when multiple assets are selected.',
  'asset-selection-change': 'Fires when multi-selection state changes.',
  'asset-upload-invalid': 'Fires when upload input fails validation.',
  'asset-upload-request': 'Fires before upload handling.',
  'asset-uploaded': 'Fires after upload creates an asset.',
  change: 'Native-style change event.',
  'uib-asset-archive-request': 'Requests asset archive.',
  'uib-asset-clear': 'Component-specific clear event.',
  'uib-asset-copy-to-app-request': 'Requests copying a reusable asset into the active application.',
  'uib-asset-created': 'Fires when an asset is created.',
  'uib-asset-filter-change': 'Fires when filter state changes.',
  'uib-asset-image-resolution-error': 'Fires when async image resolution fails.',
  'uib-asset-open': 'Fires when an asset is opened for details.',
  'uib-asset-permission-change-request': 'Requests permission set changes.',
  'uib-asset-picker-select': 'Fires when the dialog confirms a selection.',
  'uib-asset-restore-request': 'Requests asset restore.',
  'uib-asset-search': 'Fires when search query changes.',
  'uib-asset-select': 'Fires when one asset is selected.',
  'uib-assets-select': 'Fires when multiple assets are selected.',
  'uib-asset-update-request': 'Requests asset metadata updates.',
  'uib-asset-upload-error': 'Fires when upload fails.',
  'uib-asset-upload-invalid': 'Fires when upload validation fails.',
  'uib-asset-upload-request': 'Requests upload handling.',
  'uib-asset-uploaded': 'Fires after picker upload succeeds.',
  'uib-visual-source-change': 'Fires when visual source settings change.'
};

const partDescriptions = {
  browser: 'Browser shell.',
  details: 'Details panel.',
  dialog: 'Dialog shell.',
  field: 'Form field wrapper.',
  grid: 'Grid wrapper.',
  image: 'Image element.',
  list: 'List wrapper.',
  panel: 'Panel wrapper.',
  picker: 'Picker wrapper.',
  preview: 'Preview wrapper.',
  search: 'Search wrapper.',
  thumbnail: 'Thumbnail wrapper',
  uploader: 'Uploader wrapper.'
};

const cssVariableDescriptions = {
  '--uib-assets-accent': 'Accent color.',
  '--uib-assets-border': 'Default border color.',
  '--uib-assets-border-strong': 'Strong border color.',
  '--uib-assets-danger': 'Danger color.',
  '--uib-assets-muted': 'Muted text color.',
  '--uib-assets-primary': 'Primary color.',
  '--uib-assets-primary-contrast': 'Text color on primary backgrounds.',
  '--uib-assets-radius': 'Default asset component radius.',
  '--uib-assets-radius-sm': 'Small asset component radius.',
  '--uib-assets-shadow': 'Default asset component shadow.',
  '--uib-assets-success': 'Success color.',
  '--uib-assets-surface': 'Default surface color.',
  '--uib-assets-surface-soft': 'Soft surface color.',
  '--uib-assets-text': 'Primary text color.',
  '--uib-assets-warning': 'Warning color.'
};

function item(name, source, type = '') {
  return { name, type, description: source[name] || `${name} API surface.` };
}

function items(names = [], source = {}, type = '') {
  return names.map((name) => item(name, source, type));
}

function api({
  tagName,
  purpose,
  attributes = [],
  properties = [],
  events = [],
  slots = [],
  cssParts = [],
  cssVariables = [
    '--uib-assets-text',
    '--uib-assets-muted',
    '--uib-assets-surface',
    '--uib-assets-surface-soft',
    '--uib-assets-border',
    '--uib-assets-primary',
    '--uib-assets-radius'
  ],
  examples = []
}) {
  return {
    tagName,
    package: '@ui-base/assets',
    maturity: MATURITY_LEVELS.PREVIEW,
    purpose,
    attributes: items(attributes, descriptions),
    properties: items(properties, propertyDescriptions),
    events: items(events, eventDescriptions),
    slots: items(slots, {}),
    cssParts: items(cssParts, partDescriptions),
    cssVariables: items(cssVariables, cssVariableDescriptions),
    examples
  };
}

const pickerAttributes = [
  'name', 'value', 'label', 'placeholder', 'disabled', 'selection-mode', 'application-key',
  'default-application-key', 'api-base-url', 'view', 'default-layout', 'allow-upload',
  'insertable-only', 'insertable-file-types', 'accepted-file-types', 'max-selection',
  'default-asset-type', 'default-file-type', 'default-category', 'default-reuse-scope',
  'default-scope', 'default-visibility', 'default-status', 'default-search', 'reuse-scope',
  'asset-visibility', 'category', 'copy-on-select', 'selection-behavior', 'include-shared'
];

export const ASSET_COMPONENT_API = {
  'uib-asset-browser': api({
    tagName: 'uib-asset-browser',
    purpose: 'Search, browse, pick, upload, and manage assets from a provider.',
    attributes: ['mode', 'variant', ...pickerAttributes, 'layout', 'show-upload'],
    properties: ['provider', 'assets', 'categories', 'permissionSets', 'headers', 'getAuthHeaders'],
    events: ['uib-asset-open', 'uib-asset-select', 'uib-assets-select', 'asset-selected', 'assets-selected', 'asset-selection-change', 'uib-asset-upload-request', 'uib-asset-created', 'uib-asset-update-request', 'uib-asset-archive-request', 'uib-asset-restore-request', 'uib-asset-copy-to-app-request', 'uib-asset-permission-change-request'],
    cssParts: ['browser'],
    examples: ['<uib-asset-browser mode="browse" selection-mode="single" view="grid" application-key="demo-app"></uib-asset-browser>']
  }),
  'uib-asset-picker': api({
    tagName: 'uib-asset-picker',
    purpose: 'Form-associated asset picker for selecting one or more reusable assets.',
    attributes: pickerAttributes,
    properties: ['provider', 'assets', 'categories', 'permissionSets', 'headers', 'getAuthHeaders', 'value'],
    events: ['asset-selected', 'assets-selected', 'asset-selection-change', 'asset-cleared', 'uib-asset-select', 'uib-assets-select', 'uib-asset-upload-request', 'uib-asset-uploaded', 'uib-asset-created'],
    cssParts: ['picker', 'field'],
    examples: ['<uib-asset-picker name="heroAsset" label="Hero asset" application-key="demo-app" selection-mode="single" allow-upload></uib-asset-picker>']
  }),
  'uib-asset-picker-dialog': api({
    tagName: 'uib-asset-picker-dialog',
    purpose: 'Dialog picker surface used by picker and browser workflows.',
    attributes: ['open', 'application-key', 'selection-mode', 'mode', 'picker-mode', 'data-picker-mode', 'view', 'layout', 'default-layout', 'allow-upload', 'show-upload', 'insertable-only', 'insertable-file-types', 'accepted-file-types', 'max-selection', 'default-category', 'default-asset-type', 'default-file-type', 'default-reuse-scope', 'default-scope', 'default-visibility', 'default-status', 'default-search', 'reuse-scope', 'asset-visibility', 'category', 'include-shared', 'copy-on-select', 'selection-behavior'],
    properties: ['provider', 'assets'],
    events: ['uib-asset-picker-select', 'uib-asset-select', 'uib-assets-select'],
    cssParts: ['dialog'],
    examples: ['<uib-asset-picker-dialog open application-key="demo-app" selection-mode="single"></uib-asset-picker-dialog>']
  }),
  'uib-asset-image': api({
    tagName: 'uib-asset-image',
    purpose: 'Resolves and renders direct, asset object, asset map, or async asset image sources.',
    attributes: ['src', 'asset-id', 'asset', 'asset-map', 'alt', 'fit', 'role', 'visual-role', 'ratio', 'fallback-label'],
    properties: ['asset', 'assetMap', 'assetResolver'],
    events: ['uib-asset-image-resolution-error'],
    cssParts: ['image'],
    examples: ['<uib-asset-image src="/apps/demo/assets/icons/tour-size.svg" alt="Tour size" role="icon" fit="contain" ratio="1/1"></uib-asset-image>']
  }),
  'uib-visual-source-control': api({
    tagName: 'uib-visual-source-control',
    purpose: 'Authoring control for choosing visual source, role, URL, asset ID, and alt text.',
    attributes: ['visual-source', 'visual-role', 'src', 'asset-id', 'alt', 'label', 'application-key', 'api-base-url', 'use-asset-picker'],
    properties: ['value'],
    events: ['change', 'uib-visual-source-change'],
    cssParts: ['field'],
    examples: ['<uib-visual-source-control label="Hero visual source"></uib-visual-source-control>']
  }),
  'uib-asset-list': api({
    tagName: 'uib-asset-list',
    purpose: 'List view of assets with open/select interactions.',
    attributes: ['selected-asset-id', 'selection-mode'],
    properties: ['assets'],
    events: ['uib-asset-open', 'uib-asset-select'],
    cssParts: ['list'],
    examples: ['<uib-asset-list selection-mode="single"></uib-asset-list>']
  }),
  'uib-asset-grid': api({
    tagName: 'uib-asset-grid',
    purpose: 'Grid view of assets with open/select interactions.',
    attributes: ['selected-asset-id', 'selection-mode'],
    properties: ['assets'],
    events: ['uib-asset-open', 'uib-asset-select'],
    cssParts: ['grid'],
    examples: ['<uib-asset-grid selection-mode="single"></uib-asset-grid>']
  }),
  'uib-asset-preview': api({
    tagName: 'uib-asset-preview',
    purpose: 'Preview panel for a selected asset.',
    properties: ['asset'],
    cssParts: ['preview'],
    examples: ['<uib-asset-preview></uib-asset-preview>']
  }),
  'uib-asset-details': api({
    tagName: 'uib-asset-details',
    purpose: 'Detailed asset metadata, preview, usage, versions, permissions, and actions.',
    attributes: ['tab'],
    properties: ['asset', 'versions', 'usage', 'permissionSets'],
    events: ['uib-asset-select', 'uib-asset-copy-to-app-request', 'uib-asset-archive-request', 'uib-asset-restore-request', 'uib-asset-permission-change-request'],
    cssParts: ['details'],
    examples: ['<uib-asset-details tab="summary"></uib-asset-details>']
  }),
  'uib-asset-filter-bar': api({
    tagName: 'uib-asset-filter-bar',
    purpose: 'Filter controls for asset type, scope, visibility, category, and status.',
    properties: ['categories'],
    events: ['uib-asset-filter-change'],
    cssParts: ['field'],
    examples: ['<uib-asset-filter-bar></uib-asset-filter-bar>']
  }),
  'uib-asset-search': api({
    tagName: 'uib-asset-search',
    purpose: 'Search input that emits asset search query changes.',
    attributes: ['value', 'placeholder'],
    events: ['uib-asset-search'],
    cssParts: ['search'],
    examples: ['<uib-asset-search placeholder="Search assets"></uib-asset-search>']
  }),
  'uib-asset-thumbnail': api({
    tagName: 'uib-asset-thumbnail',
    purpose: 'Small thumbnail/fallback renderer for asset cards and rows.',
    attributes: ['label', 'file-type', 'thumbnail-url', 'url', 'mime-type', 'file-name'],
    properties: ['asset'],
    cssParts: ['thumbnail'],
    examples: ['<uib-asset-thumbnail label="Tour size" file-type="svg" url="/apps/demo/assets/icons/tour-size.svg"></uib-asset-thumbnail>']
  }),
  'uib-asset-uploader': api({
    tagName: 'uib-asset-uploader',
    purpose: 'Upload form that emits validated asset upload requests.',
    properties: ['uploadPolicy'],
    events: ['uib-asset-upload-invalid', 'uib-asset-upload-request'],
    cssParts: ['uploader'],
    examples: ['<uib-asset-uploader></uib-asset-uploader>']
  }),
  'uib-asset-metadata-editor': api({
    tagName: 'uib-asset-metadata-editor',
    purpose: 'Metadata editor for scope, visibility, category, alt text, and description.',
    properties: ['asset'],
    events: ['uib-asset-update-request'],
    cssParts: ['field'],
    examples: ['<uib-asset-metadata-editor></uib-asset-metadata-editor>']
  }),
  'uib-asset-version-history': api({
    tagName: 'uib-asset-version-history',
    purpose: 'Version list for an asset.',
    properties: ['asset', 'versions'],
    cssParts: ['list'],
    examples: ['<uib-asset-version-history></uib-asset-version-history>']
  }),
  'uib-asset-usage': api({
    tagName: 'uib-asset-usage',
    purpose: 'Where-used records for an asset.',
    properties: ['usage'],
    cssParts: ['list'],
    examples: ['<uib-asset-usage></uib-asset-usage>']
  }),
  'uib-asset-permission-panel': api({
    tagName: 'uib-asset-permission-panel',
    purpose: 'Permission summary and permission set controls for an asset.',
    properties: ['asset', 'permissionSets'],
    events: ['uib-asset-permission-change-request'],
    cssParts: ['panel'],
    examples: ['<uib-asset-permission-panel></uib-asset-permission-panel>']
  }),
  'uib-asset-permission-set-picker': api({
    tagName: 'uib-asset-permission-set-picker',
    purpose: 'Permission set selector.',
    attributes: ['value', 'disabled'],
    properties: ['permissionSets'],
    events: ['uib-asset-permission-change-request'],
    cssParts: ['field'],
    examples: ['<uib-asset-permission-set-picker value="application-asset-manager"></uib-asset-permission-set-picker>']
  })
};

export const UI_BASE_ASSET_COMPONENTS = Object.values(ASSET_COMPONENT_API).map((componentApi) => createComponentMetadata({
  ...componentApi,
  attributes: componentApi.attributes.map((entry) => entry.name),
  properties: componentApi.properties.map((entry) => entry.name),
  events: componentApi.events.map((entry) => entry.name),
  slots: componentApi.slots.map((entry) => entry.name),
  cssParts: componentApi.cssParts.map((entry) => entry.name),
  cssVariables: componentApi.cssVariables.map((entry) => entry.name)
}));
