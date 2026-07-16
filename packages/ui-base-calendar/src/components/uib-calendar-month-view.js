/**
 * uib-calendar-month-view
 *
 * Shows a month grid. Empty cells are used before and after the visible month.
 * Attributes:
 * - year: Four digit year.
 * - month: Month number from 1 to 12.
 * - selected-date: Optional ISO date to highlight.
 * Events:
 * - uib-calendar-date-select with detail.date when a day is selected.
 */
import { DAY_NAMES, MONTH_NAMES, baseCalendarStyles, daysInMonth, dispatchDateSelect, escapeHtml, firstDayOfMonth, isSameDay, parseNumber, registerCalendarElement, toDate, toIsoDate } from './calendar-utils.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibCalendarMonthView extends BaseHTMLElement {
  static get observedAttributes() { return ['year', 'month', 'selected-date']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  render() {
    const today = new Date();
    const year = parseNumber(this.getAttribute('year'), today.getFullYear());
    const month = Math.min(12, Math.max(1, parseNumber(this.getAttribute('month'), today.getMonth() + 1)));
    const selected = this.getAttribute('selected-date') || '';
    const first = firstDayOfMonth(year, month);
    const count = daysInMonth(year, month);
    const blanksBefore = first.getDay();
    const days = Array.from({ length: count }, (_, index) => new Date(year, month - 1, index + 1));
    const blanksAfter = (7 - ((blanksBefore + count) % 7)) % 7;
    this.shadowRoot.innerHTML = (
  `<style>` +
  ` ` +
  (baseCalendarStyles) +
  ` .month-grid { grid-template-columns: repeat(7, minmax(0, 1fr)); } .day-label { padding: 0.3rem 0; color: var(--uib-color-muted,#53657f); text-align: center; font-size: 0.75rem; font-weight: 850; text-transform: uppercase; } .empty { min-height: 3.2rem; border-radius: 12px; background: #f6f8fc; } @media (max-width: 560px) { .month-grid { gap: 0.35rem; } .date-button, .empty { min-height: 2.7rem; } } ` +
  `</style>` +
  `<section class="calendar-card" part="card" aria-label="Month view">` +
  `<div class="calendar-header" part="header">` +
  `<div>` +
  `<h2 class="calendar-title" part="title">` +
  ` ` +
  (MONTH_NAMES[month - 1]) +
  ` ` +
  (year) +
  ` ` +
  `</h2>` +
  `<p class="calendar-subtitle" part="subtitle">` +
  ` Parent controls year, month, and selected date. ` +
  `</p>` +
  `</div>` +
  `</div>` +
  `<div class="grid month-grid" part="grid">` +
  ` ` +
  (DAY_NAMES.map((name) => `<div class="day-label" part="day-label">${name}</div>`).join('')) +
  ` ` +
  (Array.from({ length: blanksBefore }, () => '<div class="empty" aria-hidden="true"></div>').join('')) +
  ` ` +
  (days.map((day) => `
            <button class="date-button" part="date-button${selected && isSameDay(day, selected) ? ' selected-date' : ''}" type="button" data-date="${escapeHtml(toIsoDate(day))}" aria-current="${selected && isSameDay(day, selected) ? 'date' : 'false'}">${day.getDate()}</button>
            `).join('')) +
  ` ` +
  (Array.from({ length: blanksAfter }, () => '<div class="empty" aria-hidden="true"></div>').join('')) +
  ` ` +
  `</div>` +
  `</section>`
);
    this.shadowRoot.querySelectorAll('[data-date]').forEach((button) => {
      button.addEventListener('click', () => dispatchDateSelect(this, toDate(button.dataset.date)));
    });
  }
}

registerCalendarElement('uib-calendar-month-view', UibCalendarMonthView);
