import type { ShapedRecord, StorageRecord } from '@ui-base/app-manager-api-client';
import { BaseHTMLElement, attr, clientFromElement, defineAppManagerElement, dispatch, escapeHtml, formatError, statusBadge } from '../utils/dom.js';

export class UibApplicationHeroList extends BaseHTMLElement {
  static get observedAttributes() {
    return ['orm-base-url', 'iam-base-url', 'dev-actor-id', 'dev-token', 'application-key'];
  }

  private records: ShapedRecord[] = [];
  private loading = true;
  private error = '';

  connectedCallback() {
    void this.load();
  }

  attributeChangedCallback() {
    if (this.isConnected) void this.load();
  }

  private get applicationKey(): string {
    return this.getAttribute('application-key') || '';
  }

  private async load() {
    if (!this.applicationKey) {
      this.loading = false;
      this.error = 'Select an application before managing heroes.';
      this.render();
      return;
    }
    this.loading = true;
    this.error = '';
    this.render();
    try {
      const result = await clientFromElement(this).listHeroes(this.applicationKey);
      this.records = result.records;
      this.loading = false;
      this.render();
    } catch (error) {
      this.loading = false;
      this.error = formatError(error);
      this.render();
    }
  }

  private async removeHero(heroKey: string) {
    const confirmed = window.confirm(`Remove hero ${heroKey}? This is a soft delete and will set is_active=false.`);
    if (!confirmed) return;
    try {
      await clientFromElement(this).deleteHero(this.applicationKey, heroKey);
      await this.load();
    } catch (error) {
      this.error = formatError(error);
      this.render();
    }
  }

  private bind() {
    this.querySelector('[data-action="create"]')?.addEventListener('click', () => dispatch(this, 'uib-hero-edit-requested', { applicationKey: this.applicationKey, heroKey: 'new' }));
    this.querySelector('[data-action="refresh"]')?.addEventListener('click', () => void this.load());
    this.querySelectorAll<HTMLElement>('[data-action="edit"]').forEach((button) => {
      button.addEventListener('click', () => dispatch(this, 'uib-hero-edit-requested', { applicationKey: this.applicationKey, heroKey: button.dataset.heroKey }));
    });
    this.querySelectorAll<HTMLElement>('[data-action="remove"]').forEach((button) => {
      button.addEventListener('click', () => void this.removeHero(button.dataset.heroKey || ''));
    });
  }

  private rowActionsMarkup(row: StorageRecord): string {
    return `
      <div class="uibam-actions uibam-actions--icons" aria-label="Hero actions for ${attr(row.hero_key)}">
        <button class="uibam-icon-button" type="button" data-action="edit" data-hero-key="${attr(row.hero_key)}" aria-label="View or edit ${attr(row.hero_key)}" title="View or edit hero">
          <span aria-hidden="true">&#9998;</span>
          <span class="uibam-sr-only">View/Edit</span>
        </button>
        <button class="uibam-icon-button uibam-icon-button--danger" type="button" data-action="remove" data-hero-key="${attr(row.hero_key)}" aria-label="Remove ${attr(row.hero_key)}" title="Remove hero">
          <span aria-hidden="true">&#10005;</span>
          <span class="uibam-sr-only">Remove</span>
        </button>
      </div>`;
  }

  private tableMarkup(): string {
    if (this.loading) return '<div class="uibam-loading">Loading heroes...</div>';
    if (this.error) return `<div class="uibam-error" role="alert">${escapeHtml(this.error)}</div>`;
    if (!this.records.length) return '<div class="uibam-empty">No heroes found for this application. Create a hero to begin.</div>';

    return `
      <div class="uibam-table-wrap">
        <table class="uibam-table">
          <thead>
            <tr>
              <th class="uibam-actions-column">Actions</th>
              <th>Hero</th>
              <th>Key</th>
              <th>Route</th>
              <th>Placement</th>
              <th>Audience</th>
              <th>Status</th>
              <th>Sort</th>
            </tr>
          </thead>
          <tbody>
            ${this.records.map((item) => {
              const row = item.storageRecord;
              return `
                <tr>
                  <td class="uibam-actions-cell">${this.rowActionsMarkup(row)}</td>
                  <td><strong>${escapeHtml(row.name || row.headline || row.hero_key)}</strong><br /><span>${escapeHtml(row.headline || '')}</span></td>
                  <td><code>${escapeHtml(row.hero_key)}</code></td>
                  <td>${escapeHtml(row.route_path)}</td>
                  <td>${escapeHtml(row.placement)}</td>
                  <td>${escapeHtml(row.audience_type || 'public')}${row.audience_key ? `: ${escapeHtml(row.audience_key)}` : ''}</td>
                  <td>${statusBadge(row.is_active)}</td>
                  <td>${escapeHtml(row.sort_order)}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }

  render() {
    this.innerHTML = `
      <section class="uibam-card">
        <div class="uibam-card-header">
          <div>
            <h2>Heroes for ${escapeHtml(this.applicationKey)}</h2>
            <p class="uibam-subtitle">List, create, update, and remove application_hero records for the active application.</p>
          </div>
          <div class="uibam-actions">
            <button class="uibam-button" type="button" data-action="create">Add hero</button>
            <button class="uibam-button-secondary" type="button" data-action="refresh">Refresh</button>
          </div>
        </div>
        <div class="uibam-card-body">
          ${this.tableMarkup()}
        </div>
      </section>
    `;
    this.bind();
  }
}

defineAppManagerElement('uib-application-hero-list', UibApplicationHeroList);
