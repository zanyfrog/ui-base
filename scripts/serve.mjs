import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const rootArg = process.argv[2] || '.';
const port = Number(process.argv[3] || 5173);
const root = resolve(process.cwd(), rootArg);
const fallback = join(root, 'apps/demo/index.html');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const withoutLeadingSlash = decoded.replace(/^\/+/, '');
  const normalized = normalize(withoutLeadingSlash);
  if (normalized.startsWith('..')) return null;
  return join(root, normalized);
}

function sendFile(res, filePath) {
  const ext = extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
}

createServer((req, res) => {
  const requestUrl = req.url || '/';
  const filePath = safePath(requestUrl);

  if (!filePath) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  if (existsSync(filePath)) {
    const stat = statSync(filePath);
    if (stat.isFile()) {
      sendFile(res, filePath);
      return;
    }

    if (stat.isDirectory()) {
      const indexPath = join(filePath, 'index.html');
      if (existsSync(indexPath) && statSync(indexPath).isFile()) {
        sendFile(res, indexPath);
        return;
      }
    }
  }

  if (requestUrl === '/' && existsSync(fallback)) {
    sendFile(res, fallback);
    return;
  }

  if (existsSync(fallback)) {
    sendFile(res, fallback);
    return;
  }

  res.writeHead(404);
  res.end('Not found');
}).listen(port, () => {
  console.log(`UI Base demo running at http://localhost:${port}/`);
});
