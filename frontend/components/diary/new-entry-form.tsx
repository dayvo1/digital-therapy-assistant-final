"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { diaryApi, ApiRequestError } from "@/lib/api"
import type { DistortionInfo, CreateDiaryEntryRequest, DistortionSuggestion } from "@/lib/api/types"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Brain,
  Heart,
  Lightbulb,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Loader2,
  Wand2,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

interface NewEntryFormProps {
  onBack: () => void
  onComplete: () => void
}

const emotionOptions = [
  "Anxious",
  "Stressed",
  "Overwhelmed",
  "Frustrated",
  "Sad",
  "Lonely",
  "Angry",
  "Worried",
  "Tired",
  "Hopeless",
  "Calm",
  "Content",
  "Happy",
  "Hopeful",
  "Grateful",
  "Peaceful",
]

type FormStep = "situation" | "thoughts" | "emotions" | "distortions" | "reframe" | "complete"

export function NewEntryForm({ onBack, onComplete }: NewEntryFormProps) {
  const [step, setStep] = useState<FormStep>("situation")
  const [situation, setSituation] = useState("")
  const [automaticThought, setAutomaticThought] = useState("")
  const [selectedEmotions, setSelectedEmotions] = useState<{ name: string; intensity: number }[]>([])
  const [moodBefore, setMoodBefore] = useState(5)
  const [moodAfter, setMoodAfter] = useState(5)
  const [availableDistortions, setAvailableDistortions] = useState<DistortionInfo[]>([])
  const [selectedDistortions, setSelectedDistortions] = useState<string[]>([])
  const [suggestedDistortions, setSuggestedDistortions] = useState<DistortionSuggestion[]>([])
  const [reframingPrompt, setReframingPrompt] = useState<string>("")
  const [reframedThought, setReframedThought] = useState("")
  const [loading, setLoading] = useState(false)
  const [suggestingDistortions, setSuggestingDistortions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const steps: FormStep[] = ["situation", "thoughts", "emotions", "distortions", "reframe", "complete"]
  const currentStepIndex = steps.indexOf(step)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  // Initialize available distortions on mount
  // Note: Backend doesn't have a GET /diary/distortions endpoint, using predefined list
  useEffect(() => {
    setAvailableDistortions([
      { id: "all-or-nothing", name: "All-or-Nothing Thinking", description: "Seeing things in black and white" },
      { id: "catastrophizing", name: "Catastrophizing", description: "Expecting the worst outcome" },
      { id: "mind-reading", name: "Mind Reading", description: "Assuming what others think" },
      { id: "fortune-telling", name: "Fortune Telling", description: "Predicting negative futures" },
      { id: "should-statements", name: "Should Statements", description: "Rigid rules about how things must be" },
      { id: "labeling", name: "Labeling", description: "Defining yourself by one event" },
      { id: "personalization", name: "Personalization", description: "Blaming yourself for everything" },
      { id: "filtering", name: "Mental Filtering", description: "Focusing only on negatives" },
      { id: "discounting", name: "Discounting Positives", description: "Dismissing good things" },
      { id: "emotional-reasoning", name: "Emotional Reasoning", description: "I feel it, so it must be true" },
    ])
  }, [])

  const handleEmotionToggle = (emotion: string) => {
    setSelectedEmotions((prev) => {
      const existing = prev.find((e) => e.name === emotion)
      if (existing) {
        return prev.filter((e) => e.name !== emotion)
      }
      return [...prev, { name: emotion, intensity: 5 }]
    })
  }

  const handleIntensityChange = (emotion: string, intensity: number) => {
    setSelectedEmotions((prev) =>
      prev.map((e) => (e.name === emotion ? { ...e, intensity } : e))
    )
  }

  const handleDistortionToggle = (distortionId: string) => {
    setSelectedDistortions((prev) =>
      prev.includes(distortionId)
        ? prev.filter((d) => d !== distortionId)
        : [...prev, distortionId]
    )
  }

  const handleSuggestDistortions = async () => {
    setSuggestingDistortions(true)
    setError(null)
    try {
      // CLI: POST /diary/distortions/suggest with { thought: automaticThought }
      // Returns List<DistortionSuggestion> with name, confidence, reasoning
      const suggestions = await diaryApi.suggestDistortions(automaticThought)
      setSuggestedDistortions(suggestions)
      // Auto-select suggested distortions by matching names
      const suggestedNames = suggestions.map((s) => s.name.toLowerCase())
      const matchedIds = availableDistortions
        .filter((d) => suggestedNames.some((name) => d.name.toLowerCase().includes(name) || name.includes(d.name.toLowerCase())))
        .map((d) => d.id)
      setSelectedDistortions((prev) => [...new Set([...prev, ...matchedIds])])
    } catch (err) {
      const message = err instanceof ApiRequestError
        ? err.message
        : "Failed to get AI suggestions. Please try again."
      setError(message)
    } finally {
      setSuggestingDistortions(false)
    }
  }

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex])
    }
  }

  const handlePrevious = () => {
    setError(null)
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1])
    } else {
      onBack()
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      const entryData: CreateDiaryEntryRequest = {
        situation,
        automaticThought,
        emotions: selectedEmotions,
        distortions: selectedDistortions,
        alternativeThought: reframedThought || undefined,
        moodBefore,
        moodAfter,
      }
      await diaryApi.createEntry(entryData)
      setStep("complete")
    } catch (err) {
      const message = err instanceof ApiRequestError
        ? err.message
        : "Failed to save entry. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case "situation":
        return situation.trim().length >= 10
      case "thoughts":
        return automaticThought.trim().length >= 10
      case "emotions":
        return selectedEmotions.length > 0
      case "distortions":
        return true // Optional
      case "reframe":
        return reframedThought.trim().length >= 10
      default:
        return true
    }
  }

  const renderStep = () => {
    switch (step) {
      case "situation":
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Describe the Situation</h2>
                <p className="text-sm text-muted-foreground">What happened? Where were you?</p>
              </div>
            </div>
            <Textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Example: I was in a meeting at work when my manager asked me to present unexpectedly..."
              className="min-h-[150px] resize-none bg-secondary/50 border-border text-base leading-relaxed"
            />
            <p className="text-sm text-muted-foreground mt-3">
              {situation.length} characters {situation.length >= 10 ? "" : "- Write at least 10 characters"}
            </p>
          </div>
        )

      case "thoughts":
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Capture Your Thoughts</h2>
                <p className="text-sm text-muted-foreground">What automatic thoughts went through your mind?</p>
              </div>
            </div>
            <Textarea
              value={automaticThought}
              onChange={(e) => setAutomaticThought(e.target.value)}
              placeholder="Example: Everyone will think I am incompetent. I should have been more prepared..."
              className="min-h-[150px] resize-none bg-secondary/50 border-border text-base leading-relaxed"
            />
            <Card className="border-border/50 bg-accent/10 mt-4">
              <CardContent className="p-4 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Try to capture your automatic thoughts exactly as they occurred, even if they seem irrational now.
                </p>
              </CardContent>
            </Card>
          </div>
        )

      case "emotions":
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Identify Your Emotions</h2>
                <p className="text-sm text-muted-foreground">Select all that apply and rate their intensity</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {emotionOptions.map((emotion) => {
                const isSelected = selectedEmotions.some((e) => e.name === emotion)
                return (
                  <button
                    key={emotion}
                    onClick={() => handleEmotionToggle(emotion)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {emotion}
                  </button>
                )
              })}
            </div>

            {selectedEmotions.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-foreground">Rate intensity (1-10):</p>
                {selectedEmotions.map((emotion) => (
                  <div key={emotion.name} className="p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-foreground">{emotion.name}</span>
                      <span className="text-sm text-muted-foreground">{emotion.intensity}/10</span>
                    </div>
                    <Slider
                      value={[emotion.intensity]}
                      onValueChange={([value]) => handleIntensityChange(emotion.name, value)}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Mood before */}
            <div className="mt-6 p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-foreground">Overall mood</span>
                <span className="text-sm text-muted-foreground">{moodBefore}/10</span>
              </div>
              <Slider
                value={[moodBefore]}
                onValueChange={([value]) => setMoodBefore(value)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        )

      case "distortions":
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Identify Thinking Patterns</h2>
                <p className="text-sm text-muted-foreground">Do any of these apply to your thoughts?</p>
              </div>
            </div>

            {/* AI Suggestion button */}
            <Button
              onClick={handleSuggestDistortions}
              disabled={suggestingDistortions}
              variant="outline"
              className="w-full mb-4 h-12 border-primary/30 hover:bg-primary/5"
            >
              {suggestingDistortions ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing your thoughts...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2 text-primary" />
                  Get AI Suggestions
                </>
              )}
            </Button>

            {suggestedDistortions.length > 0 && (
              <Alert className="mb-4 bg-primary/5 border-primary/30">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <p className="mb-2">AI identified {suggestedDistortions.length} potential cognitive distortions:</p>
                  <ul className="text-sm space-y-1">
                    {suggestedDistortions.map((s, i) => (
                      <li key={i}>
                        <span className="font-medium">{s.name}</span> ({Math.round(s.confidence * 100)}%) - {s.reasoning}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              {availableDistortions.map((distortion) => {
                const isSelected = selectedDistortions.includes(distortion.id)
                const isSuggested = suggestedDistortions.some((s) => 
                      s.name.toLowerCase().includes(distortion.name.toLowerCase()) || 
                      distortion.name.toLowerCase().includes(s.name.toLowerCase())
                    )
                return (
                  <button
                    key={distortion.id}
                    onClick={() => handleDistortionToggle(distortion.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30 bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground">{distortion.name}</h4>
                          {isSuggested && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                              AI suggested
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{distortion.description}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <p className="text-sm text-muted-foreground mt-4 text-center">
              This step is optional. Skip if none apply.
            </p>
          </div>
        )

      case "reframe":
        return (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Reframe Your Thought</h2>
                <p className="text-sm text-muted-foreground">Create a more balanced perspective</p>
              </div>
            </div>

            <Card className="border-border/50 bg-secondary/30 mb-4">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Original thought:</p>
                <p className="text-foreground italic">&quot;{automaticThought}&quot;</p>
              </CardContent>
            </Card>

            <Textarea
              value={reframedThought}
              onChange={(e) => setReframedThought(e.target.value)}
              placeholder="Example: It is normal to feel nervous when put on the spot. I have knowledge to share..."
              className="min-h-[150px] resize-none bg-secondary/50 border-border text-base leading-relaxed"
            />

            <Card className="border-border/50 bg-accent/10 mt-4">
              <CardContent className="p-4 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Ask yourself: What would I tell a friend in this situation? What evidence supports or contradicts my original thought?
                </p>
              </CardContent>
            </Card>

            {/* Mood After Recording */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-medium text-foreground mb-4">How do you feel now?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                After reframing your thought, rate your current mood (1 = Very Low, 10 = Very High)
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Very Low</span>
                  <span className="text-2xl font-semibold text-primary">{moodAfter}</span>
                  <span>Very High</span>
                </div>
                <Slider
                  value={[moodAfter]}
                  onValueChange={(value) => setMoodAfter(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                {moodAfter > moodBefore && (
                  <p className="text-sm text-success flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Your mood improved by {moodAfter - moodBefore} points after reframing!
                  </p>
                )}
                {moodAfter < moodBefore && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    That&apos;s okay - reframing takes practice. Keep going!
                  </p>
                )}
              </div>
            </div>
          </div>
        )

      case "complete":
        return (
          <div className="animate-fade-in text-center py-8">
            <div className="w-20 h-20 rounded-full bg-success/20 mx-auto mb-6 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Entry Saved!</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Great work reflecting on your thoughts. Regular practice strengthens your self-awareness.
            </p>
            <Button
              onClick={onComplete}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 px-8"
            >
              Back to Diary
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  if (step === "complete") {
    return (
      <div className="min-h-screen flex flex-col px-4 py-8 bg-background">
        {renderStep()}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevious}
            className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <span className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length - 1}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6 lg:px-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {renderStep()}
        </div>
      </main>

      {/* Footer */}
      <footer className="sticky bottom-0 bg-background border-t border-border px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={step === "reframe" ? handleSave : handleNext}
            disabled={!canProceed() || loading}
            className="w-full h-14 text-lg font-medium rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : step === "reframe" ? (
              <>
                Save Entry
                <Check className="w-5 h-5" />
              </>
            ) : step === "distortions" ? (
              <>
                {selectedDistortions.length > 0 ? "Continue" : "Skip"}
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  )
}
