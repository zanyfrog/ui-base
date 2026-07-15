import { BaseHTMLElement, attr, defineAppManagerElement, dispatch, escapeHtml } from '../utils/dom.js';
import {
  type HeroActionConfig,
  cloneHeroAction,
  normalizeHeroAction,
  normalizeHeroActionList,
  parseBoolean,
  parseHeroActionJson,
  parseHeroActionListJson,
} from './hero-action-config.js';
import './uib-hero-action-button.js';

let heroActionButtonsId = 0;

function attributeBoolean(element: HTMLElement, name: string, fallback = false): boolean {
  if (!element.hasAttribute(name)) return fallback;
  const value = element.getAttribute(name);
  if (value === '') return true;
  return parseBoolean(value, true);
}

function defaultAction(index: number): HeroActionConfig {
  const number = index + 1;
  return normalizeHeroAction({
    id: `heroAction${number}`,
    name: `heroAction${number}`,
    label: `Action ${number}`,
    type: 'link',
    value: '#',
    show: true,
    disabled: false,
    variant: index === 0 ? 'primary' : 'secondary',
    title: `Action ${number}`,
  });
}

function addIcon(): string {
  return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" fill="currentColor"/></svg>';
}

function deleteIcon(): string {
  return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-.9 12H6.9L6 9Zm3 2 .5 8h1.7l-.3-8H9Zm4.1 0-.3 8h1.7l.5-8h-1.9Z" fill="currentColor"/></svg>';
}

function dragIcon(): string {
  return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5A1.5 1.5 0 1 1 5 5.5a1.5 1.5 0 0 1 3 0Zm0 6.5A1.5 1.5 0 1 1 5 12a1.5 1.5 0 0 1 3 0Zm0 6.5A1.5 1.5 0 1 1 5 18.5a1.5 1.5 0 0 1 3 0Zm11-13A1.5 1.5 0 1 1 16 5.5a1.5 1.5 0 0 1 3 0Zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" fill="currentColor"/></svg>';
}

export class UibHeroActionButtons extends BaseHTMLElement {
  static get observedAttributes() {
    return [
      'actions',
      'action',
      'name',
      'label',
      'help',
      'allow-add',
      'allow-remove',
      'show-preview',
      'disabled',
      'readonly',
      'invalid',
      'error',
    ];
  }

  private internalActions: HeroActionConfig[] | null = null;
  private componentId = `uib-hero-action-buttons-${++heroActionButtonsId}`;
  private dragIndex: number | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.internalActions) this.internalActions = this.readActionsFromAttributes();
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;
    if (name === 'actions' || name === 'action') this.internalActions = this.readActionsFromAttributes();
    if (this.isConnected) this.render();
  }

  get actions(): HeroActionConfig[] {
    if (!this.internalActions) this.internalActions = this.readActionsFromAttributes();
    return this.internalActions.map((item) => cloneHeroAction(item));
  }

  set actions(value: unknown) {
    this.internalActions = normalizeHeroActionList(value);
    if (this.isConnected) this.render();
  }

  get disabled(): boolean {
    return attributeBoolean(this, 'disabled', false);
  }

  get readonly(): boolean {
    return attributeBoolean(this, 'readonly', false);
  }

  get allowAdd(): boolean {
    return attributeBoolean(this, 'allow-add', false);
  }

  get allowRemove(): boolean {
    return attributeBoolean(this, 'allow-remove', false);
  }

  get showPreview(): boolean {
    return attributeBoolean(this, 'show-preview', false);
  }

  private readActionsFromAttributes(): HeroActionConfig[] {
    if (this.hasAttribute('actions')) return parseHeroActionListJson(this.getAttribute('actions'));
    if (this.hasAttribute('action')) return [parseHeroActionJson(this.getAttribute('action'))];
    return [];
  }

  private setActions(actions: HeroActionConfig[], options: { emit?: boolean; render?: boolean; extra?: Record<string, unknown> } = {}) {
    const { emit = true, render = true, extra = {} } = options;
    const oldValue = this.actions;
    const newValue = normalizeHeroActionList(actions);
    this.internalActions = newValue;

    if (render && this.isConnected) this.render();
    else this.updatePreview();

    if (emit && JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      const detail = {
        name: this.getAttribute('name') || '',
        oldValue,
        newValue: newValue.map((item) => cloneHeroAction(item)),
        actions: newValue.map((item) => cloneHeroAction(item)),
        ...extra,
      };
      dispatch(this, 'change', detail);
      dispatch(this, 'uib-hero-action-buttons-change', detail);
    }
  }

  private handleChildChange(event: Event, index: number) {
    event.stopPropagation();
    const customEvent = event as CustomEvent<{ newValue?: HeroActionConfig }>;
    const nextActions = this.actions;
    const oldItem = nextActions[index] ? cloneHeroAction(nextActions[index]) : null;
    nextActions[index] = normalizeHeroAction(customEvent.detail?.newValue ?? {});
    this.setActions(nextActions, {
      emit: true,
      render: false,
      extra: {
        index,
        oldItem,
        newItem: cloneHeroAction(nextActions[index]),
      },
    });
  }

  private addAction() {
    if (this.disabled || this.readonly) return;
    const nextActions = this.actions;
    nextActions.push(defaultAction(nextActions.length));
    this.setActions(nextActions, { emit: true, render: true, extra: { action: 'add' } });
  }

  private removeAction(index: number) {
    if (this.disabled || this.readonly) return;
    const nextActions = this.actions;
    const removedItem = nextActions.splice(index, 1)[0] ?? null;
    this.setActions(nextActions, { emit: true, render: true, extra: { action: 'remove', index, removedItem } });
  }

  private moveAction(fromIndex: number, targetIndex: number) {
    if (this.disabled || this.readonly) return;
    const nextActions = this.actions;
    if (fromIndex < 0 || fromIndex >= nextActions.length) return;
    const boundedTarget = Math.max(0, Math.min(targetIndex, nextActions.length));
    let insertionIndex = boundedTarget;
    if (fromIndex < insertionIndex) insertionIndex -= 1;
    if (fromIndex === insertionIndex) return;
    const movedItem = nextActions.splice(fromIndex, 1)[0];
    if (!movedItem) return;
    nextActions.splice(insertionIndex, 0, movedItem);
    this.setActions(nextActions, {
      emit: true,
      render: true,
      extra: {
        action: 'reorder',
        oldIndex: fromIndex,
        newIndex: insertionIndex,
        movedItem: cloneHeroAction(movedItem),
      },
    });
  }

  private updatePreview() {
    // The Hero Action Buttons editor intentionally keeps the raw JSON hidden in App Management.
  }

  private clearDropClasses() {
    this.shadowRoot?.querySelectorAll('.item').forEach((item) => {
      item.classList.remove('is-dragging', 'is-drop-before', 'is-drop-after');
    });
  }

  private bindDragAndDrop(disabled: boolean) {
    if (!this.shadowRoot || disabled) return;

    this.shadowRoot.querySelectorAll<HTMLElement>('[data-drag-handle]').forEach((handle) => {
      handle.addEventListener('dragstart', (event) => {
        const dragEvent = event as DragEvent;
        const index = Number(handle.dataset.dragHandle ?? -1);
        if (!Number.isFinite(index) || index < 0) {
          dragEvent.preventDefault();
          return;
        }
        this.dragIndex = index;
        dragEvent.dataTransfer?.setData('text/plain', String(index));
        if (dragEvent.dataTransfer) dragEvent.dataTransfer.effectAllowed = 'move';
        handle.closest('.item')?.classList.add('is-dragging');
      });

      handle.addEventListener('dragend', () => {
        this.dragIndex = null;
        this.clearDropClasses();
      });
    });

    this.shadowRoot.querySelectorAll<HTMLElement>('[data-draggable-item]').forEach((item) => {
      const index = Number(item.dataset.index ?? -1);
      item.addEventListener('dragover', (event) => {
        const dragEvent = event as DragEvent;
        if (this.dragIndex === null || !Number.isFinite(index) || index < 0) return;
        dragEvent.preventDefault();
        if (dragEvent.dataTransfer) dragEvent.dataTransfer.dropEffect = 'move';
        const rect = item.getBoundingClientRect();
        const dropAfter = dragEvent.clientY > rect.top + rect.height / 2;
        this.clearDropClasses();
        item.classList.add(dropAfter ? 'is-drop-after' : 'is-drop-before');
      });

      item.addEventListener('dragleave', (event) => {
        const relatedTarget = (event as DragEvent).relatedTarget;
        if (relatedTarget instanceof Node && item.contains(relatedTarget)) return;
        item.classList.remove('is-drop-before', 'is-drop-after');
      });

      item.addEventListener('drop', (event) => {
        const dragEvent = event as DragEvent;
        dragEvent.preventDefault();
        const fromIndex = Number(dragEvent.dataTransfer?.getData('text/plain') ?? this.dragIndex ?? -1);
        const rect = item.getBoundingClientRect();
        const dropAfter = dragEvent.clientY > rect.top + rect.height / 2;
        const targetIndex = index + (dropAfter ? 1 : 0);
        this.dragIndex = null;
        this.clearDropClasses();
        this.moveAction(fromIndex, targetIndex);
      });
    });
  }

  private bind() {
    if (!this.shadowRoot) return;
    const disabled = this.disabled || this.readonly;
    this.shadowRoot.querySelector('[data-add]')?.addEventListener('click', () => this.addAction());
    this.shadowRoot.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach((button) => {
      button.addEventListener('click', () => this.removeAction(Number(button.dataset.remove ?? 0)));
    });
    this.shadowRoot.querySelectorAll<HTMLElement>('uib-hero-action-button').forEach((element) => {
      const index = Number((element as HTMLElement).dataset.actionIndex ?? 0);
      element.addEventListener('change', (event) => event.stopPropagation());
      element.addEventListener('uib-hero-action-button-change', (event) => this.handleChildChange(event, index));
    });
    this.bindDragAndDrop(disabled);
  }

  render() {
    if (!this.shadowRoot) return;
    const actions = this.actions;
    const disabled = this.disabled || this.readonly;
    const label = this.getAttribute('label') || 'Hero action buttons';
    const help = this.getAttribute('help') || 'Configure one or more Hero action button definitions. Drag items to reorder them.';
    const labelId = `${this.componentId}-label`;
    const helpId = `${this.componentId}-help`;
    const error = this.getAttribute('error') || '';
    const errorId = error || this.hasAttribute('invalid') ? `${this.componentId}-error` : '';

    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;color:var(--uib-color-ink,#13294b);font-family:var(--uib-font-family-sans,Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif)}
        *,*::before,*::after{box-sizing:border-box}
        section{display:grid;gap:1rem;padding:clamp(1rem,2vw,1.25rem);border:1px solid var(--uib-color-border,#d9e2f0);border-radius:var(--uib-radius-lg,1rem);background:var(--uib-color-surface,#fff);box-shadow:var(--uib-shadow-sm,0 8px 22px rgba(10,31,68,.08))}
        section[aria-disabled="true"]{opacity:.7}
        .header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}
        h2{margin:0;color:var(--uib-color-primary,#174a8b);font-size:1.1rem;line-height:1.2}
        p{margin:.35rem 0 0;color:var(--uib-color-muted,#53657f);line-height:1.45}
        .list{display:grid;gap:1rem}
        .item{position:relative;display:grid;gap:.5rem;isolation:isolate}
        .item.is-dragging{opacity:.58}
        .item.is-drop-before::before,.item.is-drop-after::after{content:"";display:block;height:.25rem;border-radius:999px;background:var(--uib-color-primary,#174a8b);box-shadow:0 0 0 3px color-mix(in srgb,var(--uib-color-primary,#174a8b) 16%,transparent)}
        .drag-handle,.delete-button{position:absolute;z-index:2;top:.85rem;width:2.1rem;height:2.1rem;min-height:2.1rem;padding:.35rem;border:1px solid var(--uib-color-border-strong,#aab8cc);border-radius:999px;background:var(--uib-color-surface,#fff);box-shadow:var(--uib-shadow-sm,0 8px 22px rgba(10,31,68,.08));color:var(--uib-color-primary,#174a8b)}
        .drag-handle{left:.85rem;cursor:grab}
        .drag-handle:active{cursor:grabbing}
        .delete-button{right:.85rem;color:var(--uib-color-danger,#b4232a)}
        .icon-button{display:inline-flex;align-items:center;justify-content:center;min-height:2.35rem;min-width:2.35rem;padding:.55rem;border:1px solid var(--uib-color-border-strong,#aab8cc);border-radius:999px;background:var(--uib-color-surface,#fff);color:var(--uib-color-primary,#174a8b);font:inherit;font-weight:850;cursor:pointer}
        .icon-button--primary{border-color:var(--uib-color-primary,#174a8b);background:var(--uib-color-primary,#174a8b);color:var(--uib-color-primary-contrast,#fff)}
        .icon-button svg,.drag-handle svg,.delete-button svg{width:1.15rem;height:1.15rem;display:block}
        button:focus-visible{outline:3px solid color-mix(in srgb,var(--uib-color-primary,#174a8b) 28%,transparent);outline-offset:2px}
        button:disabled{cursor:not-allowed;opacity:.6}
        uib-hero-action-button{display:block;--uibam-hero-action-padding:3.1rem clamp(1rem,2vw,1.25rem) clamp(1rem,2vw,1.25rem)}
        .empty{padding:1rem;border:1px dashed var(--uib-color-border,#d9e2f0);border-radius:var(--uib-radius-lg,1rem);background:var(--uib-color-surface-soft,#f8fbff);color:var(--uib-color-muted,#53657f);line-height:1.45}
        .error{color:var(--uib-color-danger,#b4232a);font-size:.88rem;line-height:1.4}
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
        @media(max-width:640px){.header{display:grid}.drag-handle,.delete-button{top:.65rem}.drag-handle{left:.65rem}.delete-button{right:.65rem}uib-hero-action-button{--uibam-hero-action-padding:2.9rem .85rem .85rem}}
      </style>
      <section part="section" aria-labelledby="${labelId}" aria-describedby="${helpId}${errorId ? ` ${errorId}` : ''}" aria-disabled="${disabled ? 'true' : 'false'}">
        <div class="header" part="header">
          <div>
            <h2 part="title" id="${labelId}">${escapeHtml(label)}</h2>
            <p part="help" id="${helpId}">${escapeHtml(help)}</p>
          </div>
          ${this.allowAdd ? `<button class="icon-button icon-button--primary" part="icon-button" type="button" data-add aria-label="Add action" title="Add action" ${disabled ? 'disabled' : ''}>${addIcon()}<span class="sr-only">Add action</span></button>` : ''}
        </div>
        <div class="list" part="list">
          ${actions.length
            ? actions.map((action, index) => {
              const actionLabel = action.label || `action ${index + 1}`;
              return `
              <div class="item" part="item" data-index="${index}" data-draggable-item="true">
                <button class="drag-handle" part="drag-handle" type="button" data-drag-handle="${index}" draggable="${disabled ? 'false' : 'true'}" aria-label="Drag to reorder ${attr(actionLabel)}" title="Drag to reorder" ${disabled ? 'disabled' : ''}>${dragIcon()}<span class="sr-only">Drag to reorder ${escapeHtml(actionLabel)}</span></button>
                ${this.allowRemove ? `<button class="delete-button" part="delete-button" type="button" data-remove="${index}" aria-label="Delete ${attr(actionLabel)}" title="Delete ${attr(actionLabel)}" ${disabled ? 'disabled' : ''}>${deleteIcon()}<span class="sr-only">Delete ${escapeHtml(actionLabel)}</span></button>` : ''}
                <uib-hero-action-button data-action-index="${index}" heading="${attr(action.title || action.label || `Action ${index + 1}`)}" default-action-token="ACTION_${index + 1}" ${disabled ? 'disabled' : ''}></uib-hero-action-button>
              </div>`;
            }).join('')
            : '<p class="empty" part="empty">No hero action buttons are configured.</p>'}
        </div>
        ${errorId ? `<p id="${errorId}" class="error" part="error" role="alert">${escapeHtml(error || `${label} is invalid.`)}</p>` : ''}
      </section>
    `;

    this.shadowRoot.querySelectorAll('uib-hero-action-button').forEach((element) => {
      const index = Number((element as HTMLElement).dataset.actionIndex ?? 0);
      (element as unknown as { action: HeroActionConfig }).action = actions[index] || defaultAction(index);
    });

    this.bind();
  }
}

defineAppManagerElement('uib-hero-action-buttons', UibHeroActionButtons);
