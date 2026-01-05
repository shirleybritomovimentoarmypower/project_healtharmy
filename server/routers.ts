import type { Express } from 'express';
import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const appRouter = t.router({
  health: t.procedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
});

export type AppRouter = typeof appRouter;

export function registerRoutes(app: Express) {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}
