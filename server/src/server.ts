import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import env from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";
import authRoute from "./routes/auth.route.js";
import noteRoute from "./routes/note.route.js";

env.config();

const app = express();

// security and middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
app.use(express.json({ limit: "10kb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// routes
app.get("/api/health", (_req: express.Request, res: express.Response) => {
  return res.json({ message: "Server is running perfectly fine!" });
});
app.use("/api/auth", authRoute);
app.use("/api/notes", noteRoute);
// 404 catch-all route
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ message: "Route not found!" });
});

// global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err.name === "ValidationError") {
    const errors = Object.values((err as any).errors).map((e: any) => e.message);
    return res.status(400).json({ errors: errors });
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

// start server with graceful shutdown
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  const shutdown = () => {
    console.log("Shutting down...");
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer().catch((err: Error) => {
  console.error("Failed to start: ", err);
  process.exit(1);
});
