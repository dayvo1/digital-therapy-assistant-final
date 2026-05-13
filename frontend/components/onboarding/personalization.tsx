"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Sun, Sunset, Moon, Clock, Check } from "lucide-react"
import { useState } from "react"
import type { PersonalizationAnswers } from "@/lib/app-context"

interface PersonalizationProps {
  onComplete: (answers: PersonalizationAnswers) => void
  onBack: () => void
}

const timeOptions = [
  { value: "morning", label: "Morning", icon: Sun, description: "6am - 12pm" },
  { value: "afternoon", label: "Afternoon", icon: Sunset, description: "12pm - 6pm" },
  { value: "evening", label: "Evening", icon: Moon, description: "6pm - 10pm" },
  { value: "flexible", label: "Flexible", icon: Clock, description: "Anytime" },
] as const

const sessionLengths = [
  { value: "short", label: "Quick", duration: "5-10 min", description: "Brief check-ins" },
  { value: "medium", label: "Standard", duration: "15-20 min", description: "Balanced sessions" },
  { value: "long", label: "Deep Dive", duration: "25-30 min", description: "Thorough exploration" },
] as const

const focusAreas = [
  { id: "stress", label: "Stress Management" },
  { id: "anxiety", label: "Anxiety Relief" },
  { id: "sleep", label: "Better Sleep" },
  { id: "worklife", label: "Work-Life Balance" },
  { id: "mindfulness", label: "Mindfulness" },
  { id: "selfesteem", label: "Self-Esteem" },
  { id: "relationships", label: "Relationships" },
  { id: "productivity", label: "Productivity" },
]

export function Personalization({ onComplete, onBack }: PersonalizationProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<PersonalizationAnswers>>({
    focusAreas: [],
    notifications: true,
    voiceEnabled: false,
  })

  const handleComplete = () => {
    onComplete(answers as PersonalizationAnswers)
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              When do you prefer to reflect?
            </h2>
            <p className="text-muted-foreground mb-6">
              We will suggest activities during your preferred time.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {timeOptions.map((option) => {
                const Icon = option.icon
                const isSelected = answers.preferredTime === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => setAnswers((prev) => ({ ...prev, preferredTime: option.value }))}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30 bg-card"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${
                        isSelected ? "bg-primary" : "bg-secondary"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isSelected ? "text-primary-foreground" : "text-secondary-foreground"
                        }`}
                      />
                    </div>
                    <h4 className="font-medium text-foreground">{option.label}</h4>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              How long are your ideal sessions?
            </h2>
            <p className="text-muted-foreground mb-6">
              You can always adjust this for individual sessions.
            </p>
            <div className="space-y-3">
              {sessionLengths.map((option) => {
                const isSelected = answers.sessionLength === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => setAnswers((prev) => ({ ...prev, sessionLength: option.value }))}
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30 bg-card"
                    }`}
                  >
                    <div>
                      <h4 className="font-medium text-foreground">{option.label}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-primary">{option.duration}</span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              What areas would you like to focus on?
            </h2>
            <p className="text-muted-foreground mb-6">
              Select all that apply. We will personalize your content.
            </p>
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((area) => {
                const isSelected = answers.focusAreas?.includes(area.id)
                return (
                  <button
                    key={area.id}
                    onClick={() => {
                      setAnswers((prev) => ({
                        ...prev,
                        focusAreas: isSelected
                          ? prev.focusAreas?.filter((id) => id !== area.id)
                          : [...(prev.focusAreas || []), area.id],
                      }))
                    }}
                    className={`px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/30 bg-card text-foreground"
                    }`}
                  >
                    {area.label}
                  </button>
                )
              })}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Communication preferences
            </h2>
            <p className="text-muted-foreground mb-6">
              Customize how you interact with MindfulPath.
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Gentle Reminders</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive mindful nudges for check-ins and sessions
                    </p>
                  </div>
                  <Switch
                    checked={answers.notifications}
                    onCheckedChange={(checked) =>
                      setAnswers((prev) => ({ ...prev, notifications: checked }))
                    }
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">Voice Interactions</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enable voice input and audio guidance
                    </p>
                  </div>
                  <Switch
                    checked={answers.voiceEnabled}
                    onCheckedChange={(checked) =>
                      setAnswers((prev) => ({ ...prev, voiceEnabled: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border/50">
              <p className="text-sm text-muted-foreground">
                You can change these preferences anytime in Settings. We will never send you more than 2 notifications per day.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canContinue = () => {
    switch (step) {
      case 0:
        return !!answers.preferredTime
      case 1:
        return !!answers.sessionLength
      case 2:
        return (answers.focusAreas?.length || 0) > 0
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => (step > 0 ? setStep(step - 1) : onBack())}
          className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <span className="text-sm text-muted-foreground">
          {step + 1} of 4
        </span>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2 mb-4">
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-border" />
      </div>

      {/* Personalization progress */}
      <div className="mb-8">
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">{renderStep()}</div>

      {/* Continue button */}
      <div className="pt-6">
        <Button
          onClick={() => (step < 3 ? setStep(step + 1) : handleComplete())}
          disabled={!canContinue()}
          className="w-full h-14 text-lg font-medium rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {step < 3 ? "Continue" : "Complete Setup"}
        </Button>
      </div>
    </div>
  )
}
