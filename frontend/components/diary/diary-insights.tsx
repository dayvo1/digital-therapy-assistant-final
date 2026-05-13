"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { diaryApi, ApiRequestError } from "@/lib/api"
import type { DiaryInsights as DiaryInsightsType } from "@/lib/api/types"
import { ArrowLeft, TrendingUp, Brain, BarChart3, Lightbulb, AlertCircle, CheckCircle2 } from "lucide-react"

interface DiaryInsightsProps {
  onBack: () => void
}

export function DiaryInsights({ onBack }: DiaryInsightsProps) {
  const [insights, setInsights] = useState<DiaryInsightsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await diaryApi.getInsights()
      setInsights(data)
    } catch (err) {
      const message = err instanceof ApiRequestError
        ? err.message
        : "Failed to load insights. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Diary Insights</h1>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 space-y-4">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </main>
      </div>
    )
  }

  const hasData = insights && insights.totalEntries > 0

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Diary Insights</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6 lg:px-8 space-y-4">
        <div className="max-w-2xl mx-auto">
          {/* Error state */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!hasData ? (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">No Insights Available Yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Start logging your thoughts to see patterns and insights emerge over time. Keep journaling!
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary stats - matches CLI output */}
              <div className="grid grid-cols-2 gap-4 animate-fade-in">
                <Card className="border-border/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-semibold text-foreground">{insights.totalEntries}</p>
                    <p className="text-sm text-muted-foreground">Total Entries</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50">
                  <CardContent className="p-4 text-center">
                    <p className="text-3xl font-semibold text-foreground">
                      {insights.averageMoodImprovement > 0 ? "+" : ""}
                      {insights.averageMoodImprovement.toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Mood Improvement</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Cognitive Distortions - matches CLI topDistortions */}
              {insights.topDistortions && insights.topDistortions.length > 0 && (
                <Card className="border-border/50 animate-slide-up" style={{ animationDelay: "0.05s" }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      Top Cognitive Distortions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.topDistortions.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="w-6 text-sm text-muted-foreground">{index + 1}.</span>
                          <span className="flex-1 font-medium text-foreground">{item.name}</span>
                          <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: `${Math.min(
                                  (item.count / (insights.topDistortions?.[0]?.count || 1)) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-16 text-right">
                            {item.count} occurrence{item.count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Patterns Identified - matches CLI patterns */}
              {insights.patterns && insights.patterns.length > 0 && (
                <Card className="border-border/50 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Patterns Identified
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.patterns.map((pattern, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{pattern}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations - matches CLI recommendations */}
              {insights.recommendations && insights.recommendations.length > 0 && (
                <Card className="border-border/50 bg-success/5 animate-slide-up" style={{ animationDelay: "0.15s" }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-success" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Legacy fields for backward compatibility */}
              {insights.commonEmotions && insights.commonEmotions.length > 0 && (
                <Card className="border-border/50 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Most Frequent Emotions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.commonEmotions.slice(0, 5).map((emotion, index) => (
                        <div key={emotion.emotion} className="flex items-center gap-3">
                          <span className="w-6 text-sm text-muted-foreground">{index + 1}.</span>
                          <span className="flex-1 font-medium text-foreground">{emotion.emotion}</span>
                          <span className="text-sm text-muted-foreground w-8">{emotion.count}x</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Back button */}
          <div className="pt-4">
            <Button
              onClick={onBack}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            >
              Back to Diary
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
