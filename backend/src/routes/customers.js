const express = require("express")
const { body, validationResult } = require("express-validator")
const { authenticateToken } = require("../middlewares/auth")
const Customer = require("../models/Customer")
const Order = require("../models/Order")

const router = express.Router()

// Apply authentication to all routes
router.use(authenticateToken)

// Get all customers
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query

    const query = { userId: req.user._id }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    const customers = await Customer.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })

    const total = await Customer.countDocuments(query)

    res.json({
      customers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customers" })
  }
})

// Get customer by ID
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" })
    }

    // Get customer orders
    const orders = await Order.find({
      customerId: customer._id,
      userId: req.user._id,
    }).sort({ createdAt: -1 })

    res.json({ customer, orders })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer" })
  }
})

// Ingest customers (bulk import)
router.post(
  "/ingest",
  [
    body("customers").isArray().withMessage("Customers must be an array"),
    body("customers.*.firstName").notEmpty().withMessage("First name is required"),
    body("customers.*.lastName").notEmpty().withMessage("Last name is required"),
    body("customers.*.email").isEmail().withMessage("Valid email is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { customers } = req.body

      // Add userId to each customer
      const customersWithUserId = customers.map((customer) => ({
        ...customer,
        userId: req.user._id,
      }))

      // Use upsert to avoid duplicates
      const bulkOps = customersWithUserId.map((customer) => ({
        updateOne: {
          filter: { email: customer.email, userId: req.user._id },
          update: { $set: customer },
          upsert: true,
        },
      }))

      const result = await Customer.bulkWrite(bulkOps)

      res.json({
        message: "Customers ingested successfully",
        inserted: result.upsertedCount,
        updated: result.modifiedCount,
      })
    } catch (error) {
      console.error("Customer ingestion error:", error)
      res.status(500).json({ error: "Failed to ingest customers" })
    }
  },
)

// Ingest orders (bulk import)
router.post(
  "/ingest/orders",
  [
    body("orders").isArray().withMessage("Orders must be an array"),
    body("orders.*.customerEmail").isEmail().withMessage("Valid customer email is required"),
    body("orders.*.orderId").notEmpty().withMessage("Order ID is required"),
    body("orders.*.amount").isNumeric().withMessage("Amount must be a number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { orders } = req.body
      let processedOrders = 0

      for (const orderData of orders) {
        // Find customer by email
        const customer = await Customer.findOne({
          email: orderData.customerEmail,
          userId: req.user._id,
        })

        if (!customer) {
          continue // Skip orders for non-existent customers
        }

        // Create order
        const order = new Order({
          userId: req.user._id,
          customerId: customer._id,
          orderId: orderData.orderId,
          amount: orderData.amount,
          status: orderData.status || "completed",
          items: orderData.items || [],
          orderDate: orderData.orderDate || new Date(),
        })

        await order.save()

        // Update customer total spend
        await Customer.findByIdAndUpdate(customer._id, {
          $inc: { totalSpend: orderData.amount },
          lastSeenAt: orderData.orderDate || new Date(),
        })

        processedOrders++
      }

      res.json({
        message: "Orders ingested successfully",
        processed: processedOrders,
        total: orders.length,
      })
    } catch (error) {
      console.error("Order ingestion error:", error)
      res.status(500).json({ error: "Failed to ingest orders" })
    }
  },
)

module.exports = router
