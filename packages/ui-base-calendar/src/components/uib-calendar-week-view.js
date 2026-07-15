/**
 * uib-calendar-week-view
 *
 * Shows seven consecutive days beginning with start-date.
 * Attributes:
 * - start-date: ISO date used as the first visible day.
 * - selected-date: Optional ISO date to highlight.
 * Events:
 * - uib-calendar-date-select with detail.date when a day is selected.
 */
import { DAY_NAMES, addDays, baseCalendarStyles, dispatchDateSelect, escapeHtml, isSameDay, registerCalendarElement, toDate, toIsoDate } from './calendar-utils.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibCalendarWeekView extends BaseHTMLElement {
  static get observedAttributes() { return ['start-date', 'selected-date']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  render() {
    const start = toDate(this.getAttribute('start-date'));
    const selected = this.getAttribute('selected-date') || '';
    const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));
    this.shadowRoot.innerHTML = `
      <style>${baseCalendarStyles}
        .week-grid { grid-template-columns: repeat(7, minmax(0, 1fr)); }
        .weekday { display: block; color: var(--uib-color-muted,#53657f); font-size: 0.72rem; font-weight: 850; text-transform: uppercase; }
        .day-number { display: block; margin-top: 0.25rem; font-size: 1.15rem; }
        @media (max-width: 700px) { .week-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      </style>
      <section class="calendar-card" part="card" aria-label="Week view">
        <div class="calendar-header" part="header">
          <div>
            <h2 class="calendar-title" part="title">Week View</h2>
            <p class="calendar-subtitle" part="subtitle">${escapeHtml(toIsoDate(days[0]))} through ${escapeHtml(toIsoDate(days[6]))}</p>
          </div>
        </div>
        <div class="grid week-grid" part="grid">
          ${days.map((day) => `
            <button class="date-button" part="date-button${selected && isSameDay(day, selected) ? ' selected-date' : ''}" type="button" data-date="${escapeHtml(toIsoDate(day))}" aria-current="${selected && isSameDay(day, selected) ? 'date' : 'false'}">
              <span class="weekday" part="day-label">${DAY_NAMES[day.getDay()]}</span>
              <span class="day-number" part="day-number">${day.getDate()}</span>
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

registerCalendarElement('uib-calendar-week-view', UibCalendarWeekView);
