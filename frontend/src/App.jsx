import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./hooks/useAuth"
import Layout from "./components/Layout"
import LoginPage from "./pages/LoginPage"
import AuthCallback from "./pages/AuthCallback"
import Dashboard from "./pages/Dashboard"
import CustomersPage from "./pages/CustomersPage"
import CampaignCreatePage from "./pages/CampaignCreatePage"
import CampaignHistoryPage from "./pages/CampaignHistoryPage"
import "./index.css"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="campaigns/create" element={<CampaignCreatePage />} />
            <Route path="campaigns/history" element={<CampaignHistoryPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
