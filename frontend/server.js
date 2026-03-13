const http = require('http');
const fs = require('fs');
const path = require('path');

// Use Railway's PORT variable, fallback to 3000 for local development
const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

console.log(`[Server] Starting server...`);
console.log(`[Server] DIST_DIR: ${DIST_DIR}`);
console.log(`[Server] __dirname: ${__dirname}`);
console.log(`[Server] Using Dockerfile.frontend configuration`);

// Check if dist exists
if (!fs.existsSync(DIST_DIR)) {
  console.error(`[Server] ERROR: dist directory does not exist at ${DIST_DIR}`);
  console.log(`[Server] Contents of ${__dirname}:`);
  try {
    const contents = fs.readdirSync(__dirname);
    console.log(contents);
  } catch (e) {
    console.error(`[Server] Could not read directory: ${e.message}`);
  }
}

const server = http.createServer((req, res) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.log(`[Response] File not found: ${filePath}, serving index.html`);
      fs.readFile(path.join(DIST_DIR, 'index.html'), (err2, content2) => {
        if (err2) {
          console.error(`[Response] ERROR: Could not read index.html: ${err2.message}`);
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 - Application Error</h1><p>Could not find dist/index.html</p>');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content2);
      });
    } else {
      const ext = path.extname(filePath);
      const contentType = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject'
      }[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.on('error', (err) => {
  console.error(`[Server ERROR] ${err.message}`);
  process.exit(1);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] ✅ Server is listening on port ${PORT}`);
  console.log(`[Server] Ready to serve frontend from ${DIST_DIR}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});



