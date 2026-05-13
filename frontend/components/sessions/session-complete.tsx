"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { SessionSummaryItem } from "@/lib/api/types"
import { CheckCircle2, Sparkles, ArrowRight, TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react"

interface SessionCompleteProps {
  session: SessionSummaryItem
  summary: {
    moodChange: number
    insights: string[]
  }
  onContinue: () => void
}

export function SessionComplete({ session, summary, onContinue }: SessionCompleteProps) {
  const getMoodChangeIcon = () => {
    if (summary.moodChange > 0) return <TrendingUp className="w-5 h-5 text-success" />
    if (summary.moodChange < 0) return <TrendingDown className="w-5 h-5 text-destructive" />
    return <Minus className="w-5 h-5 text-muted-foreground" />
  }

  const getMoodChangeText = () => {
    if (summary.moodChange > 0) return `+${summary.moodChange} mood improvement`
    if (summary.moodChange < 0) return `${summary.moodChange} mood change`
    return "Mood stayed stable"
  }

  const getMoodChangeColor = () => {
    if (summary.moodChange > 0) return "text-success"
    if (summary.moodChange < 0) return "text-destructive"
    return "text-muted-foreground"
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 bg-background">
      {/* Success animation */}
      <div className="flex flex-col items-center text-center mb-8 animate-fade-in">
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-success/20 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-success/40 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-success flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success-foreground" />
              </div>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-accent-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Session Complete!</h1>
        <p className="text-muted-foreground max-w-sm">
          You have finished &quot;{session.title}&quot;. Great work on investing in your mental wellness.
        </p>
      </div>

      {/* Mood change */}
      <Card className="border-border/50 mb-6 animate-slide-up">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {getMoodChangeIcon()}
            <span className={`text-2xl font-semibold ${getMoodChangeColor()}`}>
              {getMoodChangeText()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your mood was tracked before and after the session
          </p>
        </CardContent>
      </Card>

      {/* Key insights */}
      {summary.insights && summary.insights.length > 0 && (
        <Card className="border-border/50 bg-primary/5 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">Key Insights</h3>
            </div>
            <ul className="space-y-3">
              {summary.insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tips card */}
      <Card className="border-border/50 mb-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <CardContent className="p-6">
          <h3 className="font-medium text-foreground mb-3">What&apos;s Next?</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Practice the techniques from this session in daily life</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Record any thoughts or situations in your diary</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>Continue to your next session when you feel ready</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Continue button */}
      <div className="mt-auto">
        <Button
          onClick={onContinue}
          className="w-full h-14 text-lg font-medium rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2"
        >
          Back to Sessions
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
