import { api } from "./client"
import type {
  CrisisHub,
  CopingStrategy,
  SafetyPlan,
  UpdateSafetyPlanRequest,
  CrisisDetectionRequest,
  CrisisDetectionResponse,
} from "./types"

export const crisisApi = {
  /**
   * Get crisis hub overview
   * GET /crisis?userId=... (userId is optional)
   * Backend: CrisisController.getCrisisHub()
   */
  getCrisisHub: async (userId?: string): Promise<CrisisHub> => {
    const params = userId ? `?userId=${userId}` : ""
    return api.get<CrisisHub>(`/crisis${params}`)
  },

  /**
   * Get coping strategies (PUBLIC endpoint - no auth required)
   * GET /crisis/coping-strategies
   * Backend: CrisisController.getCopingStrategies()
   * Returns a flat list of coping strategies
   */
  getCopingStrategies: async (): Promise<CopingStrategy[]> => {
    return api.get<CopingStrategy[]>("/crisis/coping-strategies")
  },

  /**
   * Detect crisis indicators in text
   * POST /crisis/detect
   * Backend: CrisisController.detectCrisis()
   */
  detectCrisis: async (data: CrisisDetectionRequest): Promise<CrisisDetectionResponse> => {
    return api.post<CrisisDetectionResponse>("/crisis/detect", data)
  },

  /**
   * Get user's safety plan
   * GET /crisis/safety-plan?userId=...
   * Backend: CrisisController.getSafetyPlan() - requires userId query param
   */
  getSafetyPlan: async (userId: string): Promise<SafetyPlan> => {
    return api.get<SafetyPlan>(`/crisis/safety-plan?userId=${userId}`)
  },

  /**
   * Update user's safety plan
   * PUT /crisis/safety-plan?userId=...
   * Backend: CrisisController.updateSafetyPlan() - requires userId query param
   */
  updateSafetyPlan: async (userId: string, data: UpdateSafetyPlanRequest): Promise<SafetyPlan> => {
    return api.put<SafetyPlan>(`/crisis/safety-plan?userId=${userId}`, data)
  },
}
