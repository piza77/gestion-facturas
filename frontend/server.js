const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const DIST_DIR = path.join(__dirname, 'dist');

console.log(`[Server] Starting Express server...`);
console.log(`[Server] DIST_DIR: ${DIST_DIR}`);
console.log(`[Server] PORT: ${PORT}`);

// Servir archivos estáticos del build
app.use(express.static(DIST_DIR));

// CRÍTICO: redirigir todas las rutas a index.html (Vue Router history mode)
app.get('*', (req, res) => {
  console.log(`[Request] ${req.method} ${req.url} → serving index.html`);
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] ✅ Express server listening on 0.0.0.0:${PORT}`);
  console.log(`[Server] Ready to serve frontend from ${DIST_DIR}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully');
  process.exit(0);
});



