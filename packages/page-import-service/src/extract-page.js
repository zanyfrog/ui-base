export async function extractPage(options) {
  const { chromium } = await import('playwright');
  const url = normalizeUrl(options.url);
  const logs = [log('info', `Started loading web page ${url}.`)];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  try {
    const waitUntil = options.waitUntil || 'domcontentloaded';
    await page.goto(url, { waitUntil, timeout: options.timeoutMs || 45000 });
    logs.push(log('success', `Web page loaded: ${url}.`));
    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { timeout: options.selectorTimeoutMs || 15000 });
      logs.push(log('success', `Waited for selector ${options.waitForSelector}.`));
    }
    if (options.delayMs !== 0) {
      await page.waitForTimeout(Number(options.delayMs || 1000));
    }

    const renderedHtml = await page.content();
    logs.push(log('info', 'Started parsing web page into Extracted Items.'));
    const extracted = await page.evaluate(classifyRenderedPage);
    const source = {
      html: renderedHtml,
      css: extracted.css,
      js: extracted.js,
    };

    logs.push(log('success', `Finished parsing web page into Extracted Items: ${extracted.items.length} items.`));
    return {
      source,
      items: extracted.items,
      tree: extracted.tree,
      assets: extracted.assets,
      logs: [...logs, ...extracted.logs],
    };
  } finally {
    await browser.close();
  }
}

function normalizeUrl(value) {
  const url = new URL(String(value || ''));
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only http and https URLs are supported.');
  return url.href;
}

function log(level, message) {
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    level,
    message,
  };
}

function classifyRenderedPage() {
  const itemById = new Map();
  const assets = new Map();
  const logs = [];
  const seenActions = new Set();
  const seenInstructions = new Set();
  let order = 0;

  const css = [
    ...Array.from(document.querySelectorAll('style')).map((node) => node.textContent || ''),
    ...Array.from(document.querySelectorAll('link[rel~="stylesheet"][href]')).map((node) => `/* stylesheet: ${node.href} */`),
  ].filter(Boolean).join('\n\n');
  const js = [
    ...Array.from(document.querySelectorAll('script:not([src])')).map((node) => node.textContent || ''),
    ...Array.from(document.querySelectorAll('script[src]')).map((node) => `/* script: ${node.src} */`),
  ].filter(Boolean).join('\n\n');

  function addItem(item) {
    order += 1;
    const id = item.id || stableId(`item_${item.kind}`, `${item.kind}|${item.label || ''}|${item.name || ''}|${order}`);
    const next = {
      id,
      hidden: false,
      ...item,
      position: {
        order,
        ...(item.position || {}),
      },
    };
    itemById.set(id, next);
    return next;
  }

  function addAsset(url, type, label, usedBy) {
    if (!url) return;
    const absolute = new URL(url, location.href).href;
    const id = stableId('asset', absolute);
    const current = assets.get(id) || { id, url: absolute, type, label, usedBy: [] };
    current.label = current.label || label;
    current.usedBy = Array.from(new Set([...current.usedBy, usedBy].filter(Boolean)));
    assets.set(id, current);
  }

  function componentForControl(control) {
    const tag = control.tagName.toLowerCase();
    const type = (control.getAttribute('type') || 'text').toLowerCase();
    if (tag === 'select') return 'uib-forms-select';
    if (tag === 'textarea') return 'uib-forms-textarea';
    if (type === 'radio') return 'uib-forms-select';
    if (type === 'email') return 'uib-forms-email';
    if (type === 'tel' || type === 'phone') return 'uib-forms-phone';
    if (type === 'number') return 'uib-forms-number';
    if (type === 'date') return 'uib-forms-date';
    if (type === 'password') return 'uib-forms-password';
    if (type === 'checkbox') return 'uib-checkbox';
    return 'uib-forms-textbox';
  }

  function labelFor(control) {
    const labels = control.labels ? Array.from(control.labels).map((label) => cleanText(label.textContent)).filter(Boolean) : [];
    if (labels[0]) return labels[0];
    const id = control.id;
    if (id) {
      const label = document.querySelector(`label[for="${cssEscape(id)}"]`);
      if (label) return cleanText(label.textContent);
    }
    const aria = control.getAttribute('aria-label');
    if (aria) return aria;
    const wrapped = control.closest('label');
    if (wrapped) return cleanText(wrapped.textContent);
    const previous = previousText(control);
    if (previous) return previous;
    return control.getAttribute('placeholder') || control.getAttribute('name') || control.id || control.tagName.toLowerCase();
  }

  function addField(control) {
    const tag = control.tagName.toLowerCase();
    const label = labelFor(control);
    const name = control.getAttribute('name') || control.id || camelCase(label);
    const inputType = tag === 'select' ? 'select' : tag === 'textarea' ? 'textarea' : (control.getAttribute('type') || 'text').toLowerCase();
    const options = tag === 'select'
      ? Array.from(control.querySelectorAll('option')).map((option) => cleanText(option.textContent)).filter(Boolean)
      : [];
    const item = addItem({
      kind: 'field',
      label,
      inputType,
      name,
      elementId: control.id || '',
      placeholder: control.getAttribute('placeholder') || '',
      value: control.value || control.getAttribute('value') || '',
      required: control.hasAttribute('required') || control.getAttribute('aria-required') === 'true',
      options,
      componentTag: componentForControl(control),
      sourceSnippet: snippet(control),
      cssSnippet: cssFor(control),
      position: position(control),
      database: {
        fieldName: name,
        label,
        type: databaseType(inputType),
        required: control.hasAttribute('required') || control.getAttribute('aria-required') === 'true',
        sampleValue: control.value || control.getAttribute('value') || control.getAttribute('placeholder') || options[0] || '',
        entityGuess: entityGuess(control),
      },
    });
    return item;
  }

  function addChoiceGroups(type) {
    const grouped = new Map();
    Array.from(document.querySelectorAll(`input[type="${type}"]`)).forEach((control) => {
      const name = control.getAttribute('name') || control.id || labelFor(control);
      const key = `${type}:${entityGuess(control)}:${name}`;
      const current = grouped.get(key) || [];
      current.push(control);
      grouped.set(key, current);
    });

    grouped.forEach((controls) => {
      if (!controls.length) return;
      const first = controls[0];
      const fieldset = first.closest('fieldset');
      const legend = fieldset?.querySelector('legend');
      const name = first.getAttribute('name') || first.id || camelCase(labelFor(first));
      const label = cleanText(legend?.textContent) || groupLabelFromName(name) || labelFor(first);
      const options = controls.map((control) => labelFor(control) || control.value || control.id).filter(Boolean);
      const checked = controls.filter((control) => control.checked).map((control) => labelFor(control) || control.value || control.id).filter(Boolean);
      addItem({
        kind: 'field',
        label,
        inputType: type === 'radio' ? 'radio' : controls.length > 1 ? 'checkbox-group' : 'checkbox',
        name,
        elementId: first.id || '',
        value: checked.join(', '),
        required: controls.some((control) => control.hasAttribute('required') || control.getAttribute('aria-required') === 'true'),
        options,
        componentTag: type === 'radio' ? 'uib-forms-select' : 'uib-checkbox',
        sourceSnippet: snippet(fieldset || first),
        cssSnippet: cssFor(fieldset || first),
        position: position(fieldset || first),
        database: {
          fieldName: name,
          label,
          type: type === 'radio' || controls.length > 1 ? 'string' : 'boolean',
          required: controls.some((control) => control.hasAttribute('required') || control.getAttribute('aria-required') === 'true'),
          sampleValue: checked.join(', ') || options[0] || '',
          entityGuess: entityGuess(first),
        },
      });
    });
  }

  addChoiceGroups('radio');
  addChoiceGroups('checkbox');

  Array.from(document.querySelectorAll('input, select, textarea')).forEach((control) => {
    const type = (control.getAttribute('type') || '').toLowerCase();
    if (['hidden', 'submit', 'button', 'reset', 'radio', 'checkbox'].includes(type)) return;
    addField(control);
  });

  Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a[href]')).forEach((control) => {
    const label = cleanText(control.textContent) || control.getAttribute('value') || control.getAttribute('aria-label') || control.getAttribute('href') || '';
    if (!label || label.length > 80) return;
    const signature = `${label}|${control.getAttribute('href') || ''}`;
    if (seenActions.has(signature)) return;
    seenActions.add(signature);
    addItem({
      kind: 'action',
      label,
      value: control.getAttribute('href') || '',
      componentTag: 'uib-action-button',
      sourceSnippet: snippet(control),
      cssSnippet: cssFor(control),
      position: position(control),
    });
  });

  Array.from(document.querySelectorAll('img[src], video[src], audio[src]')).forEach((media) => {
    const src = media.currentSrc || media.getAttribute('src') || '';
    const item = addItem({
      kind: 'asset',
      label: media.getAttribute('alt') || media.getAttribute('aria-label') || src.split('/').pop() || 'Asset',
      value: new URL(src, location.href).href,
      componentTag: 'uib-media',
      sourceSnippet: snippet(media),
      cssSnippet: cssFor(media),
      position: position(media),
    });
    addAsset(src, 'image', item.label, item.id);
  });

  Array.from(document.querySelectorAll('dl')).forEach((list) => {
    const terms = Array.from(list.querySelectorAll('dt'));
    terms.slice(0, 25).forEach((term) => {
      const value = term.nextElementSibling?.tagName.toLowerCase() === 'dd' ? cleanText(term.nextElementSibling.textContent) : '';
      if (!value) return;
      addItem({
        kind: 'static-value',
        label: cleanText(term.textContent),
        value,
        componentTag: 'uib-detail-item',
        sourceSnippet: snippet(term.parentElement || term),
        cssSnippet: cssFor(term.parentElement || term),
        position: position(term),
      });
    });
  });

  Array.from(document.querySelectorAll('h1,h2,h3,p,[role="note"],.help,.instructions,.instruction')).forEach((node) => {
    if (node.closest('label,button,a,select')) return;
    const text = cleanText(node.textContent);
    if (!text || text.length < 12 || text.length > 280) return;
    const signature = text.toLowerCase();
    if (seenInstructions.has(signature)) return;
    seenInstructions.add(signature);
    addItem({
      kind: /h1|h2|h3/i.test(node.tagName) ? 'instruction' : 'instruction',
      label: text.slice(0, 80),
      value: text,
      componentTag: 'uib-heading-block',
      sourceSnippet: snippet(node),
      cssSnippet: cssFor(node),
      position: position(node),
    });
  });

  Array.from(document.querySelectorAll('table')).forEach((table) => {
    const label = table.caption ? cleanText(table.caption.textContent) : previousText(table) || 'Table';
    addItem({
      kind: 'table',
      label,
      value: `${table.querySelectorAll('tr').length} rows`,
      componentTag: 'uib-card',
      sourceSnippet: snippet(table),
      cssSnippet: cssFor(table),
      position: position(table),
    });
  });

  Array.from(document.querySelectorAll('[class*="dashboard"],[class*="metric"],[class*="stat"],[class*="card"]')).slice(0, 40).forEach((node) => {
    if (node.querySelector('input,select,textarea,table')) return;
    const text = cleanText(node.textContent);
    if (!text || text.length < 4 || text.length > 160 || !/\d/.test(text)) return;
    addItem({
      kind: 'dashboard',
      label: text.slice(0, 60),
      value: text,
      componentTag: 'uib-card',
      sourceSnippet: snippet(node),
      cssSnippet: cssFor(node),
      position: position(node),
    });
  });

  Array.from(document.querySelectorAll('*')).forEach((node) => {
    const tag = node.tagName.toLowerCase();
    if (!tag.includes('-') || tag.startsWith('uib-')) return;
    if (Array.from(itemById.values()).some((item) => item.position?.selector === selector(node))) return;
    addItem({
      kind: 'unknown',
      label: tag,
      value: cleanText(node.textContent).slice(0, 160),
      sourceSnippet: snippet(node),
      cssSnippet: cssFor(node),
      position: position(node),
    });
  });

  Array.from(document.querySelectorAll('link[href],script[src]')).forEach((node) => {
    const isScript = node.tagName.toLowerCase() === 'script';
    addAsset(node.getAttribute('href') || node.getAttribute('src') || '', isScript ? 'script' : 'stylesheet', isScript ? 'Script' : 'Stylesheet', '');
  });

  const items = Array.from(itemById.values()).sort((left, right) => (left.position?.order || 0) - (right.position?.order || 0));
  return {
    css,
    js,
    items,
    assets: Array.from(assets.values()),
    tree: buildTree(items),
    logs,
  };

  function position(element) {
    const rect = element.getBoundingClientRect();
    return {
      selector: selector(element),
      domPath: domPath(element),
      gridColumn: '',
      gridRow: '',
      bounds: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      },
    };
  }

  function buildTree(items) {
    const sections = new Map();
    items.forEach((item) => {
      const section = sectionLabel(item.position?.selector || '');
      const sectionId = stableId('section', section);
      const current = sections.get(sectionId) || { id: sectionId, label: section, kind: 'section', children: [] };
      current.children.push({ id: `node_${item.id}`, label: item.label, kind: item.kind, itemId: item.id, children: [] });
      sections.set(sectionId, current);
    });
    return {
      id: 'page_import',
      label: document.title || location.pathname || 'Imported Page',
      kind: 'page',
      children: Array.from(sections.values()),
    };
  }

  function sectionLabel(selectorValue) {
    if (selectorValue.includes('form')) return 'Form';
    if (selectorValue.includes('header') || selectorValue.includes('hero')) return 'Hero';
    if (selectorValue.includes('table')) return 'Tables';
    if (selectorValue.includes('dashboard') || selectorValue.includes('card')) return 'Dashboard';
    return 'Page';
  }

  function selector(element) {
    if (element.id) return `#${cssEscape(element.id)}`;
    const dataId = element.getAttribute('data-testid') || element.getAttribute('data-test-id');
    if (dataId) return `[data-testid="${cssEscape(dataId)}"]`;
    const parts = [];
    let current = element;
    while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 4) {
      const tag = current.tagName.toLowerCase();
      const className = Array.from(current.classList || [])[0];
      const part = className ? `${tag}.${cssEscape(className)}` : tag;
      parts.unshift(part);
      current = current.parentElement;
    }
    return parts.join(' > ');
  }

  function domPath(element) {
    const parts = [];
    let current = element;
    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.documentElement) {
      const tag = current.tagName.toLowerCase();
      const siblings = current.parentElement ? Array.from(current.parentElement.children).filter((child) => child.tagName === current.tagName) : [];
      const index = siblings.length > 1 ? `[${siblings.indexOf(current) + 1}]` : '';
      parts.unshift(`${tag}${index}`);
      current = current.parentElement;
    }
    return parts.join('/');
  }

  function previousText(element) {
    let current = element.previousElementSibling;
    while (current) {
      const text = cleanText(current.textContent);
      if (text && text.length < 100) return text;
      current = current.previousElementSibling;
    }
    return '';
  }

  function entityGuess(element) {
    const form = element.closest('form');
    return form?.getAttribute('name') || form?.id || location.pathname.split('/').filter(Boolean).pop() || 'page';
  }

  function snippet(element) {
    const html = element.outerHTML || '';
    return html.length > 600 ? `${html.slice(0, 600)}...` : html;
  }

  function cssFor(element) {
    const computed = getComputedStyle(element);
    const selectorValue = selector(element);
    const properties = [
      'display',
      'position',
      'box-sizing',
      'grid-column',
      'grid-row',
      'flex-direction',
      'align-items',
      'justify-content',
      'gap',
      'width',
      'height',
      'margin',
      'padding',
      'border',
      'border-radius',
      'background-color',
      'color',
      'font-family',
      'font-size',
      'font-weight',
      'line-height',
    ];
    const declarations = properties
      .map((property) => [property, computed.getPropertyValue(property)])
      .filter(([, value]) => value && value !== 'normal' && value !== 'auto' && value !== 'none')
      .map(([property, value]) => `  ${property}: ${value.trim()};`);
    return `${selectorValue} {\n${declarations.join('\n')}\n}`;
  }

  function databaseType(inputType) {
    if (['number', 'range'].includes(inputType)) return 'number';
    if (['date', 'datetime-local', 'month', 'time'].includes(inputType)) return 'date';
    if (['checkbox', 'radio'].includes(inputType)) return 'boolean';
    return 'string';
  }

  function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function camelCase(value) {
    return cleanText(value).replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()).replace(/^[A-Z]/, (chr) => chr.toLowerCase()) || 'field';
  }

  function groupLabelFromName(value) {
    return cleanText(String(value || '').replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')).replace(/^\w/, (chr) => chr.toUpperCase());
  }

  function stableId(prefix, value) {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
    }
    return `${prefix}_${Math.abs(hash).toString(36)}`;
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value).replace(/["\\#.;:[\]>+~*^$|=]/g, '\\$&');
  }
}
