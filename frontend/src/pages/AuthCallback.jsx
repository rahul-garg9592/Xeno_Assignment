"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = searchParams.get("token")
    const errorParam = searchParams.get("error")

    if (errorParam) {
      console.error("Auth error:", errorParam)
      setError(errorParam)
      setTimeout(() => {
        navigate("/login?error=" + errorParam)
      }, 2000)
      return
    }

    if (token) {
      try {
        login(token)
        // Redirect to dashboard after successful login
        setTimeout(() => {
          navigate("/dashboard")
        }, 1000)
      } catch (err) {
        console.error("Login error:", err)
        setError("Login failed")
        setTimeout(() => {
          navigate("/login?error=login_failed")
        }, 2000)
      }
    } else {
      setError("No token received")
      setTimeout(() => {
        navigate("/login?error=no_token")
      }, 2000)
    }
  }, [searchParams, login, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ {error}</div>
          <div className="text-gray-500">Redirecting to login...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
        <div className="text-gray-600">Processing login...</div>
      </div>
    </div>
  )
}
