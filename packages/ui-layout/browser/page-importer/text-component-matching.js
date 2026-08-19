                                                                                             

const TEXT_CONTAINER_TAGS = new Set(['p', 'span', 'div']);
const MAX_SHORT_HEADING_LENGTH = 30;

                                             
                           
                   
                             
                                                 
                                            
                                         
  

export function matchImportedTextComponents(extraction                      )                       {
  const items = recoverMissingTextItems(extraction);
  return {
    ...extraction,
    items: items.map(matchImportedTextItem),
    appExtractions: extraction.appExtractions?.map((appExtraction) => ({
      ...appExtraction,
      items: appExtraction.items.map(matchImportedTextItem),
    })),
  };
}

export function matchImportedTextItem(item                )                 {
  if (!isTextOnlyItem(item)) return item;

  const tagName = originalTagName(item);
  const text = itemText(item);
  const headingLevel = headingLevelFor(item, tagName);

  if (isHeadingTag(tagName) || isShortHeadingText(text)) {
    return {
      ...item,
      kind: 'instruction',
      componentTag: 'uib-heading',
      headingLevel,
    };
  }

  if (TEXT_CONTAINER_TAGS.has(tagName)) {
    const { headingLevel: _headingLevel, ...nextItem } = item;
    return {
      ...nextItem,
      kind: 'instruction',
      componentTag: 'uib-instruction',
    };
  }

  return item;
}

function recoverMissingTextItems(extraction                      )                   {
  const html = extraction.source?.html;
  if (!html || typeof DOMParser === 'undefined') return extraction.items;

  const document = new DOMParser().parseFromString(html, 'text/html');
  const existingSignatures = new Set(extraction.items.map((item) => textSignature(itemText(item))));
  const recovered                   = [];
  let recoveredIndex = 0;
  const maxOrder = extraction.items.reduce((order, item) => Math.max(order, item.position?.order || 0), 0);

  document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,div').forEach((element) => {
    if (!isRecoverableTextElement(element)) return;
    const text = normalizeText(element.textContent);
    const signature = textSignature(text);
    if (!signature || existingSignatures.has(signature)) return;
    existingSignatures.add(signature);
    recoveredIndex += 1;
    recovered.push({
      id: `item_recovered_text_${recoveredIndex}`,
      kind: 'instruction',
      label: text.slice(0, 80),
      value: text,
      componentTag: isHeadingTag(element.tagName) || isShortHeadingText(text) ? 'uib-heading' : 'uib-instruction',
      headingLevel: isHeadingTag(element.tagName) || isShortHeadingText(text) ? headingLevelForRecoveredElement(element) : undefined,
      sourceSnippet: snippetForElement(element),
      position: {
        order: maxOrder + recoveredIndex,
      },
      notes: 'Recovered from rendered HTML text during import.',
    });
  });

  return recovered.length ? [...extraction.items, ...recovered] : extraction.items;
}

function isTextOnlyItem(item                )          {
  if (item.hidden) return false;
  if (['field', 'action', 'asset', 'table', 'dashboard', 'subcomponent'].includes(item.kind)) return false;
  const text = itemText(item);
  if (!text) return false;
  const value = String(item.value ?? '').trim();
  if (value.startsWith('<') && value.endsWith('>')) return false;
  return true;
}

function itemText(item                )         {
  return normalizeText(item.value || item.label);
}

function isShortHeadingText(text        )          {
  return text.length > 0 && text.length < MAX_SHORT_HEADING_LENGTH && !text.includes('.');
}

function isHeadingTag(tagName        )          {
  return /^h[1-6]$/.test(normalizeTagName(tagName));
}

function headingLevelFor(item                , tagName        )         {
  const tagLevel = /^h([1-6])$/.exec(tagName)?.[1];
  if (tagLevel) return Number(tagLevel);

  const fontSize = fontSizeFor(item);
  if (fontSize >= 48) return 1;
  if (fontSize >= 36) return 2;
  if (fontSize >= 28) return 3;
  if (fontSize >= 22) return 4;
  if (fontSize >= 18) return 5;
  return 3;
}

function headingLevelForRecoveredElement(element         )         {
  const tagLevel = /^h([1-6])$/.exec(normalizeTagName(element.tagName))?.[1];
  if (tagLevel) return Number(tagLevel);
  return headingLevelFor({
    id: 'recovered',
    kind: 'instruction',
    label: normalizeText(element.textContent),
    value: normalizeText(element.textContent),
    sourceSnippet: snippetForElement(element),
    position: { order: 0 },
  }, '');
}

function fontSizeFor(item                )         {
  const hints = item                       ;
  return parseFontSize(
    hints.fontSize
    ?? hints.computedStyle?.fontSize
    ?? hints.computed?.fontSize
    ?? hints.style?.fontSize
    ?? fontSizeFromCss(item.cssSnippet)
    ?? fontSizeFromSnippet(item.sourceSnippet),
  );
}

function parseFontSize(value         )         {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;
  const match = /(-?\d+(?:\.\d+)?)(px|rem|em)?/i.exec(value);
  if (!match) return 0;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return 0;
  const unit = (match[2] || 'px').toLowerCase();
  return unit === 'rem' || unit === 'em' ? amount * 16 : amount;
}

function fontSizeFromCss(value                    )         {
  return /font-size\s*:\s*([^;}\n]+)/i.exec(value || '')?.[1]?.trim() || '';
}

function fontSizeFromSnippet(value                    )         {
  return /font-size\s*:\s*([^;"']+)/i.exec(value || '')?.[1]?.trim() || '';
}

function originalTagName(item                )         {
  const hints = item                       ;
  return normalizeTagName(hints.originalTagName || hints.tagName || tagNameFromSnippet(item.sourceSnippet));
}

function tagNameFromSnippet(value                    )         {
  return /^<\s*([a-zA-Z][\w:-]*)/.exec(value || '')?.[1] || '';
}

function normalizeTagName(value        )         {
  return String(value || '').trim().toLowerCase();
}

function normalizeText(value         )         {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function textSignature(value        )         {
  return normalizeText(value).toLowerCase();
}

function isRecoverableTextElement(element         )          {
  const tagName = normalizeTagName(element.tagName);
  const text = normalizeText(element.textContent);
  if (!text || text.length > 280) return false;
  if (element.closest('label,button,a,select,textarea,script,style,noscript')) return false;
  if (isHeadingTag(tagName)) return true;
  if (!TEXT_CONTAINER_TAGS.has(tagName)) return false;
  if (!hasOwnReadableText(element)) return false;
  return !element.querySelector('div,p,h1,h2,h3,h4,h5,h6,input,select,textarea,button,table,img,video,audio');
}

function hasOwnReadableText(element         )          {
  return Array.from(element.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && normalizeText(node.textContent).length >= 2);
}

function snippetForElement(element         )         {
  const html = element.outerHTML || '';
  return html.length > 600 ? `${html.slice(0, 600)}...` : html;
}
