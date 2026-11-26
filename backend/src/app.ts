import express, { type Express } from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Env } from './config/env.js';
import { paths } from './config/paths.js';
import { publicCache } from './middleware/cache.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiCors, apiRateLimit, securityHeaders } from './middleware/security.js';
import { apiRoutes } from './routes/index.js';

export type AppConfig = Pick<Env, 'CORS_ORIGIN' | 'RATE_LIMIT_PER_MINUTE' | 'TRUST_PROXY' | 'SERVE_CLIENT'>;

/** Build the Express app without listening, so tests can mount it on a random port. */
export function createApp(config: AppConfig): Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.TRUST_PROXY);
  app.set('query parser', 'extended');

  app.use(securityHeaders());
  app.use(express.json({ limit: '10kb' }));

  app.use('/api', apiCors(config.CORS_ORIGIN), apiRateLimit(config.RATE_LIMIT_PER_MINUTE), publicCache(30), apiRoutes);

  // Production: serve the built React app; unknown paths fall back to index.html (client-side routes).
  // Only frontend/dist is exposed — never the database directory.
  if (config.SERVE_CLIENT) {
    if (existsSync(path.join(paths.frontendDist, 'index.html'))) {
      app.use(express.static(paths.frontendDist, { index: false, maxAge: '1h' }));
      app.get('/{*splat}', (_req, res) => res.sendFile(path.join(paths.frontendDist, 'index.html')));
    } else {
      console.warn('[server] SERVE_CLIENT=true but frontend/dist is missing — run `npm run build` first.');
    }
  }

  app.use(errorHandler);
  return app;
}
