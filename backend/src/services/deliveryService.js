const transporter = require("../config/email")
const CommunicationLog = require("../models/CommunicationLog")
const Campaign = require("../models/Campaign")

class DeliveryService {
  static async sendEmails(campaignId, communicationLogs) {
    try {
      const campaign = await Campaign.findById(campaignId)
      if (!campaign) throw new Error("Campaign not found")

      // Mark as sending
      campaign.status = "sending"
      await campaign.save()

      for (const log of communicationLogs) {
        try {
          const customer = await log.populate("customerId", "email firstName")

          const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: customer.customerId.email,
            subject: `Message from ${campaign.name}`,
            text: log.messageContent,
          }

          // Send email
          await transporter.sendMail(mailOptions)

          // Success
          log.status = "sent"
          log.deliveredAt = new Date()
          log.deliveryStatus = "SENT"
          await log.save()

          campaign.sentCount += 1
        } catch (error) {
          console.error("Email sending error:", error)

          // Failed
          log.status = "failed"
          log.failureReason = error.message
          log.deliveryStatus = "FAILED"
          await log.save()

          campaign.failedCount += 1
        }
      }

      // Mark completed
      campaign.status = "completed"
      campaign.completedAt = new Date()
      await campaign.save()

      return { success: true, message: "Emails sent" }
    } catch (error) {
      console.error("Delivery service error:", error)
      throw new Error("Failed to send emails")
    }
  }
}

module.exports = DeliveryService
