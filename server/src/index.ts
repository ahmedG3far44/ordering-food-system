import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.routes";
import orderRoutes from "./routes/order.routes";
import restaurantRoutes from "./routes/restaurant.routes";
import uploadRoutes from "./routes/upload.routes";

import { connectDB } from "./utils/mongodb";
import { Request, Response } from "express";
import { requestLogger } from "./middlewares/logger";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

export const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

async function startServer() {
  const PORT = process.env.PORT || 5006;
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  await connectDB();
  app.use(express.json({ limit: "10mb" }));
  app.use(requestLogger);

  app.use("/api/auth", authRoutes);
  app.use("/api/restaurants", restaurantRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/upload", uploadRoutes);

  app.get("/", (req: Request, res: Response) => {
    res.send(`<div>
      <h2>Ordering System Server is running</h2>
      <p>Visit <a href="/health">/health</a> to check the server status.</p>
      </div>`);
  });
  app.get("/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      message: "Ordering System Server is running",
      time: new Date().toISOString(),
    });
  });

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
  });
}

startServer();
