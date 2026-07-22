import { discoverPackageBrowserPackages } from './package-browser-data.js';
import { escapeAttr, escapeHtml } from '../routes/demo-utils.js';

const styles = `
:host{display:block;color:var(--text,#13294b);font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}
*{box-sizing:border-box}
.browser{border:1px solid var(--border,#d9e2f0);border-radius:20px;background:var(--surface,#fff);box-shadow:0 14px 40px rgba(10,31,68,.08);overflow:hidden}
details.browser-disclosure>summary{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 1.25rem;cursor:pointer;list-style:none}
details.browser-disclosure>summary::-webkit-details-marker{display:none}
.summary-main{display:grid;gap:.2rem}
.eyebrow{margin:0;color:var(--accent,#174a8b);font-size:.76rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
h2{margin:0;font-size:1.25rem;line-height:1.15}
p{margin:0;color:var(--muted,#53657f);line-height:1.45}
.summary-count{display:inline-flex;align-items:center;justify-content:center;min-width:2.2rem;height:2.2rem;padding:0 .55rem;border:1px solid var(--border,#d9e2f0);border-radius:999px;background:var(--surface-soft,#f8fbff);font-weight:900}
.content{display:grid;gap:1rem;padding:0 1.25rem 1.25rem}
.filter-field{display:grid;gap:.35rem}
.filter-field label{color:var(--muted,#53657f);font-size:.85rem;font-weight:850}
.filter-field input{width:100%;min-height:2.75rem;padding:.7rem .85rem;border:1px solid var(--border,#d9e2f0);border-radius:12px;background:#fff;color:inherit;font:inherit}
.package-list{display:grid;gap:.7rem}
.package{border:1px solid var(--border,#d9e2f0);border-radius:14px;background:var(--surface-soft,#f8fbff);overflow:hidden}
.package>summary{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.85rem 1rem;cursor:pointer;list-style:none}
.package>summary::-webkit-details-marker{display:none}
.package-title{min-width:0;display:grid;gap:.15rem}
.package-title strong{font-size:.98rem}
.package-title span{color:var(--muted,#53657f);font-size:.82rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.status{flex:0 0 auto;display:inline-flex;align-items:center;gap:.35rem;min-height:1.75rem;padding:.25rem .55rem;border:1px solid rgba(23,74,139,.22);border-radius:999px;background:#fff;color:var(--muted,#53657f);font-size:.78rem;font-weight:850}
.components{display:grid;gap:.45rem;padding:0 1rem 1rem}
.component-link,.component-disabled{display:grid;gap:.25rem;width:100%;padding:.7rem .8rem;border:1px solid var(--border,#d9e2f0);border-radius:12px;background:#fff;text-align:left;text-decoration:none;color:inherit;font:inherit}
.component-link{cursor:pointer}
.component-link:hover{border-color:rgba(23,74,139,.45);box-shadow:0 8px 22px rgba(10,31,68,.08)}
.component-disabled{opacity:.64;cursor:not-allowed}
.component-link code,.component-disabled code{font-size:.9rem;font-weight:900}
.component-link span,.component-disabled span{color:var(--muted,#53657f);font-size:.82rem;line-height:1.35}
.empty{padding:.85rem 1rem;color:var(--muted,#53657f);font-size:.9rem}
.load-note{padding:.85rem 1rem;border:1px dashed var(--border,#d9e2f0);border-radius:12px;background:#fff;color:var(--muted,#53657f);font-size:.88rem}
@media (max-width:640px){details.browser-disclosure>summary,.package>summary{align-items:flex-start;flex-direction:column}.content{padding-inline:1rem}.summary-count,.status{align-self:flex-start}}
`;

export class PackageBrowser extends HTMLElement {
  static get observedAttributes() {
    return ['open', 'title'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._packages = null;
    this._filter = '';
    this._loading = false;
    this._open = false;
  }

  connectedCallback() {
    this._open = this.hasAttribute('open');
    this.render();
    if (!this._packages && !this._loading) this.loadDefaultPackages();
  }

  attributeChangedCallback() {
    if (this.isConnected) this._open = this.hasAttribute('open');
    if (this.isConnected) this.render();
  }

  get packages() {
    return this._packages || [];
  }

  set packages(value) {
    this._packages = this.normalizePackages(Array.isArray(value) ? value : []);
    this._loading = false;
    if (this.isConnected) this.render();
  }

  async loadDefaultPackages() {
    this._loading = true;
    this.render();
    this.packages = await discoverPackageBrowserPackages();
  }

  normalizePackages(packages) {
    return packages.map((pkg) => ({
      name: pkg.name || pkg.package || 'Package',
      path: pkg.path || '',
      workspacePath: pkg.workspacePath || pkg.path || '',
      summary: pkg.summary || '',
      status: pkg.status || 'loaded',
      importError: pkg.importError || '',
      components: (pkg.components || []).map((component) => ({
        tagName: component.tagName || component.name || '',
        title: component.title || component.tagName || component.name || '',
        purpose: component.purpose || component.summary || '',
        route: component.route || ''
      })).filter((component) => component.tagName)
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  filteredPackages() {
    const query = this._filter.trim().toLowerCase();
    if (!query) return this.packages;

    return this.packages
      .map((pkg) => {
        const packageMatches = [pkg.name, pkg.path, pkg.summary].some((value) => String(value || '').toLowerCase().includes(query));
        const components = pkg.components.filter((component) => (
          packageMatches ||
          [component.tagName, component.title, component.purpose].some((value) => String(value || '').toLowerCase().includes(query))
        ));
        if (packageMatches) return pkg;
        return components.length ? { ...pkg, components } : null;
      })
      .filter(Boolean);
  }

  componentCount(packages = this.packages) {
    return packages.reduce((total, pkg) => total + (pkg.components?.length || 0), 0);
  }

  bindEvents() {
    const disclosure = this.shadowRoot.querySelector('.browser-disclosure');
    disclosure?.addEventListener('toggle', (event) => {
      this._open = event.currentTarget.open;
    });

    const filter = this.shadowRoot.querySelector('[data-filter]');
    filter?.addEventListener('input', (event) => {
      const selectionStart = event.target.selectionStart;
      const selectionEnd = event.target.selectionEnd;
      this._filter = event.target.value;
      this._open = true;
      this.render();
      const nextFilter = this.shadowRoot.querySelector('[data-filter]');
      nextFilter?.focus({ preventScroll: true });
      if (typeof nextFilter?.setSelectionRange === 'function') {
        nextFilter.setSelectionRange(selectionStart, selectionEnd);
      }
    });

    this.shadowRoot.querySelectorAll('[data-route]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const href = event.currentTarget.getAttribute('href');
        this.dispatchEvent(new CustomEvent('package-browser-navigate', {
          bubbles: true,
          composed: true,
          detail: { href }
        }));
      });
    });
  }

  renderComponent(component) {
    const label = component.purpose || (component.route ? 'Open focused demo.' : 'No focused demo route is available yet.');
    if (!component.route) {
      return `
        <div class="component-disabled" aria-disabled="true">
          <code>${escapeHtml(component.tagName)}</code>
          <span>${escapeHtml(label)}</span>
        </div>
      `;
    }

    return `
      <a class="component-link" href="${escapeAttr(component.route)}" data-route>
        <code>
          ${escapeHtml(component.tagName)}
        </code>
        <span>
          ${escapeHtml(label)}
        </span>
      </a>
    `;
  }

  renderPackage(pkg) {
    const count = pkg.components?.length || 0;
    const statusLabel = pkg.importError ? 'partial' : `${count} component${count === 1 ? '' : 's'}`;
    const shouldOpen = Boolean(this._filter.trim());
    return `
      <details class="package" ${shouldOpen ? 'open' : ''}>
        <summary>
          <span class="package-title">
            <strong>${escapeHtml(pkg.name)}</strong>
            <span>${escapeHtml(pkg.workspacePath || pkg.path || pkg.importSpecifier || pkg.summary || 'ui-base workspace package')}</span>
          </span>
          <span class="status">${escapeHtml(statusLabel)}</span>
        </summary>
        <div class="components">
          ${pkg.importError ? `<div class="load-note">Runtime import note: ${escapeHtml(pkg.importError)}</div>` : ''}
          ${count ? pkg.components.map((component) => this.renderComponent(component)).join('') : '<div class="empty">No public components documented.</div>'}
        </div>
      </details>
    `;
  }

  render() {
    const packages = this.filteredPackages();
    const title = this.getAttribute('title') || 'Package Browser';
    const isOpen = this._open || this.hasAttribute('open');

    this.shadowRoot.innerHTML = `
      <style>
        ${styles}
      </style>
      <section class="browser">
        <details class="browser-disclosure" ${isOpen ? 'open' : ''}>
          <summary>
            <span class="summary-main">
              <span class="eyebrow">
                Workspace components
              </span>
              <h2>
                ${escapeHtml(title)}
              </h2>
              <p>
                Browse packages and jump to focused component demos when available.
              </p>
            </span>
            <span class="summary-count">
              ${this.componentCount(this.packages)}
            </span>
          </summary>
          <div class="content">
            <div class="filter-field">
              <label for="packageBrowserFilter">
                Filter packages and components
              </label>
              <input id="packageBrowserFilter" data-filter type="search" value="${escapeAttr(this._filter)}" placeholder="Search package or component name">
            </div>
            ${this._loading ? '<div class="load-note">Loading package metadata...</div>' : ''}
            <div class="package-list">
              ${packages.length ? packages.map((pkg) => this.renderPackage(pkg)).join('') : '<div class="empty">No packages match the current filter.</div>'}
            </div>
          </div>
        </details>
      </section>
    `;

    this.bindEvents();
  }
}

if (!customElements.get('package-browser')) {
  customElements.define('package-browser', PackageBrowser);
}
