// API Response Types - Aligned with Backend DTOs and CLI Implementation

// ============================================================
// Authentication DTOs
// ============================================================

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

// Matches AuthResponse.java
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  userId: string
  name: string
}

// Frontend User model (derived from AuthResponse)
export interface User {
  id: string
  email: string
  name: string
  role?: "USER" | "ADMIN"
  createdAt?: string
  hasCompletedOnboarding?: boolean
  burnoutLevel?: "LOW" | "MODERATE" | "HIGH" | "SEVERE"
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  notifications: boolean
  reminderTime?: string
  preferredSessionDuration?: number
}

// ============================================================
// Session DTOs - Matches CLI SessionCommands.java
// ============================================================

// Matches SessionModuleDto.java with nested SessionSummaryItem
export interface SessionModuleDto {
  id: string
  name: string
  description: string
  category: string
  sessions: SessionSummaryItem[]
}

// Matches SessionModuleDto.SessionSummaryItem
export interface SessionSummaryItem {
  id: string
  title: string
  description: string
  durationMinutes: number
}

// Matches ActiveSession.java (returned from /sessions/{id}/start)
export interface ActiveSession {
  sessionId: string
  userSessionId: string
  title: string
  description: string
  startedAt: string
  moodBefore?: number
}

// Frontend extended ActiveSession with additional tracking
export interface ActiveSessionState extends ActiveSession {
  currentStepIndex?: number
  messages?: ChatMessage[]
  moodAfter?: number
}

export interface ChatMessage {
  id: string
  role: string // "user" | "assistant" | "system" from backend
  content: string
  timestamp: string
  crisisDetected?: boolean
  crisisAction?: string
}

// Matches ChatRequest.java
export interface ChatRequest {
  message: string
  modality?: "TEXT" | "VOICE" | "VIDEO"
}

// Matches ChatResponse.java
export interface ChatResponse {
  message: string
  role?: string
  timestamp?: string
  crisisDetected: boolean
  crisisAction?: string
}

// Matches SessionSummary.java (returned from /sessions/{id}/end)
export interface SessionSummary {
  sessionId?: string
  summary?: string
  moodBefore?: number
  moodAfter?: number
  keyInsights?: string[]
  duration?: number
  completedSteps?: number
  totalSteps?: number
  moodChange?: number
  insights?: string[]
  nextRecommendations?: string[]
}

// Matches SessionHistoryEntry.java (returned from /sessions/history)
export interface SessionHistoryEntry {
  id?: string
  sessionId?: string
  sessionTitle: string
  moduleName: string
  status: string
  startedAt?: string
  endedAt?: string
  moodBefore?: number
  moodAfter?: number
  duration?: number
}

// Legacy types for backward compatibility
export interface Session {
  id: string
  title: string
  description: string
  duration: number
  category: "STRESS_MANAGEMENT" | "COGNITIVE_RESTRUCTURING" | "MINDFULNESS" | "WORK_LIFE_BALANCE"
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  imageUrl?: string
  techniques: string[]
}

export interface SessionDetail extends Session {
  steps: SessionStep[]
  objectives: string[]
  prerequisites?: string[]
}

export interface SessionStep {
  id: string
  type: "VIDEO" | "TEXT" | "EXERCISE" | "REFLECTION" | "BREATHING" | "QUIZ"
  title: string
  content: string
  duration: number
  mediaUrl?: string
  options?: QuizOption[]
}

export interface QuizOption {
  id: string
  text: string
  isCorrect?: boolean
}

// ============================================================
// Diary DTOs - Matches CLI DiaryCommands.java
// ============================================================

// Matches DiaryEntrySummary.java (for list view)
export interface DiaryEntrySummary {
  id: string
  situation: string
  automaticThought: string
  moodBefore?: number
  moodAfter?: number
  createdAt: string
  distortionCount: number
}

// Matches DiaryEntryDetail.java (for detail view)
export interface DiaryEntryDetail {
  id: string
  situation: string
  automaticThought: string
  emotions: EmotionInfo[]
  distortions: DistortionInfo[]
  alternativeThought?: string
  moodBefore?: number
  moodAfter?: number
  beliefRatingBefore?: number
  beliefRatingAfter?: number
  createdAt: string
}

export interface EmotionInfo {
  emotion: string
  intensity: number
}

export interface DistortionInfo {
  id: string
  name: string
  description: string
}

// Matches DiaryEntryResponse.java (for create response)
export interface DiaryEntryResponse {
  id: string
  situation: string
  automaticThought: string
  emotions?: EmotionRating[]
  distortionIds?: string[]
  alternativeThought?: string
  moodBefore?: number
  moodAfter?: number
  beliefRatingBefore?: number
  beliefRatingAfter?: number
  createdAt?: string
}

export interface EmotionRating {
  emotion: string
  intensity: number
}

// Matches DiaryEntryCreate.java
export interface CreateDiaryEntryRequest {
  situation: string
  automaticThought: string
  emotions?: EmotionRating[]
  distortionIds?: string[]
  alternativeThought?: string
  moodBefore?: number
  moodAfter?: number
  beliefRatingBefore?: number
  beliefRatingAfter?: number
}

// Matches DistortionSuggestion.java (from CLI)
export interface DistortionSuggestion {
  id?: string
  name: string
  confidence: number
  reasoning: string
}

// Matches DiaryInsights.java (from CLI)
export interface DiaryInsights {
  totalEntries: number
  averageMoodImprovement: number
  topDistortions?: DistortionFrequencyItem[]
  patterns?: string[]
  recommendations?: string[]
  // Legacy fields for backward compatibility
  averageMoodBefore?: number
  averageMoodAfter?: number
  commonDistortions?: DistortionFrequency[]
  commonEmotions?: EmotionFrequency[]
  weeklyTrend?: MoodTrendPoint[]
  monthlyTrend?: MoodTrendPoint[]
}

// Matches DiaryInsights.DistortionFrequency from CLI
export interface DistortionFrequencyItem {
  name: string
  count: number
}

// Legacy type alias for backward compatibility
export interface DiaryEntry extends DiaryEntryDetail {}
export interface Emotion extends EmotionInfo {}
export interface CognitiveDistortion extends DistortionInfo {
  example?: string
  isAiSuggested?: boolean
}

export interface DistortionFrequency {
  distortion: DistortionInfo
  count: number
  percentage: number
}

export interface EmotionFrequency {
  emotion: string
  count: number
  averageIntensity: number
}

export interface MoodTrendPoint {
  date: string
  averageMood: number
  entryCount: number
}

export interface InsightPattern {
  type: "TRIGGER" | "PROGRESS" | "RECOMMENDATION"
  title: string
  description: string
  confidence: number
}

// ============================================================
// Progress DTOs - Matches CLI ProgressCommands.java
// ============================================================

// Matches WeeklyProgress.java from CLI
export interface WeeklyProgress {
  weekStart?: string
  weekEnd?: string
  sessionsCompleted: number
  diaryEntries: number
  averageMood: number
  streakDays: number
  dailyMoods?: DailyMood[]
  // Legacy fields
  totalSessionTime?: number
  diaryEntriesCreated?: number
  moodChange?: number
  goals?: ProgressGoal[]
}

// Matches WeeklyProgress.DailyMood from CLI
export interface DailyMood {
  date?: string
  averageMood: number
  entriesCount: number
}

export interface ProgressGoal {
  id: string
  title: string
  target: number
  current: number
  unit: string
}

// Matches MonthlyTrend.java from CLI
export interface MonthlyTrend {
  month: string
  year: number
  totalSessions: number
  totalDiaryEntries: number
  averageMoodStart: number
  averageMoodEnd: number
  moodTrend: number
  weeks?: WeeklySummaryItem[]
}

// Matches MonthlyTrend.WeeklySummaryItem from CLI
export interface WeeklySummaryItem {
  weekNumber: number
  sessions: number
  entries: number
  avgMood: number
}

// Legacy type for backward compatibility
export interface MonthlyTrends {
  month: string
  year: number
  burnoutScores?: BurnoutScorePoint[]
  sessionActivity?: SessionActivityPoint[]
  diaryActivity?: DiaryActivityPoint[]
  overallProgress?: number
}

export interface BurnoutScorePoint {
  date: string
  score: number
  category: "LOW" | "MODERATE" | "HIGH" | "SEVERE"
}

export interface SessionActivityPoint {
  week: number
  sessionsCompleted: number
  totalMinutes: number
}

export interface DiaryActivityPoint {
  week: number
  entriesCreated: number
  averageMoodImprovement: number
}

// Matches BurnoutRecovery.java
export interface BurnoutRecovery {
  overallStatus: string
  recoveryScore: number
  dimensionScores: Record<string, number>
  recommendations: string[]
  consecutiveDaysActive: number
}

// Matches Achievement.java from CLI
export interface Achievement {
  id: string
  name: string
  description: string
  icon?: string
  unlocked: boolean
  unlockedAt?: string
  progress: number
}

// ============================================================
// Crisis DTOs - Matches CLI CrisisCommands.java
// ============================================================

// Matches CrisisHub.java
export interface CrisisHub {
  message?: string
  emergencyResources?: EmergencyResource[]
  copingStrategies?: string[]
  safetyPlanSummary?: string
}

// Matches CrisisHub.EmergencyResource
export interface EmergencyResource {
  name: string
  phone: string
  description: string
  available24x7: boolean
}

// Matches CopingStrategy.java
export interface CopingStrategy {
  id?: string
  name: string
  description: string
  category: string
  steps?: string[]
  estimatedMinutes: number
}

// Matches SafetyPlanDto.java
export interface SafetyPlan {
  userId?: string
  warningSignals?: string[]
  copingStrategies?: string[]
  trustedContacts?: TrustedContact[]
  professionalContacts?: string[]
  environmentSafetySteps?: string[]
  reasonForLiving?: string
}

// Matches SafetyPlanDto.TrustedContactDto
export interface TrustedContact {
  name: string
  phone: string
  relationship: string
}

// Matches SafetyPlanUpdate.java
export interface UpdateSafetyPlanRequest {
  warningSignals?: string[]
  copingStrategies?: string[]
  trustedContacts?: TrustedContact[]
  professionalContacts?: string[]
  environmentSafetySteps?: string[]
  reasonForLiving?: string
}

// Matches CrisisDetectRequest.java
export interface CrisisDetectionRequest {
  text: string
}

// Matches CrisisDetectionResultDto.java
export interface CrisisDetectionResponse {
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL"
  keywordsDetected: string[]
  recommendedAction: string
  reasoning: string
}

// Helper to check if crisis is detected based on risk level
export function isCrisisDetected(response: CrisisDetectionResponse): boolean {
  return response.riskLevel === "HIGH" || response.riskLevel === "CRITICAL"
}

export interface CrisisActivity {
  type: "COPING_STRATEGY_USED" | "SAFETY_PLAN_VIEWED" | "RESOURCE_ACCESSED"
  timestamp: string
  details: string
}

// ============================================================
// Pagination - Matches Spring RestPage (from CLI RestPage.java)
// ============================================================

// Matches RestPage.java from CLI
export interface RestPage<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number: number // current page number (0-indexed)
  size: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

// Helper methods matching CLI RestPage
export function hasNextPage<T>(page: RestPage<T>): boolean {
  return !page.last
}

export function hasPreviousPage<T>(page: RestPage<T>): boolean {
  return !page.first
}

// Legacy type for backward compatibility
export interface PaginatedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

// ============================================================
// Error Response - Matches GlobalExceptionHandler ErrorResponse.java
// ============================================================

/**
 * Matches backend ErrorResponse DTO structure from GlobalExceptionHandler
 * The backend wraps all errors in { error: ErrorBody }
 */
export interface ErrorResponse {
  error: ErrorBody
}

export interface ErrorBody {
  code: string
  message: string
  timestamp: string
  details?: ErrorDetail[]
}

export interface ErrorDetail {
  field: string
  message: string
}

/**
 * Legacy ApiError format for backwards compatibility
 * Can be converted from ErrorResponse
 */
export interface ApiError {
  status: number
  error: string
  errorCode?: string
  message: string
  timestamp: string
  path?: string
  validationErrors?: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
}
