import { createServer } from 'node:http';
import { extractPage } from './extract-page.js';

const port = Number(process.env.PAGE_IMPORT_SERVICE_PORT || process.env.PORT || 4178);

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(JSON.stringify(payload, null, 2));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || `localhost:${port}`}`);

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      sendJson(res, 200, { ok: true, service: '@ui-base/page-import-service' });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/extract') {
      const body = await readJson(req);
      if (!body.url) {
        sendJson(res, 400, { ok: false, error: 'Missing required url.' });
        return;
      }
      const result = await extractPage(body);
      sendJson(res, 200, { ok: true, result });
      return;
    }

    sendJson(res, 404, { ok: false, error: 'Not found.' });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(port, () => {
  console.log(`Page import service running at http://localhost:${port}/`);
});
