import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'cmd.exe' : 'npm';
const args = new Set(process.argv.slice(2));

const services = [
  {
    name: 'demo',
    color: '\x1b[36m',
    command: ['run', 'start', '-w', '@ui-base/demo'],
    url: 'http://localhost:5173',
  },
  {
    name: 'page-import',
    color: '\x1b[35m',
    command: ['run', 'start', '-w', '@ui-base/page-import-service'],
    url: 'http://localhost:4178',
  },
];

if (args.has('--manager') || args.has('--all')) {
  services.push({
    name: 'manager',
    color: '\x1b[33m',
    command: ['run', 'dev', '-w', '@ui-base/app-manager'],
    url: 'http://localhost:5174',
  });
}

if (args.has('--help') || args.has('-h')) {
  console.log(`Start UI Base local services.

Usage:
  npm run dev:services
  npm run dev:services -- --manager
  npm run dev:services -- --all

Default services:
  demo          http://localhost:5173
  page-import   http://localhost:4178

Options:
  --manager     Also start @ui-base/app-manager
  --all         Start every known local UI Base service
`);
  process.exit(0);
}

const reset = '\x1b[0m';
const children = new Set();

function log(service, text, stream = process.stdout) {
  const lines = String(text).split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    stream.write(`${service.color}[${service.name}]${reset} ${line}\n`);
  }
}

function stopAll(signal = 'SIGTERM') {
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
}

process.on('SIGINT', () => {
  console.log('\nStopping UI Base services...');
  stopAll('SIGINT');
});

process.on('SIGTERM', () => {
  stopAll('SIGTERM');
});

for (const service of services) {
  const childArgs = isWindows
    ? ['/d', '/s', '/c', `npm ${service.command.join(' ')}`]
    : service.command;
  const child = spawn(npmCommand, childArgs, {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  children.add(child);
  log(service, `starting: npm ${service.command.join(' ')}`);
  log(service, `expected URL: ${service.url}`);

  child.stdout.on('data', (chunk) => log(service, chunk));
  child.stderr.on('data', (chunk) => log(service, chunk, process.stderr));
  child.on('error', (error) => {
    children.delete(child);
    log(service, `failed to start: ${error.message}`, process.stderr);
    stopAll();
    process.exitCode = 1;
    if (!children.size) process.exit(1);
  });
  child.on('exit', (code, signal) => {
    children.delete(child);
    log(service, `exited${signal ? ` by ${signal}` : ''}${code === null ? '' : ` with code ${code}`}`);
    if (code && children.size) {
      stopAll();
      process.exitCode = code;
    }
    if (!children.size) process.exit(process.exitCode || 0);
  });
}
