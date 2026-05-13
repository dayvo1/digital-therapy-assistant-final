import { api } from "./client"
import type {
  DiaryEntrySummary,
  DiaryEntryDetail,
  DiaryEntryResponse,
  CreateDiaryEntryRequest,
  DistortionSuggestion,
  DiaryInsights,
  RestPage,
} from "./types"

export const diaryApi = {
  /**
   * List diary entries with pagination
   * GET /diary/entries
   * Returns a Spring Page with DiaryEntrySummary items
   */
  getEntries: async (params?: {
    page?: number
    size?: number
    sort?: string
  }): Promise<RestPage<DiaryEntrySummary>> => {
    const searchParams = new URLSearchParams()
    if (params?.page !== undefined) searchParams.append("page", params.page.toString())
    if (params?.size !== undefined) searchParams.append("size", params.size.toString())
    if (params?.sort) searchParams.append("sort", params.sort)

    const query = searchParams.toString()
    return api.get<RestPage<DiaryEntrySummary>>(`/diary/entries${query ? `?${query}` : ""}`)
  },

  /**
   * Create a new diary entry
   * POST /diary/entries
   */
  createEntry: async (data: CreateDiaryEntryRequest): Promise<DiaryEntryResponse> => {
    return api.post<DiaryEntryResponse>("/diary/entries", data)
  },

  /**
   * Get diary entry detail
   * GET /diary/entries/{entryId}
   */
  getEntry: async (entryId: string): Promise<DiaryEntryDetail> => {
    return api.get<DiaryEntryDetail>(`/diary/entries/${entryId}`)
  },

  /**
   * Delete a diary entry
   * DELETE /diary/entries/{entryId}
   */
  deleteEntry: async (entryId: string): Promise<void> => {
    return api.delete<void>(`/diary/entries/${entryId}`)
  },

  /**
   * Get AI-suggested cognitive distortions based on automatic thought
   * POST /diary/distortions/suggest
   * Returns a list of distortion suggestions with confidence scores
   */
  suggestDistortions: async (thought: string): Promise<DistortionSuggestion[]> => {
    return api.post<DistortionSuggestion[]>("/diary/distortions/suggest", { thought })
  },

  /**
   * Get diary insights and patterns
   * GET /diary/insights
   */
  getInsights: async (): Promise<DiaryInsights> => {
    return api.get<DiaryInsights>("/diary/insights")
  },
}
