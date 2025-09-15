const express = require("express")
const { body, validationResult } = require("express-validator")
const DeliveryService = require("../services/deliveryService")

const router = express.Router()

// Delivery receipt webhook (simulated vendor callback)
router.post(
  "/receipt",
  [
    body("vendorMessageId").notEmpty().withMessage("Vendor message ID is required"),
    body("status").isIn(["SENT", "FAILED"]).withMessage("Status must be SENT or FAILED"),
    body("timestamp").isISO8601().withMessage("Valid timestamp is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { vendorMessageId, status, timestamp, failureReason } = req.body

      await DeliveryService.processDeliveryReceipt({
        vendorMessageId,
        status,
        timestamp: new Date(timestamp),
        failureReason,
      })

      res.json({ message: "Delivery receipt processed successfully" })
    } catch (error) {
      console.error("Delivery receipt error:", error)
      res.status(500).json({ error: "Failed to process delivery receipt" })
    }
  },
)

module.exports = router
