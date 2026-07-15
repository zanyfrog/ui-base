                                                                    
import { parseHtmlFragment } from '../utils/html-fragment-parser.js';
import { stableId } from '../utils/stable-id.js';
import { lineColumnForIndex } from '../utils/source-ranges.js';

                                         
                     
                    
 

export function extractTemplateFragments(options                        )                     {
  if (isLikelyHtmlFile(options.fileName)) {
    const position = lineColumnForIndex(options.sourceText, 0);
    const fragment                   = {
      id: stableId([options.fileName, 'html', 0], 'fragment'),
      source: {
        fileName: options.fileName,
        start: 0,
        end: options.sourceText.length,
        line: position.line,
        column: position.column,
        confidence: 'high',
      },
      rawText: options.sourceText,
      rootNodes: [],
    };
    fragment.rootNodes = parseHtmlFragment(options.sourceText, {
      fileName: options.fileName,
      sourceText: options.sourceText,
      sourceOffset: 0,
      idPrefix: fragment.id,
    });
    return [fragment];
  }

  return scanTemplateLiterals(options.sourceText)
    .filter((template) => looksLikeHtml(template.rawText))
    .map((template, index) => {
      const methodName = inferMethodName(options.sourceText, template.start);
      const propertyName = inferPropertyName(options.sourceText, template.start);
      const position = lineColumnForIndex(options.sourceText, template.start);
      const fragment                   = {
        id: stableId([options.fileName, methodName, propertyName, template.start, index], 'fragment'),
        methodName,
        propertyName,
        source: {
          fileName: options.fileName,
          methodName,
          propertyName,
          start: template.start,
          end: template.end,
          line: position.line,
          column: position.column,
          confidence: methodName || propertyName ? 'medium' : 'low',
        },
        rawText: template.rawText,
        rootNodes: [],
      };
      fragment.rootNodes = parseHtmlFragment(template.rawText, {
        fileName: options.fileName,
        methodName,
        propertyName,
        sourceText: options.sourceText,
        sourceOffset: template.start,
        idPrefix: fragment.id,
      });
      return fragment;
    });
}

function isLikelyHtmlFile(fileName         )          {
  return /\.html?$/i.test(fileName ?? '');
}

function looksLikeHtml(value        )          {
  return /<\s*[a-zA-Z][\w:.-]*(\s|>|\/>)/.test(value);
}

function scanTemplateLiterals(sourceText        )                                                         {
  const templates                                                         = [];
  let quote = '';
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    const next = sourceText[index + 1];
    const previous = sourceText[index - 1];

    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (char === quote && previous !== '\\') quote = '';
      continue;
    }
    if (char === '/' && next === '/') {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === '`') {
      const template = readTemplateLiteral(sourceText, index);
      templates.push(template);
      index = template.end;
    }
  }

  return templates;
}

function readTemplateLiteral(sourceText        , backtickIndex        )                                                  {
  let index = backtickIndex + 1;
  while (index < sourceText.length) {
    const char = sourceText[index];
    const previous = sourceText[index - 1];
    if (char === '`' && previous !== '\\') {
      return {
        start: backtickIndex + 1,
        end: index,
        rawText: sourceText.slice(backtickIndex + 1, index),
      };
    }
    if (char === '$' && sourceText[index + 1] === '{') index = skipTemplateExpression(sourceText, index + 2);
    index += 1;
  }
  return {
    start: backtickIndex + 1,
    end: sourceText.length,
    rawText: sourceText.slice(backtickIndex + 1),
  };
}

function skipTemplateExpression(sourceText        , start        )         {
  let depth = 0;
  let quote = '';
  for (let index = start; index < sourceText.length; index += 1) {
    const char = sourceText[index];
    const previous = sourceText[index - 1];
    if (quote) {
      if (char === quote && previous !== '\\') quote = '';
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      if (depth === 0) return index;
      depth -= 1;
    }
  }
  return sourceText.length;
}

function inferMethodName(sourceText        , templateStart        )                     {
  const before = sourceText.slice(0, templateStart);
  const methodMatches = [...before.matchAll(/(?:^|\n|\r)\s*(?:public\s+|private\s+|protected\s+|static\s+|async\s+)*([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/g)];
  return methodMatches.at(-1)?.[1];
}

function inferPropertyName(sourceText        , templateStart        )                     {
  const before = sourceText.slice(Math.max(0, templateStart - 180), templateStart);
  return before.match(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*$/)?.[1]
    ?? before.match(/this\.([A-Za-z_$][\w$]*)\s*=\s*$/)?.[1];
}
