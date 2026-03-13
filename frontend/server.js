const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
// Dist puede estar en frontend/dist o dist dependiendo de cómo se ejecute
const DIST_DIR = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      // SPA fallback - si no encuentra el archivo, sirve index.html
      fs.readFile(path.join(DIST_DIR, 'index.html'), (err2, content2) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1>404 - Not Found</h1><p>Could not find ' + DIST_DIR + '</p>');
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
        '.svg': 'image/svg+xml'
      }[ext] || 'text/plain';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server listening on port ${PORT}`);
});


