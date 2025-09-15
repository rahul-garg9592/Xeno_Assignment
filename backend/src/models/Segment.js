const mongoose = require("mongoose")

const segmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    rules: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    audienceCount: {
      type: Number,
      default: 0,
    },
    isAiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Segment", segmentSchema)
