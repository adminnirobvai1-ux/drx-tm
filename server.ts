/**
 * Full-Stack Express Server for Dark Killer Signal Dashboard
 * Binds to 0.0.0.0:3000.
 */

import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { securityHeaders } from './server/middleware/securityHeaders.ts';
import { apiRouter } from './server/routes/api.ts';
import { initFirebaseService } from './server/services/firebaseService.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Firebase RTDB sync in background
  initFirebaseService().catch((err) => {
    console.warn('[Server] Firebase init warning:', err);
  });

  // Middlewares
  app.use(express.json());
  app.use(cookieParser());
  app.use(securityHeaders);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Dark Killer Secure Server' });
  });

  // Secure API Proxy Routes
  app.use('/api/v1', apiRouter);

  // Vite middleware in development vs Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Dark Killer] Secure server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
