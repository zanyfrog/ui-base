import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const manifest = JSON.parse(readFileSync(new URL('../packages/ui-base-ui/ui.component.json', import.meta.url), 'utf8'));
const card = manifest.components.find(entry => entry.implementation?.tagName === 'uib-card');
const items = entries => entries.map(([name, value]) => ({ name, ...value, type: value.type || '', description: value.description || `${name} runtime API.` }));
const projection = {
  tagName: card.implementation.tagName, package: card.ownership.package.packageId, maturity: card.maturity, purpose: card.identity.description,
  attributes: items(Object.entries(card.runtime.attributes)), properties: items(Object.entries(card.runtime.properties)),
  events: items(Object.entries(card.runtime.events)), slots: items(card.runtime.slots.map(slot => [slot.name, {}])),
  cssParts: items(card.presentation.parts.map(name => [name, {}])), cssVariables: items(card.presentation.cssVariables.map(name => [name, {}])),
  examples: ['<uib-card heading="Card" selectable><p>Card body.</p></uib-card>']
};
const output = `// Generated from ui.component.json by scripts/generate-card-metadata.mjs. Do not edit.\nexport const CARD_COMPONENT_API = ${JSON.stringify(projection, null, 2)};\n`;
const target = new URL('../packages/ui-base-ui/src/platform/card-metadata.generated.js', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== output) throw new Error('Card metadata is stale. Run node scripts/generate-card-metadata.mjs.');
} else writeFileSync(target, output);
console.log(`Card metadata ${process.argv.includes('--check') ? 'verified' : 'generated'}: ${fileURLToPath(target)}`);
