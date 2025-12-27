/**
 * Vercel Serverless Function para tRPC
 * Handles all /api/trpc/* routes
 */

import { createExpressMiddleware } from '@trpc/server/adapters/express';
import express from 'express';
import { appRouter } from '../dist/routers.js';
import { createContext } from '../dist/_core/context.js';

// Create Express app
const app = express();

// Configure body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Setup tRPC middleware
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Export handler for Vercel
export default app;
