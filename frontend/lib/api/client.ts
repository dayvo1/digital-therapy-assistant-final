import type { ApiError } from "./types"

// API Base URL - always use /api, the proxy handles forwarding to backend
// Development: next.config.mjs rewrites forward to http://localhost:8080
// Production: Nginx proxies to backend
const API_BASE_URL = "/api"

// Error messages for different HTTP status codes
export const ERROR_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your input and try again.",
  401: "Your session has expired. Please log in again.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource was not found.",
  422: "The provided data is invalid. Please check and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "An unexpected server error occurred. Please try again later.",
  502: "The server is temporarily unavailable. Please try again later.",
  503: "Service is currently unavailable. Please try again later.",
}

// ============================================================================
// JWT Token Storage (in-memory for security)
// ============================================================================
// Tokens are stored in memory to prevent XSS attacks.
// This is more secure than localStorage but tokens are lost on page refresh.
// The refresh token is used to obtain new access tokens on page load.
// ============================================================================

interface TokenStore {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
}

const tokenStore: TokenStore = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
}

// Token management functions
export function setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
  tokenStore.accessToken = accessToken
  tokenStore.refreshToken = refreshToken
  tokenStore.expiresAt = Date.now() + expiresIn * 1000
  
  // Store refresh token in localStorage for session persistence across page reloads
  // Access token stays in memory for better security
  if (typeof window !== "undefined") {
    localStorage.setItem("refreshToken", refreshToken)
  }
}

export function getAccessToken(): string | null {
  // Check if token is expired (with 30 second buffer)
  if (tokenStore.expiresAt && Date.now() > tokenStore.expiresAt - 30000) {
    return null // Token expired, need to refresh
  }
  return tokenStore.accessToken
}

export function getRefreshToken(): string | null {
  // First check in-memory store
  if (tokenStore.refreshToken) {
    return tokenStore.refreshToken
  }
  // Fall back to localStorage for session persistence
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken")
  }
  return null
}

export function clearTokens(): void {
  tokenStore.accessToken = null
  tokenStore.refreshToken = null
  tokenStore.expiresAt = null
  
  if (typeof window !== "undefined") {
    localStorage.removeItem("refreshToken")
  }
}

export function isTokenExpired(): boolean {
  if (!tokenStore.expiresAt) return true
  return Date.now() > tokenStore.expiresAt - 30000 // 30 second buffer
}

// Custom error class for API errors with comprehensive error handling
export class ApiRequestError extends Error {
  status: number
  error: string
  errorCode?: string
  validationErrors?: { field: string; message: string }[]
  timestamp: string
  path: string

  constructor(apiError: ApiError) {
    // Use custom error message or fallback to status-based message
    const message = apiError.message || ERROR_MESSAGES[apiError.status] || "An unexpected error occurred"
    super(message)
    this.name = "ApiRequestError"
    this.status = apiError.status
    this.error = apiError.error
    this.errorCode = apiError.errorCode
    this.validationErrors = apiError.validationErrors
    this.timestamp = apiError.timestamp
    this.path = apiError.path
  }

  // Get user-friendly error message
  getUserMessage(): string {
    // Return validation errors as a formatted message
    if (this.validationErrors && this.validationErrors.length > 0) {
      return this.validationErrors.map((e) => e.message).join(". ")
    }
    return this.message
  }

  // Check if error is an authentication error
  isAuthError(): boolean {
    return this.status === 401
  }

  // Check if error is a permission error
  isForbiddenError(): boolean {
    return this.status === 403
  }

  // Check if error is a validation error
  isValidationError(): boolean {
    return this.status === 400 || this.status === 422
  }

  // Check if error is a not found error
  isNotFoundError(): boolean {
    return this.status === 404
  }

  // Check if error is a server error
  isServerError(): boolean {
    return this.status >= 500
  }
}

// Token refresh state management (prevent multiple simultaneous refresh calls)
let isRefreshing = false
let refreshSubscribers: ((success: boolean) => void)[] = []

const subscribeTokenRefresh = (callback: (success: boolean) => void) => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = (success: boolean) => {
  refreshSubscribers.forEach((callback) => callback(success))
  refreshSubscribers = []
}

// Refresh access token using refresh token
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return false
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      clearTokens()
      return false
    }

    const data = await response.json()
    
    // Store new tokens
    if (data.accessToken && data.refreshToken) {
      setTokens(data.accessToken, data.refreshToken, data.expiresIn || 3600)
      return true
    }

    return false
  } catch {
    clearTokens()
    return false
  }
}

// Main API request function with comprehensive error handling
interface RequestOptions extends Omit<RequestInit, 'body'> {
  skipAuth?: boolean
  timeout?: number
  body?: BodyInit | null | object
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, timeout = 30000, body, ...fetchOptions } = options

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...fetchOptions.headers,
  }

  // Add Authorization header if we have a valid token and auth is not skipped
  if (!skipAuth) {
    const accessToken = getAccessToken()
    if (accessToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`
    }
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    let response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
      body: body ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
    })

    clearTimeout(timeoutId)

    // Handle 401 - try to refresh token
    if (response.status === 401 && !skipAuth) {
      if (!isRefreshing) {
        isRefreshing = true
        const success = await refreshAccessToken()
        isRefreshing = false
        onTokenRefreshed(success)

        if (success) {
          // Retry original request with new token
          const newHeaders = { ...headers }
          const newAccessToken = getAccessToken()
          if (newAccessToken) {
            (newHeaders as Record<string, string>)["Authorization"] = `Bearer ${newAccessToken}`
          }
          
          response = await fetch(url, {
            ...fetchOptions,
            headers: newHeaders,
            body: body ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
          })
        } else {
          // Dispatch logout event
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth:logout"))
          }
          throw new ApiRequestError({
            status: 401,
            error: "Unauthorized",
            message: ERROR_MESSAGES[401],
            timestamp: new Date().toISOString(),
            path: endpoint,
          })
        }
      } else {
        // Wait for token refresh
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(async (success) => {
            if (success) {
              try {
                const newHeaders = { ...headers }
                const newAccessToken = getAccessToken()
                if (newAccessToken) {
                  (newHeaders as Record<string, string>)["Authorization"] = `Bearer ${newAccessToken}`
                }
                
                const retryResponse = await fetch(url, {
                  ...fetchOptions,
                  headers: newHeaders,
                  body: body ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
                })
                if (retryResponse.ok) {
                  if (retryResponse.status === 204) {
                    resolve({} as T)
                  } else {
                    resolve(await retryResponse.json())
                  }
                } else {
                  reject(new ApiRequestError(await retryResponse.json()))
                }
              } catch (error) {
                reject(error)
              }
            } else {
              reject(new ApiRequestError({
                status: 401,
                error: "Unauthorized",
                message: ERROR_MESSAGES[401],
                timestamp: new Date().toISOString(),
                path: endpoint,
              }))
            }
          })
        })
      }
    }

    // Handle successful responses
    if (response.ok) {
      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T
      }
      
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return response.json()
      }
      
      // Return empty object for non-JSON responses
      return {} as T
    }

    // Handle error responses - supports both new ErrorResponse and legacy ApiError formats
    let errorData: ApiError
    try {
      const rawError = await response.json()
      
      // Check if it's the new ErrorResponse format from GlobalExceptionHandler
      // Format: { error: { code, message, timestamp, details? } }
      if (rawError.error && typeof rawError.error === "object" && rawError.error.code) {
        const errorBody = rawError.error
        errorData = {
          status: response.status,
          error: response.statusText,
          errorCode: errorBody.code,
          message: errorBody.message,
          timestamp: errorBody.timestamp || new Date().toISOString(),
          path: endpoint,
          validationErrors: errorBody.details?.map((d: { field: string; message: string }) => ({
            field: d.field,
            message: d.message,
          })),
        }
      } else {
        // Legacy format or unknown format
        errorData = {
          status: response.status,
          error: rawError.error || response.statusText,
          errorCode: rawError.errorCode || rawError.code,
          message: rawError.message || ERROR_MESSAGES[response.status] || "An unexpected error occurred",
          timestamp: rawError.timestamp || new Date().toISOString(),
          path: rawError.path || endpoint,
          validationErrors: rawError.validationErrors,
        }
      }
    } catch {
      errorData = {
        status: response.status,
        error: response.statusText,
        message: ERROR_MESSAGES[response.status] || "An unexpected error occurred",
        timestamp: new Date().toISOString(),
        path: endpoint,
      }
    }

    throw new ApiRequestError(errorData)
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof ApiRequestError) {
      throw error
    }

    // Handle abort/timeout
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiRequestError({
        status: 408,
        error: "Request Timeout",
        message: "The request timed out. Please try again.",
        timestamp: new Date().toISOString(),
        path: endpoint,
      })
    }

    // Handle network errors
    throw new ApiRequestError({
      status: 0,
      error: "Network Error",
      message: "Unable to connect to the server. Please check your internet connection.",
      timestamp: new Date().toISOString(),
      path: endpoint,
    })
  }
}

// Streaming API request for AI chat responses
export async function apiStreamRequest(
  endpoint: string,
  data: unknown,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: ApiRequestError) => void
): Promise<void> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
  }

  // Add Authorization header if we have a valid token
  const accessToken = getAccessToken()
  if (accessToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        status: response.status,
        error: response.statusText,
        message: ERROR_MESSAGES[response.status] || "An unexpected error occurred",
        timestamp: new Date().toISOString(),
        path: endpoint,
      }))
      throw new ApiRequestError(errorData)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new ApiRequestError({
        status: 500,
        error: "Stream Error",
        message: "Unable to read response stream",
        timestamp: new Date().toISOString(),
        path: endpoint,
      })
    }

    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)
          if (data === "[DONE]") {
            onComplete()
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              onChunk(parsed.content)
            }
          } catch {
            // If not JSON, treat as plain text
            onChunk(data)
          }
        }
      }
    }

    onComplete()
  } catch (error) {
    if (error instanceof ApiRequestError) {
      onError(error)
    } else {
      onError(new ApiRequestError({
        status: 0,
        error: "Stream Error",
        message: "Failed to process streaming response",
        timestamp: new Date().toISOString(),
        path: endpoint,
      }))
    }
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  // Public GET request (no auth required)
  getPublic: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: "GET", skipAuth: true }),

  post: <T>(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  // Public POST request (no auth required)
  postPublic: <T>(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      skipAuth: true,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),

  stream: apiStreamRequest,
}
