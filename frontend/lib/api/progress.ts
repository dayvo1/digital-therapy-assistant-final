import { api } from "./client"
import type {
  WeeklyProgress,
  MonthlyTrend,
  BurnoutRecovery,
  Achievement,
} from "./types"

export const progressApi = {
  /**
   * Get weekly progress summary
   * GET /progress/weekly
   */
  getWeeklyProgress: async (): Promise<WeeklyProgress> => {
    return api.get<WeeklyProgress>("/progress/weekly")
  },

  /**
   * Get monthly trends
   * GET /progress/monthly
   */
  getMonthlyTrends: async (): Promise<MonthlyTrend> => {
    return api.get<MonthlyTrend>("/progress/monthly")
  },

  /**
   * Get burnout recovery metrics
   * GET /progress/burnout
   */
  getBurnoutRecovery: async (): Promise<BurnoutRecovery> => {
    return api.get<BurnoutRecovery>("/progress/burnout")
  },

  /**
   * Get achievements
   * GET /progress/achievements
   * Returns a list of achievements (not wrapped)
   */
  getAchievements: async (): Promise<Achievement[]> => {
    return api.get<Achievement[]>("/progress/achievements")
  },
}
