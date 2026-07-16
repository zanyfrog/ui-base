/**
 * uib-calendar-year-view
 *
 * Shows twelve months for a year.
 * Attributes:
 * - year: Four digit year.
 * - selected-month: Optional month number from 1 to 12.
 * Events:
 * - uib-calendar-month-select with detail.year and detail.month.
 */
import { MONTH_NAMES, baseCalendarStyles, escapeHtml, parseNumber, registerCalendarElement } from './calendar-utils.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibCalendarYearView extends BaseHTMLElement {
  static get observedAttributes() { return ['year', 'selected-month']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  render() {
    const today = new Date();
    const year = parseNumber(this.getAttribute('year'), today.getFullYear());
    const selectedMonth = parseNumber(this.getAttribute('selected-month'), 0);
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (baseCalendarStyles) +
  ` .year-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } .month-button { min-height: 5rem; } .month-button[aria-current="date"] { background: var(--uib-color-primary,#174a8b); color: var(--uib-color-primary-contrast,#fff); border-color: var(--uib-color-primary,#174a8b); } @media (max-width: 700px) { .year-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } } ` +
  `</style>` +
  `<section class="calendar-card" part="card" aria-label="Year view">` +
  `<div class="calendar-header" part="header">` +
  `<div>` +
  `<h2 class="calendar-title" part="title">` +
  ` ` +
  (year) +
  ` ` +
  `</h2>` +
  `<p class="calendar-subtitle" part="subtitle">` +
  ` Select a month and let the parent decide the next view. ` +
  `</p>` +
  `</div>` +
  `</div>` +
  `<div class="grid year-grid" part="grid">` +
  ` ` +
  (MONTH_NAMES.map((name, index) => `
            <button class="month-button" part="month-button${selectedMonth === index + 1 ? ' selected-month' : ''}" type="button" data-month="${index + 1}" aria-current="${selectedMonth === index + 1 ? 'date' : 'false'}">${escapeHtml(name)}</button>
            `).join('')) +
  ` ` +
  `</div>` +
  `</section>`
);
    this.shadowRoot.querySelectorAll('[data-month]').forEach((button) => {
      button.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('uib-calendar-month-select', {
          bubbles: true,
          composed: true,
          detail: { year, month: Number(button.dataset.month) }
        }));
      });
    });
  }
}

registerCalendarElement('uib-calendar-year-view', UibCalendarYearView);
