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
