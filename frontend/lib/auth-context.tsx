"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { authApi, type User, type LoginRequest, type RegisterRequest, ApiRequestError } from "./api"

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  setHasCompletedOnboarding: (value: boolean) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    hasCompletedOnboarding: false,
    error: null,
  })

  // Check authentication status on mount
  // With httpOnly cookies, we try to refresh the token to validate session
  const checkAuth = useCallback(async () => {
    try {
      const user = await authApi.getCurrentUser()
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        hasCompletedOnboarding: user.hasCompletedOnboarding ?? false,
        error: null,
      })
    } catch {
      // Not authenticated - show login screen
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        hasCompletedOnboarding: false,
        error: null,
      })
    }
  }, [])

  useEffect(() => {
    checkAuth()

    // Listen for logout events (from API client when token refresh fails)
    const handleLogout = () => {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        hasCompletedOnboarding: false,
        error: "Session expired. Please log in again.",
      })
    }

    window.addEventListener("auth:logout", handleLogout)
    return () => window.removeEventListener("auth:logout", handleLogout)
  }, [checkAuth])

  const login = useCallback(async (data: LoginRequest) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const { user } = await authApi.login(data)
      
      // Store email in localStorage for session persistence
      // (refresh endpoint doesn't return email)
      if (typeof window !== "undefined" && user.email) {
        localStorage.setItem("userEmail", user.email)
      }
      
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        hasCompletedOnboarding: user.hasCompletedOnboarding ?? false,
        error: null,
      })
    } catch (err) {
      const message = err instanceof ApiRequestError
        ? err.getUserMessage()
        : "Login failed. Please try again."
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }))
      throw err
    }
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const { user } = await authApi.register(data)
      
      // Store email in localStorage for session persistence
      if (typeof window !== "undefined" && data.email) {
        localStorage.setItem("userEmail", data.email)
      }
      
      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        hasCompletedOnboarding: false,
        error: null,
      })
    } catch (err) {
      const message = err instanceof ApiRequestError
        ? err.getUserMessage()
        : "Registration failed. Please try again."
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }))
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      await authApi.logout()
    } finally {
      // Clear stored email
      if (typeof window !== "undefined") {
        localStorage.removeItem("userEmail")
      }
      
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        hasCompletedOnboarding: false,
        error: null,
      })
    }
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const setHasCompletedOnboarding = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, hasCompletedOnboarding: value }))
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const user = await authApi.getCurrentUser()
      setState((prev) => ({
        ...prev,
        user,
        hasCompletedOnboarding: user.hasCompletedOnboarding ?? prev.hasCompletedOnboarding,
      }))
    } catch {
      // Silent fail - user will remain with current state
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
        setHasCompletedOnboarding,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
