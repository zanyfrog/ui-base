import { UI_BASE_UI_COMPONENTS } from '../../../../packages/ui-base-ui/src/metadata/index.js';
import { UI_BASE_FORM_COMPONENTS } from '../../../../packages/ui-base-forms/src/metadata.js';
import { UI_BASE_CALENDAR_COMPONENTS } from '../../../../packages/ui-base-calendar/src/metadata.js';
import { UI_BASE_ASSET_COMPONENTS } from '../../../../packages/ui-base-assets/src/metadata.js';

const WORKSPACE_ROOT = 'ui-base';

const PACKAGE_SPECS = [
  {
    name: '@ui-base/core',
    path: 'packages/ui-base-core',
    importSpecifier: '@ui-base/core',
    components: []
  },
  {
    name: '@ui-base/design-system',
    path: 'packages/ui-base-design-system',
    importSpecifier: '@ui-base/design-system',
    components: []
  },
  {
    name: '@ui-base/theme',
    path: 'packages/ui-base-theme',
    importSpecifier: '@ui-base/theme',
    components: []
  },
  {
    name: '@ui-base/icons',
    path: 'packages/ui-base-icons',
    importSpecifier: '@ui-base/icons',
    routeBase: '/components',
    components: [
      component('uib-icon', {
        purpose: 'Accessible icon renderer backed by the UI Base icon registry.',
        route: '/component-tests/#component-uib-icon'
      })
    ]
  },
  {
    name: '@ui-base/ui',
    path: 'packages/ui-base-ui',
    importSpecifier: '@ui-base/ui',
    routeBase: '/ui',
    components: UI_BASE_UI_COMPONENTS
  },
  {
    name: '@ui-base/forms',
    path: 'packages/ui-base-forms',
    importSpecifier: '@ui-base/forms',
    routeBase: '/forms',
    components: UI_BASE_FORM_COMPONENTS
  },
  {
    name: '@ui-base/calendar',
    path: 'packages/ui-base-calendar',
    importSpecifier: '@ui-base/calendar',
    routeBase: '/calendar',
    components: UI_BASE_CALENDAR_COMPONENTS
  },
  {
    name: '@ui-base/hero',
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
    path: 'packages/ui-base-assets',
    importSpecifier: '@ui-base/assets',
    routeBase: '/assets',
    components: UI_BASE_ASSET_COMPONENTS
  },
  {
    name: '@ui-base/ui-layout',
    path: 'packages/ui-layout',
    importSpecifier: '@ui-base/ui-layout',
    components: []
  },
  {
    name: '@ui-base/app-manager-api-client',
    path: 'packages/app-manager-api-client',
    importSpecifier: '@ui-base/app-manager-api-client',
    components: []
  },
  {
    name: '@ui-base/app-manager-design-tokens',
    path: 'packages/app-manager-design-tokens',
    importSpecifier: '@ui-base/app-manager-design-tokens/tokens.css',
    components: []
  },
  {
    name: '@ui-base/app-manager-ui',
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
      component('uib-hero-action-button'),
      component('uib-hero-action-buttons')
    ]
  }
];

function component(tagName, overrides = {}) {
  return {
    tagName,
    package: overrides.package,
    purpose: overrides.purpose || 'Public web component exported by this package.',
    attributes: overrides.attributes || [],
    events: overrides.events || [],
    slots: overrides.slots || [],
    cssParts: overrides.cssParts || [],
    route: overrides.route || ''
  };
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
      return {
        tagName,
        package: item.package || packageName,
        title: item.title || tagName,
        purpose: item.purpose || item.summary || 'Public web component exported by this package.',
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
