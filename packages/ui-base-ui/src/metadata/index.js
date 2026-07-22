import { createComponentMetadata, MATURITY_LEVELS } from '@ui-base/core';

const uiAttributeDescriptions = {
  action: 'Action identifier included in emitted action events.',
  actions: 'JSON array or property value used to render child actions.',
  'action-token': 'Stable action token included in emitted action events.',
  active: 'Marks the current navigation item.',
  align: 'Cross-axis or content alignment.',
  alt: 'Accessible alternative text for media.',
  'api-base-url': 'Base URL used by asset-picker integrations.',
  'application-key': 'Application key passed to asset-picker integrations.',
  'aria-describedby': 'ID reference for additional accessible description.',
  'aria-label': 'Accessible label override.',
  'asset-id': 'Asset identifier used to resolve an icon or image from an asset map.',
  'asset-map': 'JSON object mapping asset IDs to URL and alt metadata.',
  body: 'Body copy rendered in the content block.',
  breakpoint: 'Responsive breakpoint, in pixels, where menu collapse behavior activates.',
  checked: 'Boolean checked state.',
  class: 'Optional host CSS class.',
  'close-label': 'Accessible label for the close menu button.',
  'collapse-label': 'Accessible label for the collapsed menu button.',
  columns: 'Fixed number of grid columns.',
  detail: 'JSON detail item object.',
  details: 'JSON array of detail item objects.',
  direction: 'Flex direction used by stack layout.',
  disabled: 'Disables user interaction.',
  error: 'Validation or error message.',
  eyebrow: 'Small overline text rendered before the heading.',
  fit: 'Media object-fit mode.',
  for: 'ID of the control labelled by this label.',
  gap: 'CSS gap value between children.',
  heading: 'Heading text for layout surfaces, dialogs, accordions, or tabs.',
  headline: 'Primary heading text.',
  help: 'Help text rendered inline or in a tooltip.',
  'help-mode': 'Help display mode.',
  href: 'Link URL.',
  icon: 'Icon text, symbol, or fallback marker.',
  'icon-alt': 'Accessible label for an icon URL or asset.',
  'icon-url': 'Direct icon image URL.',
  index: 'Item index included in detail editor events.',
  invalid: 'Forces invalid visual styling.',
  justify: 'Main-axis alignment.',
  kind: 'Semantic action kind included in emitted action events.',
  label: 'Visible label text.',
  labels: 'Comma-separated labels for toggle choices.',
  level: 'Heading level.',
  min: 'Minimum grid item size.',
  mode: 'Display mode.',
  name: 'Control or event payload name.',
  open: 'Open state for menus, dialogs, help, and disclosures.',
  position: 'Media object-position or splitter column template.',
  ratio: 'Aspect ratio for media.',
  readonly: 'Prevents user edits while preserving visible state.',
  rel: 'Anchor rel attribute.',
  required: 'Marks a control or label as required.',
  role: 'ARIA role or media presentation role.',
  size: 'Heading size variant.',
  src: 'Media source URL.',
  stacked: 'Stacks action buttons vertically.',
  target: 'Anchor target attribute.',
  text: 'Rendered text content.',
  title: 'Tooltip/title text.',
  value: 'Current control value.',
  variant: 'Visual style variant.',
  wrap: 'Allows row children to wrap.'
};

const uiPropertyDescriptions = {
  actions: 'Gets or sets the rendered action array.',
  assetMap: 'Gets or sets the asset ID lookup map.',
  checked: 'Gets or sets boolean checked state.',
  detail: 'Gets or sets the detail item object.',
  details: 'Gets or sets the detail item array.',
  disabled: 'Gets or sets the disabled state.',
  getAuthHeaders: 'Optional callback used by asset-picker integrations.',
  headers: 'Optional request headers used by asset-picker integrations.',
  open: 'Gets or sets open state.',
  value: 'Gets or sets the current value.'
};

const uiEventDescriptions = {
  change: 'Native-style change event that bubbles from interactive controls.',
  'uib-accordion-toggle': 'Fires when the accordion disclosure state changes.',
  'uib-action': 'Generic action event fired by action buttons and groups.',
  'uib-action-button-click': 'Cancelable action-button click event with action metadata.',
  'uib-checkbox-change': 'Component-specific checkbox change event.',
  'uib-detail-add': 'Fires when a detail row is added.',
  'uib-detail-asset-change': 'Fires when a detail icon asset changes.',
  'uib-detail-item-edit-change': 'Fires when one editable detail row changes.',
  'uib-detail-list-editor-change': 'Fires when the editable detail list changes.',
  'uib-detail-remove': 'Fires when a detail row is removed.',
  'uib-detail-update': 'Fires when a detail row is updated.',
  'uib-dialog-close': 'Fires when a dialog closes.',
  'uib-menu-select': 'Fires when a menu item selection bubbles to the menu.',
  'uib-menuitem-select': 'Fires when a menu item is selected.',
  'uib-toggle-change': 'Component-specific toggle change event.'
};

const uiSlotDescriptions = {
  body: 'Custom body content.',
  default: 'Primary child content.',
  end: 'End pane content.',
  eyebrow: 'Custom eyebrow content.',
  footer: 'Footer content.',
  header: 'Header content.',
  headline: 'Custom headline content.',
  label: 'Custom label content.',
  start: 'Start pane content.',
  subheadline: 'Custom subheadline content.',
  summary: 'Custom accordion summary content.'
};

const uiPartDescriptions = {
  backdrop: 'Dialog backdrop.',
  base: 'Outer component container.',
  body: 'Body content wrapper.',
  button: 'Button element or button-like control.',
  closeButton: 'Dialog close button.',
  close: 'Dialog close button.',
  content: 'Content wrapper.',
  control: 'Interactive control wrapper.',
  editor: 'Detail editor wrapper.',
  error: 'Error message.',
  fallback: 'Fallback media state.',
  field: 'Field wrapper.',
  fields: 'Editable fields wrapper.',
  footer: 'Footer wrapper.',
  group: 'Action group wrapper.',
  header: 'Header wrapper.',
  help: 'Help text or help trigger.',
  hint: 'Hint text.',
  input: 'Native input element.',
  item: 'List or menu item.',
  items: 'Menu item collection.',
  label: 'Label text.',
  link: 'Anchor element.',
  list: 'List wrapper.',
  media: 'Rendered media element.',
  nav: 'Navigation wrapper.',
  panel: 'Dialog or tab panel.',
  'pane-end': 'Splitter end pane.',
  'pane-start': 'Splitter start pane.',
  segmentedControl: 'Toggle segmented control.',
  'segmented-control': 'Toggle segmented control.',
  submenu: 'Submenu wrapper.',
  summary: 'Accordion summary row.',
  tab: 'Tab element.',
  tablist: 'Tab list wrapper.',
  text: 'Text wrapper.',
  tooltip: 'Tooltip wrapper.',
  value: 'Value text.'
};

const cssVariableDescriptions = {
  '--uib-action-bg': 'Action button background.',
  '--uib-action-border': 'Action button border.',
  '--uib-action-color': 'Action button text color.',
  '--uib-action-group-gap': 'Gap between grouped actions.',
  '--uib-action-min-height': 'Minimum action button height.',
  '--uib-action-padding': 'Action button padding.',
  '--uib-action-radius': 'Action button border radius.',
  '--uib-action-shadow': 'Action button shadow.',
  '--uib-color-border': 'Default border color.',
  '--uib-color-border-strong': 'Strong border color.',
  '--uib-color-danger': 'Danger/destructive color.',
  '--uib-color-ink': 'Primary text color.',
  '--uib-color-muted': 'Muted text color.',
  '--uib-color-primary': 'Primary accent color.',
  '--uib-color-primary-contrast': 'Text color on primary backgrounds.',
  '--uib-color-surface': 'Default surface color.',
  '--uib-color-surface-soft': 'Subtle surface color.',
  '--uib-focus-ring': 'Focus ring shadow.',
  '--uib-radius-lg': 'Large radius token.',
  '--uib-radius-md': 'Medium radius token.',
  '--uib-radius-pill': 'Pill radius token.',
  '--uib-shadow-lg': 'Large shadow token.',
  '--uib-shadow-sm': 'Small shadow token.',
  '--uib-space-3': 'Small layout gap.',
  '--uib-space-4': 'Default layout gap.',
  '--uib-z-index-modal': 'Modal z-index.'
};

function item(name, descriptions, type = '') {
  return { name, type, description: descriptions[name] || `${name} API surface.` };
}

function items(names = [], descriptions = {}, type = '') {
  return names.map((name) => item(name, descriptions, type));
}

function api({
  tagName,
  purpose,
  maturity = MATURITY_LEVELS.PREVIEW,
  attributes = [],
  properties = [],
  events = [],
  slots = [],
  cssParts = [],
  cssVariables = [],
  examples = []
}) {
  return {
    tagName,
    package: '@ui-base/ui',
    maturity,
    purpose,
    attributes: items(attributes, uiAttributeDescriptions),
    properties: items(properties, uiPropertyDescriptions),
    events: items(events, uiEventDescriptions),
    slots: items(slots, uiSlotDescriptions),
    cssParts: items(cssParts, uiPartDescriptions),
    cssVariables: items(cssVariables, cssVariableDescriptions),
    examples
  };
}

export const UI_COMPONENT_API = {
  'uib-toggle': api({
    tagName: 'uib-toggle',
    purpose: 'Compact nullable boolean segmented control.',
    attributes: ['name', 'value', 'required', 'labels', 'label', 'help', 'help-mode', 'disabled', 'readonly', 'invalid', 'error', 'aria-label', 'aria-describedby'],
    properties: ['value', 'disabled'],
    events: ['change', 'uib-toggle-change'],
    slots: ['label'],
    cssParts: ['field', 'label', 'control', 'segmented-control', 'button', 'error'],
    cssVariables: ['--uib-color-primary', '--uib-color-border', '--uib-focus-ring'],
    examples: ['<uib-toggle name="published" label="Published" help="Use N/A when unknown."></uib-toggle>']
  }),
  'uib-checkbox': api({
    tagName: 'uib-checkbox',
    purpose: 'Boolean checkbox control.',
    attributes: ['name', 'value', 'checked', 'label', 'help', 'hint', 'disabled', 'readonly', 'invalid', 'error'],
    properties: ['value', 'checked', 'disabled'],
    events: ['change', 'uib-checkbox-change'],
    slots: ['default'],
    cssParts: ['field', 'input', 'content', 'label', 'hint', 'error'],
    cssVariables: ['--uib-color-primary', '--uib-color-border', '--uib-focus-ring'],
    examples: ['<uib-checkbox name="confirmed" label="Confirmed"></uib-checkbox>']
  }),
  'uib-label': api({
    tagName: 'uib-label',
    purpose: 'Plain or form-associated accessible label with optional help.',
    attributes: ['for', 'text', 'help', 'help-mode', 'title', 'required', 'accessible-text', 'class'],
    slots: ['default'],
    cssParts: ['label'],
    examples: ['<uib-label text="Field label" help="Helpful context" required></uib-label>']
  }),
  'uib-help': api({
    tagName: 'uib-help',
    purpose: 'Tooltip or inline help content.',
    attributes: ['text', 'mode', 'open', 'label'],
    properties: ['open'],
    slots: ['default'],
    cssParts: ['base', 'button', 'tooltip', 'inline', 'text'],
    examples: ['<uib-help text="Helpful context appears here."></uib-help>']
  }),
  'uib-menu': api({
    tagName: 'uib-menu',
    purpose: 'Responsive site navigation container with hamburger behavior.',
    attributes: ['label', 'breakpoint', 'open', 'collapse-label', 'close-label'],
    properties: ['open'],
    events: ['uib-menu-select'],
    slots: ['default'],
    cssParts: ['base', 'toggle', 'nav', 'items'],
    examples: ['<uib-menu label="Primary"><uib-menuitem href="/ui/">UI</uib-menuitem></uib-menu>']
  }),
  'uib-menuitem': api({
    tagName: 'uib-menuitem',
    purpose: 'Navigation link or submenu trigger. Child menu items create dropdowns.',
    attributes: ['href', 'target', 'rel', 'label', 'active', 'open', 'disabled'],
    properties: ['open', 'disabled'],
    events: ['uib-menuitem-select', 'uib-menu-select'],
    slots: ['default'],
    cssParts: ['item', 'link', 'button', 'submenu', 'label'],
    examples: ['<uib-menuitem href="/ui/" active>UI</uib-menuitem>']
  }),
  'uib-stack': api({
    tagName: 'uib-stack',
    maturity: MATURITY_LEVELS.EXPERIMENTAL,
    purpose: 'Flex stack layout primitive.',
    attributes: ['gap', 'direction', 'align', 'justify'],
    slots: ['default'],
    cssParts: ['base'],
    cssVariables: ['--uib-space-3'],
    examples: ['<uib-stack gap="0.75rem"><button>Primary</button><button>Secondary</button></uib-stack>']
  }),
  'uib-grid': api({
    tagName: 'uib-grid',
    maturity: MATURITY_LEVELS.EXPERIMENTAL,
    purpose: 'Responsive grid layout primitive.',
    attributes: ['columns', 'min', 'gap'],
    slots: ['default'],
    cssParts: ['base'],
    cssVariables: ['--uib-space-4'],
    examples: ['<uib-grid min="8rem"><span>One</span><span>Two</span></uib-grid>']
  }),
  'uib-row': api({
    tagName: 'uib-row',
    maturity: MATURITY_LEVELS.EXPERIMENTAL,
    purpose: 'Horizontal flex row layout primitive.',
    attributes: ['gap', 'align', 'justify', 'wrap'],
    slots: ['default'],
    cssParts: ['base'],
    examples: ['<uib-row wrap><span>Row A</span><span>Row B</span></uib-row>']
  }),
  'uib-column': api({
    tagName: 'uib-column',
    maturity: MATURITY_LEVELS.EXPERIMENTAL,
    purpose: 'Vertical flex column layout primitive.',
    attributes: ['gap', 'align', 'justify'],
    slots: ['default'],
    cssParts: ['base'],
    examples: ['<uib-column><span>Column A</span><span>Column B</span></uib-column>']
  }),
  'uib-panel': api({
    tagName: 'uib-panel',
    maturity: MATURITY_LEVELS.EXPERIMENTAL,
    purpose: 'Panel surface with header, body, and footer slots.',
    attributes: ['label', 'heading'],
    slots: ['default', 'header', 'footer'],
    cssParts: ['base', 'header', 'body', 'footer'],
    examples: ['<uib-panel label="Panel fixture"><p>Panel body.</p><span slot="footer">Footer</span></uib-panel>']
  }),
  'uib-card': api({
    tagName: 'uib-card',
    maturity: MATURITY_LEVELS.EXPERIMENTAL,
    purpose: 'Card surface with header, body, and footer slots.',
    attributes: ['label', 'heading'],
    slots: ['default', 'header', 'footer'],
    cssParts: ['base', 'header', 'body', 'footer'],
    examples: ['<uib-card label="Card fixture"><p>Card body.</p><span slot="footer">Footer</span></uib-card>']
  }),
  'uib-dialog': api({
    tagName: 'uib-dialog',
    maturity: MATURITY_LEVELS.EXPERIMENTAL,
    purpose: 'Modal dialog shell.',
    attributes: ['open', 'heading', 'label'],
    properties: ['open'],
    events: ['uib-dialog-close'],
    slots: ['default', 'header', 'footer'],
    cssParts: ['backdrop', 'panel', 'header', 'body', 'footer', 'close-button'],
    cssVariables: ['--uib-z-index-modal', '--uib-shadow-lg'],
    examples: ['<uib-dialog heading="Fixture dialog" open><p>Dialog body content.</p></uib-dialog>']
  }),
  'uib-accordion': api({
    tagName: 'uib-accordion',
    maturity: MATURITY_LEVELS.EXPERIMENTAL,
    purpose: 'Disclosure section with summary and body.',
    attributes: ['open', 'heading', 'label'],
    events: ['uib-accordion-toggle'],
    slots: ['default', 'summary'],
    cssParts: ['base', 'summary', 'body'],
    examples: ['<uib-accordion heading="Accordion fixture"><p>Accordion body.</p></uib-accordion>']
  }),
  'uib-tabs': api({
    tagName: 'uib-tabs',
    maturity: MATURITY_LEVELS.EXPERIMENTAL,
    purpose: 'Experimental tab panel stub.',
    attributes: ['label'],
    slots: ['default'],
    cssParts: ['base', 'tablist', 'tab', 'panel'],
    examples: ['<uib-tabs label="Fixture tab"><p>Experimental tab body.</p></uib-tabs>']
  }),
  'uib-splitter': api({
    tagName: 'uib-splitter',
    maturity: MATURITY_LEVELS.EXPERIMENTAL,
    purpose: 'Two-pane splitter layout primitive.',
    attributes: ['position'],
    slots: ['default', 'start', 'end'],
    cssParts: ['base', 'pane-start', 'pane-end'],
    examples: ['<uib-splitter><div slot="start">Start pane</div><div slot="end">End pane</div></uib-splitter>']
  }),
  'uib-eyebrow': api({
    tagName: 'uib-eyebrow',
    purpose: 'Small section label or overline text.',
    attributes: ['text'],
    slots: ['default'],
    cssParts: ['eyebrow'],
    examples: ['<uib-eyebrow text="Developer docs"></uib-eyebrow>']
  }),
  'uib-heading-block': api({
    tagName: 'uib-heading-block',
    purpose: 'Reusable heading group with eyebrow, headline, subheadline, and body content.',
    attributes: ['eyebrow', 'headline', 'subheadline', 'body', 'level', 'size', 'align'],
    slots: ['eyebrow', 'headline', 'subheadline', 'body'],
    cssParts: ['base', 'eyebrow', 'headline', 'subheadline', 'body'],
    examples: ['<uib-heading-block eyebrow="Section" headline="Heading block" subheadline="Reusable content heading." body="Parent pages own the state."></uib-heading-block>']
  }),
  'uib-action-button': api({
    tagName: 'uib-action-button',
    purpose: 'Single action rendered as a button or link.',
    attributes: ['label', 'href', 'action', 'action-token', 'variant', 'kind', 'disabled', 'target', 'rel', 'icon'],
    properties: ['disabled'],
    events: ['uib-action-button-click', 'uib-action'],
    slots: ['default'],
    cssParts: ['button'],
    cssVariables: ['--uib-action-bg', '--uib-action-border', '--uib-action-color', '--uib-action-min-height', '--uib-action-padding', '--uib-action-radius', '--uib-action-shadow'],
    examples: ['<uib-action-button label="Run action" action-token="RUN_ACTION" variant="primary"></uib-action-button>']
  }),
  'uib-action-group': api({
    tagName: 'uib-action-group',
    purpose: 'Renders an ordered group of action buttons from a JSON array or property.',
    attributes: ['actions', 'align', 'stacked'],
    properties: ['actions'],
    events: ['uib-action-button-click', 'uib-action'],
    slots: ['default'],
    cssParts: ['group'],
    cssVariables: ['--uib-action-group-gap'],
    examples: ['<uib-action-group actions=\'[{"label":"Save","variant":"primary","actionToken":"SAVE"},{"label":"Cancel","variant":"secondary","actionToken":"CANCEL"}]\'></uib-action-group>']
  }),
  'uib-media': api({
    tagName: 'uib-media',
    purpose: 'Safe image/media presenter with fit, ratio, alt text, and fallback handling.',
    attributes: ['src', 'alt', 'fit', 'ratio', 'position', 'role', 'fallback-label'],
    cssParts: ['media', 'fallback'],
    examples: ['<uib-media src="/apps/demo/assets/icons/availability.svg" alt="Availability" fit="contain" ratio="16:9"></uib-media>']
  }),
  'uib-detail-item': api({
    tagName: 'uib-detail-item',
    purpose: 'Displays one label/value detail item with optional icon metadata.',
    attributes: ['label', 'value', 'description', 'icon', 'asset-id', 'icon-url', 'icon-alt', 'asset-map', 'detail'],
    properties: ['detail', 'assetMap'],
    cssParts: ['item', 'label', 'value', 'description'],
    examples: ['<uib-detail-item label="Duration" value="60 minutes" icon="60"></uib-detail-item>']
  }),
  'uib-detail-item-edit': api({
    tagName: 'uib-detail-item-edit',
    purpose: 'Edits one detail item, including asset-backed icon fields.',
    attributes: ['detail', 'label', 'asset-map', 'use-asset-picker', 'application-key', 'api-base-url', 'index'],
    properties: ['detail', 'headers', 'getAuthHeaders'],
    events: ['change', 'uib-detail-item-edit-change', 'uib-detail-asset-change'],
    cssParts: ['fields'],
    examples: ['<uib-detail-item-edit index="0" detail=\'{"label":"Duration","value":"60 minutes","icon":"60"}\'></uib-detail-item-edit>']
  }),
  'uib-detail-list': api({
    tagName: 'uib-detail-list',
    purpose: 'Displays label/value/detail rows with text, URL, or asset-backed icons.',
    attributes: ['details', 'asset-map'],
    properties: ['details', 'assetMap'],
    cssParts: ['list', 'item', 'label', 'value'],
    examples: ['<uib-detail-list details=\'[{"label":"Duration","value":"60 minutes","icon":"60"}]\'></uib-detail-list>']
  }),
  'uib-detail-list-editor': api({
    tagName: 'uib-detail-list-editor',
    purpose: 'Editable detail-row authoring component that emits clean detail arrays.',
    attributes: ['details', 'asset-map', 'label', 'use-asset-picker', 'application-key', 'api-base-url'],
    properties: ['details', 'assetMap'],
    events: ['uib-detail-add', 'uib-detail-update', 'uib-detail-asset-change', 'uib-detail-remove', 'uib-detail-list-editor-change'],
    cssParts: ['editor'],
    examples: ['<uib-detail-list-editor label="Editable details" details=\'[{"label":"Duration","value":"60 minutes","icon":"60"}]\'></uib-detail-list-editor>']
  })
};

export const UI_BASE_UI_COMPONENTS = Object.values(UI_COMPONENT_API).map((componentApi) => createComponentMetadata({
  ...componentApi,
  attributes: componentApi.attributes.map((item) => item.name),
  properties: componentApi.properties.map((item) => item.name),
  events: componentApi.events.map((item) => item.name),
  slots: componentApi.slots.map((item) => item.name),
  cssParts: componentApi.cssParts.map((item) => item.name),
  cssVariables: componentApi.cssVariables.map((item) => item.name)
}));
