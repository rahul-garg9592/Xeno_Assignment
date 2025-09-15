"use client"

import { useState, useEffect, createContext, useContext } from "react"
import api from "../lib/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        setLoading(false)
        return
      }

      console.log("Checking auth with token:", token.substring(0, 20) + "...")
      const response = await api.get("/auth/me")
      console.log("Auth check successful:", response.data)
      setUser(response.data)
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("authToken")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (token) => {
    try {
      console.log("Logging in with token:", token.substring(0, 20) + "...")
      localStorage.setItem("authToken", token)
      await checkAuth()
      console.log("Login successful")
    } catch (error) {
      console.error("Login failed:", error)
      localStorage.removeItem("authToken")
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.post("/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("authToken")
      setUser(null)
      window.location.href = "/login"
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
