"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sessionsApi, ApiRequestError } from "@/lib/api"
import type { SessionModuleDto, SessionSummaryItem } from "@/lib/api/types"
import {
  BookOpen,
  Clock,
  ChevronRight,
  AlertCircle,
  Brain,
  Leaf,
  Scale,
  Target,
  Layers,
} from "lucide-react"

// Interface for selecting a session - uses SessionSummaryItem from module
interface SessionsLibraryProps {
  onSelectSession: (session: SessionSummaryItem) => void
}

const categoryIcons: Record<string, React.ElementType> = {
  STRESS_MANAGEMENT: Target,
  COGNITIVE_RESTRUCTURING: Brain,
  MINDFULNESS: Leaf,
  WORK_LIFE_BALANCE: Scale,
}

const categoryLabels: Record<string, string> = {
  STRESS_MANAGEMENT: "Stress Management",
  COGNITIVE_RESTRUCTURING: "Cognitive Restructuring",
  MINDFULNESS: "Mindfulness",
  WORK_LIFE_BALANCE: "Work-Life Balance",
}

export function SessionsLibrary({ onSelectSession }: SessionsLibraryProps) {
  const [modules, setModules] = useState<SessionModuleDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      // GET /sessions returns List<SessionModuleDto> (not paginated)
      const response = await sessionsApi.getSessions()
      setModules(response)
    } catch (err) {
      const message = err instanceof ApiRequestError
        ? err.message
        : "Failed to load sessions. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6 lg:px-8 lg:py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  // Count total sessions across all modules
  const totalSessions = modules.reduce((sum, mod) => sum + (mod.sessions?.length || 0), 0)

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-semibold text-foreground mb-1">CBT Sessions</h1>
        <p className="text-muted-foreground">
          Evidence-based cognitive behavioral therapy modules designed to help you manage stress and build resilience.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Module List */}
      {modules.length === 0 && !error ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No session modules available at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {modules.map((module, moduleIndex) => {
            const CategoryIcon = categoryIcons[module.category] || Brain

            return (
              <div
                key={module.id}
                className="animate-slide-up"
                style={{ animationDelay: `${moduleIndex * 0.05}s` }}
              >
                {/* Module Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CategoryIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{module.name}</h2>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {categoryLabels[module.category] || module.category}
                  </Badge>
                </div>

                {/* Sessions in Module */}
                {module.sessions && module.sessions.length > 0 ? (
                  <div className="space-y-2 ml-13 pl-0">
                    {module.sessions.map((session, sessionIndex) => (
                      <Card
                        key={session.id}
                        className="border-border/50 hover:border-primary/30 cursor-pointer transition-all duration-200"
                        onClick={() => onSelectSession(session)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                              <Layers className="w-4 h-4 text-muted-foreground" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-medium text-foreground">{session.title}</h3>
                                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              </div>
                              {session.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                  {session.description}
                                </p>
                              )}
                            </div>

                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              <Clock className="w-3 h-3 mr-1" />
                              {session.durationMinutes} min
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-border/50 ml-13">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">No sessions in this module yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Total count */}
      {totalSessions > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {totalSessions} session{totalSessions !== 1 ? "s" : ""} available across {modules.length} module{modules.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}
