import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import presets from "./routes/presets.js";
import { seedPresets } from "./seed.js";
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || true }));
app.use(express.json({ limit: "1mb" }));
const swagger = {
  openapi: "3.0.0",
  info: { title: "Numerical Method Calculator API", version: "1.0.0" },
  paths: {
    "/api/health": {
      get: {
        summary: "Health check",
        responses: { 200: { description: "API is running" } },
      },
    },
    "/api/presets": {
      get: {
        summary: "Get a sample preset",
        parameters: [
          { in: "query", name: "category", schema: { type: "string" } },
          { in: "query", name: "method", schema: { type: "string" } },
        ],
        responses: { 200: { description: "Preset or null" } },
      },
      post: {
        summary: "Create or update a preset",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["category", "method", "title", "input"],
                properties: {
                  category: { type: "string" },
                  method: { type: "string" },
                  title: { type: "string" },
                  input: { type: "object" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Saved" } },
      },
    },
  },
};
app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  }),
);
app.use("/api/presets", presets);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swagger));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Internal server error" });
});
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on ${port}`));
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log("MongoDB connected");
      await seedPresets();
    })
    .catch((e) => console.error("MongoDB connection failed:", e.message));
} else console.warn("MONGODB_URI not set; API starts without database.");
