/**
 * uib-date-window-view
 *
 * Shows a contiguous window of dates. This is different from day-of-week view
 * because every consecutive day is shown.
 * Attributes:
 * - start-date: First visible ISO date.
 * - days: Number of consecutive dates to show.
 * - selected-date: Optional ISO date to highlight.
 * Events:
 * - uib-calendar-date-select with detail.date when a day is selected.
 */
import { DAY_NAMES, addDays, baseCalendarStyles, dispatchDateSelect, escapeHtml, isSameDay, parseNumber, registerCalendarElement, toDate, toIsoDate } from './calendar-utils.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibDateWindowView extends BaseHTMLElement {
  static get observedAttributes() { return ['start-date', 'days', 'selected-date']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  render() {
    const start = toDate(this.getAttribute('start-date'));
    const count = Math.min(31, Math.max(1, parseNumber(this.getAttribute('days'), 10)));
    const selected = this.getAttribute('selected-date') || '';
    const dates = Array.from({ length: count }, (_, index) => addDays(start, index));
    this.shadowRoot.innerHTML = `
      <style>${baseCalendarStyles}
        .window-grid { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }
        .weekday { display: block; color: var(--uib-color-muted,#53657f); font-size: 0.72rem; font-weight: 850; text-transform: uppercase; }
        .day-number { display: block; margin-top: 0.25rem; font-size: 1.15rem; }
      </style>
      <section class="calendar-card" part="card" aria-label="Date window view">
        <div class="calendar-header" part="header">
          <div>
            <h2 class="calendar-title" part="title">Date Window View</h2>
            <p class="calendar-subtitle" part="subtitle">${escapeHtml(count)} consecutive dates starting ${escapeHtml(toIsoDate(start))}</p>
          </div>
        </div>
        <div class="grid window-grid" part="grid">
          ${dates.map((day) => `
            <button class="date-button" part="date-button${selected && isSameDay(day, selected) ? ' selected-date' : ''}" type="button" data-date="${escapeHtml(toIsoDate(day))}" aria-current="${selected && isSameDay(day, selected) ? 'date' : 'false'}">
              <span class="weekday" part="day-label">${DAY_NAMES[day.getDay()]}</span>
              <span class="day-number" part="day-number">${day.getMonth() + 1}/${day.getDate()}</span>
            </button>
          `).join('')}
        </div>
      </section>
    `;
    this.shadowRoot.querySelectorAll('[data-date]').forEach((button) => {
      button.addEventListener('click', () => dispatchDateSelect(this, toDate(button.dataset.date)));
    });
  }
}

registerCalendarElement('uib-date-window-view', UibDateWindowView);
