const express = require("express");
const { body, validationResult } = require("express-validator");
const { authenticateToken } = require("../middlewares/auth");
const Segment = require("../models/Segment");
const Customer = require("../models/Customer");
const AIService = require("../services/aiService");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// 🔑 Utility to resolve placeholders into real Dates
function resolvePlaceholders(query) {
  const now = new Date();

  function replacer(obj) {
    if (typeof obj === "string") {
      const match = obj.match(/^NOW_MINUS_(\d+)_DAYS$/);
      if (match) {
        const days = parseInt(match[1], 10);
        const date = new Date(now);
        date.setDate(now.getDate() - days);
        return date; // return actual Date object
      }
    } else if (typeof obj === "object" && obj !== null) {
      for (const key of Object.keys(obj)) {
        obj[key] = replacer(obj[key]);
      }
    }
    return obj;
  }

  return replacer(query);
}

// Get all segments
router.get("/", async (req, res) => {
  try {
    const segments = await Segment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(segments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch segments" });
  }
});

// Create segment
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Segment name is required"),
    body("rules").notEmpty().withMessage("Segment rules are required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, rules, isAiGenerated = false } = req.body;

      // ✅ Resolve placeholders before querying
      const resolvedRules = resolvePlaceholders(rules);

      // Calculate audience count
      const audienceCount = await Customer.countDocuments({
        userId: req.user._id,
        ...resolvedRules,
      });

      const segment = new Segment({
        userId: req.user._id,
        name,
        description,
        rules: resolvedRules,
        audienceCount,
        isAiGenerated,
      });

      await segment.save();
      res.status(201).json(segment);
    } catch (error) {
      console.error("Segment creation error:", error);
      res.status(500).json({ error: "Failed to create segment" });
    }
  }
);

// Generate segment with AI
router.post(
  "/ai-generate",
  [body("description").notEmpty().withMessage("Description is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { description } = req.body;

      // Generate rules using AI
      const rules = await AIService.generateSegmentRules(description);

      // ✅ Resolve placeholders
      const resolvedRules = resolvePlaceholders(rules);

      // Calculate audience count
      const audienceCount = await Customer.countDocuments({
        userId: req.user._id,
        ...resolvedRules,
      });

      res.json({
        rules: resolvedRules,
        audienceCount,
        suggestedName: `AI: ${description.substring(0, 30)}...`,
      });
    } catch (error) {
      console.error("AI segment generation error:", error);
      res.status(500).json({ error: "Failed to generate segment with AI" });
    }
  }
);

// Get segment audience
router.get("/:id/audience", async (req, res) => {
  try {
    const segment = await Segment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!segment) {
      return res.status(404).json({ error: "Segment not found" });
    }

    const { page = 1, limit = 10 } = req.query;

    // ✅ Resolve placeholders from stored rules too
    const resolvedRules = resolvePlaceholders(segment.rules);

    const customers = await Customer.find({
      userId: req.user._id,
      ...resolvedRules,
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments({
      userId: req.user._id,
      ...resolvedRules,
    });

    res.json({
      segment,
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Segment audience error:", error);
    res.status(500).json({ error: "Failed to fetch segment audience" });
  }
});

module.exports = router;
