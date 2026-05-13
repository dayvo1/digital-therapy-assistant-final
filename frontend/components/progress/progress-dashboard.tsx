"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { progressApi, ApiRequestError } from "@/lib/api"
import type { WeeklyProgress, MonthlyTrend, Achievement } from "@/lib/api/types"
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Target,
  BookOpen,
  PenLine,
  Award,
  Calendar,
  Star,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react"

export function ProgressDashboard() {
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(null)
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("weekly")

  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [weekly, monthly, achievementsData] = await Promise.all([
        progressApi.getWeeklyProgress(),
        progressApi.getMonthlyTrends(),
        progressApi.getAchievements(),
      ])
      setWeeklyProgress(weekly)
      setMonthlyTrend(monthly)
      setAchievements(achievementsData)
    } catch (err) {
      const message = err instanceof ApiRequestError
        ? err.message
        : "Failed to load progress data. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="px-4 py-6 lg:px-8 lg:py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Progress Dashboard</h1>
        <p className="text-muted-foreground">Track your therapy progress and achievements.</p>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Key stats - matches CLI WeeklyProgress */}
      {weeklyProgress && (
        <div className="grid grid-cols-2 gap-4 animate-slide-up">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{weeklyProgress.streakDays}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i < weeklyProgress.streakDays ? "bg-primary" : "bg-secondary"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">
                    {weeklyProgress.averageMood.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Mood</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for Weekly/Monthly */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-4 space-y-4">
          {weeklyProgress && (
            <>
              {/* Weekly Summary - matches CLI output */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Weekly Progress Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weeklyProgress.weekStart && weeklyProgress.weekEnd && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Week: {formatDate(weeklyProgress.weekStart)} to {formatDate(weeklyProgress.weekEnd)}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-lg font-semibold text-foreground">{weeklyProgress.sessionsCompleted}</p>
                        <p className="text-xs text-muted-foreground">Sessions Completed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <PenLine className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-lg font-semibold text-foreground">{weeklyProgress.diaryEntries}</p>
                        <p className="text-xs text-muted-foreground">Diary Entries</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Mood Breakdown - matches CLI dailyMoods */}
              {weeklyProgress.dailyMoods && weeklyProgress.dailyMoods.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Daily Mood Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                        <span>Date</span>
                        <span className="text-center">Avg Mood</span>
                        <span className="text-right">Entries</span>
                      </div>
                      {weeklyProgress.dailyMoods.map((daily, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 items-center">
                          <span className="text-sm">{formatDate(daily.date)}</span>
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(daily.averageMood / 10) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{daily.averageMood.toFixed(1)}</span>
                          </div>
                          <span className="text-sm text-right text-muted-foreground">{daily.entriesCount}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="monthly" className="mt-4 space-y-4">
          {monthlyTrend && (
            <>
              {/* Monthly Overview - matches CLI MonthlyTrend */}
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Monthly Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-foreground mb-4">
                    {monthlyTrend.month} {monthlyTrend.year}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-2xl font-semibold text-foreground">{monthlyTrend.totalSessions}</p>
                      <p className="text-xs text-muted-foreground">Total Sessions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-foreground">{monthlyTrend.totalDiaryEntries}</p>
                      <p className="text-xs text-muted-foreground">Total Diary Entries</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg Mood (Start)</span>
                      <span className="text-sm font-medium">{monthlyTrend.averageMoodStart.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg Mood (End)</span>
                      <span className="text-sm font-medium">{monthlyTrend.averageMoodEnd.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Mood Trend</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          monthlyTrend.moodTrend >= 0
                            ? "bg-success/10 text-success border-success/30"
                            : "bg-destructive/10 text-destructive border-destructive/30"
                        }`}
                      >
                        {monthlyTrend.moodTrend >= 0 ? "+" : ""}{monthlyTrend.moodTrend.toFixed(1)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Breakdown - matches CLI weeks */}
              {monthlyTrend.weeks && monthlyTrend.weeks.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Weekly Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground mb-2">
                        <span>Week</span>
                        <span className="text-center">Sessions</span>
                        <span className="text-center">Entries</span>
                        <span className="text-right">Avg Mood</span>
                      </div>
                      {monthlyTrend.weeks.map((week) => (
                        <div key={week.weekNumber} className="grid grid-cols-4 gap-2 items-center">
                          <span className="text-sm">Week {week.weekNumber}</span>
                          <span className="text-sm text-center">{week.sessions}</span>
                          <span className="text-sm text-center">{week.entries}</span>
                          <span className="text-sm text-right">{week.avgMood.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Achievements - matches CLI Achievement format */}
      {achievements.length > 0 && (
        <Card className="border-border/50 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Achievements
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {unlockedCount}/{totalCount} unlocked
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    achievement.unlocked ? "bg-success/10" : "bg-secondary/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    achievement.unlocked ? "bg-success/20" : "bg-secondary"
                  }`}>
                    {achievement.unlocked ? (
                      achievement.icon ? (
                        <span className="text-lg">{achievement.icon}</span>
                      ) : (
                        <Star className="w-5 h-5 text-success" />
                      )
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${
                        achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {achievement.name}
                      </p>
                      {achievement.unlocked ? (
                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                          UNLOCKED
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(achievement.progress * 100)}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Unlocked: {formatDate(achievement.unlockedAt)}
                      </p>
                    )}
                    {!achievement.unlocked && (
                      <Progress value={achievement.progress * 100} className="h-1.5 mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!weeklyProgress && !monthlyTrend && achievements.length === 0 && !error && (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">No Progress Data Yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Start completing sessions and logging diary entries to see your progress here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
