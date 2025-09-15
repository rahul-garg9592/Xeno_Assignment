require("dotenv").config()
const express = require("express")
const cors = require("cors")
const session = require("express-session")
const passport = require("./config/passport")
const { connectDB } = require("./config/database")

// Import routes
const authRoutes = require("./routes/auth")
const customerRoutes = require("./routes/customers")
const segmentRoutes = require("./routes/segments")
const campaignRoutes = require("./routes/campaigns")
const deliveryRoutes = require("./routes/delivery")
const testRoutes = require("./routes/test")

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use("/auth", authRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/segments", segmentRoutes)
app.use("/api/campaigns", campaignRoutes)
app.use("/api/delivery", deliveryRoutes)
app.use("/api", testRoutes)


// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})
app.get("/", (req, res) => {
    res.json("Hello World");
  })

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
})

module.exports = app