import { UI_BASE_UI_COMPONENTS } from '../../../../packages/ui-base-ui/src/metadata/index.js';
import { UI_BASE_FORM_COMPONENTS } from '../../../../packages/ui-base-forms/src/metadata.js';
import { UI_BASE_CALENDAR_COMPONENTS } from '../../../../packages/ui-base-calendar/src/metadata.js';
import { UI_BASE_ASSET_COMPONENTS } from '../../../../packages/ui-base-assets/src/metadata.js';

const WORKSPACE_ROOT = 'ui-base';

const PACKAGE_DETAILS = {
  '@ui-base/core': packageDetails('Core', 'Shared base classes, accessibility helpers, validation, localization, metadata shaping, and utility functions for UI Base Web Components.', 'info', 'Foundation', '0.1.0'),
  '@ui-base/design-system': packageDetails('Design System', 'Design tokens, base styles, accessibility rules, component specifications, and governance documentation for UI Base.', 'check', 'Foundation', '0.1.0'),
  '@ui-base/theme': packageDetails('Theme', 'Theme CSS entry points and custom-property overrides for default, dark, and sample-tour UI Base experiences.', 'info', 'Foundation', '0.1.0'),
  '@ui-base/icons': packageDetails('Icons', 'SVG icon registry, URL icon support, and the accessible uib-icon renderer.', 'check', 'Foundation', '0.1.0'),
  '@ui-base/ui': packageDetails('UI Primitives', 'General-purpose content, action, navigation, layout, media, detail, and lightweight form primitives.', 'menu', 'Components', '0.5.1'),
  '@ui-base/forms': packageDetails('Forms', 'Form shell, inputs, validation-aware fields, display fields, recent values, and form layout helpers.', 'check', 'Components', '0.1.0'),
  '@ui-base/calendar': packageDetails('Calendar', 'Parent-controlled date, week, month, year, date-window, and weekday calendar views.', 'calendar', 'Components', '0.2.0'),
  '@ui-base/hero': packageDetails('Hero', 'Landing-page and tour-page hero rendering, preview, editing, defaults, and action component support.', 'external-link', 'Experience', '0.2.3'),
  '@ui-base/tour-ui': packageDetails('Tour UI', 'Tour reservation action components for starting, finding, cancelling, and booking group reservations.', 'calendar', 'Business', '0.1.1'),
  '@ui-base/assets': packageDetails('Assets', 'Asset browsing, picking, image rendering, upload, metadata, permission, version, and usage components.', 'external-link', 'Content', '0.1.17'),
  '@ui-base/ui-layout': packageDetails('UI Layout', 'Source-backed layout analysis, page importing, visual layout editing, previews, diffs, and patch generation tools.', 'menu', 'Tooling', '0.1.0'),
  '@ui-base/app-manager-api-client': packageDetails('App Manager API Client', 'Fetch client helpers for UI Base App Manager ORM and I-AM endpoints.', 'external-link', 'Services', '0.1.0'),
  '@ui-base/app-manager-design-tokens': packageDetails('App Manager Design Tokens', 'CSS design tokens and shared styles for the App Manager interface.', 'check', 'Foundation', '0.1.0'),
  '@ui-base/app-manager-ui': packageDetails('App Manager UI', 'Administrative Web Components for configuring applications, hero records, assets, and hero actions.', 'menu', 'Business', '0.2.12'),
  '@ui-base/page-import-service': packageDetails('Page Import Service', 'Local rendered-page extraction service and CLI used by the UI Base page importer workflow.', 'external-link', 'Services', '0.1.0')
};

const COMPONENT_DETAILS = {
  'uib-accordion': componentDetails('Accordion', 'Disclosure section with a summary row and expandable body content.', 'chevron-down', 'Layout'),
  'uib-action-button': componentDetails('Action Button', 'Single command rendered as a button or link with variants, icons, disabled state, and action events.', 'check', 'Actions'),
  'uib-action-group': componentDetails('Action Group', 'Ordered action button cluster rendered from slotted content or a JSON action array.', 'menu', 'Actions'),
  'uib-app-manager-asset-picker': componentDetails('App Manager Asset Picker', 'App Manager-specific asset picker for uploading, refreshing, and selecting ORM-backed assets.', 'external-link', 'App Manager'),
  'uib-application-asset-editor': componentDetails('Application Asset Editor', 'Administrative editor for asset metadata, replacement files, display URLs, and download links.', 'external-link', 'App Manager'),
  'uib-application-asset-list': componentDetails('Application Asset List', 'Application-scoped asset list with upload and asset edit navigation actions.', 'menu', 'App Manager'),
  'uib-application-editor': componentDetails('Application Editor', 'Create and edit App Manager application records through generated form fields.', 'check', 'App Manager'),
  'uib-application-hero-editor': componentDetails('Application Hero Editor', 'Loads, edits, previews, and saves application hero records through the shared hero editor.', 'external-link', 'App Manager'),
  'uib-application-hero-list': componentDetails('Application Hero List', 'Application-scoped hero record browser with create, refresh, and edit actions.', 'menu', 'App Manager'),
  'uib-application-hero-preview': componentDetails('Application Hero Preview', 'ORM-aware wrapper that resolves hero preview data for an application hero record.', 'external-link', 'App Manager'),
  'uib-application-list': componentDetails('Application List', 'App Manager application browser with selection, refresh, and creation workflows.', 'menu', 'App Manager'),
  'uib-application-manager': componentDetails('Application Manager', 'Top-level App Manager shell that routes between application, hero, and asset administration views.', 'menu', 'App Manager'),
  'uib-asset-browser': componentDetails('Asset Browser', 'Full asset management surface for searching, filtering, uploading, selecting, previewing, and editing assets.', 'external-link', 'Assets'),
  'uib-asset-details': componentDetails('Asset Details', 'Detailed asset panel for summary, metadata, versions, usage, permissions, and asset actions.', 'info', 'Assets'),
  'uib-asset-filter-bar': componentDetails('Asset Filter Bar', 'Filter controls for asset type, scope, visibility, category, status, and related search state.', 'menu', 'Assets'),
  'uib-asset-grid': componentDetails('Asset Grid', 'Card-style grid of assets with open and select interactions.', 'menu', 'Assets'),
  'uib-asset-image': componentDetails('Asset Image', 'Image renderer that resolves direct URLs, asset objects, asset maps, or async asset IDs.', 'external-link', 'Assets'),
  'uib-asset-list': componentDetails('Asset List', 'Tabular asset result list with thumbnail, metadata, open, and select actions.', 'menu', 'Assets'),
  'uib-asset-metadata-editor': componentDetails('Asset Metadata Editor', 'Editor for asset scope, visibility, category, alt text, description, and permission metadata.', 'check', 'Assets'),
  'uib-asset-permission-panel': componentDetails('Asset Permission Panel', 'Permission summary and management panel for asset permission set changes.', 'warning', 'Assets'),
  'uib-asset-permission-set-picker': componentDetails('Asset Permission Set Picker', 'Permission set selector used by asset metadata and permission management surfaces.', 'warning', 'Assets'),
  'uib-asset-picker': componentDetails('Asset Picker', 'Form-associated asset picker for choosing one or more reusable assets with optional upload.', 'external-link', 'Assets'),
  'uib-asset-picker-dialog': componentDetails('Asset Picker Dialog', 'Modal picker surface for browse, upload, filter, and confirm-selection workflows.', 'external-link', 'Assets'),
  'uib-asset-preview': componentDetails('Asset Preview', 'Focused preview panel for the currently selected asset.', 'external-link', 'Assets'),
  'uib-asset-search': componentDetails('Asset Search', 'Search input that emits asset query changes for browser and picker workflows.', 'info', 'Assets'),
  'uib-asset-thumbnail': componentDetails('Asset Thumbnail', 'Compact thumbnail and fallback renderer for asset cards, rows, and selected chips.', 'external-link', 'Assets'),
  'uib-asset-uploader': componentDetails('Asset Uploader', 'Upload form that validates files and emits asset upload requests.', 'external-link', 'Assets'),
  'uib-asset-usage': componentDetails('Asset Usage', 'Where-used list showing asset usage records and contexts.', 'info', 'Assets'),
  'uib-asset-version-history': componentDetails('Asset Version History', 'Version history list for an asset record.', 'info', 'Assets'),
  'uib-book-group-reservation': componentDetails('Book Group Reservation', 'Tour reservation action card for starting a group booking request.', 'calendar', 'Reservations'),
  'uib-calendar-day-view': componentDetails('Calendar Day View', 'Single-date calendar card with a selectable day action.', 'calendar', 'Calendar'),
  'uib-calendar-month-view': componentDetails('Calendar Month View', 'Selectable month grid controlled by year, month, and selected date.', 'calendar', 'Calendar'),
  'uib-calendar-week-view': componentDetails('Calendar Week View', 'Seven-day calendar strip beginning from a parent-controlled start date.', 'calendar', 'Calendar'),
  'uib-calendar-year-view': componentDetails('Calendar Year View', 'Twelve-month selection grid for a parent-controlled year.', 'calendar', 'Calendar'),
  'uib-cancel-reservation': componentDetails('Cancel Reservation', 'Tour reservation action card for cancelling an existing reservation.', 'x', 'Reservations'),
  'uib-card': componentDetails('Card', 'Repeatable content card with optional media, link/action behavior, and selectable state.', 'info', 'Layout'),
  'uib-checkbox': componentDetails('Checkbox', 'Lightweight boolean checkbox control for UI-level interactions.', 'check', 'Controls'),
  'uib-column': componentDetails('Column', 'Vertical flex layout primitive for stacking child content.', 'menu', 'Layout'),
  'uib-date-window-view': componentDetails('Date Window View', 'Selectable contiguous range of dates beginning from a parent-controlled start date.', 'calendar', 'Calendar'),
  'uib-day-of-week-view': componentDetails('Day Of Week View', 'Paged list of repeated weekday dates with selection and page request events.', 'calendar', 'Calendar'),
  'uib-detail-item': componentDetails('Detail Item', 'Single label/value row with optional text, URL, or asset-backed icon metadata.', 'info', 'Details'),
  'uib-detail-item-edit': componentDetails('Detail Item Edit', 'Editor for one detail row, including asset-backed icon fields.', 'check', 'Details'),
  'uib-detail-list': componentDetails('Detail List', 'List of detail rows with labels, values, descriptions, and optional icons.', 'menu', 'Details'),
  'uib-detail-list-editor': componentDetails('Detail List Editor', 'Editable detail-row authoring component that emits normalized detail arrays.', 'check', 'Details'),
  'uib-dialog': componentDetails('Dialog', 'Modal dialog shell with header, body, footer, close behavior, and accessible labeling.', 'close', 'Layout'),
  'uib-eyebrow': componentDetails('Eyebrow', 'Compact section label or overline text for content hierarchy.', 'info', 'Content'),
  'uib-find-reservation': componentDetails('Find Reservation', 'Tour reservation action card for looking up an existing reservation.', 'info', 'Reservations'),
  'uib-forms-checkbox': componentDetails('Forms Checkbox', 'Form-associated checkbox with validation, help, error, and submitted-value handling.', 'check', 'Forms'),
  'uib-forms-date': componentDetails('Forms Date', 'Form-associated date input with min, max, step, validation, and field chrome.', 'calendar', 'Forms'),
  'uib-forms-display-field': componentDetails('Forms Display Field', 'Read-only display field for formatted values, empty states, orientation, and help text.', 'info', 'Forms'),
  'uib-forms-email': componentDetails('Forms Email', 'Form-associated email input with browser validation and recent-value support.', 'external-link', 'Forms'),
  'uib-forms-field': componentDetails('Forms Field', 'Generic label/help wrapper for native or custom slotted controls.', 'info', 'Forms'),
  'uib-forms-form': componentDetails('Forms Form', 'Form shell that serializes child controls and emits validation-aware submit events.', 'check', 'Forms'),
  'uib-forms-input-group': componentDetails('Forms Input Group', 'Responsive group layout for related form controls.', 'menu', 'Forms'),
  'uib-forms-number': componentDetails('Forms Number', 'Form-associated number input with min, max, step, validation, and field chrome.', 'info', 'Forms'),
  'uib-forms-password': componentDetails('Forms Password', 'Form-associated password input with validation and a visibility toggle.', 'warning', 'Forms'),
  'uib-forms-phone': componentDetails('Forms Phone', 'Form-associated telephone input with validation and recent-value support.', 'info', 'Forms'),
  'uib-forms-select': componentDetails('Forms Select', 'Form-associated select control from comma-separated options or native option children.', 'chevron-down', 'Forms'),
  'uib-forms-textarea': componentDetails('Forms Textarea', 'Form-associated multiline text input with validation, help, and error states.', 'info', 'Forms'),
  'uib-forms-textbox': componentDetails('Forms Textbox', 'Form-associated single-line text input with validation and recent-value support.', 'info', 'Forms'),
  'uib-forms-wizard': componentDetails('Forms Wizard', 'Experimental wizard shell for parent-owned multi-step form content.', 'menu', 'Forms'),
  'uib-grid': componentDetails('Grid', 'Responsive CSS grid layout primitive with configurable columns, minimum item size, and gap.', 'menu', 'Layout'),
  'uib-heading': componentDetails('Heading', 'Reusable h1-h6 heading renderer with semantic level, visual size, and alignment controls.', 'info', 'Content'),
  'uib-heading-block': componentDetails('Heading Block', 'Composable content heading group with eyebrow, headline, subheadline, and body regions.', 'info', 'Content'),
  'uib-help': componentDetails('Help', 'Inline or tooltip-style help text with accessible trigger and open state.', 'help', 'Controls'),
  'uib-hero': componentDetails('Hero', 'Public hero renderer for high-value page entry points with visual media, CTAs, nav, and detail rows.', 'external-link', 'Hero'),
  'uib-hero-action-button': componentDetails('Hero Action Button', 'Administrative editor for a single hero action component configuration.', 'check', 'App Manager'),
  'uib-hero-action-buttons': componentDetails('Hero Action Buttons', 'Administrative array editor for adding, removing, and reordering hero action configurations.', 'menu', 'App Manager'),
  'uib-hero-editor': componentDetails('Hero Editor', 'Reusable hero authoring form that edits hero data and emits change/save events.', 'check', 'Hero'),
  'uib-hero-preview': componentDetails('Hero Preview', 'Preview wrapper that renders hero data without parent-page persistence concerns.', 'external-link', 'Hero'),
  'uib-icon': componentDetails('Icon', 'Accessible SVG or image icon renderer backed by the UI Base icon registry.', 'check', 'Icons'),
  'uib-instruction': componentDetails('Instruction', 'Instructional block with variants, steps, actions, collapsible summaries, and progress state.', 'info', 'Content'),
  'uib-label': componentDetails('Label', 'Accessible label element with optional help, required marker, and form-control targeting.', 'info', 'Controls'),
  'uib-layout-diff': componentDetails('Layout Diff', 'Source-aware diff view for reviewing pending layout editing changes.', 'info', 'Layout Tooling'),
  'uib-layout-editor': componentDetails('Layout Editor', 'Interactive layout editor that coordinates analysis, tree selection, property edits, preview, and patch output.', 'menu', 'Layout Tooling'),
  'uib-layout-manager': componentDetails('Layout Manager', 'Manager shell for loading component source, running layout analysis, and driving layout edits.', 'menu', 'Layout Tooling'),
  'uib-layout-preview': componentDetails('Layout Preview', 'Preview surface for selecting and inspecting analyzed layout nodes.', 'external-link', 'Layout Tooling'),
  'uib-layout-properties': componentDetails('Layout Properties', 'Property editor for selected layout nodes and layout operation inputs.', 'check', 'Layout Tooling'),
  'uib-layout-toolbar': componentDetails('Layout Toolbar', 'Command toolbar for analyze, diff, save, and revert layout editing actions.', 'menu', 'Layout Tooling'),
  'uib-layout-tree': componentDetails('Layout Tree', 'Tree view of extracted layout nodes with selection and move-request interactions.', 'menu', 'Layout Tooling'),
  'uib-media': componentDetails('Media', 'Safe media presenter with image fit, ratio, role, alt text, and fallback handling.', 'external-link', 'Content'),
  'uib-menu': componentDetails('Menu', 'Responsive navigation container with collapse behavior and bubbling selection events.', 'menu', 'Navigation'),
  'uib-menuitem': componentDetails('Menu Item', 'Navigation link or submenu trigger with active, disabled, and open states.', 'chevron-down', 'Navigation'),
  'uib-new-reservation': componentDetails('New Reservation', 'Tour reservation action card for starting a new reservation flow.', 'calendar', 'Reservations'),
  'uib-page-importer': componentDetails('Page Importer', 'Rendered-page importer for extracting page content into UI Base component and layout artifacts.', 'external-link', 'Layout Tooling'),
  'uib-panel': componentDetails('Panel', 'Structural panel region with header, actions, body, footer, variants, density, and collapse behavior.', 'chevron-down', 'Layout'),
  'uib-recent-values-manager': componentDetails('Recent Values Manager', 'Management panel for viewing and clearing locally stored recent form input values.', 'info', 'Forms'),
  'uib-rich-text': componentDetails('Rich Text', 'Readable rich text container for trusted slotted content and safe external link defaults.', 'info', 'Content'),
  'uib-row': componentDetails('Row', 'Horizontal flex layout primitive with gap, alignment, justification, and wrapping controls.', 'menu', 'Layout'),
  'uib-splitter': componentDetails('Splitter', 'Two-pane splitter layout primitive with start and end regions.', 'menu', 'Layout'),
  'uib-stack': componentDetails('Stack', 'Flex stack layout primitive for arranging children in a configurable direction with gaps.', 'menu', 'Layout'),
  'uib-tab': componentDetails('Tab', 'Focusable tab item managed by a parent uib-tabs component.', 'info', 'Tabs'),
  'uib-tab-panel': componentDetails('Tab Panel', 'Panel paired with a tab by direct-child order inside uib-tabs.', 'info', 'Tabs'),
  'uib-tabs': componentDetails('Tabs', 'Coordinated tab list and panel system with selected state and keyboard navigation.', 'menu', 'Tabs'),
  'uib-toggle': componentDetails('Toggle', 'Compact nullable boolean segmented control with labels, help, readonly, and validation states.', 'check', 'Controls'),
  'uib-visual-source-control': componentDetails('Visual Source Control', 'Authoring control for choosing URL, asset-backed, or empty visual sources with alt text and role metadata.', 'external-link', 'Assets')
};

const PACKAGE_SPECS = [
  {
    name: '@ui-base/core',
    package: PACKAGE_DETAILS['@ui-base/core'],
    path: 'packages/ui-base-core',
    importSpecifier: '@ui-base/core',
    components: []
  },
  {
    name: '@ui-base/design-system',
    package: PACKAGE_DETAILS['@ui-base/design-system'],
    path: 'packages/ui-base-design-system',
    importSpecifier: '@ui-base/design-system',
    components: []
  },
  {
    name: '@ui-base/theme',
    package: PACKAGE_DETAILS['@ui-base/theme'],
    path: 'packages/ui-base-theme',
    importSpecifier: '@ui-base/theme',
    components: []
  },
  {
    name: '@ui-base/icons',
    package: PACKAGE_DETAILS['@ui-base/icons'],
    path: 'packages/ui-base-icons',
    importSpecifier: '@ui-base/icons',
    routeBase: '/components',
    components: [
      component('uib-icon', {
        route: '/component-tests/#component-uib-icon'
      })
    ]
  },
  {
    name: '@ui-base/ui',
    package: PACKAGE_DETAILS['@ui-base/ui'],
    path: 'packages/ui-base-ui',
    importSpecifier: '@ui-base/ui',
    routeBase: '/ui',
    components: UI_BASE_UI_COMPONENTS
  },
  {
    name: '@ui-base/forms',
    package: PACKAGE_DETAILS['@ui-base/forms'],
    path: 'packages/ui-base-forms',
    importSpecifier: '@ui-base/forms',
    routeBase: '/forms',
    components: UI_BASE_FORM_COMPONENTS
  },
  {
    name: '@ui-base/calendar',
    package: PACKAGE_DETAILS['@ui-base/calendar'],
    path: 'packages/ui-base-calendar',
    importSpecifier: '@ui-base/calendar',
    routeBase: '/calendar',
    components: UI_BASE_CALENDAR_COMPONENTS
  },
  {
    name: '@ui-base/hero',
    package: PACKAGE_DETAILS['@ui-base/hero'],
    path: 'packages/ui-base-hero',
    importSpecifier: '@ui-base/hero',
    components: [
      component('uib-hero', { route: '/hero/' }),
      component('uib-hero-preview'),
      component('uib-hero-editor')
    ]
  },
  {
    name: '@ui-base/tour-ui',
    package: PACKAGE_DETAILS['@ui-base/tour-ui'],
    path: 'packages/ui-base-tour-ui',
    importSpecifier: '@ui-base/tour-ui',
    components: [
      component('uib-new-reservation', { route: '/tour-ui/new-reservation' }),
      component('uib-cancel-reservation', { route: '/tour-ui/cancel-reservation' }),
      component('uib-find-reservation', { route: '/tour-ui/find-reservation' }),
      component('uib-book-group-reservation', { route: '/tour-ui/book-group-reservation' })
    ]
  },
  {
    name: '@ui-base/assets',
    package: PACKAGE_DETAILS['@ui-base/assets'],
    path: 'packages/ui-base-assets',
    importSpecifier: '@ui-base/assets',
    routeBase: '/assets',
    components: UI_BASE_ASSET_COMPONENTS
  },
  {
    name: '@ui-base/ui-layout',
    package: PACKAGE_DETAILS['@ui-base/ui-layout'],
    path: 'packages/ui-layout',
    importSpecifier: '@ui-base/ui-layout',
    components: [
      component('uib-layout-diff'),
      component('uib-layout-editor'),
      component('uib-layout-manager'),
      component('uib-layout-preview'),
      component('uib-layout-properties'),
      component('uib-layout-toolbar'),
      component('uib-layout-tree'),
      component('uib-page-importer', { route: '/layout/pageimporter' })
    ]
  },
  {
    name: '@ui-base/app-manager-api-client',
    package: PACKAGE_DETAILS['@ui-base/app-manager-api-client'],
    path: 'packages/app-manager-api-client',
    importSpecifier: '@ui-base/app-manager-api-client',
    components: []
  },
  {
    name: '@ui-base/app-manager-design-tokens',
    package: PACKAGE_DETAILS['@ui-base/app-manager-design-tokens'],
    path: 'packages/app-manager-design-tokens',
    importSpecifier: '@ui-base/app-manager-design-tokens/tokens.css',
    components: []
  },
  {
    name: '@ui-base/app-manager-ui',
    package: PACKAGE_DETAILS['@ui-base/app-manager-ui'],
    path: 'packages/app-manager-ui',
    importSpecifier: '@ui-base/app-manager-ui',
    components: [
      component('uib-application-manager'),
      component('uib-application-list'),
      component('uib-application-editor'),
      component('uib-application-hero-list'),
      component('uib-application-hero-editor'),
      component('uib-application-hero-preview'),
      component('uib-application-asset-list'),
      component('uib-application-asset-editor'),
      component('uib-app-manager-asset-picker'),
      component('uib-hero-action-button'),
      component('uib-hero-action-buttons')
    ]
  },
  {
    name: '@ui-base/page-import-service',
    package: PACKAGE_DETAILS['@ui-base/page-import-service'],
    path: 'packages/page-import-service',
    importSpecifier: '@ui-base/page-import-service',
    components: []
  }
];

function component(tagName, overrides = {}) {
  const details = COMPONENT_DETAILS[tagName] || {};
  return {
    tagName,
    package: overrides.package,
    displayName: overrides.displayName || details.displayName || tagName,
    title: overrides.title || overrides.displayName || details.displayName || tagName,
    description: overrides.description || details.description || overrides.purpose || 'Public web component exported by this package.',
    icon: overrides.icon || details.icon || 'info',
    category: overrides.category || details.category || 'Components',
    purpose: overrides.purpose || overrides.description || details.description || 'Public web component exported by this package.',
    attributes: overrides.attributes || [],
    events: overrides.events || [],
    slots: overrides.slots || [],
    cssParts: overrides.cssParts || [],
    route: overrides.route || ''
  };
}

function packageDetails(displayName, description, icon, category, version) {
  return { displayName, description, icon, category, version };
}

function componentDetails(displayName, description, icon, category) {
  return { displayName, description, icon, category };
}

function exportNameToTagName(name) {
  const withoutPrefix = name.replace(/^Uib/, '');
  if (!withoutPrefix || withoutPrefix === name || withoutPrefix.endsWith('Base')) return '';
  return `uib-${withoutPrefix
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()}`;
}

function normalizeComponents(components = [], packageName, routeBase = '') {
  return components
    .map((item) => {
      const tagName = item.tagName || item.name || '';
      if (!tagName || !tagName.includes('-')) return null;
      const details = COMPONENT_DETAILS[tagName] || {};
      const description = item.description || item.purpose || item.summary || details.description || 'Public web component exported by this package.';
      return {
        tagName,
        package: item.package || packageName,
        displayName: item.displayName || item.title || details.displayName || tagName,
        title: item.title || item.displayName || details.displayName || tagName,
        description,
        icon: item.icon || details.icon || 'info',
        category: item.category || details.category || 'Components',
        purpose: item.purpose || item.summary || description,
        maturity: item.maturity || '',
        attributes: item.attributes || [],
        events: item.events || [],
        slots: item.slots || [],
        cssParts: item.cssParts || [],
        route: item.route || (routeBase ? `${routeBase}/${tagName}` : '')
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.tagName.localeCompare(b.tagName));
}

async function inferComponentsFromExports(spec) {
  if (!spec.importSpecifier) return [];
  try {
    const moduleExports = await import(spec.importSpecifier);
    return Object.entries(moduleExports)
      .map(([name, value]) => {
        const tagName = exportNameToTagName(name);
        if (!tagName || typeof value !== 'function') return null;
        return component(tagName, {
          package: spec.name,
          purpose: `Exported as ${name}.`
        });
      })
      .filter(Boolean);
  } catch (error) {
    return {
      error: error?.message || `Could not import ${spec.importSpecifier}.`
    };
  }
}

export async function discoverPackageBrowserPackages(specs = PACKAGE_SPECS) {
  const packages = [];

  for (const spec of specs) {
    const inferred = await inferComponentsFromExports(spec);
    const importError = inferred?.error || '';
    const inferredComponents = Array.isArray(inferred) ? inferred : [];
    const components = normalizeComponents(
      [...(spec.components || []), ...inferredComponents],
      spec.name,
      spec.routeBase
    );
    const dedupedComponents = Array.from(
      new Map(components.map((item) => [item.tagName, item])).values()
    );

    packages.push({
      name: spec.name,
      package: {
        name: spec.name,
        displayName: spec.package?.displayName || spec.displayName || spec.name,
        description: spec.package?.description || spec.description || spec.summary || '',
        icon: spec.package?.icon || spec.icon || 'info',
        category: spec.package?.category || spec.category || 'Components',
        version: spec.package?.version || spec.version || ''
      },
      displayName: spec.package?.displayName || spec.displayName || spec.name,
      description: spec.package?.description || spec.description || spec.summary || '',
      icon: spec.package?.icon || spec.icon || 'info',
      category: spec.package?.category || spec.category || 'Components',
      version: spec.package?.version || spec.version || '',
      path: spec.path || '',
      workspacePath: spec.path ? `${WORKSPACE_ROOT}/${spec.path}` : WORKSPACE_ROOT,
      importSpecifier: spec.importSpecifier || '',
      summary: spec.summary || '',
      status: importError ? 'partial' : 'loaded',
      importError,
      components: dedupedComponents
    });
  }

  return packages;
}

export function getPackageBrowserSpecs() {
  return PACKAGE_SPECS.map((spec) => ({
    ...spec,
    workspacePath: spec.path ? `${WORKSPACE_ROOT}/${spec.path}` : WORKSPACE_ROOT
  }));
}
