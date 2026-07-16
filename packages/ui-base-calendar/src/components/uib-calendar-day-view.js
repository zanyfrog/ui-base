/**
 * uib-calendar-day-view
 *
 * Shows one date. The parent owns state and updates the date attribute.
 * Attributes:
 * - date: ISO date in YYYY-MM-DD format.
 * Events:
 * - uib-calendar-date-select with detail.date when the day is selected.
 */
import { baseCalendarStyles, dispatchDateSelect, escapeHtml, formatLong, registerCalendarElement, toDate } from './calendar-utils.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibCalendarDayView extends BaseHTMLElement {
  static get observedAttributes() { return ['date']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  render() {
    const date = toDate(this.getAttribute('date'));
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (baseCalendarStyles) +
  ` .day-panel { padding: 1.25rem; } .day-date { margin: 0; font-size: clamp(2rem, 7vw, 4.5rem); line-height: 1; font-weight: 900; } .day-name { margin: 0.35rem 0 1rem; font-size: 1.1rem; color: var(--uib-color-muted,#53657f); } ` +
  `</style>` +
  `<section class="calendar-card" part="card" aria-label="Day view">` +
  `<div class="calendar-header" part="header">` +
  `<div>` +
  `<h2 class="calendar-title" part="title">` +
  ` Day View ` +
  `</h2>` +
  `<p class="calendar-subtitle" part="subtitle">` +
  ` A single date controlled by the parent. ` +
  `</p>` +
  `</div>` +
  `</div>` +
  `<div class="day-panel" part="body">` +
  `<p class="day-date" part="day-date">` +
  ` ` +
  (date.getDate()) +
  ` ` +
  `</p>` +
  `<p class="day-name" part="day-name">` +
  ` ` +
  (escapeHtml(formatLong(date))) +
  ` ` +
  `</p>` +
  `<button type="button" part="action" data-date="` +
  (escapeHtml(date.toISOString())) +
  `"> Select this day ` +
  `</button>` +
  `</div>` +
  `</section>`
);
    this.shadowRoot.querySelector('button').addEventListener('click', () => dispatchDateSelect(this, date));
  }
}

registerCalendarElement('uib-calendar-day-view', UibCalendarDayView);
