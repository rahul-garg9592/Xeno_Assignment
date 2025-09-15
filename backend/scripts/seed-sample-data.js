require("dotenv").config()
const mongoose = require("mongoose")
const Customer = require("../src/models/Customer")
const Order = require("../src/models/Order")

// Sample customer data
const sampleCustomers = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    totalSpend: 2500,
    lastSeenAt: new Date("2024-11-15"),
    tags: ["VIP", "Premium"],
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+1234567891",
    totalSpend: 1800,
    lastSeenAt: new Date("2024-10-20"),
    tags: ["Regular"],
  },
  {
    firstName: "Bob",
    lastName: "Johnson",
    email: "bob.johnson@example.com",
    phone: "+1234567892",
    totalSpend: 3200,
    lastSeenAt: new Date("2024-12-01"),
    tags: ["VIP", "Frequent"],
  },
  {
    firstName: "Alice",
    lastName: "Williams",
    email: "alice.williams@example.com",
    phone: "+1234567893",
    totalSpend: 950,
    lastSeenAt: new Date("2024-09-15"),
    tags: ["New"],
  },
  {
    firstName: "Charlie",
    lastName: "Brown",
    email: "charlie.brown@example.com",
    phone: "+1234567894",
    totalSpend: 4100,
    lastSeenAt: new Date("2024-11-28"),
    tags: ["VIP", "Premium", "Loyal"],
  },
  {
    firstName: "Diana",
    lastName: "Davis",
    email: "diana.davis@example.com",
    phone: "+1234567895",
    totalSpend: 750,
    lastSeenAt: new Date("2024-08-10"),
    tags: ["Inactive"],
  },
  {
    firstName: "Edward",
    lastName: "Miller",
    email: "edward.miller@example.com",
    phone: "+1234567896",
    totalSpend: 2800,
    lastSeenAt: new Date("2024-11-20"),
    tags: ["Premium"],
  },
  {
    firstName: "Fiona",
    lastName: "Wilson",
    email: "fiona.wilson@example.com",
    phone: "+1234567897",
    totalSpend: 1200,
    lastSeenAt: new Date("2024-10-05"),
    tags: ["Regular"],
  },
]

// Sample order data
const sampleOrders = [
  {
    orderId: "ORD-001",
    amount: 150,
    status: "completed",
    items: [{ name: "Product A", quantity: 2, price: 75 }],
    orderDate: new Date("2024-11-15"),
  },
  {
    orderId: "ORD-002",
    amount: 300,
    status: "completed",
    items: [{ name: "Product B", quantity: 1, price: 300 }],
    orderDate: new Date("2024-10-20"),
  },
  {
    orderId: "ORD-003",
    amount: 450,
    status: "completed",
    items: [{ name: "Product C", quantity: 3, price: 150 }],
    orderDate: new Date("2024-12-01"),
  },
]

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Note: This script requires a valid userId
    // In a real scenario, you would get this from an authenticated user
    console.log("⚠️  This script requires a valid userId from an authenticated user")
    console.log("Please run this after creating a user through the application")

    // Clear existing data (optional)
    // await Customer.deleteMany({})
    // await Order.deleteMany({})
    // console.log('Cleared existing data')

    console.log("Sample data structure:")
    console.log("Customers:", JSON.stringify(sampleCustomers, null, 2))
    console.log("Orders:", JSON.stringify(sampleOrders, null, 2))

    console.log("✅ Sample data ready for import through the application")
  } catch (error) {
    console.error("Error seeding data:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

seedData()
