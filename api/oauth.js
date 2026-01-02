/**
 * Vercel Serverless Function para OAuth
 * Handles all /api/oauth/* routes
 */

import express from 'express';
import cors from 'cors';
import { registerOAuthRoutes } from '../server/_core/oauth.ts';

// Create Express app
const app = express();

// Enable CORS for Vercel deployment
app.use(cors());

// Configure body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register OAuth routes
registerOAuthRoutes(app);

// Export handler for Vercel
export default app;
