"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { diaryApi, ApiRequestError } from "@/lib/api"
import type { DiaryEntrySummary, RestPage } from "@/lib/api/types"
import { PenLine, Plus, Calendar, TrendingUp, ChevronRight, ChevronLeft, Heart, Brain, AlertCircle } from "lucide-react"

interface DiaryListProps {
  onNewEntry: () => void
  onSelectEntry: (entry: DiaryEntrySummary) => void
  onViewInsights: () => void
}

export function DiaryList({ onNewEntry, onSelectEntry, onViewInsights }: DiaryListProps) {
  const [entries, setEntries] = useState<DiaryEntrySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<RestPage<DiaryEntrySummary>>({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 5,
    numberOfElements: 0,
    first: true,
    last: true,
    empty: true,
  })

  useEffect(() => {
    loadEntries(0)
  }, [])

  const loadEntries = async (pageNumber: number) => {
    setLoading(true)
    setError(null)
    try {
      // Uses RestPage pagination matching CLI
      const response = await diaryApi.getEntries({
        page: pageNumber,
        size: 5,
        sort: "createdAt,desc",
      })
      setEntries(response.content)
      setPage(response)
    } catch (err) {
      // Handle specific error cases with helpful messages
      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          setError("Please log in to view your diary entries.")
        } else if (err.status === 404 || err.message.includes("Unable to connect")) {
          // Backend not available - show empty state instead of error
          setEntries([])
          setPage({
            content: [],
            totalPages: 0,
            totalElements: 0,
            number: 0,
            size: 5,
            numberOfElements: 0,
            first: true,
            last: true,
            empty: true,
          })
          // Don't show error for connection issues - just show empty state
          return
        } else {
          setError(err.message)
        }
      } else {
        setError("Failed to load diary entries. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const truncate = (text: string | undefined, maxLength: number) => {
    if (!text) return "N/A"
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const groupEntriesByDate = () => {
    const groups: { [key: string]: DiaryEntrySummary[] } = {}
    entries.forEach((entry) => {
      const date = new Date(entry.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      if (!groups[date]) groups[date] = []
      groups[date].push(entry)
    })
    return groups
  }

  const groupedEntries = groupEntriesByDate()
  const hasEntries = entries.length > 0

  if (loading && entries.length === 0) {
    return (
      <div className="px-4 py-6 lg:px-8 lg:py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">Thought Diary</h1>
          <p className="text-muted-foreground">Track and reflect on your thoughts and emotions.</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 animate-slide-up">
        <Button
          onClick={onNewEntry}
          className="h-auto py-4 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex flex-col items-center gap-2"
        >
          <Plus className="w-6 h-6" />
          <span className="font-medium">New Entry</span>
        </Button>
        <Button
          onClick={onViewInsights}
          variant="outline"
          className="h-auto py-4 px-4 rounded-xl flex flex-col items-center gap-2 border-border hover:bg-secondary"
        >
          <TrendingUp className="w-6 h-6 text-primary" />
          <span className="font-medium">View Insights</span>
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      {page.totalElements > 0 && (
        <Card className="border-border/50 bg-primary/5 animate-slide-up" style={{ animationDelay: "0.05s" }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <PenLine className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{page.totalElements} Entries</p>
                  <p className="text-sm text-muted-foreground">Total reflections</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {page.empty && !error && (
        <Card className="border-border/50 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <PenLine className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">Start Your Thought Journal</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              Recording your thoughts helps you identify patterns and gain insights into your emotional wellbeing.
            </p>
            <Button
              onClick={onNewEntry}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Entry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Entries list */}
      {hasEntries && (
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([date, dateEntries], groupIndex) => (
            <div
              key={date}
              className="animate-slide-up"
              style={{ animationDelay: `${0.1 + groupIndex * 0.05}s` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">{date}</h3>
              </div>
              <div className="space-y-3">
                {dateEntries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="border-border/50 hover:border-primary/30 cursor-pointer transition-colors"
                    onClick={() => onSelectEntry(entry)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Heart className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="font-medium text-foreground line-clamp-1">
                              {truncate(entry.situation, 50)}
                            </p>
                            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {truncate(entry.automaticThought, 50)}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            {entry.moodBefore != null && entry.moodAfter != null && (
                              <Badge variant="outline" className="text-xs">
                                Mood: {entry.moodBefore} → {entry.moodAfter}
                              </Badge>
                            )}
                            {entry.distortionCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Brain className="w-3 h-3 mr-1" />
                                {entry.distortionCount} distortion{entry.distortionCount !== 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination - matches CLI pattern */}
      {page.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadEntries(page.number - 1)}
            disabled={page.first || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page.number + 1} of {page.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadEntries(page.number + 1)}
            disabled={page.last || loading}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Entry count */}
      {page.totalElements > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {page.numberOfElements} of {page.totalElements} total entries
        </p>
      )}

      {/* Tip */}
      <Card className="border-border/50 bg-secondary/50 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Regular journaling can help reduce stress and improve emotional awareness. Try to log at least one thought per day.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
