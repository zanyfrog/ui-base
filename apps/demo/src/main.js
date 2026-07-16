import '@ui.base/icons';
import '@ui.base/ui';
import '@ui.base/forms';
import '@ui.base/hero';
import '@ui.base/calendar';
import '@ui.base/assets';
import './components/package-browser.js';
import { renderCalendarPackageRoute } from './routes/calendar-package-demo.js';
import { renderCalendarRoute } from './routes/calendar-demo.js';
import { renderAssetsPackageRoute } from './routes/assets-package-demo.js';
import { renderAssetsRoute } from './routes/assets-demo.js';
import { renderHeroRoute } from './routes/hero-demo.js';
import { renderTourUiRoute } from './routes/tour-ui-demo.js';
import { renderUiRoute } from './routes/ui-demo.js';
import { renderUiControlsRoute } from './routes/ui-controls-demo.js';
import { renderFormsRoute } from './routes/forms-demo.js';
import { renderDesignSystemRoute } from './routes/design-system-demo.js';
import { renderComponentCatalogRoute } from './routes/component-catalog-demo.js';
import { renderComponentTestsRoute } from './routes/component-tests-demo.js';
import { exportDemoData, initDemoStore, replaceDemoData, resetDemoData } from './data/demo-store.js';

const app = document.querySelector('#app');
let demoData = await initDemoStore();

window.addEventListener('demo-data-change', (event) => {
  demoData = event.detail?.data || demoData;
});

function normalizePath(pathname) {
  if (!pathname || pathname === '') return '/';
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

function isActive(basePath) {
  const current = normalizePath(window.location.pathname);
  return current === basePath || current.startsWith(`${basePath}/`);
}

function dataControls() {
  return `
    <details class="demo-data-menu">
      <summary>
        Demo data
      </summary>
      <div class="demo-data-menu__panel">
        <p>
          Changes auto-save in this browser.
        </p>
        <div class="button-row">
          <button class="secondary-button compact-control-button" type="button" data-export-demo-data>
            Export
          </button>
          <button class="secondary-button compact-control-button" type="button" data-import-demo-data>
            Import
          </button>
          <button class="secondary-button compact-control-button" type="button" data-reset-demo-data>
            Reset
          </button>
        </div>
        <textarea id="demoDataExchange" class="demo-data-exchange" spellcheck="false" aria-label="Demo data import and export JSON">
        </textarea>
        <div id="demoDataStatus" class="demo-data-status">
          Loaded from saved browser data.
        </div>
      </div>
    </details>
  `;
}

function shell() {
  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <a class="logo" href="/" data-link>
          <span class="logo-mark" aria-hidden="true">
            UIB
          </span>
          <span>
            UI Base Design System
          </span>
        </a>
        <uib-menu class="demo-menu" label="Primary" breakpoint="860">
          <uib-menuitem href="/component-tests/" ${isActive('/component-tests') ? 'active' : ''}>
            Component Tests
          </uib-menuitem>
          <uib-menuitem href="/package-tests/" ${isActive('/package-tests') ? 'active' : ''}>
            Package Tests
          </uib-menuitem>
          <uib-menuitem href="/design-system/" ${isActive('/design-system') ? 'active' : ''}>
            Design System
          </uib-menuitem>
          <uib-menuitem href="/components/" ${isActive('/components') ? 'active' : ''}>
            Components
          </uib-menuitem>
          <uib-menuitem href="/ui/" ${isActive('/ui') ? 'active' : ''}>
            UI
          </uib-menuitem>
          <uib-menuitem href="/ui-controls/" ${isActive('/ui-controls') ? 'active' : ''}>
            Controls
          </uib-menuitem>
          <uib-menuitem href="/forms/" ${isActive('/forms') ? 'active' : ''}>
            Forms
          </uib-menuitem>
          <uib-menuitem href="/calendar/" ${isActive('/calendar') ? 'active' : ''}>
            Calendar
          </uib-menuitem>
          <uib-menuitem href="/assets/" ${isActive('/assets') ? 'active' : ''}>
            Assets
          </uib-menuitem>
          <uib-menuitem label="Demos">
            <uib-menuitem href="/assets-demo/" ${isActive('/assets-demo') ? 'active' : ''}>
              Assets
            </uib-menuitem>
            <uib-menuitem href="/assets-demo/picker" ${isActive('/assets-demo/picker') ? 'active' : ''}>
              Asset Picker
            </uib-menuitem>
            <uib-menuitem href="/calendar-demo/" ${isActive('/calendar-demo') ? 'active' : ''}>
              Calendar
            </uib-menuitem>
            <uib-menuitem href="/hero/" ${isActive('/hero') ? 'active' : ''}>
              Hero
            </uib-menuitem>
            <uib-menuitem href="/hero/asset-backed-details" ${isActive('/hero/asset-backed-details') ? 'active' : ''}>
              Hero Assets
            </uib-menuitem>
            <uib-menuitem href="/tour-ui/" ${isActive('/tour-ui') ? 'active' : ''}>
              Actions
            </uib-menuitem>
          </uib-menuitem>
        </uib-menu>
        ${dataControls()}
      </header>
      <main id="app-main" tabindex="-1">
      </main>
    </div>
  `;
  return app.querySelector('#app-main');
}

function packageTestCards() {
  return (demoData.packageTests || []).map((item) => `
    <article class="card home-card package-test-card">
      <span>
        <p class="eyebrow">
          ${item.name}
        </p>
        <h2>
          ${item.title}
        </h2>
        <p>
          ${item.description}
        </p>
      </span>
      <div class="button-row package-test-actions" aria-label="${item.name} demo routes">
        <a class="primary-button" href="${item.primaryPath}" data-link>
          ${item.primaryLabel}
        </a>
        ${item.links.map((link) => `
          <a class="secondary-button" href="${link.path}" data-link>
            ${link.label}
          </a>
        `).join('')}
      </div>
    </article>
  `).join('');
}

function bindDataControls() {
  const output = app.querySelector('#demoDataExchange');
  const status = app.querySelector('#demoDataStatus');
  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

  app.querySelector('[data-export-demo-data]')?.addEventListener('click', () => {
    if (output) output.value = exportDemoData();
    setStatus('Current demo data exported below.');
  });

  app.querySelector('[data-import-demo-data]')?.addEventListener('click', () => {
    if (!output?.value.trim()) {
      setStatus('Paste exported JSON before importing.');
      return;
    }
    try {
      demoData = replaceDemoData(JSON.parse(output.value));
      setStatus('Imported data and refreshed the current route.');
      render();
    } catch (error) {
      setStatus(`Import failed: ${error.message}`);
    }
  });

  app.querySelector('[data-reset-demo-data]')?.addEventListener('click', () => {
    demoData = resetDemoData();
    if (output) output.value = '';
    setStatus('Demo data reset to the seed file.');
    render();
  });
}

function renderPackageTests(main) {
  main.innerHTML = `
    <section class="page-heading">
      <p class="eyebrow">
        Demo and testing routes
      </p>
      <h1>
        Package-by-package UI test dashboard.
      </h1>
      <p>
        Each package below links to the route that exercises its components. For the developer documentation and stable smoke-test hooks, start with the Component Tests route.
      </p>
    </section>
    <section class="card landing-callout">
      <div class="card-content">
        <p class="eyebrow">
          Developer documentation
        </p>
        <h2>
          Component Tests
        </h2>
        <p class="muted">
          Interactive docs for every package, including runtime attributes, events, live fixtures, markup examples, and suggested smoke checks.
        </p>
        <a class="big-demo-button" href="/component-tests/" data-link>
          Open Component Tests
        </a>
      </div>
    </section>
    <section class="home-grid package-test-grid" aria-label="Package demo and testing routes">
      ${packageTestCards()}
    </section>
  `;
}

function renderHome(main) {
  main.innerHTML = `
    <section class="page-heading">
      <p class="eyebrow">
        Framework-neutral Web Components
      </p>
      <h1>
        Reusable UI Base packages with design consistency built in.
      </h1>
      <p>
        This workspace includes the UI Base design-system foundation, shared core utilities, theme tokens, icons, UI controls, forms, Hero, Calendar, Assets, and a live package-by-package documentation/demo site.
      </p>
    </section>
    <package-browser title="Package Browser">
    </package-browser>
    <section class="home-grid" aria-label="Primary demo routes">
      <a class="card home-card featured-home-card" href="/package-tests/" data-link>
        <span>
          <p class="eyebrow">
            Testing home
          </p>
          <h2>
            Package Test Dashboard
          </h2>
          <p>
            Open the package-by-package route list, including the direct
            <code>
              @ui.base/assets
            </code>
            asset-picker test route.
          </p>
        </span>
        <strong class="big-demo-button">
          Open Package Tests
        </strong>
      </a>
      <a class="card home-card featured-home-card" href="/component-tests/" data-link>
        <span>
          <p class="eyebrow">
            Developer documentation
          </p>
          <h2>
            Component Tests
          </h2>
          <p>
            Open the interactive documentation route for every package, live component fixtures, event logs, option lists, and smoke-test-ready anchors.
          </p>
        </span>
        <strong class="big-demo-button">
          Open Component Tests
        </strong>
      </a>
      <a class="card home-card" href="/design-system/" data-link>
        <span>
          <h2>
            Design System
          </h2>
          <p>
            Principles, accessibility standards, component lifecycle, package roadmap, and design tokens.
          </p>
        </span>
        <strong class="primary-button">
          Open Design System
        </strong>
      </a>
      <a class="card home-card" href="/components/" data-link>
        <span>
          <h2>
            Component Catalog
          </h2>
          <p>
            Live examples for labels, help, menus, icons, layout stubs, and form stubs.
          </p>
        </span>
        <strong class="primary-button">
          Open Components
        </strong>
      </a>
      <a class="card home-card" href="/assets-demo/picker" data-link>
        <span>
          <p class="eyebrow">
            @ui.base/assets
          </p>
          <h2>
            Asset Picker Test
          </h2>
          <p>
            Direct route for the asset picker field, browse modal, upload option, live parent controls, and event payload tests.
          </p>
        </span>
        <strong class="primary-button">
          Open Asset Picker
        </strong>
      </a>
      <a class="card home-card" href="/assets-demo/" data-link>
        <span>
          <h2>
            Assets Package
          </h2>
          <p>
            Browse, pick, upload, edit, archive, version, and permission-check reusable assets using
            <code>
              @ui.base/assets
            </code>
            .
          </p>
        </span>
        <strong class="primary-button">
          Open Assets Demo
        </strong>
      </a>
      <a class="card home-card" href="/assets/" data-link>
        <span>
          <h2>
            Asset Components
          </h2>
          <p>
            Focused pages for every
            <code>
              @ui.base/assets
            </code>
            component with public prop controls and mock-data previews.
          </p>
        </span>
        <strong class="primary-button">
          Open Assets
        </strong>
      </a>
      <a class="card home-card" href="/ui-controls/" data-link>
        <span>
          <h2>
            Controls
          </h2>
          <p>
            Compact accessible toggle and checkbox components with shared attributes and events.
          </p>
        </span>
        <strong class="primary-button">
          Open Controls
        </strong>
      </a>
      <a class="card home-card" href="/ui/" data-link>
        <span>
          <h2>
            UI Primitives
          </h2>
          <p>
            Focused pages for every
            <code>
              @ui.base/ui
            </code>
            component with public prop controls and live previews.
          </p>
        </span>
        <strong class="primary-button">
          Open UI
        </strong>
      </a>
      <a class="card home-card" href="/forms/" data-link>
        <span>
          <h2>
            Forms
          </h2>
          <p>
            Focused pages for every
            <code>
              @ui.base/forms
            </code>
            component with derived public prop controls and live previews.
          </p>
        </span>
        <strong class="primary-button">
          Open Forms
        </strong>
      </a>
      <a class="card home-card" href="/calendar/" data-link>
        <span>
          <h2>
            Calendar
          </h2>
          <p>
            Focused pages for every
            <code>
              @ui.base/calendar
            </code>
            component with public prop controls and parent-state event handling.
          </p>
        </span>
        <strong class="primary-button">
          Open Calendar
        </strong>
      </a>
      <a class="card home-card" href="/calendar-demo/" data-link>
        <span>
          <h2>
            Calendar Components
          </h2>
          <p>
            Day, week, month, year, date window, and day-of-week views controlled by parent state.
          </p>
        </span>
        <strong class="primary-button">
          Open Calendar Demo
        </strong>
      </a>
      <article class="card home-card">
        <span>
          <h2>
            Hero Component
          </h2>
          <p>
            Documented page hero with headline, CTAs, navigation, visual, trust signal, and detail bullets.
          </p>
        </span>
        <div class="button-row" aria-label="Hero demo routes">
          <a class="primary-button" href="/hero/" data-link>
            Open Hero Route
          </a>
          <a class="secondary-button" href="/hero/sample-site" data-link>
            Sample Site
          </a>
          <a class="secondary-button" href="/hero/asset-backed-details" data-link>
            Asset-backed Details
          </a>
        </div>
      </article>
      <article class="card home-card">
        <span>
          <h2>
            Action Components
          </h2>
          <p>
            Reusable action components exported from
            <code>
              @ui.base/tour-ui
            </code>
            for common workflow actions.
          </p>
        </span>
        <div class="button-row" aria-label="Action component demo routes">
          <a class="primary-button" href="/tour-ui/" data-link>
            Open Actions
          </a>
          <a class="secondary-button" href="/tour-ui/new-reservation" data-link>
            New Action
          </a>
        </div>
      </article>
    </section>
    <section class="home-grid package-test-grid" aria-label="Package demo and testing routes">
      ${packageTestCards()}
    </section>
  `;
}

function render() {
  const main = shell();
  bindDataControls();
  const path = normalizePath(window.location.pathname);

  if (path === '/' || path === '/index.html') {
    renderHome(main);
  } else if (path === '/component-tests' || path.startsWith('/component-tests/')) {
    renderComponentTestsRoute(main);
  } else if (path === '/package-tests' || path.startsWith('/package-tests/')) {
    renderPackageTests(main);
  } else if (path === '/design-system' || path.startsWith('/design-system/')) {
    renderDesignSystemRoute(main);
  } else if (path === '/components' || path.startsWith('/components/')) {
    renderComponentCatalogRoute(main, demoData.components?.componentCatalog);
  } else if (path === '/ui' || path.startsWith('/ui/')) {
    renderUiRoute(main, path);
  } else if (path === '/assets' || path.startsWith('/assets/')) {
    renderAssetsPackageRoute(main, path);
  } else if (path === '/assets-demo' || path.startsWith('/assets-demo/')) {
    renderAssetsRoute(main, path, demoData);
  } else if (path === '/calendar' || path.startsWith('/calendar/')) {
    renderCalendarPackageRoute(main, path);
  } else if (path === '/calendar-demo' || path.startsWith('/calendar-demo/')) {
    renderCalendarRoute(main, path, demoData.routes?.calendar);
  } else if (path === '/ui-controls' || path.startsWith('/ui-controls/')) {
    renderUiControlsRoute(main);
  } else if (path === '/forms' || path.startsWith('/forms/')) {
    renderFormsRoute(main, path);
  } else if (path === '/hero' || path.startsWith('/hero/')) {
    renderHeroRoute(main, path);
  } else if (path === '/tour-ui' || path.startsWith('/tour-ui/')) {
    renderTourUiRoute(main, path);
  } else {
    main.innerHTML = `
      <section class="page-heading">
        <h1>
          Page not found
        </h1>
        <p>
          The requested route does not exist. Use the demo links below.
        </p>
      </section>
      <div class="route-list">
        <a class="route-button" href="/package-tests/" data-link>
          Package Tests
        </a>
        <a class="route-button" href="/component-tests/" data-link>
          Component Tests
        </a>
        <a class="route-button" href="/design-system/" data-link>
          Design System
        </a>
        <a class="route-button" href="/components/" data-link>
          Components
        </a>
        <a class="route-button" href="/ui/" data-link>
          UI
        </a>
        <a class="route-button" href="/ui-controls/" data-link>
          Controls
        </a>
        <a class="route-button" href="/forms/" data-link>
          Forms
        </a>
        <a class="route-button" href="/calendar/" data-link>
          Calendar
        </a>
        <a class="route-button" href="/assets/" data-link>
          Assets
        </a>
        <a class="route-button" href="/assets-demo/" data-link>
          Assets Demo
        </a>
        <a class="route-button" href="/assets-demo/picker" data-link>
          Asset Picker
        </a>
        <a class="route-button" href="/calendar-demo/" data-link>
          Calendar Demo
        </a>
        <a class="route-button" href="/hero/" data-link>
          Hero Demo
        </a>
        <a class="route-button" href="/hero/asset-backed-details" data-link>
          Hero Asset-backed Details
        </a>
        <a class="route-button" href="/tour-ui/" data-link>
          Action Demo
        </a>
      </div>
    `;
  }

  main.focus({ preventScroll: true });
}

document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a[data-link]');
  if (!anchor) return;
  const url = new URL(anchor.href, window.location.origin);
  if (url.origin !== window.location.origin) return;
  event.preventDefault();
  window.history.pushState({}, '', url.pathname + url.search + url.hash);
  render();
});

document.addEventListener('package-browser-navigate', (event) => {
  const href = event.detail?.href;
  if (!href) return;
  const url = new URL(href, window.location.origin);
  if (url.origin !== window.location.origin) return;
  window.history.pushState({}, '', url.pathname + url.search + url.hash);
  render();
});

window.addEventListener('popstate', render);
render();
