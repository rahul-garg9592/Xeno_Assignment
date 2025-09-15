require("dotenv").config()
const mongoose = require("mongoose")

async function createIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    const db = mongoose.connection.db

    // Create indexes for better performance

    // Customer indexes
    await db.collection("customers").createIndex({ userId: 1, email: 1 })
    await db.collection("customers").createIndex({ userId: 1, totalSpend: -1 })
    await db.collection("customers").createIndex({ userId: 1, lastSeenAt: -1 })
    await db.collection("customers").createIndex({
      firstName: "text",
      lastName: "text",
      email: "text",
    })
    console.log("✅ Customer indexes created")

    // Order indexes
    await db.collection("orders").createIndex({ userId: 1, customerId: 1 })
    await db.collection("orders").createIndex({ userId: 1, orderDate: -1 })
    await db.collection("orders").createIndex({ customerId: 1, orderDate: -1 })
    console.log("✅ Order indexes created")

    // Campaign indexes
    await db.collection("campaigns").createIndex({ userId: 1, createdAt: -1 })
    await db.collection("campaigns").createIndex({ userId: 1, status: 1 })
    console.log("✅ Campaign indexes created")

    // Communication log indexes
    await db.collection("communicationlogs").createIndex({ campaignId: 1, status: 1 })
    await db.collection("communicationlogs").createIndex({ userId: 1, createdAt: -1 })
    console.log("✅ Communication log indexes created")

    // Segment indexes
    await db.collection("segments").createIndex({ userId: 1, createdAt: -1 })
    console.log("✅ Segment indexes created")

    console.log("🎉 All indexes created successfully")
  } catch (error) {
    console.error("Error creating indexes:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

createIndexes()
