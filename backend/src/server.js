import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import presets from "./routes/presets.js";
import { seedPresets } from "./seed.js";

import dns from "node:dns";

if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin denied"));
    },
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? "ok" : "unavailable",
    database: connected ? "connected" : "disconnected",
  });
});

app.use("/api/presets", presets);

if (process.env.NODE_ENV !== "production") {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup({
      openapi: "3.0.0",
      info: {
        title: "Numerical Method API",
        version: "1.0.0",
      },
      paths: {
        "/api/health": {
          get: {
            responses: {
              200: { description: "Ready" },
            },
          },
        },
      },
    }),
  );
}

app.use((err, _req, res, _next) => {
  if (err.message === "CORS origin denied") {
    return res.status(403).json({
      message: "Origin not allowed",
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      message: "Payload too large",
    });
  }

  console.error("API error:", err);

  res.status(500).json({
    message: "Internal server error",
  });
});

const port = Number(process.env.PORT || 4000);

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB connected");

  if (process.env.SEED_PRESETS === "true") {
    await seedPresets();
  }

  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`API listening on ${port}`);
  });

  const shutdown = async () => {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

start().catch((error) => {
  console.error("Startup failed:", error.message);
  process.exit(1);
});
