import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDir, '..');
const output = resolve(root, 'package-output');
const packages = [
  { name: '@ui.base/core', directory: 'packages/ui-base-core' },
  { name: '@ui.base/design-system', directory: 'packages/ui-base-design-system' },
  { name: '@ui.base/theme', directory: 'packages/ui-base-theme' },
  { name: '@ui.base/icons', directory: 'packages/ui-base-icons' },
  { name: '@ui.base/ui', directory: 'packages/ui-base-ui' },
  { name: '@ui.base/forms', directory: 'packages/ui-base-forms' },
  { name: '@ui.base/hero', directory: 'packages/ui-base-hero' },
  { name: '@ui.base/tour-ui', directory: 'packages/ui-base-tour-ui' },
  { name: '@ui.base/calendar', directory: 'packages/ui-base-calendar' },
  { name: '@ui.base/assets', directory: 'packages/ui-base-assets' }
];

if (existsSync(output)) rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

const packed = [];
for (const item of packages) {
  const packageDir = resolve(root, item.directory);
  const result = spawnSync('npm', ['pack', packageDir, '--pack-destination', output], {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32'
  });

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }

  const tarball = result.stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
  packed.push({ package: item.name, source: item.directory, tarball });
  console.log(`Packed ${item.name}: ${tarball}`);
}

writeFileSync(resolve(output, 'manifest.json'), `${JSON.stringify({ generatedBy: 'npm pack', packages: packed }, null, 2)}\n`);
console.log(`Package tarballs written to ${output}`);
