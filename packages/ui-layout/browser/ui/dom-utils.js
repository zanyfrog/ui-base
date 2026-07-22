const FallbackHTMLElement = class {};
export const BaseHTMLElement                     = (typeof HTMLElement === 'undefined' ? FallbackHTMLElement : HTMLElement)                      ;

export function escapeHtml(value         )         {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function attr(value         )         {
  return escapeHtml(value);
}

export function cssClassTokens(element             )           {
  return String(element.getAttribute('css-class') ?? (element                                       ).cssClass ?? '')
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function applyCssClassToRoot(element             )       {
  const root = element.shadowRoot ?? element;
  const target = root.querySelector('[data-uib-css-class-root]')
    ?? Array.from(root.children).find((child) => child instanceof HTMLElement && child.localName !== 'style');
  if (!(target instanceof HTMLElement)) return;
  const state = element                                                    ;
  target.classList.remove(...(state.__uibCssClassTokens ?? []));
  const next = cssClassTokens(element);
  if (next.length) target.classList.add(...next);
  state.__uibCssClassTokens = next;
}

export function defineLayoutElement(tagName        , elementClass                          )                           {
  const prototype = elementClass.prototype                                                                                                    ;
  if (!Object.getOwnPropertyDescriptor(prototype, 'cssClass')) {
    Object.defineProperty(prototype, 'cssClass', {
      configurable: true,
      enumerable: true,
      get() { return this.getAttribute('css-class') || ''; },
      set(value         ) {
        if (value === null || value === undefined || value === false) this.removeAttribute('css-class');
        else this.setAttribute('css-class', String(value));
      },
    });
  }

  const observed = Array.isArray((elementClass                                                ).observedAttributes)
    ? [...((elementClass                                               ).observedAttributes)]
    : [];
  if (!observed.includes('css-class')) {
    Object.defineProperty(elementClass, 'observedAttributes', {
      configurable: true,
      value: [...observed, 'css-class'],
    });
  }

  if (typeof prototype.render === 'function' && !prototype.__uibCssClassRenderWrapped) {
    const render = prototype.render;
    prototype.render = function renderWithCssClass(                   ...args           )          {
      const result = render.apply(this, args);
      applyCssClassToRoot(this);
      return result;
    };
    prototype.__uibCssClassRenderWrapped = true;
  }

  if (typeof customElements !== 'undefined' && !customElements.get(tagName)) {
    customElements.define(tagName, elementClass);
  }
  return elementClass;
}

export function dispatch(element             , type        , detail          = {})       {
  element.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
}

export function parseJson   (value               , fallback   )    {
  if (!value) return fallback;
  try {
    return JSON.parse(value)     ;
  } catch {
    return fallback;
  }
}
