"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type UserType = "individual" | "therapist-referred" | null
export type OnboardingStep = 
  | "welcome" 
  | "user-type" 
  | "privacy" 
  | "assessment" 
  | "personalization" 
  | "complete"

export interface AssessmentAnswers {
  exhaustion: number
  cynicism: number
  efficacy: number
  workload: number
  control: number
  reward: number
  community: number
  fairness: number
  values: number
}

export interface PersonalizationAnswers {
  preferredTime: "morning" | "afternoon" | "evening" | "flexible"
  sessionLength: "short" | "medium" | "long"
  focusAreas: string[]
  notifications: boolean
  voiceEnabled: boolean
}

export interface ThoughtEntry {
  id: string
  date: Date
  situation: string
  thoughts: string
  emotions: { emotion: string; intensity: number }[]
  cognitiveDistortions: string[]
  reframedThought: string
  insights?: string
}

export interface CBTSession {
  id: string
  title: string
  description: string
  duration: number
  type: "audio" | "text" | "interactive"
  completed: boolean
  completedAt?: Date
  rating?: number
  feedback?: string
}

export interface UserProgress {
  sessionsCompleted: number
  entriesLogged: number
  streak: number
  burnoutScore: number
  weeklyMoodAverage: number
  achievements: string[]
}

interface AppState {
  userType: UserType
  onboardingStep: OnboardingStep
  onboardingComplete: boolean
  assessmentAnswers: Partial<AssessmentAnswers>
  personalizationAnswers: Partial<PersonalizationAnswers>
  burnoutScore: number | null
  thoughtEntries: ThoughtEntry[]
  cbtSessions: CBTSession[]
  progress: UserProgress
  isCrisisMode: boolean
  consentGiven: boolean
}

interface AppContextType extends AppState {
  setUserType: (type: UserType) => void
  setOnboardingStep: (step: OnboardingStep) => void
  completeOnboarding: () => void
  updateAssessment: (answers: Partial<AssessmentAnswers>) => void
  updatePersonalization: (answers: Partial<PersonalizationAnswers>) => void
  calculateBurnoutScore: () => number
  addThoughtEntry: (entry: Omit<ThoughtEntry, "id" | "date">) => void
  updateThoughtEntry: (id: string, entry: Partial<ThoughtEntry>) => void
  deleteThoughtEntry: (id: string) => void
  completeCBTSession: (sessionId: string, rating?: number, feedback?: string) => void
  triggerCrisisMode: () => void
  exitCrisisMode: () => void
  giveConsent: () => void
  resetApp: () => void
}

const initialState: AppState = {
  userType: null,
  onboardingStep: "welcome",
  onboardingComplete: false,
  assessmentAnswers: {},
  personalizationAnswers: {},
  burnoutScore: null,
  thoughtEntries: [],
  cbtSessions: [
    {
      id: "1",
      title: "Introduction to CBT",
      description: "Learn the fundamentals of Cognitive Behavioral Therapy and how it can help manage burnout.",
      duration: 15,
      type: "interactive",
      completed: false,
    },
    {
      id: "2",
      title: "Identifying Cognitive Distortions",
      description: "Recognize common thinking patterns that contribute to stress and burnout.",
      duration: 20,
      type: "interactive",
      completed: false,
    },
    {
      id: "3",
      title: "Thought Challenging Techniques",
      description: "Practice reframing negative thoughts with evidence-based strategies.",
      duration: 25,
      type: "interactive",
      completed: false,
    },
    {
      id: "4",
      title: "Behavioral Activation",
      description: "Discover how small actions can shift your mood and energy.",
      duration: 20,
      type: "interactive",
      completed: false,
    },
    {
      id: "5",
      title: "Stress Management Essentials",
      description: "Build a toolkit of practical coping strategies for daily stress.",
      duration: 18,
      type: "audio",
      completed: false,
    },
    {
      id: "6",
      title: "Setting Healthy Boundaries",
      description: "Learn to protect your energy and prioritize self-care.",
      duration: 22,
      type: "interactive",
      completed: false,
    },
  ],
  progress: {
    sessionsCompleted: 0,
    entriesLogged: 0,
    streak: 0,
    burnoutScore: 0,
    weeklyMoodAverage: 0,
    achievements: [],
  },
  isCrisisMode: false,
  consentGiven: false,
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)

  const setUserType = useCallback((type: UserType) => {
    setState(prev => ({ ...prev, userType: type }))
  }, [])

  const setOnboardingStep = useCallback((step: OnboardingStep) => {
    setState(prev => ({ ...prev, onboardingStep: step }))
  }, [])

  const completeOnboarding = useCallback(() => {
    setState(prev => ({ ...prev, onboardingComplete: true, onboardingStep: "complete" }))
  }, [])

  const updateAssessment = useCallback((answers: Partial<AssessmentAnswers>) => {
    setState(prev => ({
      ...prev,
      assessmentAnswers: { ...prev.assessmentAnswers, ...answers },
    }))
  }, [])

  const updatePersonalization = useCallback((answers: Partial<PersonalizationAnswers>) => {
    setState(prev => ({
      ...prev,
      personalizationAnswers: { ...prev.personalizationAnswers, ...answers },
    }))
  }, [])

  const calculateBurnoutScore = useCallback(() => {
    const answers = state.assessmentAnswers
    const values = Object.values(answers).filter((v): v is number => typeof v === "number")
    if (values.length === 0) return 0
    const average = values.reduce((a, b) => a + b, 0) / values.length
    const score = Math.round((average / 5) * 100)
    setState(prev => ({ ...prev, burnoutScore: score, progress: { ...prev.progress, burnoutScore: score } }))
    return score
  }, [state.assessmentAnswers])

  const addThoughtEntry = useCallback((entry: Omit<ThoughtEntry, "id" | "date">) => {
    const newEntry: ThoughtEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date(),
    }
    setState(prev => ({
      ...prev,
      thoughtEntries: [newEntry, ...prev.thoughtEntries],
      progress: { ...prev.progress, entriesLogged: prev.progress.entriesLogged + 1 },
    }))
  }, [])

  const updateThoughtEntry = useCallback((id: string, entry: Partial<ThoughtEntry>) => {
    setState(prev => ({
      ...prev,
      thoughtEntries: prev.thoughtEntries.map(e => (e.id === id ? { ...e, ...entry } : e)),
    }))
  }, [])

  const deleteThoughtEntry = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      thoughtEntries: prev.thoughtEntries.filter(e => e.id !== id),
    }))
  }, [])

  const completeCBTSession = useCallback((sessionId: string, rating?: number, feedback?: string) => {
    setState(prev => ({
      ...prev,
      cbtSessions: prev.cbtSessions.map(s =>
        s.id === sessionId ? { ...s, completed: true, completedAt: new Date(), rating, feedback } : s
      ),
      progress: { ...prev.progress, sessionsCompleted: prev.progress.sessionsCompleted + 1 },
    }))
  }, [])

  const triggerCrisisMode = useCallback(() => {
    setState(prev => ({ ...prev, isCrisisMode: true }))
  }, [])

  const exitCrisisMode = useCallback(() => {
    setState(prev => ({ ...prev, isCrisisMode: false }))
  }, [])

  const giveConsent = useCallback(() => {
    setState(prev => ({ ...prev, consentGiven: true }))
  }, [])

  const resetApp = useCallback(() => {
    setState(initialState)
  }, [])

  return (
    <AppContext.Provider
      value={{
        ...state,
        setUserType,
        setOnboardingStep,
        completeOnboarding,
        updateAssessment,
        updatePersonalization,
        calculateBurnoutScore,
        addThoughtEntry,
        updateThoughtEntry,
        deleteThoughtEntry,
        completeCBTSession,
        triggerCrisisMode,
        exitCrisisMode,
        giveConsent,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
