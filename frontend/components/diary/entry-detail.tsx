"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { diaryApi, ApiRequestError } from "@/lib/api"
import type { DiaryEntryDetail } from "@/lib/api/types"
import { ArrowLeft, Calendar, MapPin, Brain, Heart, Lightbulb, RefreshCw, Trash2, Sparkles, Loader2 } from "lucide-react"

interface EntryDetailProps {
  entryId: string
  initialEntry?: DiaryEntryDetail
  onBack: () => void
  onDelete: (id: string) => void
}

export function EntryDetail({ entryId, initialEntry, onBack, onDelete }: EntryDetailProps) {
  const [entry, setEntry] = useState<DiaryEntryDetail | null>(initialEntry || null)
  const [isLoading, setIsLoading] = useState(!initialEntry)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Fetch entry detail from API
  useEffect(() => {
    const fetchEntry = async () => {
      if (initialEntry) return
      
      setIsLoading(true)
      setError(null)
      try {
        const data = await diaryApi.getEntry(entryId)
        setEntry(data)
      } catch (err) {
        setError(err instanceof ApiRequestError ? err.getUserMessage() : "Failed to load entry")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchEntry()
  }, [entryId, initialEntry])

  const handleDelete = () => {
    if (entry) {
      onDelete(entry.id)
    }
    setShowDeleteDialog(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading entry...</p>
        </div>
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || "Entry not found"}</p>
            <Button onClick={onBack} variant="outline">Go Back</Button>
          </div>
        </main>
      </div>
    )
  }

  const formattedDate = new Date(entry.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const formattedTime = new Date(entry.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <button
                className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                aria-label="Delete entry"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this diary entry? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6 lg:px-8 space-y-4">
        <div className="max-w-2xl mx-auto">
          {/* Date header */}
          <div className="flex items-center gap-2 text-muted-foreground mb-6 animate-fade-in">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formattedDate} at {formattedTime}</span>
          </div>

          {/* Mood indicator */}
          <Card className="border-border/50 animate-slide-up">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mood before reflection</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${entry.moodBefore * 10}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">{entry.moodBefore}/10</span>
                </div>
              </div>
              {entry.moodAfter && (
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-muted-foreground">Mood after reflection</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-success transition-all duration-500"
                        style={{ width: `${entry.moodAfter * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">{entry.moodAfter}/10</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Situation */}
          <Card className="border-border/50 animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Situation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{entry.situation}</p>
            </CardContent>
          </Card>

          {/* Thoughts */}
          <Card className="border-border/50 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Automatic Thoughts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed italic">&quot;{entry.automaticThought}&quot;</p>
            </CardContent>
          </Card>

          {/* Emotions */}
          <Card className="border-border/50 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Emotions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entry.emotions.map((emotion, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Badge className="bg-primary/10 text-primary">{emotion.name}</Badge>
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${emotion.intensity * 10}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{emotion.intensity}/10</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cognitive Distortions */}
          {entry.distortions && entry.distortions.length > 0 && (
            <Card className="border-border/50 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Thinking Patterns Identified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {entry.distortions.map((distortion) => (
                    <Badge key={distortion.id} variant="outline" className="px-3 py-1">
                      {distortion.isAiSuggested && (
                        <Sparkles className="w-3 h-3 mr-1 text-primary" />
                      )}
                      {distortion.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reframed Thought / Alternative perspective */}
          {entry.alternativeThought && (
            <Card className="border-border/50 bg-success/5 animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-success" />
                  Balanced Perspective
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{entry.alternativeThought}</p>
              </CardContent>
            </Card>
          )}

          {/* Reframing prompt */}
          {entry.reframingPrompt && (
            <Card className="border-border/50 bg-accent/10 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-foreground" />
                  AI Reframing Suggestion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed italic">{entry.reframingPrompt}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="pt-4 animate-slide-up" style={{ animationDelay: "0.35s" }}>
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
