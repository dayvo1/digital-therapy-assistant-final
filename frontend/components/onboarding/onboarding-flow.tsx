"use client"

import { useState } from "react"
import { WelcomeScreen } from "./welcome-screen"
import { UserTypeSelection } from "./user-type-selection"
import { PrivacyConsent } from "./privacy-consent"
import { BurnoutAssessment } from "./burnout-assessment"
import { Personalization } from "./personalization"
import { OnboardingComplete } from "./onboarding-complete"
import { useAuth } from "@/lib/auth-context"
import { markOnboardingComplete } from "@/lib/api/auth"

type OnboardingStep = "welcome" | "user-type" | "privacy" | "assessment" | "personalization" | "complete"
type UserType = "individual" | "caregiver" | "healthcare-professional"

interface AssessmentAnswers {
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

interface PersonalizationAnswers {
  theme: "light" | "dark" | "system"
  notifications: boolean
  reminderTime: string
  goals: string[]
}

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user, setHasCompletedOnboarding } = useAuth()
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>("welcome")
  const [userType, setUserType] = useState<UserType | null>(null)
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswers | null>(null)
  const [burnoutScore, setBurnoutScore] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleWelcomeContinue = () => {
    setOnboardingStep("user-type")
  }

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type)
    setOnboardingStep("privacy")
  }

  const handlePrivacyConsent = () => {
    setOnboardingStep("assessment")
  }

  const calculateBurnoutScore = (answers: AssessmentAnswers): number => {
    const values = Object.values(answers)
    const total = values.reduce((sum, val) => sum + val, 0)
    const maxScore = values.length * 5
    return Math.round((total / maxScore) * 100)
  }

  const handleAssessmentComplete = async (answers: AssessmentAnswers) => {
    setAssessmentAnswers(answers)
    const score = calculateBurnoutScore(answers)
    setBurnoutScore(score)
    
    // Note: Assessment data is stored locally for personalization
    // The backend progress API tracks progress over time from sessions/diary entries
    // rather than accepting assessment submissions
    
    setOnboardingStep("personalization")
  }

  const handlePersonalizationComplete = (answers: PersonalizationAnswers) => {
    setOnboardingStep("complete")
  }

  const handleOnboardingComplete = async () => {
    setIsSubmitting(true)
    try {
      // Persist onboarding completion to localStorage
      // This ensures the status survives page reloads
      if (user?.id) {
        markOnboardingComplete(user.id)
      }
      setHasCompletedOnboarding(true)
      onComplete()
    } catch (error) {
      console.error("Failed to complete onboarding:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  switch (onboardingStep) {
    case "welcome":
      return <WelcomeScreen onContinue={handleWelcomeContinue} />
    case "user-type":
      return (
        <UserTypeSelection
          onSelect={handleUserTypeSelect}
          onBack={() => setOnboardingStep("welcome")}
        />
      )
    case "privacy":
      return (
        <PrivacyConsent
          onConsent={handlePrivacyConsent}
          onBack={() => setOnboardingStep("user-type")}
        />
      )
    case "assessment":
      return (
        <BurnoutAssessment
          onComplete={handleAssessmentComplete}
          onBack={() => setOnboardingStep("privacy")}
        />
      )
    case "personalization":
      return (
        <Personalization
          onComplete={handlePersonalizationComplete}
          onBack={() => setOnboardingStep("assessment")}
        />
      )
    case "complete":
      return (
        <OnboardingComplete
          burnoutScore={burnoutScore}
          onContinue={handleOnboardingComplete}
        />
      )
    default:
      return <WelcomeScreen onContinue={handleWelcomeContinue} />
  }
}
