/**
 * Vercel Serverless Function para OAuth
 * Handles all /api/oauth/* routes
 */

import express from 'express';
import { registerOAuthRoutes } from '../dist/_core/oauth.js';

// Create Express app
const app = express();

// Configure body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register OAuth routes
registerOAuthRoutes(app);

// Export handler for Vercel
export default app;
