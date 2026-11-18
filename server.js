/**
 * RoomQ - simple local development server (no dependencies).
 *
 *   npm start            -> http://localhost:8002
 *   PORT=8080 npm start  -> http://localhost:8080
 *
 *   /        -> redirects to the User portal (/user/index.html)
 *   /user    -> User portal
 *   /admin   -> Admin portal
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8002;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.md': 'text/plain; charset=utf-8'
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  res.end(body);
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return send(res, 400, 'Bad request');
  }

  if (pathname === '/') {
    return send(res, 302, 'Redirecting…', { Location: '/user/index.html' });
  }

  // Resolve inside the project folder only (blocks ../ path traversal).
  let filePath = path.normalize(path.join(ROOT, pathname));
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    return send(res, 403, 'Forbidden');
  }
  // Never serve git internals or the server itself.
  const relative = path.relative(ROOT, filePath).split(path.sep);
  if (relative[0] === '.git' || relative[0] === 'node_modules') {
    return send(res, 404, 'Not found');
  }

  fs.stat(filePath, (statErr, stats) => {
    if (!statErr && stats.isDirectory()) {
      // /admin -> /admin/ so relative links (css/, js/) resolve correctly.
      if (!pathname.endsWith('/')) {
        return send(res, 301, 'Moved', { Location: `${pathname}/` });
      }
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        return send(res, 404, `Not found: ${pathname}`);
      }
      const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try: set PORT=8003 && npm start`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log('RoomQ is running:');
  console.log(`  User portal:  http://localhost:${PORT}/user/`);
  console.log(`  Admin portal: http://localhost:${PORT}/admin/`);
  console.log('Press Ctrl+C to stop.');
});
