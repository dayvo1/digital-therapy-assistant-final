"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, Sparkles, TrendingDown, TrendingUp, Minus, ArrowRight } from "lucide-react"

interface OnboardingCompleteProps {
  burnoutScore: number
  onContinue: () => void
}

export function OnboardingComplete({ burnoutScore, onContinue }: OnboardingCompleteProps) {
  const getScoreLevel = () => {
    if (burnoutScore < 30) return { level: "Low", color: "text-success", bg: "bg-success/10" }
    if (burnoutScore < 50) return { level: "Mild", color: "text-accent-foreground", bg: "bg-accent/20" }
    if (burnoutScore < 70) return { level: "Moderate", color: "text-warning-foreground", bg: "bg-warning/20" }
    return { level: "High", color: "text-crisis", bg: "bg-crisis/10" }
  }

  const scoreInfo = getScoreLevel()

  const getScoreIcon = () => {
    if (burnoutScore < 30) return TrendingDown
    if (burnoutScore < 70) return Minus
    return TrendingUp
  }

  const ScoreIcon = getScoreIcon()

  const getRecommendations = () => {
    if (burnoutScore < 30) {
      return [
        "Maintain your wellness with regular check-ins",
        "Explore mindfulness exercises to stay balanced",
        "Build resilience with our preventive sessions",
      ]
    }
    if (burnoutScore < 50) {
      return [
        "Start with stress management techniques",
        "Track your thoughts to identify patterns",
        "Schedule regular breaks throughout your day",
      ]
    }
    if (burnoutScore < 70) {
      return [
        "Begin with guided CBT sessions for stress relief",
        "Use the thought diary to process emotions",
        "Consider speaking with a healthcare provider",
      ]
    }
    return [
      "We recommend speaking with a mental health professional",
      "Use our crisis support features when needed",
      "Start with gentle, restorative exercises",
    ]
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-background">
      {/* Progress indicator - complete */}
      <div className="flex gap-2 mb-8">
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-primary" />
      </div>

      {/* Success animation */}
      <div className="flex flex-col items-center text-center mb-8 animate-fade-in">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Your Journey Begins
        </h1>
        <p className="text-muted-foreground">
          We have personalized MindfulPath just for you.
        </p>
      </div>

      {/* Burnout Score Card */}
      <div className="mb-6 animate-slide-up">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">Your Burnout Assessment</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${scoreInfo.bg} ${scoreInfo.color}`}>
              {scoreInfo.level}
            </span>
          </div>

          {/* Score visualization */}
          <div className="relative mb-4">
            <div className="h-4 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${burnoutScore}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
            <div className={`w-10 h-10 rounded-full ${scoreInfo.bg} flex items-center justify-center`}>
              <ScoreIcon className={`w-5 h-5 ${scoreInfo.color}`} />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-foreground">{burnoutScore}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
              </div>
              <p className="text-sm text-muted-foreground">Current burnout indicator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="flex-1 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <h3 className="font-medium text-foreground mb-4">Your Personalized Path</h3>
        <div className="space-y-3">
          {getRecommendations().map((rec, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50"
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">{index + 1}</span>
              </div>
              <p className="text-foreground">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy reminder */}
      <div className="my-6 p-4 rounded-xl bg-secondary/50 border border-border/50">
        <p className="text-sm text-muted-foreground text-center">
          Your assessment results are private and secure. Only you can see this information.
        </p>
      </div>

      {/* Continue button */}
      <div className="pt-2">
        <Button
          onClick={onContinue}
          className="w-full h-14 text-lg font-medium rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
