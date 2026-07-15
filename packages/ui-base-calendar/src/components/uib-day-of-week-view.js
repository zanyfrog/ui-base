/**
 * uib-day-of-week-view
 *
 * Shows repeated instances of one day of week, such as every Tuesday for the
 * next N weeks. This is different from date-window view because only the chosen
 * weekday is displayed.
 *
 * Attributes:
 * - day-of-week: Number from 0 to 6. 0 is Sunday, 2 is Tuesday.
 * - start-date: Anchor date. The component finds the first matching weekday on
 *   or after this date.
 * - count: Number of matching weekdays to show.
 * - selected-date: Optional ISO date to highlight.
 * - min-date: Optional earliest allowed ISO date.
 * - max-date: Optional latest allowed ISO date.
 * - show-paging: Boolean. Shows Previous and Next page buttons.
 *
 * Events:
 * - uib-calendar-date-select with detail.date when a date is selected.
 * - uib-calendar-page-request with detail.direction and detail.nextStartDate
 *   when the previous or next page button is selected. The parent decides
 *   whether to update start-date.
 *
 * Paging behavior:
 * - The component does not mutate its own page.
 * - If paging before min-date or after max-date would be outside the allowed
 *   range, the button is disabled and no request event is emitted.
 */
import { DAY_NAMES, addDays, baseCalendarStyles, boolFromAttribute, dispatchDateSelect, escapeHtml, firstWeekdayOnOrAfter, isSameDay, parseNumber, registerCalendarElement, toDate, toIsoDate } from './calendar-utils.js';

const BaseHTMLElement = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;

export class UibDayOfWeekView extends BaseHTMLElement {
  static get observedAttributes() {
    return ['day-of-week', 'start-date', 'count', 'selected-date', 'min-date', 'max-date', 'show-paging'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }

  render() {
    const dayOfWeek = Math.min(6, Math.max(0, parseNumber(this.getAttribute('day-of-week'), 2)));
    const count = Math.min(52, Math.max(1, parseNumber(this.getAttribute('count'), 8)));
    const start = toDate(this.getAttribute('start-date'));
    const first = firstWeekdayOnOrAfter(start, dayOfWeek);
    const selected = this.getAttribute('selected-date') || '';
    const minDateValue = this.getAttribute('min-date') || '';
    const maxDateValue = this.getAttribute('max-date') || '';
    const minDate = minDateValue ? toDate(minDateValue) : null;
    const maxDate = maxDateValue ? toDate(maxDateValue) : null;
    const showPaging = boolFromAttribute(this.getAttribute('show-paging'), false);
    const dates = Array.from({ length: count }, (_, index) => addDays(first, index * 7));
    const previousFirst = addDays(first, -count * 7);
    const nextFirst = addDays(first, count * 7);
    const previousDisabled = Boolean(minDate && previousFirst < minDate);
    const nextDisabled = Boolean(maxDate && nextFirst > maxDate);

    this.shadowRoot.innerHTML = `
      <style>${baseCalendarStyles}
        .dow-grid { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); }
        .weekday { display: block; color: var(--uib-color-muted,#53657f); font-size: 0.72rem; font-weight: 850; text-transform: uppercase; }
        .day-number { display: block; margin-top: 0.25rem; font-size: 1.15rem; }
        .pager { display: flex; gap: 0.5rem; }
      </style>
      <section class="calendar-card" part="card" aria-label="Day of week view">
        <div class="calendar-header" part="header">
          <div>
            <h2 class="calendar-title" part="title">${escapeHtml(DAY_NAMES[dayOfWeek])} Day Of Week View</h2>
            <p class="calendar-subtitle" part="subtitle">Shows only ${escapeHtml(DAY_NAMES[dayOfWeek])} dates across ${count} week(s).</p>
          </div>
          ${showPaging ? `
            <div class="pager" part="pager">
              <button type="button" part="page-button" data-page="previous" ${previousDisabled ? 'disabled' : ''}>Previous</button>
              <button type="button" part="page-button" data-page="next" ${nextDisabled ? 'disabled' : ''}>Next</button>
            </div>
          ` : ''}
        </div>
        <div class="grid dow-grid" part="grid">
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

    this.shadowRoot.querySelectorAll('[data-page]').forEach((button) => {
      button.addEventListener('click', () => {
        const direction = button.dataset.page;
        const nextStartDate = direction === 'previous' ? toIsoDate(previousFirst) : toIsoDate(nextFirst);
        this.dispatchEvent(new CustomEvent('uib-calendar-page-request', {
          bubbles: true,
          composed: true,
          detail: { direction, nextStartDate }
        }));
      });
    });
  }
}

registerCalendarElement('uib-day-of-week-view', UibDayOfWeekView);
