import { api } from "./client"
import type {
  SessionModuleDto,
  ActiveSession,
  ChatRequest,
  ChatResponse,
  SessionSummary,
  SessionHistoryEntry,
} from "./types"

export const sessionsApi = {
  /**
   * Get session library (modules with sessions)
   * GET /sessions
   * Returns a list of session modules, each containing multiple sessions
   */
  getSessions: async (): Promise<SessionModuleDto[]> => {
    return api.get<SessionModuleDto[]>("/sessions")
  },

  /**
   * Start a CBT session
   * POST /sessions/{sessionId}/start
   * Returns an ActiveSession with userSessionId for chat
   */
  startSession: async (sessionId: string): Promise<ActiveSession> => {
    return api.post<ActiveSession>(`/sessions/${sessionId}/start`, {})
  },

  /**
   * Send chat message during session
   * POST /sessions/{userSessionId}/chat
   * Note: Uses userSessionId from ActiveSession, not the template sessionId
   */
  sendMessage: async (userSessionId: string, data: ChatRequest): Promise<ChatResponse> => {
    return api.post<ChatResponse>(`/sessions/${userSessionId}/chat`, data)
  },

  /**
   * End a session
   * POST /sessions/{userSessionId}/end
   * Returns session summary with insights
   */
  endSession: async (
    userSessionId: string,
    reason?: string
  ): Promise<SessionSummary> => {
    return api.post<SessionSummary>(`/sessions/${userSessionId}/end`, { reason: reason || "User ended session" })
  },

  /**
   * Get session history
   * GET /sessions/history
   * Returns a list of past session entries
   */
  getSessionHistory: async (): Promise<SessionHistoryEntry[]> => {
    return api.get<SessionHistoryEntry[]>("/sessions/history")
  },
}
