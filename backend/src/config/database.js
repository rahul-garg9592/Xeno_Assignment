const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    console.log("🔌 Attempting to connect to MongoDB Atlas...")
    console.log("📍 Connection URI:", process.env.MONGODB_URI ? "Found" : "Not found")

    // Connection event listeners
    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB Atlas Connected Successfully!")
    })

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB Connection Error:", err.message)
    })

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB Disconnected")
    })

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 60000, // 60s
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      maxPoolSize: 10,
      retryWrites: true,
      w: "majority",

      // 👇 TLS options (important for Atlas on some Node setups)
      tls: true,
      tlsAllowInvalidCertificates: process.env.NODE_ENV !== "production", // allow only in dev
    })

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)
    console.log(`🔗 Connection State: ${mongoose.connection.readyState}`)

    return true
  } catch (error) {
    console.error("❌ Database connection error:", error.message)
    console.error("🔍 Error details:", {
      name: error.name,
      code: error.code,
      reason: error.reason,
    })

    console.log("⚠️ App will continue without database connection")
    return false
  }
}

// Test connection
const testConnection = async () => {
  try {
    console.log("🧪 Testing MongoDB connection...")
    const result = await mongoose.connection.db.admin().ping()
    console.log("✅ Connection test successful:", result)
    return true
  } catch (error) {
    console.error("❌ Connection test failed:", error.message)
    return false
  }
}

module.exports = { connectDB, testConnection }
