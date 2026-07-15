#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { analyzeComponentSource } from '../analyzer/analyze-component.js';
import { applyLayoutOperationsToSource } from '../writer/apply-layout-operations.js';
import type { LayoutOperation } from '../model/layout-operation.js';

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === 'analyze') {
    const fileName = args[0];
    if (!fileName) fail('Missing source file.');
    const out = valueAfter(args, '--out');
    const sourceText = await readFile(fileName, 'utf8');
    const analysis = analyzeComponentSource({ sourceText, fileName });
    const json = `${JSON.stringify(analysis, null, 2)}\n`;
    if (out) await writeFile(out, json, 'utf8');
    else process.stdout.write(json);
    return;
  }

  if (command === 'patch') {
    const fileName = args[0];
    if (!fileName) fail('Missing source file.');
    const opsFile = valueAfter(args, '--ops');
    if (!opsFile) fail('Missing --ops file.');
    const write = args.includes('--write');
    const dryRun = args.includes('--dry-run') || !write;
    const sourceText = await readFile(fileName, 'utf8');
    const operations = JSON.parse(await readFile(opsFile, 'utf8')) as LayoutOperation[];
    const result = applyLayoutOperationsToSource(sourceText, operations, { fileName });
    process.stdout.write(result.diffText);
    if (result.warnings.length) process.stderr.write(`${result.warnings.join('\n')}\n`);
    if (write) await writeFile(fileName, result.updatedText, 'utf8');
    if (!dryRun && !write) fail('Patch requires --dry-run or --write.');
    return;
  }

  if (command === 'serve') {
    fail('The MVP CLI does not start a layout server yet. Use the ui-layout demo page in this workspace.');
  }

  fail(`Unknown command: ${command}`);
}

function valueAfter(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function printHelp() {
  process.stdout.write(`mt-layout

Commands:
  mt-layout analyze path/to/component.ts --out layout-analysis.json
  mt-layout patch path/to/component.ts --ops layout-operations.json --dry-run
  mt-layout patch path/to/component.ts --ops layout-operations.json --write
`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
