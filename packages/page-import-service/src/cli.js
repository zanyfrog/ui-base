#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { extractPage } from './extract-page.js';

const args = process.argv.slice(2);
const url = args.find((arg) => !arg.startsWith('--'));
const outIndex = args.indexOf('--out');
const outPath = outIndex >= 0 ? args[outIndex + 1] : '';

if (!url) {
  console.error('Usage: uib-page-import <url> [--out page-extraction-result.json]');
  process.exit(1);
}

try {
  const result = await extractPage({ url });
  const json = `${JSON.stringify(result, null, 2)}\n`;
  if (outPath) {
    writeFileSync(outPath, json, 'utf8');
  } else {
    process.stdout.write(json);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
