import { BaseHTMLElement, attr, defineAppManagerElement, escapeHtml, passClientAttributes } from '../utils/dom.js';

interface RouteState {
  name: 'applications' | 'heroes' | 'hero-editor' | 'assets' | 'asset-editor';
  applicationKey?: string;
  heroKey?: string;
  assetId?: string;
}

function parseRoute(): RouteState {
  const hash = window.location.hash || '#/applications';
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);

  if (parts[0] === 'applications' && parts[1] && parts[2] === 'assets' && parts[3]) {
    return { name: 'asset-editor', applicationKey: parts[1], assetId: parts[3] };
  }

  if (parts[0] === 'applications' && parts[1] && parts[2] === 'assets') {
    return { name: 'assets', applicationKey: parts[1] };
  }

  if (parts[0] === 'applications' && parts[1] && parts[2] === 'heroes' && parts[3]) {
    return { name: 'hero-editor', applicationKey: parts[1], heroKey: parts[3] };
  }

  if (parts[0] === 'applications' && parts[1] && parts[2] === 'heroes') {
    return { name: 'heroes', applicationKey: parts[1] };
  }

  return { name: 'applications' };
}

function routeTitle(route: RouteState): string {
  if (route.name === 'asset-editor') return 'Edit asset';
  if (route.name === 'assets') return 'Application assets';
  if (route.name === 'hero-editor') return route.heroKey === 'new' ? 'Create hero' : 'Edit hero';
  if (route.name === 'heroes') return 'Application heroes';
  return 'Applications';
}

export class UibApplicationManager extends BaseHTMLElement {
  static get observedAttributes() {
    return ['orm-base-url', 'iam-base-url', 'dev-actor-id', 'dev-token'];
  }

  private route: RouteState = { name: 'applications' };

  connectedCallback() {
    this.route = parseRoute();
    window.addEventListener('hashchange', this.handleHashChange);
    this.addEventListener('uib-application-selected', this.handleApplicationSelected as EventListener);
    this.addEventListener('uib-hero-edit-requested', this.handleHeroEditRequested as EventListener);
    this.addEventListener('uib-hero-created', this.handleHeroCreated as EventListener);
    this.addEventListener('uib-asset-edit-requested', this.handleAssetEditRequested as EventListener);
    this.addEventListener('uib-asset-created', this.handleAssetCreated as EventListener);
    this.render();
  }

  disconnectedCallback() {
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  private handleHashChange = () => {
    this.route = parseRoute();
    this.render();
  };

  private handleApplicationSelected = (event: CustomEvent<{ applicationKey: string }>) => {
    window.location.hash = `#/applications/${encodeURIComponent(event.detail.applicationKey)}/heroes`;
  };

  private handleHeroEditRequested = (event: CustomEvent<{ applicationKey: string; heroKey: string }>) => {
    window.location.hash = `#/applications/${encodeURIComponent(event.detail.applicationKey)}/heroes/${encodeURIComponent(event.detail.heroKey)}`;
  };

  private handleHeroCreated = (event: CustomEvent<{ applicationKey: string; heroKey: string }>) => {
    window.location.hash = `#/applications/${encodeURIComponent(event.detail.applicationKey)}/heroes/${encodeURIComponent(event.detail.heroKey)}`;
  };

  private handleAssetEditRequested = (event: CustomEvent<{ applicationKey: string; assetId: string }>) => {
    window.location.hash = `#/applications/${encodeURIComponent(event.detail.applicationKey)}/assets/${encodeURIComponent(event.detail.assetId)}`;
  };

  private handleAssetCreated = (event: CustomEvent<{ applicationKey: string; assetId: string }>) => {
    window.location.hash = `#/applications/${encodeURIComponent(event.detail.applicationKey)}/assets/${encodeURIComponent(event.detail.assetId)}`;
  };

  private navMarkup(): string {
    const route = this.route;
    const applicationsCurrent = route.name === 'applications' ? ' aria-current="page"' : '';
    const heroesHref = route.applicationKey ? `#/applications/${encodeURIComponent(route.applicationKey)}/heroes` : '#/applications';
    const heroesCurrent = route.name === 'heroes' || route.name === 'hero-editor' ? ' aria-current="page"' : '';
    const createHeroHref = route.applicationKey ? `#/applications/${encodeURIComponent(route.applicationKey)}/heroes/new` : '#/applications';
    const assetsHref = route.applicationKey ? `#/applications/${encodeURIComponent(route.applicationKey)}/assets` : '#/applications';
    const assetsCurrent = route.name === 'assets' || route.name === 'asset-editor' ? ' aria-current="page"' : '';

    return `
      <nav class="uibam-route-tabs" aria-label="Application manager routes">
        <a href="#/applications"${applicationsCurrent}>Applications</a>
        <a href="${attr(heroesHref)}"${heroesCurrent}>Heroes${route.applicationKey ? ` for ${escapeHtml(route.applicationKey)}` : ''}</a>
        ${route.applicationKey ? `<a href="${attr(createHeroHref)}" ${route.heroKey === 'new' ? 'aria-current="page"' : ''}>Create hero</a>` : ''}
        ${route.applicationKey ? `<a href="${attr(assetsHref)}"${assetsCurrent}>Assets</a>` : ''}
      </nav>`;
  }

  private routeContent(): string {
    const attrs = passClientAttributes(this);
    if (this.route.name === 'assets' && this.route.applicationKey) {
      return `<uib-application-asset-list ${attrs} application-key="${attr(this.route.applicationKey)}"></uib-application-asset-list>`;
    }
    if (this.route.name === 'asset-editor' && this.route.applicationKey && this.route.assetId) {
      return `<uib-application-asset-editor ${attrs} application-key="${attr(this.route.applicationKey)}" asset-id="${attr(this.route.assetId)}"></uib-application-asset-editor>`;
    }
    if (this.route.name === 'heroes' && this.route.applicationKey) {
      return `<uib-application-hero-list ${attrs} application-key="${attr(this.route.applicationKey)}"></uib-application-hero-list>`;
    }
    if (this.route.name === 'hero-editor' && this.route.applicationKey && this.route.heroKey) {
      return `<uib-application-hero-editor ${attrs} application-key="${attr(this.route.applicationKey)}" hero-key="${attr(this.route.heroKey)}"></uib-application-hero-editor>`;
    }
    return `<uib-application-list ${attrs}></uib-application-list>`;
  }

  render() {
    const route = this.route;
    this.innerHTML = `
      <main id="app" class="uibam-shell">
        <header class="uibam-topbar">
          <div>
            <p class="uibam-kicker">UI Base Application Manager</p>
            <h1 class="uibam-title">${escapeHtml(routeTitle(route))}</h1>
            <p class="uibam-subtitle">Manage application_info, application_hero, and app-scoped application_asset records with ORM-backed CRUD and I-AM-aware client context.</p>
          </div>
          <div class="uibam-status-line" aria-label="Development identity">
            <span class="uibam-badge uibam-badge--muted">dev mode</span>
            <span>Actor: ${escapeHtml(this.getAttribute('dev-actor-id') || 'original-creator')}</span>
          </div>
        </header>
        ${this.navMarkup()}
        ${this.routeContent()}
      </main>
    `;
  }
}

defineAppManagerElement('uib-application-manager', UibApplicationManager);
