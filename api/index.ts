import express from "express";
import registerRoutes from "./routes.js"; // FIX: Changed to default import

const app = express();
app.use(express.json());

registerRoutes(app);

export default app;