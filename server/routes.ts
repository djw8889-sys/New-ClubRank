import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // This app uses Firebase for all data operations
  // No backend API routes are needed currently
  
  // Example API route for future expansion:
  // app.get('/api/health', (req, res) => {
  //   res.json({ status: 'ok' });
  // });
  
  const httpServer = createServer(app);
  return httpServer;
}