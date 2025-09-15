"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { Eye, Send, Users, TrendingUp, Clock, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import api from "../lib/api"
import { formatDate } from "../lib/helpers"

export default function CampaignHistoryPage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [campaignDetails, setCampaignDetails] = useState(null)
  const [campaignSummary, setCampaignSummary] = useState("")
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async (page = 1) => {
    try {
      setLoading(true)
      const response = await api.get("/api/campaigns/history", {
        params: { page, limit: 10 },
      })

      setCampaigns(response.data.campaigns)
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
      })
    } catch (error) {
      console.error("Failed to fetch campaigns:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCampaignDetails = async (campaignId) => {
    try {
      const [detailsRes, summaryRes] = await Promise.all([
        api.get(`/api/campaigns/${campaignId}`),
        api.get(`/api/campaigns/${campaignId}/summary`).catch(() => ({ data: { summary: "Summary not available" } })),
      ])

      setCampaignDetails(detailsRes.data)
      setCampaignSummary(summaryRes.data.summary)
      setSelectedCampaign(campaignId)
    } catch (error) {
      console.error("Failed to fetch campaign details:", error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "default"
      case "sending":
        return "secondary"
      case "queued":
        return "outline"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getSuccessRate = (campaign) => {
    if (campaign.audienceSize === 0) return 0
    return Math.round((campaign.sentCount / campaign.audienceSize) * 100)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Campaign History</h1>
          <p className="text-muted-foreground font-body mt-2">View and analyze your past marketing campaigns</p>
        </div>
        <Link to="/campaigns/create">
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">Total Campaigns</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{pagination.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">Messages Sent</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{campaigns.reduce((sum, c) => sum + c.sentCount, 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">Avg Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">
              {campaigns.length > 0
                ? Math.round(campaigns.reduce((sum, c) => sum + getSuccessRate(c), 0) / campaigns.length)
                : 0}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">Active Campaigns</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">
              {campaigns.filter((c) => c.status === "sending" || c.status === "queued").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Campaign History</CardTitle>
          <CardDescription className="font-body">
            Track performance and analyze your marketing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : campaigns.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign._id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {campaign.segmentId?.name || "Unknown Segment"}
                          {campaign.segmentId?.isAiGenerated && (
                            <Badge variant="secondary" className="text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{campaign.audienceSize} total</div>
                          <div className="text-muted-foreground">
                            {campaign.sentCount} sent, {campaign.failedCount} failed
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{getSuccessRate(campaign)}%</div>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${getSuccessRate(campaign)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => fetchCampaignDetails(campaign._id)}>
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
                      onClick={() => fetchCampaigns(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchCampaigns(pagination.currentPage + 1)}
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
              <p className="text-muted-foreground font-body">No campaigns found</p>
              <Link to="/campaigns/create">
                <Button className="mt-2">
                  <Send className="mr-2 h-4 w-4" />
                  Create Your First Campaign
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Details Dialog */}
      {campaignDetails && (
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{campaignDetails.campaign.name}</DialogTitle>
              <DialogDescription>Campaign details and delivery logs</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Campaign Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded">
                  <div className="text-2xl font-bold font-heading">{campaignDetails.campaign.audienceSize}</div>
                  <div className="text-sm text-muted-foreground font-body">Total Audience</div>
                </div>
                <div className="text-center p-3 bg-muted rounded">
                  <div className="text-2xl font-bold font-heading text-green-600">
                    {campaignDetails.campaign.sentCount}
                  </div>
                  <div className="text-sm text-muted-foreground font-body">Messages Sent</div>
                </div>
                <div className="text-center p-3 bg-muted rounded">
                  <div className="text-2xl font-bold font-heading text-red-600">
                    {campaignDetails.campaign.failedCount}
                  </div>
                  <div className="text-sm text-muted-foreground font-body">Failed</div>
                </div>
                <div className="text-center p-3 bg-muted rounded">
                  <div className="text-2xl font-bold font-heading">{getSuccessRate(campaignDetails.campaign)}%</div>
                  <div className="text-sm text-muted-foreground font-body">Success Rate</div>
                </div>
              </div>

              {/* AI Summary */}
              {campaignSummary && (
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="font-medium font-body">AI Summary</span>
                  </div>
                  <p className="text-sm font-body">{campaignSummary}</p>
                </div>
              )}

              {/* Message Template */}
              <div>
                <h4 className="font-medium font-heading mb-2">Message Template</h4>
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm font-body">{campaignDetails.campaign.messageTemplate}</p>
                </div>
              </div>

              {/* Delivery Logs */}
              <div>
                <h4 className="font-medium font-heading mb-3">Delivery Logs</h4>
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead>Failure Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaignDetails.logs.slice(0, 20).map((log) => (
                        <TableRow key={log._id}>
                          <TableCell>
                            {log.customerId?.firstName} {log.customerId?.lastName}
                          </TableCell>
                          <TableCell>
                            <Badge variant={log.status === "sent" ? "default" : "destructive"}>{log.status}</Badge>
                          </TableCell>
                          <TableCell>{log.sentAt ? formatDate(log.sentAt) : "N/A"}</TableCell>
                          <TableCell>{log.failureReason || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {campaignDetails.logs.length > 20 && (
                    <p className="text-xs text-muted-foreground text-center mt-2 font-body">
                      Showing first 20 of {campaignDetails.logs.length} logs
                    </p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
