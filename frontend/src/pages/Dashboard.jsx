// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
// import { Button } from "../components/ui/button"
// import { Users, Send, TrendingUp, Clock } from "lucide-react"
// import { Link } from "react-router-dom"
// import api from "../lib/api"
// import { formatDate } from "../lib/helpers"

// export default function Dashboard() {
//   const [stats, setStats] = useState({
//     totalCustomers: 0,
//     totalCampaigns: 0,
//     recentCampaigns: [],
//     loading: true,
//   })

//   useEffect(() => {
//     fetchDashboardData()
//   }, [])

//   const fetchDashboardData = async () => {
//     try {
//       const [customersRes, campaignsRes] = await Promise.all([
//         api.get("/api/customers?limit=1"),
//         api.get("/api/campaigns/history?limit=5"),
//       ])

//       setStats({
//         totalCustomers: customersRes.data.total || 0,
//         totalCampaigns: campaignsRes.data.total || 0,
//         recentCampaigns: campaignsRes.data.campaigns || [],
//         loading: false,
//       })
//     } catch (error) {
//       console.error("Failed to fetch dashboard data:", error)
//       setStats((prev) => ({ ...prev, loading: false }))
//     }
//   }

//   if (stats.loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
//         <p className="text-muted-foreground font-body mt-2">Welcome back! Here's what's happening with your CRM.</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium font-body">Total Customers</CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold font-heading">{stats.totalCustomers}</div>
//             <p className="text-xs text-muted-foreground font-body">Active customer base</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium font-body">Total Campaigns</CardTitle>
//             <Send className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold font-heading">{stats.totalCampaigns}</div>
//             <p className="text-xs text-muted-foreground font-body">Campaigns launched</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium font-body">Success Rate</CardTitle>
//             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold font-heading">90%</div>
//             <p className="text-xs text-muted-foreground font-body">Average delivery rate</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium font-body">Last Login</CardTitle>
//             <Clock className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold font-heading">Today</div>
//             <p className="text-xs text-muted-foreground font-body">{formatDate(new Date())}</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Quick Actions */}
//       <div className="grid gap-6 md:grid-cols-2">
//         <Card>
//           <CardHeader>
//             <CardTitle className="font-heading">Quick Actions</CardTitle>
//             <CardDescription className="font-body">Get started with common tasks</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <Link to="/customers">
//               <Button variant="outline" className="w-full justify-start bg-transparent">
//                 <Users className="mr-2 h-4 w-4" />
//                 Manage Customers
//               </Button>
//             </Link>
//             <Link to="/campaigns/create">
//               <Button variant="outline" className="w-full justify-start bg-transparent">
//                 <Send className="mr-2 h-4 w-4" />
//                 Create Campaign
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle className="font-heading">Recent Campaigns</CardTitle>
//             <CardDescription className="font-body">Your latest campaign activity</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {stats.recentCampaigns.length > 0 ? (
//               <div className="space-y-4">
//                 {stats.recentCampaigns.map((campaign) => (
//                   <div key={campaign._id} className="flex items-center justify-between">
//                     <div>
//                       <p className="font-medium font-body">{campaign.name}</p>
//                       <p className="text-sm text-muted-foreground font-body">{formatDate(campaign.createdAt)}</p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-sm font-medium font-body capitalize">{campaign.status}</p>
//                       <p className="text-xs text-muted-foreground font-body">{campaign.audienceSize} recipients</p>
//                     </div>
//                   </div>
//                 ))}
//                 <Link to="/campaigns/history">
//                   <Button variant="ghost" className="w-full">
//                     View All Campaigns
//                   </Button>
//                 </Link>
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <p className="text-muted-foreground font-body">No campaigns yet</p>
//                 <Link to="/campaigns/create">
//                   <Button className="mt-2">Create Your First Campaign</Button>
//                 </Link>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Users, Send, TrendingUp, Clock } from "lucide-react"
import { Link } from "react-router-dom"
import api from "../lib/api"
import { formatDate } from "../lib/utils"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalCampaigns: 0,
    recentCampaigns: [],
    loading: true,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [customersRes, campaignsRes] = await Promise.all([
        api.get("/api/customers?limit=1"),
        api.get("/api/campaigns/history?limit=5"),
      ])

      setStats({
        totalCustomers: customersRes.data.total || 0,
        totalCampaigns: campaignsRes.data.total || 0,
        recentCampaigns: campaignsRes.data.campaigns || [],
        loading: false,
      })
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      setStats((prev) => ({ ...prev, loading: false }))
    }
  }

  // ✅ Calculate dynamic success rate
  const getSuccessRate = () => {
    if (stats.recentCampaigns.length === 0) return 0
    let totalAudience = 0
    let totalSent = 0

    stats.recentCampaigns.forEach((c) => {
      totalAudience += c.audienceSize || 0
      totalSent += c.sentCount || 0
    })

    return totalAudience === 0 ? 0 : Math.round((totalSent / totalAudience) * 100)
  }

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground font-body mt-2">Welcome back! Here's what's happening with your CRM.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground font-body">Active customer base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">Total Campaigns</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground font-body">Campaigns launched</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{getSuccessRate()}%</div>
            <p className="text-xs text-muted-foreground font-body">Average Campaign Success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-body">Last Login</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">Today</div>
            <p className="text-xs text-muted-foreground font-body">{formatDate(new Date())}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Quick Actions</CardTitle>
            <CardDescription className="font-body">Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/customers">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="mr-2 h-4 w-4" />
                Manage Customers
              </Button>
            </Link>
            <Link to="/campaigns/create">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Send className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Recent Campaigns</CardTitle>
            <CardDescription className="font-body">Your latest campaign activity</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentCampaigns.length > 0 ? (
              <div className="space-y-4">
                {stats.recentCampaigns.map((campaign) => (
                  <div key={campaign._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium font-body">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground font-body">{formatDate(campaign.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium font-body capitalize">{campaign.status}</p>
                      <p className="text-xs text-muted-foreground font-body">{campaign.audienceSize} recipients</p>
                    </div>
                  </div>
                ))}
                <Link to="/campaigns/history">
                  <Button variant="ghost" className="w-full">
                    View All Campaigns
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground font-body">No campaigns yet</p>
                <Link to="/campaigns/create">
                  <Button className="mt-2">Create Your First Campaign</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
