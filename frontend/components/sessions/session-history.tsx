"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sessionsApi, ApiRequestError } from "@/lib/api"
import type { SessionHistoryEntry, SessionSummaryItem } from "@/lib/api/types"
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Calendar,
  Brain,
  History,
} from "lucide-react"

interface SessionHistoryProps {
  onViewSession?: (session: SessionSummaryItem) => void
}

export function SessionHistory({ onViewSession }: SessionHistoryProps) {
  const [history, setHistory] = useState<SessionHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      // GET /sessions/history returns List<SessionHistoryEntry> (not paginated)
      const response = await sessionsApi.getSessionHistory()
      setHistory(response)
    } catch (err) {
      const message = err instanceof ApiRequestError
        ? err.message
        : "Failed to load session history."
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
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const getMoodChangeIcon = (before?: number, after?: number) => {
    if (before == null || after == null) return <Minus className="w-4 h-4 text-muted-foreground" />
    const change = after - before
    if (change > 0) return <TrendingUp className="w-4 h-4 text-success" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-destructive" />
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  const getMoodChangeLabel = (before?: number, after?: number) => {
    if (before == null || after == null) return "N/A"
    const change = after - before
    if (change > 0) return `+${change} mood improvement`
    if (change < 0) return `${change} mood change`
    return "No change"
  }

  const handleViewSession = (entry: SessionHistoryEntry) => {
    if (onViewSession && entry.sessionId) {
      // Convert SessionHistoryEntry to SessionSummaryItem for viewing
      const sessionItem: SessionSummaryItem = {
        id: entry.sessionId,
        title: entry.sessionTitle,
        description: `Module: ${entry.moduleName}`,
        durationMinutes: entry.duration || 0,
      }
      onViewSession(sessionItem)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Session History</h2>
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Session History</h2>
        </div>
        {history.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {history.length} completed session{history.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {history.length === 0 && !error ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">No sessions completed yet</p>
            <p className="text-sm text-muted-foreground">
              Complete a CBT session to see your history here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((entry, index) => (
            <Card
              key={`${entry.id || index}`}
              className="border-border/50 hover:border-primary/30 cursor-pointer transition-all duration-200"
              onClick={() => handleViewSession(entry)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-foreground">{entry.sessionTitle}</h3>
                        <p className="text-sm text-muted-foreground">{entry.moduleName}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {getMoodChangeIcon(entry.moodBefore, entry.moodAfter)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {entry.status}
                      </Badge>
                      {entry.startedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(entry.startedAt)}
                        </div>
                      )}
                      {entry.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {entry.duration} min
                        </div>
                      )}
                    </div>

                    {(entry.moodBefore != null || entry.moodAfter != null) && (
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            entry.moodAfter && entry.moodBefore && entry.moodAfter > entry.moodBefore
                              ? "bg-success/10 text-success border-success/30"
                              : entry.moodAfter && entry.moodBefore && entry.moodAfter < entry.moodBefore
                              ? "bg-destructive/10 text-destructive border-destructive/30"
                              : ""
                          }`}
                        >
                          {entry.moodBefore != null && entry.moodAfter != null
                            ? `Mood: ${entry.moodBefore} → ${entry.moodAfter}`
                            : getMoodChangeLabel(entry.moodBefore, entry.moodAfter)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
