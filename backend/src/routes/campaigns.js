const express = require("express")
const { body, validationResult } = require("express-validator")
const { authenticateToken } = require("../middlewares/auth")
const Campaign = require("../models/Campaign")
const Segment = require("../models/Segment")
const Customer = require("../models/Customer")
const CommunicationLog = require("../models/CommunicationLog")
const AIService = require("../services/aiService")
const DeliveryService = require("../services/deliveryService")

const router = express.Router()

// Apply authentication to all routes
router.use(authenticateToken)

// Get campaign history
router.get("/history", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const campaigns = await Campaign.find({ userId: req.user._id })
      .populate("segmentId", "name")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await Campaign.countDocuments({ userId: req.user._id })

    res.json({
      campaigns,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch campaign history" })
  }
})

// Get campaign details
router.get("/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("segmentId", "name rules")

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" })
    }

    // Get communication logs
    const logs = await CommunicationLog.find({
      campaignId: campaign._id,
      userId: req.user._id,
    })
      .populate("customerId", "firstName lastName email")
      .sort({ createdAt: -1 })

    res.json({ campaign, logs })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch campaign details" })
  }
})

// Create and launch campaign
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Campaign name is required"),
    body("segmentId").notEmpty().withMessage("Segment ID is required"),
    body("messageTemplate").notEmpty().withMessage("Message template is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, segmentId, messageTemplate } = req.body

      // Verify segment exists
      const segment = await Segment.findOne({
        _id: segmentId,
        userId: req.user._id,
      })

      if (!segment) {
        return res.status(404).json({ error: "Segment not found" })
      }

      // Get audience
      const audience = await Customer.find({
        userId: req.user._id,
        ...segment.rules,
      })

      // Create campaign
      const campaign = new Campaign({
        userId: req.user._id,
        name,
        segmentId,
        messageTemplate,
        audienceSize: audience.length,
        status: "queued",
      })

      await campaign.save()

      // Create communication logs
      const communicationLogs = audience.map((customer) => ({
        userId: req.user._id,
        campaignId: campaign._id,
        customerId: customer._id,
        messageContent: messageTemplate.replace(/\{\{first_name\}\}/g, customer.firstName),
        status: "queued",
      }))

      const savedLogs = await CommunicationLog.insertMany(communicationLogs)

      // 🔹 Send real emails (replaces old simulation)
      await DeliveryService.sendEmails(campaign._id, savedLogs)

      res.status(201).json({
        campaign,
        message: "Campaign created and delivery started",
      })
    } catch (error) {
      console.error("Campaign creation error:", error)
      res.status(500).json({ error: "Failed to create campaign" })
    }
  },
)

// Generate AI message suggestions
router.post("/ai-messages", [body("objective").notEmpty().withMessage("Objective is required")], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { objective, audienceDescription } = req.body

    const suggestions = await AIService.generateMessageSuggestions(objective, audienceDescription)

    res.json({ suggestions })
  } catch (error) {
    console.error("AI message generation error:", error)
    res.status(500).json({ error: "Failed to generate message suggestions" })
  }
})

// Get campaign summary with AI
router.get("/:id/summary", async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" })
    }

    const summary = await AIService.generateCampaignSummary({
      audienceSize: campaign.audienceSize,
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
    })

    res.json({ summary })
  } catch (error) {
    res.status(500).json({ error: "Failed to generate campaign summary" })
  }
})

module.exports = router
