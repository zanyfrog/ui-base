import { afterEach, describe, expect, it } from 'vitest';
import { UibCard } from '@ui-base/ui/card';
import { UibBaseElement } from '@ui-base/core';

afterEach(() => { document.body.replaceChildren(); });
const makeCard = (attributes = {}, content = '') => {
  const card = document.createElement('uib-card');
  for (const [name, value] of Object.entries(attributes)) card.setAttribute(name, value);
  card.innerHTML = content;
  document.body.append(card);
  return card;
};
const surface = card => card.shadowRoot.querySelector('.uib-card');
const click = card => {
  const event = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
  surface(card).dispatchEvent(event);
  return event;
};
const key = (card, value) => {
  const event = new KeyboardEvent('keydown', { key: value, bubbles: true, composed: true, cancelable: true });
  surface(card).dispatchEvent(event);
  return event;
};

describe('uib-card approved rendering regressions', () => {
  it('keeps the same focused surface through user and programmatic selection', () => {
    const card = makeCard({ selectable: '', heading: 'Select' }); const original = surface(card); original.focus();
    key(card, ' '); expect(surface(card)).toBe(original); expect(card.shadowRoot.activeElement).toBe(original);
    expect(original.getAttribute('aria-pressed')).toBe('true'); card.selected = false;
    expect(surface(card)).toBe(original); expect(original.getAttribute('aria-pressed')).toBe('false');
  });
  it('updates named slot wrappers after insertion, reassignment and removal, including reconnect', async () => {
    const card = makeCard(); const child = document.createElement('span'); child.slot = 'footer'; card.append(child);
    const flush = () => new Promise(resolve => setTimeout(resolve, 0));
    await flush(); expect(card.shadowRoot.querySelector('[part="footer"]').hidden).toBe(false);
    child.slot = 'media'; await flush(); expect(card.shadowRoot.querySelector('[part="footer"]').hidden).toBe(true);
    expect(card.shadowRoot.querySelector('[part="media"]').hidden).toBe(false);
    child.remove(); await flush(); expect(card.shadowRoot.querySelector('[part="media"]').hidden).toBe(true);
    card.remove(); child.slot = 'header'; card.append(child); document.body.append(card); await flush();
    expect(card.shadowRoot.querySelector('[part="header"]').hidden).toBe(false);
  });
  it('forwards explicit names and restores heading fallback when the override is removed', () => {
    const card = makeCard({ heading: 'Heading', 'aria-label': 'Override', 'aria-describedby': 'explanation' });
    expect(surface(card).getAttribute('aria-label')).toBe('Override'); expect(surface(card).hasAttribute('aria-labelledby')).toBe(false);
    expect(surface(card).getAttribute('aria-describedby')).toBe('explanation'); card.removeAttribute('aria-label');
    expect(surface(card).getAttribute('aria-labelledby')).toBe(`${card.componentId}-heading`);
  });
  it('leaves nested native Space activation uncancelled', () => {
    const card = makeCard({ selectable: '' }, '<button>Child</button>');
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, composed: true, cancelable: true });
    card.querySelector('button').dispatchEvent(event); expect(event.defaultPrevented).toBe(false); expect(card.selected).toBe(false);
  });
});

describe('uib-card existing runtime contract', () => {
  it('registers the public class and inherits the shared bases', () => {
    const card = makeCard();
    expect(card).toBeInstanceOf(UibCard);
    expect(card).toBeInstanceOf(UibBaseElement);
    const chain = [];
    for (let proto = Object.getPrototypeOf(card); proto; proto = Object.getPrototypeOf(proto)) chain.push(proto.constructor.name);
    expect(chain.slice(0, 5)).toEqual(['UibCard', 'UibSurfaceBase', 'UibLayoutBase', 'UibBaseElement', 'HTMLElement']);
  });
  it('renders a passive elevated comfortable section by default', () => {
    const card = makeCard();
    expect(surface(card).localName).toBe('section');
    expect(surface(card).classList.contains('uib-surface--elevated')).toBe(true);
    expect(surface(card).classList.contains('uib-surface--comfortable')).toBe(true);
    expect(surface(card).hasAttribute('role')).toBe(false);
    expect(surface(card).hasAttribute('tabindex')).toBe(false);
  });
  it('uses heading before label and associates its header ID', () => {
    const card = makeCard({ id: 'summary', heading: 'Heading', label: 'Fallback' });
    expect(card.heading).toBe('Heading');
    expect(surface(card).getAttribute('aria-labelledby')).toBe('summary-heading');
    expect(card.shadowRoot.querySelector('#summary-heading').textContent).toBe('Heading');
    card.removeAttribute('heading');
    expect(card.heading).toBe('Fallback');
    expect(card.shadowRoot.querySelector('#summary-heading').textContent).toBe('Fallback');
  });
  it('escapes heading text without creating markup', () => {
    const card = makeCard({ heading: '<img src=x onerror=alert(1)>' });
    expect(card.shadowRoot.querySelector('[part="header"]').textContent).toBe('<img src=x onerror=alert(1)>');
    expect(card.shadowRoot.querySelector('img')).toBeNull();
  });
  it('normalizes variants and falls back to the card default', () => {
    const card = makeCard({ variant: 'OUTLINED' });
    expect(card.variant).toBe('outlined');
    expect(surface(card).classList.contains('uib-surface--outlined')).toBe(true);
    card.setAttribute('variant', 'flat');
    expect(card.variant).toBe('flat');
    card.setAttribute('variant', 'unknown');
    expect(card.variant).toBe('elevated');
  });
  it('accepts only exact compact density and re-renders observed changes', () => {
    const card = makeCard({ density: 'compact' });
    expect(surface(card).classList.contains('uib-surface--compact')).toBe(true);
    card.setAttribute('density', 'COMPACT');
    expect(card.density).toBe('comfortable');
    expect(surface(card).classList.contains('uib-surface--comfortable')).toBe(true);
  });
  it('uses a native anchor for href and returns to section when removed', () => {
    const card = makeCard({ href: '/details' });
    expect(card.interactive).toBe(true);
    expect(surface(card).localName).toBe('a');
    expect(surface(card).getAttribute('href')).toBe('/details');
    expect(surface(card).getAttribute('tabindex')).toBe('0');
    expect(surface(card).hasAttribute('role')).toBe(false);
    card.removeAttribute('href');
    expect(surface(card).localName).toBe('section');
  });
  it('forwards explicit target and rel and does not synthesize rel', () => {
    const card = makeCard({ href: '/details', target: '_blank', rel: 'external' });
    expect(surface(card).getAttribute('target')).toBe('_blank');
    expect(surface(card).getAttribute('rel')).toBe('external');
    card.removeAttribute('rel');
    expect(surface(card).hasAttribute('rel')).toBe(false);
  });
  it('ignores target and rel on non-link surfaces', () => {
    const card = makeCard({ target: '_blank', rel: 'external' });
    expect(surface(card).hasAttribute('target')).toBe(false);
    expect(surface(card).hasAttribute('rel')).toBe(false);
  });
  it('makes explicit interactive mode a focusable button role without an action event', () => {
    const card = makeCard({ interactive: '' });
    let events = 0;
    card.addEventListener('uib-card-action', () => events++);
    expect(surface(card).getAttribute('role')).toBe('button');
    expect(surface(card).getAttribute('tabindex')).toBe('0');
    expect(click(card).defaultPrevented).toBe(false);
    expect(events).toBe(0);
  });
  it('toggles selectable state and emits change then select with the same detail', () => {
    const card = makeCard({ selectable: '', name: 'choice' });
    const events = [];
    for (const name of ['change', 'uib-card-select']) card.addEventListener(name, e => events.push(e));
    click(card);
    expect(card.selected).toBe(true);
    expect(surface(card).getAttribute('aria-pressed')).toBe('true');
    expect(surface(card).classList.contains('uib-card--selected')).toBe(true);
    expect(events.map(e => e.type)).toEqual(['change', 'uib-card-select']);
    expect(events[0].detail).toEqual({ name: 'choice', oldValue: false, newValue: true, selected: true });
    expect(events[1].detail).toBe(events[0].detail);
    expect(events.every(e => e.bubbles && e.composed && !e.cancelable)).toBe(true);
    click(card);
    expect(card.selected).toBe(false);
  });
  it('reflects selected property without emitting user selection events', () => {
    const card = makeCard({ selectable: '' });
    let events = 0;
    card.addEventListener('uib-card-select', () => events++);
    card.selected = true;
    expect(card.hasAttribute('selected')).toBe(true);
    expect(surface(card).getAttribute('aria-pressed')).toBe('true');
    card.selected = false;
    expect(card.hasAttribute('selected')).toBe(false);
    expect(events).toBe(0);
  });
  it('allows selected styling without selectable interaction', () => {
    const card = makeCard({ selected: '' });
    expect(card.interactive).toBe(false);
    expect(surface(card).classList.contains('uib-card--selected')).toBe(true);
    expect(surface(card).hasAttribute('aria-pressed')).toBe(false);
  });
  it('blocks disabled activation, including native link default', () => {
    const card = makeCard({ disabled: '', selectable: '', href: '/details', action: 'OPEN' });
    let events = 0;
    for (const name of ['change', 'uib-card-select', 'uib-card-action']) card.addEventListener(name, () => events++);
    expect(surface(card).getAttribute('aria-disabled')).toBe('true');
    expect(surface(card).getAttribute('tabindex')).toBe('-1');
    expect(click(card).defaultPrevented).toBe(true);
    expect(card.selected).toBe(false);
    expect(events).toBe(0);
  });
  it('preserves attribute-presence booleans including disabled="false"', () => {
    const card = makeCard({ disabled: 'false', selectable: 'false', selected: 'false' });
    expect(card.disabled).toBe(true);
    expect(card.selectable).toBe(true);
    expect(card.selected).toBe(true);
    card.disabled = false;
    expect(card.hasAttribute('disabled')).toBe(false);
  });
  it('emits a cancelable action event with distinct action and actionToken values', () => {
    const card = makeCard({ name: 'summary', action: 'open', 'action-token': 'OPEN_RECORD' });
    let event;
    card.addEventListener('uib-card-action', e => { event = e; });
    click(card);
    expect(event.detail).toEqual({ name: 'summary', action: 'open', actionToken: 'OPEN_RECORD', selected: false });
    expect(event.bubbles && event.composed && event.cancelable).toBe(true);
  });
  it('supports action-token without inventing an action alias', () => {
    const card = makeCard({ 'action-token': 'OPEN' });
    let detail;
    card.addEventListener('uib-card-action', e => { detail = e.detail; });
    click(card);
    expect(card.interactive).toBe(true);
    expect(detail.action).toBe('');
    expect(detail.actionToken).toBe('OPEN');
  });
  it('cancellation prevents link default after selection without undoing selection', () => {
    const card = makeCard({ href: '/details', selectable: '', action: 'open' });
    const order = [];
    for (const name of ['change', 'uib-card-select', 'uib-card-action']) card.addEventListener(name, e => { order.push(e.type); if (e.type === 'uib-card-action') e.preventDefault(); });
    expect(click(card).defaultPrevented).toBe(true);
    expect(card.selected).toBe(true);
    expect(order).toEqual(['change', 'uib-card-select', 'uib-card-action']);
  });
  it('activates non-link cards on Enter and Space but ignores unrelated keys', () => {
    const card = makeCard({ selectable: '' });
    expect(key(card, 'Enter').defaultPrevented).toBe(true);
    expect(card.selected).toBe(true);
    expect(key(card, ' ').defaultPrevented).toBe(true);
    expect(card.selected).toBe(false);
    expect(key(card, 'Escape').defaultPrevented).toBe(false);
    expect(card.selected).toBe(false);
  });
  it('leaves link keyboard activation to the browser', () => {
    const card = makeCard({ href: '/details', selectable: '' });
    expect(key(card, 'Enter').defaultPrevented).toBe(false);
    expect(key(card, ' ').defaultPrevented).toBe(false);
    expect(card.selected).toBe(false);
  });
  it('ignores nested native and role-based interactive click targets', () => {
    const card = makeCard({ selectable: '', action: 'open' }, '<button>Child</button><span role="link">Role link</span>');
    let actions = 0;
    card.addEventListener('uib-card-action', () => actions++);
    for (const child of card.children) {
      const event = { composedPath: () => [child, surface(card)], preventDefault() {} };
      card.activate(event);
    }
    expect(card.selected).toBe(false);
    expect(actions).toBe(0);
  });
  it('renders media, header, default body and footer slots with public parts', () => {
    const card = makeCard({}, '<img slot="media" alt=""><h2 slot="header">Title</h2><p>Body</p><span slot="footer">Footer</span>');
    expect([...card.shadowRoot.querySelectorAll('slot')].map(s => s.name || 'default')).toEqual(['media', 'header', 'default', 'footer']);
    expect([...card.shadowRoot.querySelectorAll('[part]')].map(e => e.getAttribute('part'))).toEqual(['base', 'media', 'header', 'body', 'footer']);
    for (const part of ['media', 'header', 'footer']) expect(card.shadowRoot.querySelector(`[part="${part}"]`).hidden).toBe(false);
    expect(card.querySelector('p').textContent).toBe('Body');
  });
  it('hides empty optional regions while keeping the default body slot', () => {
    const card = makeCard();
    for (const part of ['media', 'header', 'footer']) expect(card.shadowRoot.querySelector(`[part="${part}"]`).hidden).toBe(true);
    expect(card.shadowRoot.querySelector('[part="body"]').hidden).toBe(false);
  });
  it('applies inherited cssClass through registration and removes old tokens', () => {
    const card = makeCard({ 'css-class': 'custom one' });
    expect(surface(card).classList.contains('custom')).toBe(true);
    card.cssClass = 'two';
    expect(surface(card).classList.contains('one')).toBe(false);
    expect(surface(card).classList.contains('two')).toBe(true);
    expect(surface(card).classList.contains('uib-card')).toBe(true);
  });
  it('provides unique fallback IDs, shared reflection and describedBy merging', () => {
    const card = makeCard();
    const other = makeCard();
    expect(card.componentId).not.toBe(other.componentId);
    card.name = 'summary'; card.label = 'Summary'; card.help = 'Help'; card.readonly = true; card.required = true; card.invalid = true; card.error = 'Error';
    card.setAttribute('aria-describedby', 'external help');
    expect(card.describedBy('help', 'internal')).toBe('external help internal');
    expect(card.getAttribute('name')).toBe('summary');
    expect(card.readonly && card.required && card.invalid).toBe(true);
    expect(card.error).toBe('Error');
  });
});
