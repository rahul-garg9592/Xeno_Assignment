const express = require("express")
const transporter = require("../config/email")

const router = express.Router()

// Test email endpoint
router.get("/test-email", async (req, res) => {
  try {
    const toAddress = req.query.to || process.env.EMAIL_USER

    console.log(`📧 Attempting to send test email to: ${toAddress}`)

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: toAddress,
      subject: "✅ Test Email from Mini CRM",
      text: "Hello! This is a test email sent from your Mini CRM backend.",
    })

    console.log("✅ Test email sent:", info.messageId)

    res.json({ success: true, messageId: info.messageId, to: toAddress })
  } catch (error) {
    console.error("❌ Test email error:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
