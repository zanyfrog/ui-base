import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = join(root, 'packages/ui-layout/src');
const outRoot = join(root, 'packages/ui-layout/browser');

rmSync(outRoot, { recursive: true, force: true });

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full);
      continue;
    }
    if (extname(entry) !== '.ts' || entry.endsWith('.d.ts')) continue;
    const relativePath = relative(sourceRoot, full);
    const outPath = join(outRoot, relativePath).replace(/\.ts$/, '.js');
    mkdirSync(dirname(outPath), { recursive: true });
    const source = readFileSync(full, 'utf8');
    const stripped = stripTypeScriptTypes(source, { mode: 'strip' });
    writeFileSync(outPath, stripped, 'utf8');
  }
}

walk(sourceRoot);
console.log(`Built UI layout browser runtime at ${outRoot}`);
