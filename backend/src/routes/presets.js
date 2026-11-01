
import { Router } from "express";
import { timingSafeEqual } from "node:crypto";
import Preset from "../models/Preset.js";

const router = Router();

const validText = (value, max = 100) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.length <= max;

const safeKey = (value) =>
  validText(value) &&
  !value.includes("$") &&
  !value.includes(".") &&
  !value.includes("\0");

const isPlainObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

router.get("/", async (req, res, next) => {
  try {
    const { category, method } = req.query;

    if (
      (category !== undefined && !safeKey(category)) ||
      (method !== undefined && !safeKey(method))
    ) {
      return res.status(400).json({
        message: "Invalid query",
      });
    }

    const query = {};

    if (category) query.category = category;
    if (method) query.method = method;

    const preset = await Preset.findOne(query)
      .sort({ createdAt: 1 })
      .lean();

    res.json({ preset });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const token = process.env.PRESET_ADMIN_TOKEN;

    if (!token) {
      return res.status(403).json({
        message: "Preset writes disabled",
      });
    }

    const auth = req.get("authorization") || "";

    const supplied = auth.startsWith("Bearer ")
      ? auth.slice(7)
      : "";

    const a = Buffer.from(supplied);
    const b = Buffer.from(token);

    if (
      a.length !== b.length ||
      !timingSafeEqual(a, b)
    ) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const {
      category,
      method,
      title,
      input,
      description = "",
    } = req.body || {};

    if (
      ![category, method, title].every(safeKey) ||
      !isPlainObject(input) ||
      typeof description !== "string" ||
      description.length > 1000
    ) {
      return res.status(400).json({
        message: "Invalid preset data",
      });
    }

    const preset = await Preset.findOneAndUpdate(
      { category, method, title },
      { $set: { input, description } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(201).json({ preset });
  } catch (error) {
    next(error);
  }
});

export default router;
