"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Badge } from "../components/ui/badge"
import { Sparkles, Users, Send, Plus, Eye, Wand2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import api from "../lib/api"
import { personalizeMessage } from "../utils/personalization"

export default function CampaignCreatePage() {
  const navigate = useNavigate()
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  // Campaign form state
  const [campaignName, setCampaignName] = useState("")
  const [selectedSegment, setSelectedSegment] = useState("")
  const [messageTemplate, setMessageTemplate] = useState("")
  const [audiencePreview, setAudiencePreview] = useState(null)

  // Segment creation state
  const [showSegmentDialog, setShowSegmentDialog] = useState(false)
  const [segmentName, setSegmentName] = useState("")
  const [segmentDescription, setSegmentDescription] = useState("")
  const [segmentRules, setSegmentRules] = useState("")
  const [aiSegmentDescription, setAiSegmentDescription] = useState("")
  const [generatingSegment, setGeneratingSegment] = useState(false)

  // AI message state
  const [showAiMessageDialog, setShowAiMessageDialog] = useState(false)
  const [messageObjective, setMessageObjective] = useState("")
  const [generatingMessages, setGeneratingMessages] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([])

  useEffect(() => {
    fetchSegments()
  }, [])

  useEffect(() => {
    if (selectedSegment) {
      fetchAudiencePreview()
    }
  }, [selectedSegment])

  const fetchSegments = async () => {
    try {
      const response = await api.get("/api/segments")
      setSegments(response.data)
    } catch (error) {
      console.error("Failed to fetch segments:", error)
    }
  }

  const fetchAudiencePreview = async () => {
    try {
      const response = await api.get(`/api/segments/${selectedSegment}/audience?limit=5`)
      setAudiencePreview(response.data)
    } catch (error) {
      console.error("Failed to fetch audience preview:", error)
    }
  }

  const generateAiSegment = async () => {
    try {
      setGeneratingSegment(true)
      const response = await api.post("/api/segments/ai-generate", {
        description: aiSegmentDescription,
      })

      setSegmentName(response.data.suggestedName)
      setSegmentRules(JSON.stringify(response.data.rules, null, 2))
      setSegmentDescription(`AI-generated segment: ${aiSegmentDescription}`)
    } catch (error) {
      console.error("Failed to generate AI segment:", error)
      alert("Failed to generate segment. Please try again.")
    } finally {
      setGeneratingSegment(false)
    }
  }

  const createSegment = async () => {
    try {
      let rules
      try {
        rules = JSON.parse(segmentRules)
      } catch (e) {
        alert("Invalid JSON format for segment rules")
        return
      }

      const response = await api.post("/api/segments", {
        name: segmentName,
        description: segmentDescription,
        rules,
        isAiGenerated: !!aiSegmentDescription,
      })

      setSegments([...segments, response.data])
      setSelectedSegment(response.data._id)
      setShowSegmentDialog(false)

      // Reset form
      setSegmentName("")
      setSegmentDescription("")
      setSegmentRules("")
      setAiSegmentDescription("")
    } catch (error) {
      console.error("Failed to create segment:", error)
      alert("Failed to create segment. Please check your rules format.")
    }
  }

  const generateAiMessages = async () => {
    try {
      setGeneratingMessages(true)
      const response = await api.post("/api/campaigns/ai-messages", {
        objective: messageObjective,
        audienceDescription: audiencePreview?.segment?.description || "",
      })

      setAiSuggestions(response.data.suggestions)
    } catch (error) {
      console.error("Failed to generate AI messages:", error)
      alert("Failed to generate message suggestions. Please try again.")
    } finally {
      setGeneratingMessages(false)
    }
  }

  const createCampaign = async () => {
    if (!campaignName || !selectedSegment || !messageTemplate) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setCreating(true)
      await api.post("/api/campaigns", {
        name: campaignName,
        segmentId: selectedSegment,
        messageTemplate,
      })

      alert("Campaign created and launched successfully!")
      navigate("/campaigns/history")
    } catch (error) {
      console.error("Failed to create campaign:", error)
      alert("Failed to create campaign. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Create Campaign</h1>
        <p className="text-muted-foreground font-body mt-2">Build targeted marketing campaigns with AI assistance</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Campaign Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Campaign Details</CardTitle>
              <CardDescription className="font-body">Set up your campaign name and basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium font-body">Campaign Name</label>
                <Input
                  placeholder="e.g., Welcome Back Campaign"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Audience Selection */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading">Select Audience</CardTitle>
                <CardDescription className="font-body">
                  Choose or create a customer segment for your campaign
                </CardDescription>
              </div>
              <Dialog open={showSegmentDialog} onOpenChange={setShowSegmentDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Segment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Segment</DialogTitle>
                    <DialogDescription>Create a customer segment using rules or AI assistance</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* AI Segment Generation */}
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <span className="font-medium font-body">AI Segment Builder</span>
                      </div>
                      <div className="space-y-3">
                        <Input
                          placeholder="Describe your target audience (e.g., 'customers inactive for 90 days')"
                          value={aiSegmentDescription}
                          onChange={(e) => setAiSegmentDescription(e.target.value)}
                        />
                        <Button
                          onClick={generateAiSegment}
                          disabled={generatingSegment || !aiSegmentDescription}
                          size="sm"
                        >
                          {generatingSegment ? "Generating..." : "Generate with AI"}
                        </Button>
                      </div>
                    </div>

                    {/* Manual Segment Creation */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium font-body">Segment Name</label>
                        <Input
                          placeholder="e.g., Inactive High-Value Customers"
                          value={segmentName}
                          onChange={(e) => setSegmentName(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium font-body">Description</label>
                        <Input
                          placeholder="Brief description of this segment"
                          value={segmentDescription}
                          onChange={(e) => setSegmentDescription(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium font-body">Segment Rules (JSON)</label>
                        <Textarea
                          placeholder='{"totalSpend": {"$gt": 1000}, "lastSeenAt": {"$lt": "2024-10-01"}}'
                          value={segmentRules}
                          onChange={(e) => setSegmentRules(e.target.value)}
                          rows={4}
                          className="mt-1 font-mono text-xs"
                        />
                        <p className="text-xs text-muted-foreground mt-1 font-body">
                          Use MongoDB query format. Fields: firstName, lastName, email, totalSpend, lastSeenAt, tags
                        </p>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSegmentDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createSegment} disabled={!segmentName || !segmentRules}>
                      Create Segment
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer segment" />
                </SelectTrigger>
                <SelectContent>
                  {segments.map((segment) => (
                    <SelectItem key={segment._id} value={segment._id}>
                      <div className="flex items-center gap-2">
                        {segment.name}
                        {segment.isAiGenerated && (
                          <Badge variant="secondary" className="text-xs">
                            AI
                          </Badge>
                        )}
                        <span className="text-muted-foreground">({segment.audienceCount} customers)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Message Template */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading">Message Template</CardTitle>
                <CardDescription className="font-body">
                  Create your campaign message with personalization
                </CardDescription>
              </div>
              <Dialog open={showAiMessageDialog} onOpenChange={setShowAiMessageDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Wand2 className="mr-2 h-4 w-4" />
                    AI Suggestions
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>AI Message Suggestions</DialogTitle>
                    <DialogDescription>Get AI-powered message suggestions for your campaign</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium font-body">Campaign Objective</label>
                      <Input
                        placeholder="e.g., win back inactive customers"
                        value={messageObjective}
                        onChange={(e) => setMessageObjective(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <Button
                      onClick={generateAiMessages}
                      disabled={generatingMessages || !messageObjective}
                      className="w-full"
                    >
                      {generatingMessages ? "Generating..." : "Generate Suggestions"}
                    </Button>

                    {aiSuggestions.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium font-body">Suggestions:</label>
                        {aiSuggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="p-3 bg-muted rounded cursor-pointer hover:bg-muted/80"
                            onClick={() => {
                              setMessageTemplate(suggestion)
                              setShowAiMessageDialog(false)
                            }}
                          >
                            <p className="text-sm font-body">{suggestion}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAiMessageDialog(false)}>
                      Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Hi {{first_name}}, we have a special offer just for you..."
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground font-body">
                Use {"{{first_name}}"} for personalization. Keep messages under 160 characters for best results.
              </p>
            </CardContent>
          </Card>

          {/* Launch Campaign */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={createCampaign}
                disabled={creating || !campaignName || !selectedSegment || !messageTemplate}
                size="lg"
                className="w-full"
              >
                {creating ? (
                  "Creating Campaign..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Launch Campaign
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Audience Preview */}
          {audiencePreview && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Audience Preview
                </CardTitle>
                <CardDescription className="font-body">
                  {audiencePreview.total} customers in this segment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {audiencePreview.customers.slice(0, 3).map((customer) => (
                    <div key={customer._id} className="flex items-center gap-3 p-2 bg-muted rounded">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {customer.firstName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm font-body">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground font-body">{customer.email}</p>
                      </div>
                    </div>
                  ))}
                  {audiencePreview.total > 3 && (
                    <p className="text-xs text-muted-foreground text-center font-body">
                      +{audiencePreview.total - 3} more customers
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message Preview */}
          {messageTemplate && audiencePreview && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Message Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm font-body">
                    {personalizeMessage(messageTemplate, audiencePreview.customers[0] || { firstName: "John" })}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-body">
                  Preview for {audiencePreview.customers[0]?.firstName || "sample customer"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
