/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './src/backend/routes.js';
import { scheduler } from './src/backend/scheduler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Mount API Router on /api
app.use('/api', apiRouter);

// Start Notice Monitor background scheduler
scheduler.start();

async function startServer() {
  if (!isProduction) {
    // Dynamic import to avoid bundling Vite in production
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('[NoticeBondhu Server] Vite middleware mounted for development.');
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[NoticeBondhu Server] Serving production static files from dist.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 Notice Monitor (নোটিশবন্ধু) is running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('[NoticeBondhu Server] Fatal startup error:', err);
  process.exit(1);
});
