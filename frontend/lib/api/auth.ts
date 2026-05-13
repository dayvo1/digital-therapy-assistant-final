import { api, setTokens, clearTokens, getRefreshToken } from "./client"
import type { AuthResponse, LoginRequest, RegisterRequest, User } from "./types"

/**
 * Extracts User object from AuthResponse
 * Backend returns: {accessToken, refreshToken, expiresIn, userId, name}
 * We construct a User object from this data
 */
function extractUserFromAuthResponse(response: AuthResponse, email?: string): User {
  // Check localStorage for onboarding completion status
  // This persists across page reloads since backend doesn't track this
  const hasCompletedOnboarding = typeof window !== "undefined" 
    ? localStorage.getItem(`onboarding_${response.userId}`) === "true"
    : false

  return {
    id: response.userId,
    email: email || "", // Email not returned by backend after login, must be passed
    name: response.name,
    role: "USER",
    createdAt: new Date().toISOString(),
    hasCompletedOnboarding,
  }
}

/**
 * Mark onboarding as completed for a user
 * Persists to localStorage since backend doesn't track this
 */
export function markOnboardingComplete(userId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(`onboarding_${userId}`, "true")
  }
}

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(userId: string): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem(`onboarding_${userId}`) === "true"
  }
  return false
}

/**
 * Clear onboarding status (for testing or account reset)
 */
export function clearOnboardingStatus(userId: string): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(`onboarding_${userId}`)
  }
}

/**
 * Authentication API service
 * 
 * JWT Token Flow:
 * 1. Login/Register -> Backend returns accessToken, refreshToken, expiresIn
 * 2. Frontend stores accessToken in memory, refreshToken in localStorage
 * 3. All API requests include Authorization: Bearer <accessToken> header
 * 4. When accessToken expires, refreshToken is used to get new tokens
 * 5. Logout clears all tokens from memory and localStorage
 */
export const authApi = {
  /**
   * Register a new user
   * POST /auth/register
   * Returns access and refresh tokens
   */
  register: async (data: RegisterRequest): Promise<{ response: AuthResponse; user: User }> => {
    const response = await api.post<AuthResponse>("/auth/register", data, { skipAuth: true })
    
    // Store tokens for subsequent API calls
    if (response.accessToken && response.refreshToken) {
      setTokens(response.accessToken, response.refreshToken, response.expiresIn || 3600)
    }
    
    const user = extractUserFromAuthResponse(response, data.email)
    return { response, user }
  },

  /**
   * Login with email and password
   * POST /auth/login
   * Returns access and refresh tokens
   */
  login: async (data: LoginRequest): Promise<{ response: AuthResponse; user: User }> => {
    const response = await api.post<AuthResponse>("/auth/login", data, { skipAuth: true })
    
    // Store tokens for subsequent API calls
    if (response.accessToken && response.refreshToken) {
      setTokens(response.accessToken, response.refreshToken, response.expiresIn || 3600)
    }
    
    const user = extractUserFromAuthResponse(response, data.email)
    return { response, user }
  },

  /**
   * Refresh access token
   * POST /auth/refresh
   * Uses stored refresh token to get new access token
   */
  refresh: async (): Promise<AuthResponse> => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }
    
    const response = await api.post<AuthResponse>("/auth/refresh", { refreshToken }, { skipAuth: true })
    
    // Store new tokens
    if (response.accessToken && response.refreshToken) {
      setTokens(response.accessToken, response.refreshToken, response.expiresIn || 3600)
    }
    
    return response
  },

  /**
   * Logout and invalidate session
   * POST /auth/logout
   * Clears all stored tokens
   */
  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout")
    } finally {
      // Always clear tokens, even if logout request fails
      clearTokens()
    }
  },

  /**
   * Get current user by refreshing the token
   * Since the backend doesn't have a /auth/me endpoint,
   * we validate the session by calling /auth/refresh
   */
  getCurrentUser: async (): Promise<User> => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }
    
    const response = await api.post<AuthResponse>("/auth/refresh", { refreshToken }, { skipAuth: true })
    
    // Store new tokens
    if (response.accessToken && response.refreshToken) {
      setTokens(response.accessToken, response.refreshToken, response.expiresIn || 3600)
    }
    
    if (!response.userId) {
      throw new Error("No user data in refresh response")
    }
    
    // Get stored email from localStorage (set during login/register)
    const storedEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null
    
    return extractUserFromAuthResponse(response, storedEmail || undefined)
  },

  /**
   * Update user profile
   * PUT /auth/profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    return api.put<User>("/auth/profile", data)
  },

  /**
   * Change password
   * POST /auth/change-password
   */
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.post("/auth/change-password", data)
  },

  /**
   * Request password reset
   * POST /auth/forgot-password
   */
  forgotPassword: async (email: string): Promise<void> => {
    await api.post("/auth/forgot-password", { email }, { skipAuth: true })
  },

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  resetPassword: async (data: { token: string; newPassword: string }): Promise<void> => {
    await api.post("/auth/reset-password", data, { skipAuth: true })
  },
}
