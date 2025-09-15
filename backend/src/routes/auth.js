const express = require("express")
const passport = require("passport")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const User = require("../models/User")

const router = express.Router()

// Google OAuth login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
)

// Mock login for development (remove in production)
router.get("/mock", async (req, res) => {
  try {
    // Wait for database connection with retry logic
    let retries = 0
    const maxRetries = 5
    
    while (mongoose.connection.readyState !== 1 && retries < maxRetries) {
      console.log(`⏳ Waiting for database connection... (${retries + 1}/${maxRetries})`)
      console.log(`🔗 Connection state: ${mongoose.connection.readyState} (1=connected, 2=connecting, 0=disconnected)`)
      
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
      retries++
    }
    
    if (mongoose.connection.readyState !== 1) {
      console.error("❌ Database connection timeout after", maxRetries, "retries")
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=db_connection_timeout`)
    }

    console.log("✅ Database connected, proceeding with authentication...")
    console.log("🔍 Searching for existing test user...")
    // Create or find a mock user
    let user = await User.findOne({ email: "test@example.com" })
    
    if (!user) {
      console.log("👤 Creating new test user...")
      user = new User({
        googleId: "mock-google-id",
        name: "Test User",
        email: "test@example.com",
        avatar: "https://via.placeholder.com/150",
      })
      await user.save()
      console.log("✅ Test user created successfully")
    } else {
      console.log("✅ Found existing test user")
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    console.log("🎫 JWT token generated for user:", user.email)
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`)
  } catch (error) {
    console.error("❌ Mock auth error:", error.message)
    console.error("🔍 Error details:", {
      name: error.name,
      code: error.code,
      stack: error.stack
    })
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`)
  }
})

// Google OAuth callback
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), async (req, res) => {
  try {
    // Update last login
    await User.findByIdAndUpdate(req.user._id, {
      lastLogin: new Date(),
    })

    // Generate JWT token
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`)

  } catch (error) {
    console.error("Auth callback error:", error)
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`)
  }
})

// Logout
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" })
    }
    res.json({ message: "Logged out successfully" })
  })
})

// Get current user
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    console.log("Auth header:", authHeader)
    console.log("Token:", token ? token.substring(0, 20) + "..." : "No token")

    if (!token) {
      console.log("No token provided")
      return res.status(401).json({ error: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log("Decoded token:", decoded)
    
    const user = await User.findById(decoded.userId).select("-googleId")
    console.log("Found user:", user ? user.email : "No user found")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Auth /me error:", error)
    res.status(401).json({ error: "Invalid token", details: error.message })
  }
})

module.exports = router
