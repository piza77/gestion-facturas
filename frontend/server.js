const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, 'dist');

console.log(`[Server] Starting Express server...`);
console.log(`[Server] DIST_DIR: ${DIST_DIR}`);
console.log(`[Server] PORT: ${PORT}`);
console.log(`[Server] NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

// Verificar que dist/ existe
if (!fs.existsSync(DIST_DIR)) {
  console.error(`[Server] ❌ ERROR: dist directory does not exist at ${DIST_DIR}`);
  process.exit(1);
}

// Servir archivos estáticos del build
app.use(express.static(DIST_DIR, {
  maxAge: '1h',
  etag: false
}));

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// CRÍTICO: redirigir todas las rutas a index.html (Vue Router history mode)
app.get('*', (req, res) => {
  const indexPath = path.join(DIST_DIR, 'index.html');
  
  fs.readFile(indexPath, 'utf8', (err, content) => {
    if (err) {
      console.error(`[Server] ❌ Error reading index.html: ${err.message}`);
      return res.status(500).send('Internal Server Error');
    }
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(content);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[Server] ❌ Error: ${err.message}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] ✅ Express server listening on 0.0.0.0:${PORT}`);
  console.log(`[Server] Ready to serve frontend from ${DIST_DIR}`);
});

server.on('error', (err) => {
  console.error(`[Server] ❌ Server error: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] 🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});



