import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'audit-typescript';

// Evidence collector only: never imports component implementations or rewrites them.
// Syntax evidence is intentionally distinguished from browser verification.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => path.relative(root, p).replaceAll('\\', '/');
const walk = (p) => fs.readdirSync(p, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(p, e.name)) : [path.join(p, e.name)]);
const unique = a => [...new Set(a)];
const compact = s => s.replace(/\s+/g, ' ').trim();
const classes = [];
const packages = [];
const allEvidenceFiles = walk(path.join(root, 'docs')).concat(walk(path.join(root, 'apps')), walk(path.join(root, 'packages')).filter(p => /\/test\//.test(rel(p))));
const evidence = allEvidenceFiles.filter(p => /\.(md|js|ts|html)$/.test(p) && !/docs\/(?:ui-base-component-|ui-base-architecture-|uib-card-reference-)/.test(rel(p))).map(p => ({ file: rel(p), text: fs.readFileSync(p, 'utf8') }));
for (const dir of fs.readdirSync(path.join(root, 'packages'))) {
  const packageDir = path.join(root, 'packages', dir);
  const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
  const src = path.join(packageDir, 'src');
  if (!fs.existsSync(src)) continue;
  const files = walk(src).filter(p => /\.(js|ts)$/.test(p) && !p.endsWith('.d.ts'));
  const info = { directory: dir, name: manifest.name, version: manifest.version, exports: manifest.exports, dependencies: manifest.dependencies || {}, imports: [], scripts: manifest.scripts || {}, componentManifest: null };
  const componentManifestPath = path.join(packageDir, 'ui.component.json');
  if (fs.existsSync(componentManifestPath)) info.componentManifest = JSON.parse(fs.readFileSync(componentManifestPath, 'utf8'));
  packages.push(info);
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    const registrations = new Map();
    const imports = [];
    const visit = n => {
      if (ts.isImportDeclaration(n)) imports.push(n.moduleSpecifier.text);
      if (ts.isCallExpression(n) && n.arguments.length >= 2 && ts.isStringLiteral(n.arguments[0]) && n.arguments[0].text.startsWith('uib-')) registrations.set(n.arguments[1].getText(ast), { tag: n.arguments[0].text, call: n.expression.getText(ast) });
      ts.forEachChild(n, visit);
    };
    visit(ast);
    info.imports.push(...imports.filter(i => i.startsWith('@')));
    for (const n of ast.statements.filter(ts.isClassDeclaration)) {
      if (!n.name || !n.heritageClauses || !/^(?:Uib|Base)/.test(n.name.text)) continue;
      const name = n.name.text;
      const exposed = m => !m.modifiers?.some(x => x.kind === ts.SyntaxKind.PrivateKeyword || x.kind === ts.SyntaxKind.ProtectedKeyword) && !m.name?.getText(ast).startsWith('#');
      const registration = registrations.get(name);
      const body = n.getText(ast);
      const getters = n.members.filter(ts.isGetAccessorDeclaration).filter(m => exposed(m) && m.name.getText(ast) !== 'observedAttributes').map(m => ({ name: m.name.getText(ast), expression: compact(m.body.getText(ast)), writable: n.members.some(s => ts.isSetAccessorDeclaration(s) && s.name.getText(ast) === m.name.getText(ast)) }));
      const setterOnlyProperties = n.members.filter(ts.isSetAccessorDeclaration).filter(m => exposed(m) && !getters.some(g => g.name === m.name.getText(ast))).map(m => ({ name: m.name.getText(ast), expression: compact(m.body.getText(ast)) }));
      const fields = n.members.filter(ts.isPropertyDeclaration).filter(m => exposed(m) && !m.name.getText(ast).startsWith('_')).map(m => compact(m.getText(ast)));
      const observed = n.members.find(m => m.name?.getText(ast) === 'observedAttributes');
      const attributes = unique([...body.matchAll(/(?:getAttribute|hasAttribute|setAttribute|removeAttribute|toggleAttribute)\(['"]([^'"]+)['"]/g)].map(m => m[1]));
      const calls = [];
      const scan = m => {
        if ((ts.isCallExpression(m) && /emit|dispatch/.test(m.expression.getText(ast))) || (ts.isNewExpression(m) && /Event$/.test(m.expression.getText(ast)))) calls.push(compact(m.getText(ast)));
        ts.forEachChild(m, scan);
      };
      scan(n);
      // Join literal fragments so transformed template concatenation still exposes slots/parts.
      const literals = [];
      const strings = m => { if (ts.isStringLiteralLike(m) || ts.isTemplateHead(m) || ts.isTemplateMiddle(m) || ts.isTemplateTail(m)) literals.push(m.text); ts.forEachChild(m, strings); };
      strings(n);
      const markup = literals.join('');
      const slots = unique([...markup.matchAll(/<slot\b([^>]*)>/g)].map(m => /name="([^"]+)"/.exec(m[1])?.[1] || 'default'));
      const parts = unique([...markup.matchAll(/\bpart="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)).filter(p => /^[a-z][\w-]*$/i.test(p)));
      const defaults = [];
      const payloadDefinitions = [];
      const findDefaults = m => { if (ts.isVariableDeclaration(m) && m.initializer) { if (/getAttribute|\|\||\?\?/.test(m.initializer.getText(ast))) defaults.push(compact(m.getText(ast))); if (/detail|payload|selection|request|insert|defaults|eventType/i.test(m.name.getText(ast))) payloadDefinitions.push(compact(m.getText(ast))); } ts.forEachChild(m, findDefaults); };
      findDefaults(n);
      const cssVariables = unique([...text.matchAll(/--uib-[\w-]+/g)].map(m => m[0]));
      const semantics = n.members.filter(m => m.body && /aria-|role=|tabindex|event\.key|disabled|readonly|required|invalid|attachInternals|setFormValue|formAssociated/.test(m.getText(ast))).map(m => {
        const method = m.name?.getText(ast) || 'constructor';
        const source = m.getText(ast);
        const selected = method === 'render' || method.endsWith('Markup')
          ? unique([...source.matchAll(/(?:aria-[\w-]+|role|tabindex|disabled|readonly|required|hidden)="[^"\n]*"|<(?:button|input|select|textarea|details|summary|a|h[1-6])\b|(?:if\s*\([^\n]*|event\.key[^\n]*|[^\n]*\.focus\([^\n]*)/g)].map(x => compact(x[0]))).join('; ')
          : compact(source);
        return { method, evidence: selected || 'State-sensitive rendering; see source and default expressions.' };
      });
      const directPaths = Object.entries(manifest.exports || {}).filter(([, target]) => typeof target === 'string' && path.resolve(packageDir, target) === file).map(([key]) => manifest.name + (key === '.' ? '' : key.slice(1)));
      const matches = evidence.filter(e => registration && e.text.includes(registration.tag));
      classes.push({ package: manifest.name, directory: dir, name, tag: registration?.tag || null, registration: registration?.call || null, file: rel(file), line: ast.getLineAndCharacterOfPosition(n.getStart(ast)).line + 1, superclass: n.heritageClauses[0].types[0].expression.getText(ast), observed: observed ? compact(observed.getText(ast)) : null, attributes, getters, setterOnlyProperties, fields, defaults, payloadDefinitions, methods: n.members.filter(ts.isMethodDeclaration).filter(exposed).map(m => m.name.getText(ast)).filter(m => !m.startsWith('_')), eventCalls: unique(calls), slots, parts, cssVariables, semantics, imports, directPaths, evidence: matches.map(e => e.file), constructor: n.members.filter(ts.isConstructorDeclaration).map(m => compact(m.getText(ast))) });
    }
  }
  info.imports = unique(info.imports).sort();
}
const baseFor = c => classes.find(b => b.name === c.superclass && b.package === c.package) || classes.find(b => b.name === c.superclass);
const chainFor = c => { const chain = [c]; let next = c; const seen = new Set([c.name]); while ((next = baseFor(next)) && !seen.has(next.name)) { chain.push(next); seen.add(next.name); } return chain; };
const reachable = (file, importsToo, seen = new Set()) => {
  if (seen.has(file) || !fs.existsSync(file) || !/\.(js|ts)$/.test(file)) return seen;
  seen.add(file);
  const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  for (const n of ast.statements) {
    if (!ts.isExportDeclaration(n) && !(importsToo && ts.isImportDeclaration(n))) continue;
    const spec = n.moduleSpecifier?.text;
    if (!spec?.startsWith('.')) continue;
    let next = path.resolve(path.dirname(file), spec);
    if (!fs.existsSync(next) && next.endsWith('.js')) next = next.slice(0, -3) + '.ts';
    reachable(next, importsToo, seen);
  }
  return seen;
};
const namedExport = (file, name, seen = new Set()) => {
  const key = file + ':' + name;
  if (seen.has(key) || !fs.existsSync(file) || !/\.(js|ts)$/.test(file)) return false;
  seen.add(key);
  const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  for (const n of ast.statements) {
    if (ts.isClassDeclaration(n) && n.name?.text === name && n.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) return true;
    if (!ts.isExportDeclaration(n) || !n.moduleSpecifier?.text.startsWith('.')) continue;
    let next = path.resolve(path.dirname(file), n.moduleSpecifier.text);
    if (!fs.existsSync(next) && next.endsWith('.js')) next = next.slice(0, -3) + '.ts';
    if (!n.exportClause && namedExport(next, name, seen)) return true;
    if (n.exportClause && ts.isNamedExports(n.exportClause)) {
      const entry = n.exportClause.elements.find(e => e.name.text === name && !e.isTypeOnly);
      if (entry && namedExport(next, entry.propertyName?.text || entry.name.text, seen)) return true;
    }
  }
  return false;
};
// Metadata modules import core helpers only. Stub HTMLElement solely for loading metadata.
globalThis.HTMLElement = class {};
const metadata = new Map();
const catalogMetadata = new Map();
for (const p of ['ui-base-ui/src/metadata/index.js', 'ui-base-forms/src/metadata.js', 'ui-base-calendar/src/metadata.js', 'ui-base-assets/src/metadata.js']) {
  const module = await import(pathToFileURL(path.join(root, 'packages', p)));
  for (const value of Object.values(module)) {
    for (const entry of Array.isArray(value) ? value : Object.values(value || {})) if (entry?.tagName) {
      (Array.isArray(value) ? catalogMetadata : metadata).set(entry.tagName, { file: 'packages/' + p, ...entry });
    }
  }
}
for (const c of classes) {
  const chain = chainFor(c);
  c.chain = chain.map(b => b.name).concat(chain.at(-1).superclass === 'BaseHTMLElement' ? ['HTMLElement (SSR fallback alias)'] : [chain.at(-1).superclass]);
  c.metadata = metadata.get(c.tag) || null;
  c.catalogMetadata = catalogMetadata.get(c.tag) || null;
  c.componentManifest = packages.find(p => p.name === c.package).componentManifest?.components.find(m => m.tagName === c.tag) || null;
  c.constructorProperties = unique(c.constructor.flatMap(text => [...text.matchAll(/this\.([a-zA-Z][\w]*)\s*=/g)].map(m => m[1])));
  const pkg = packages.find(p => p.name === c.package);
  c.importPaths = Object.entries(pkg.exports || {}).filter(([, target]) => typeof target === 'string').flatMap(([key, target]) => {
    const entryFile = path.resolve(root, 'packages', pkg.directory, target);
    if (!reachable(entryFile, true).has(path.resolve(root, c.file))) return [];
    return [{ path: pkg.name + (key === '.' ? '' : key.slice(1)), namedExportReachable: namedExport(entryFile, c.name), registersModule: Boolean(c.tag) }];
  });
}
const result = { schema: 'source-audit-evidence-v1', note: 'Static evidence; source expressions preserve defaults and dynamic contracts. No browser accessibility certification.', packages, classes };
if (process.argv.includes('--write')) {
  fs.writeFileSync(path.join(root, 'docs/ui-base-component-inventory.json'), JSON.stringify(result, null, 2) + '\n');
  const lines = ['# UI-Base component inventory evidence', '', 'Generated with `node scripts/audit-component-architecture.mjs --write`. See the architecture baseline for reviewed findings and migration decisions.', '', 'This appendix records every source custom-element registration and shared class, excludes generated browser copies and test fixtures, and separates static evidence from verified behavior. `BaseHTMLElement` is an HTMLElement alias with a non-browser fallback. Attribute reads are not proof of observation. Empty lists mean no static evidence found, not certified absence. CSS variables include file-level shared styles (a conservative superset in the layout module). Getter expressions and constructor evidence preserve defaults without inventing types. Underscore fields are internal. Public methods may still be implementation hooks rather than supported API.', '', 'Inherited slots/parts/events/getters are listed with their owning class. Registration helpers can inject cssClass/observed css-class and wrap render; see the baseline. Metadata is a current snapshot, not a proposed Definition.', ''];
  const list = a => a.length ? a.map(x => '`' + x + '`').join(', ') : 'None found';
  for (const p of packages) {
    const entries = classes.filter(c => c.package === p.name);
    lines.push(`## ${p.name} (${p.version})`, '', `Source package: \`packages/${p.directory}\`. Registered components: ${entries.filter(c => c.tag).length}.`, '', 'Dependencies:', '', '```json', JSON.stringify(p.dependencies, null, 2), '```', '', 'Cross-package source imports: ' + list(p.imports), '', 'Export map:', '', '```json', JSON.stringify(p.exports, null, 2), '```', '');
    for (const c of entries) {
      lines.push(`### ${c.tag || c.name + ' (shared class)'}`, '', `Source: [${c.file}:${c.line}](../${c.file}). Class: \`${c.name}\`. Chain: ${list(c.chain)}. Registration: \`${c.registration || 'not registered'}\`.`, '', 'Direct module export paths: ' + list(c.directPaths) + '. Root barrels and compatibility aliases are described in the baseline and package export map.', '', 'Documentation/demo/test references: ' + list(c.evidence), '', 'Observed attributes declaration: ' + (c.observed ? '`' + c.observed + '`' : 'Inherited or none; see superclass evidence') + '.', '', 'Attributes explicitly read/written: ' + list(c.attributes), '', 'Public field/default declarations: ' + list(c.fields), '', 'Constructor/default evidence: ' + list(c.constructor), '', 'Own JavaScript accessors (read-only unless writable is true):', '', '```json', JSON.stringify(c.getters, null, 2), '```', '', 'Own methods: ' + list(c.methods), '', 'Own slots: ' + list(c.slots), '', 'Own static CSS parts: ' + list(c.parts), '', 'File-level CSS custom properties: ' + list(c.cssVariables), '', 'Event names/details/options and forwarding evidence:', '', '```js', c.eventCalls.join('\n') || '// No own event emission found; inspect inherited/helper contracts.', '```', '', 'Accessibility, keyboard and state evidence (source expressions, not browser certification):', '');
      for (const s of c.semantics) lines.push(`- \`${s.method}\`: \`${s.evidence.replaceAll('`', "'")}\``);
      if (!c.semantics.length) lines.push('No own explicit ARIA/keyboard/state evidence; check native elements and inherited contracts.');
      lines.push('', 'Package import paths reaching this module (includes registration side effects; named-export reachability is not a type/value export certification):', '', '```json', JSON.stringify(c.importPaths, null, 2), '```', '', 'Setter-only properties:', '', '```json', JSON.stringify(c.setterOnlyProperties, null, 2), '```', '', 'Public properties assigned in constructor: ' + list(c.constructorProperties), '', 'Local attribute/default/normalization expressions:', '', '```js', c.defaults.join('\n') || '// No own local default expressions.', '```', '', 'Event/payload/selection expressions:', '', '```js', c.payloadDefinitions.join('\n') || '// No own payload declarations.', '```', '', 'Inherited contracts: ' + list(chainFor(c).slice(1).map(b => b.name)), '', 'Current rich API metadata:', '', '```json', JSON.stringify(c.metadata, null, 2), '```', '', 'Current flattened catalog metadata:', '', '```json', JSON.stringify(c.catalogMetadata, null, 2), '```', '', 'Current ui.component.json entry:', '', '```json', JSON.stringify(c.componentManifest, null, 2), '```', '');
    }
  }
  fs.writeFileSync(path.join(root, 'docs/ui-base-component-inventory.md'), lines.join('\n') + '\n');
}
console.log(JSON.stringify({ packages: packages.length, components: classes.filter(c => c.tag).length, sharedClasses: classes.filter(c => !c.tag).map(c => c.name), byPackage: packages.map(p => ({ package: p.name, components: classes.filter(c => c.package === p.name && c.tag).length })), duplicateTags: unique(classes.filter(c => c.tag && classes.filter(x => x.tag === c.tag).length > 1).map(c => c.tag)) }, null, 2));
