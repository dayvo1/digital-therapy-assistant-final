"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth-context"
import { progressApi } from "@/lib/api/progress"
import { sessionsApi } from "@/lib/api/sessions"
import { diaryApi } from "@/lib/api/diary"
import { useState, useEffect } from "react"
import type { WeeklyProgress, SessionModule, DiaryEntrySummary } from "@/lib/api/types"
import {
  BookOpen,
  PenLine,
  Flame,
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles,
  Heart,
  Loader2,
} from "lucide-react"

interface HomeDashboardProps {
  onNavigate: (tab: "sessions" | "diary" | "progress") => void
}

export function HomeDashboard({ onNavigate }: HomeDashboardProps) {
  const { user } = useAuth()
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(null)
  const [sessions, setSessions] = useState<SessionModule[]>([])
  const [recentEntries, setRecentEntries] = useState<DiaryEntrySummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [progressData, sessionsData, entriesData] = await Promise.all([
          progressApi.getWeeklyProgress(),
          sessionsApi.getSessions(),
          diaryApi.getEntries({ page: 0, size: 3 }),
        ])
        setWeeklyProgress(progressData)
        setSessions(sessionsData)
        setRecentEntries(entriesData.content)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const completedSessions = sessions.filter((s) => s.status === "COMPLETED").length
  const totalSessions = sessions.length
  const sessionProgress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0

  const nextSession = sessions.find((s) => s.status === "NOT_STARTED" || s.status === "IN_PROGRESS")

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const getMotivationalMessage = () => {
    if (weeklyProgress?.currentStreak && weeklyProgress.currentStreak >= 7) return "Amazing dedication! Keep up the great work."
    if (weeklyProgress?.currentStreak && weeklyProgress.currentStreak >= 3) return "You are building momentum. Stay consistent."
    if (weeklyProgress?.sessionsCompleted && weeklyProgress.sessionsCompleted > 0) return "Every step forward matters."
    return "Your wellness journey starts with small steps."
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 space-y-6">
      {/* Welcome Section */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-semibold text-foreground mb-1">
          {getGreeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground">{getMotivationalMessage()}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 animate-slide-up">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{weeklyProgress?.currentStreak || 0}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{weeklyProgress?.sessionsCompleted || 0}</p>
                <p className="text-xs text-muted-foreground">Sessions Done</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Session Card */}
      {nextSession && (
        <Card className="border-border/50 overflow-hidden animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Continue Your Journey</CardTitle>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {nextSession.estimatedDuration} min
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground mb-1">{nextSession.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{nextSession.description}</p>
              </div>
            </div>
            <Button
              onClick={() => onNavigate("sessions")}
              className="w-full mt-4 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            >
              Start Session
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Session Progress */}
      <Card className="border-border/50 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Session Progress</CardTitle>
            <span className="text-sm text-muted-foreground">
              {completedSessions}/{totalSessions}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={sessionProgress} className="h-2 mb-3" />
          <div className="flex flex-wrap gap-2">
            {sessions.slice(0, 6).map((session, index) => (
              <div
                key={session.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  session.status === "COMPLETED"
                    ? "bg-success text-success-foreground"
                    : session.status === "IN_PROGRESS"
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <button
          onClick={() => onNavigate("diary")}
          className="p-4 rounded-xl bg-card border border-border/50 text-left hover:border-primary/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
            <PenLine className="w-5 h-5 text-secondary-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1">Thought Diary</h3>
          <p className="text-sm text-muted-foreground">Log your thoughts</p>
        </button>

        <button
          onClick={() => onNavigate("progress")}
          className="p-4 rounded-xl bg-card border border-border/50 text-left hover:border-primary/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-secondary-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1">View Progress</h3>
          <p className="text-sm text-muted-foreground">Track your journey</p>
        </button>
      </div>

      {/* Recent Entries Preview */}
      {recentEntries.length > 0 && (
        <Card className="border-border/50 animate-slide-up" style={{ animationDelay: "0.25s" }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Recent Reflections</CardTitle>
              <button
                onClick={() => onNavigate("diary")}
                className="text-sm text-primary hover:underline flex items-center"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-1">{entry.situation}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(entry.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Affirmation */}
      <Card className="border-border/50 bg-primary/5 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <CardContent className="p-6 text-center">
          <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
          <p className="text-lg text-foreground font-medium italic leading-relaxed">
            &quot;You have the power to create positive change in your life, one thought at a time.&quot;
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
