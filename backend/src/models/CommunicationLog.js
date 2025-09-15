const mongoose = require("mongoose")

const communicationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    messageContent: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["queued", "sent", "failed", "delivered", "bounced"],
      default: "queued",
    },
    deliveryStatus: {
      type: String,
      enum: ["SENT", "FAILED"],
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    failureReason: {
      type: String,
    },
    vendorMessageId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

communicationLogSchema.index({ campaignId: 1, status: 1 })

module.exports = mongoose.model("CommunicationLog", communicationLogSchema)
