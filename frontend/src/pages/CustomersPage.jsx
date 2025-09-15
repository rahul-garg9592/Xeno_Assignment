"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Textarea } from "../components/ui/textarea"
import { Search, Plus, Upload, Eye, Mail, Phone, Calendar, DollarSign } from "lucide-react"
import api from "../lib/api"
import { formatDate, formatCurrency } from "../lib/helpers"

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importData, setImportData] = useState("")
  const [importing, setImporting] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  useEffect(() => {
    fetchCustomers()
  }, [searchTerm])

  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true)
      const response = await api.get("/api/customers", {
        params: {
          page,
          limit: 10,
          search: searchTerm,
        },
      })

      setCustomers(response.data.customers)
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
      })
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await api.get(`/api/customers/${customerId}`)
      setSelectedCustomer(response.data)
    } catch (error) {
      console.error("Failed to fetch customer details:", error)
    }
  }

  const handleImportCustomers = async () => {
    try {
      setImporting(true)

      // Parse CSV-like data
      const lines = importData.trim().split("\n")
      const headers = lines[0].split(",").map((h) => h.trim())

      const customers = lines
        .slice(1)
        .map((line) => {
          const values = line.split(",").map((v) => v.trim())
          const customer = {}

          headers.forEach((header, index) => {
            const key = header.toLowerCase().replace(/\s+/g, "")
            if (key === "firstname" || key === "first_name") customer.firstName = values[index]
            else if (key === "lastname" || key === "last_name") customer.lastName = values[index]
            else if (key === "email") customer.email = values[index]
            else if (key === "phone") customer.phone = values[index]
            else if (key === "totalspend" || key === "total_spend")
              customer.totalSpend = Number.parseFloat(values[index]) || 0
          })

          return customer
        })
        .filter((customer) => customer.firstName && customer.lastName && customer.email)

      await api.post("/api/customers/ingest", { customers })

      setShowImportDialog(false)
      setImportData("")
      fetchCustomers()

      alert(`Successfully imported ${customers.length} customers!`)
    } catch (error) {
      console.error("Import failed:", error)
      alert("Import failed. Please check your data format.")
    } finally {
      setImporting(false)
    }
  }

  const sampleData = `firstName,lastName,email,phone,totalSpend
John,Doe,john.doe@example.com,+1234567890,2500
Jane,Smith,jane.smith@example.com,+1234567891,1800
Bob,Johnson,bob.johnson@example.com,+1234567892,3200`

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground font-body mt-2">
            Manage your customer database and view detailed profiles
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Customers
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Customers</DialogTitle>
                <DialogDescription>
                  Import customers from CSV data. Use the format: firstName,lastName,email,phone,totalSpend
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium font-body">Sample Format:</label>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs font-mono">{sampleData}</pre>
                </div>
                <div>
                  <label className="text-sm font-medium font-body">Your Data:</label>
                  <Textarea
                    placeholder="Paste your CSV data here..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={8}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImportCustomers} disabled={importing || !importData.trim()}>
                  {importing ? "Importing..." : "Import Customers"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground font-body">{pagination.total} total customers</div>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Customer List</CardTitle>
          <CardDescription className="font-body">View and manage your customer database</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : customers.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Total Spend</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || "N/A"}</TableCell>
                      <TableCell>{formatCurrency(customer.totalSpend)}</TableCell>
                      <TableCell>{formatDate(customer.lastSeenAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => fetchCustomerDetails(customer._id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground font-body">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchCustomers(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchCustomers(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground font-body">No customers found</p>
              <Button className="mt-2" onClick={() => setShowImportDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Import Your First Customers
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedCustomer.customer.firstName} {selectedCustomer.customer.lastName}
              </DialogTitle>
              <DialogDescription>Customer details and order history</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-body">{selectedCustomer.customer.email}</span>
                  </div>
                  {selectedCustomer.customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-body">{selectedCustomer.customer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-body">
                      Last seen: {formatDate(selectedCustomer.customer.lastSeenAt)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-body">
                      Total Spend: {formatCurrency(selectedCustomer.customer.totalSpend)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground font-body">
                    Customer since: {formatDate(selectedCustomer.customer.createdAt)}
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h4 className="font-medium font-heading mb-3">Order History</h4>
                {selectedCustomer.orders.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedCustomer.orders.map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-3 bg-muted rounded">
                        <div>
                          <p className="font-medium font-body">Order #{order.orderId}</p>
                          <p className="text-sm text-muted-foreground font-body">{formatDate(order.orderDate)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium font-body">{formatCurrency(order.amount)}</p>
                          <p className="text-sm text-muted-foreground font-body capitalize">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm font-body">No orders found</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
