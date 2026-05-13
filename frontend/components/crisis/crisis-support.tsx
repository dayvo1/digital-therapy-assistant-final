"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { crisisApi, ApiRequestError } from "@/lib/api"
import type { CrisisHub, SafetyPlan, CopingStrategy } from "@/lib/api/types"
import {
  AlertTriangle,
  Phone,
  MessageCircle,
  Heart,
  Shield,
  ChevronRight,
  ArrowLeft,
  Wind,
  Eye,
  Music,
  Hand,
  Check,
  X,
  AlertCircle,
  Globe,
  Clock,
  Play,
  Loader2,
  Edit2,
  Save,
  Plus,
} from "lucide-react"

type CrisisView = "main" | "coping" | "coping-detail" | "resources" | "safety-plan" | "safety-plan-edit"

interface CrisisSupportProps {
  onBack?: () => void
}

export function CrisisSupport({ onBack }: CrisisSupportProps) {
  const { user } = useAuth()
  const [view, setView] = useState<CrisisView>("main")
  const [crisisHub, setCrisisHub] = useState<CrisisHub | null>(null)
  const [copingStrategies, setCopingStrategies] = useState<CopingStrategy[]>([])
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlan | null>(null)
  const [selectedStrategy, setSelectedStrategy] = useState<CopingStrategy | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeCoping, setActiveCoping] = useState<string | null>(null)
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale")
  const [breathCount, setBreathCount] = useState(0)

  // Safety plan edit state
  const [editedPlan, setEditedPlan] = useState<Partial<SafetyPlan>>({})
  
  // Crisis detection state
  const [checkInText, setCheckInText] = useState("")
  const [isDetecting, setIsDetecting] = useState(false)
  const [crisisDetected, setCrisisDetected] = useState<{
    riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL"
    keywordsDetected: string[]
    recommendedAction: string
    reasoning: string
  } | null>(null)

  useEffect(() => {
    loadCrisisData()
  }, [user?.id])

  const loadCrisisData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Crisis hub and coping strategies don't require userId
      // Safety plan requires userId per backend CrisisController
      const [hub, strategies, plan] = await Promise.all([
        crisisApi.getCrisisHub(user?.id),
        crisisApi.getCopingStrategies(),
        user?.id ? crisisApi.getSafetyPlan(user.id).catch(() => null) : Promise.resolve(null),
      ])
      setCrisisHub(hub)
      setCopingStrategies(strategies)
      if (plan) {
        setSafetyPlan(plan)
        setEditedPlan(plan)
      }
    } catch (err) {
      // Handle connection errors gracefully - show default crisis resources
      if (err instanceof ApiRequestError) {
        if (err.status === 404 || err.message.includes("Unable to connect")) {
          // Backend not available - show static crisis resources
          setCrisisHub({
            emergencyNumber: "911",
            crisisHotline: "988 (Suicide & Crisis Lifeline)",
            textLine: "Text HOME to 741741",
            message: "Help is available 24/7. You are not alone.",
          })
          setCopingStrategies([
            { name: "Deep Breathing", description: "Take slow, deep breaths to calm your nervous system", category: "GROUNDING" },
            { name: "5-4-3-2-1 Grounding", description: "Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste", category: "GROUNDING" },
            { name: "Call a Friend", description: "Reach out to someone you trust", category: "SOCIAL" },
          ])
          return // Don't show error - show default resources
        }
        setError(err.message)
      } else {
        setError("Failed to load crisis support data.")
      }
    } finally {
      setLoading(false)
    }
  }

  const saveSafetyPlan = async () => {
    if (!user?.id) {
      setError("Please log in to save your safety plan.")
      return
    }
    
    setSaving(true)
    setError(null)
    try {
      // Backend requires userId as query param per CrisisController.updateSafetyPlan()
      const updated = await crisisApi.updateSafetyPlan(user.id, {
        warningSignals: editedPlan.warningSignals,
        copingStrategies: editedPlan.copingStrategies,
        trustedContacts: editedPlan.trustedContacts,
        professionalContacts: editedPlan.professionalContacts,
        environmentSafetySteps: editedPlan.environmentSafetySteps,
        reasonForLiving: editedPlan.reasonForLiving,
      })
      setSafetyPlan(updated)
      setView("safety-plan")
    } catch (err) {
      const message = err instanceof ApiRequestError
        ? err.message
        : "Failed to save safety plan."
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleExit = () => {
    onBack?.()
  }

  // Crisis detection check-in
  const handleCrisisCheckIn = async () => {
    if (!checkInText.trim()) return
    
    setIsDetecting(true)
    setCrisisDetected(null)
    try {
      const result = await crisisApi.detectCrisis({ text: checkInText })
      setCrisisDetected({
        riskLevel: result.riskLevel,
        keywordsDetected: result.keywordsDetected,
        recommendedAction: result.recommendedAction,
        reasoning: result.reasoning,
      })
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to analyze your message")
    } finally {
      setIsDetecting(false)
    }
  }

  const startBreathing = () => {
    setActiveCoping("breathing")
    setBreathPhase("inhale")
    setBreathCount(0)

    const phases: Array<"inhale" | "hold" | "exhale" | "rest"> = ["inhale", "hold", "exhale", "rest"]
    let phaseIndex = 0

    const interval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % 4
      setBreathPhase(phases[phaseIndex])
      if (phaseIndex === 0) {
        setBreathCount((prev) => {
          if (prev >= 3) {
            clearInterval(interval)
            setActiveCoping(null)
            return 0
          }
          return prev + 1
        })
      }
    }, 4000)
  }

  const getStrategyIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes("breath")) return Wind
    if (lower.includes("ground") || lower.includes("senses")) return Eye
    if (lower.includes("muscle") || lower.includes("relax")) return Hand
    if (lower.includes("music") || lower.includes("sound")) return Music
    return Heart
  }

  // Group strategies by category for display
  const groupedStrategies = copingStrategies.reduce((acc, strategy) => {
    const category = strategy.category || "General"
    if (!acc[category]) acc[category] = []
    acc[category].push(strategy)
    return acc
  }, {} as Record<string, CopingStrategy[]>)

  const renderBreathingExercise = () => (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex flex-col items-center justify-center p-6">
      <button
        onClick={() => setActiveCoping(null)}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary"
      >
        <X className="w-6 h-6 text-muted-foreground" />
      </button>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Box Breathing</h2>
        <p className="text-muted-foreground">Follow the circle. Cycle {breathCount + 1} of 4</p>
      </div>

      <div className="relative w-48 h-48 mb-8">
        <div
          className={`absolute inset-0 rounded-full transition-all duration-[4000ms] ease-linear ${
            breathPhase === "inhale"
              ? "bg-primary scale-100"
              : breathPhase === "hold"
              ? "bg-primary scale-100"
              : breathPhase === "exhale"
              ? "bg-primary/50 scale-75"
              : "bg-primary/30 scale-75"
          }`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-semibold text-primary-foreground capitalize">
            {breathPhase}
          </span>
        </div>
      </div>

      <p className="text-lg text-foreground">
        {breathPhase === "inhale" && "Breathe in slowly through your nose..."}
        {breathPhase === "hold" && "Hold your breath gently..."}
        {breathPhase === "exhale" && "Breathe out slowly through your mouth..."}
        {breathPhase === "rest" && "Rest before the next breath..."}
      </p>
    </div>
  )

  const renderMain = () => (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-destructive/10 border-b border-destructive/20 px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleExit}
            className="p-2 -ml-2 rounded-full hover:bg-destructive/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-destructive" />
          </button>
          <span className="text-sm text-destructive font-medium">Crisis Support</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">You are not alone</h1>
            <p className="text-muted-foreground">Help is available right now</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-4">
        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Message from hub */}
        {crisisHub?.message && (
          <Card className="border-border/50 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm text-foreground">{crisisHub.message}</p>
            </CardContent>
          </Card>
        )}

        {/* Emergency notice */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">If you are in immediate danger</p>
              <p className="text-sm text-muted-foreground">
                Please call 911 or go to your nearest emergency room.
              </p>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : (
          <>
            {/* Quick actions */}
            <div className="space-y-3">
              <Button
                onClick={() => setView("coping")}
                variant="outline"
                className="w-full h-auto py-4 px-4 justify-between border-border hover:bg-secondary rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wind className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Coping Strategies</p>
                    <p className="text-sm text-muted-foreground">Immediate calming techniques</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Button>

              <Button
                onClick={() => setView("resources")}
                variant="outline"
                className="w-full h-auto py-4 px-4 justify-between border-border hover:bg-secondary rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Emergency Resources</p>
                    <p className="text-sm text-muted-foreground">Crisis hotlines and contacts</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Button>

              <Button
                onClick={() => setView("safety-plan")}
                variant="outline"
                className="w-full h-auto py-4 px-4 justify-between border-border hover:bg-secondary rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-success" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">My Safety Plan</p>
                    <p className="text-sm text-muted-foreground">Your personalized safety steps</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>

            {/* Crisis Check-in */}
            <Card className="border-border/50">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-medium text-foreground">How are you feeling?</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share what&apos;s on your mind and we&apos;ll help identify if you need additional support.
                </p>
                <Textarea
                  placeholder="I'm feeling..."
                  value={checkInText}
                  onChange={(e) => setCheckInText(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
                <Button
                  onClick={handleCrisisCheckIn}
                  disabled={!checkInText.trim() || isDetecting}
                  className="w-full"
                >
                  {isDetecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Check In"
                  )}
                </Button>
                
                {/* Crisis Detection Result */}
                {crisisDetected && (
                  <Alert variant={crisisDetected.riskLevel === "HIGH" || crisisDetected.riskLevel === "CRITICAL" ? "destructive" : "default"} className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium mb-2">
                        {crisisDetected.riskLevel === "LOW"
                          ? "You seem to be doing okay. Keep taking care of yourself!"
                          : `Risk level: ${crisisDetected.riskLevel.toLowerCase()}`}
                      </p>
                      {crisisDetected.reasoning && (
                        <p className="text-sm mb-2">{crisisDetected.reasoning}</p>
                      )}
                      {crisisDetected.recommendedAction && (
                        <div>
                          <p className="text-sm font-medium">Recommended action:</p>
                          <p className="text-sm">{crisisDetected.recommendedAction}</p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Quick coping strategies from hub */}
            {crisisHub?.copingStrategies && crisisHub.copingStrategies.length > 0 && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-3">Quick Coping Strategies</h3>
                  <ul className="space-y-2">
                    {crisisHub.copingStrategies.map((strategy, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Quick call button */}
            <Card className="border-border/50 bg-primary/5">
              <CardContent className="p-4">
                <a
                  href="tel:988"
                  className="flex items-center gap-3 text-left w-full"
                >
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Call 988</p>
                    <p className="text-sm text-muted-foreground">Suicide & Crisis Lifeline</p>
                  </div>
                </a>
              </CardContent>
            </Card>
          </>
        )}

        {/* Reminder */}
        <Card className="border-border/50 bg-secondary/50">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              This moment will pass. You have survived difficult times before, and you can get through this too.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )

  const renderCoping = () => (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("main")}
            className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Coping Strategies</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        <p className="text-muted-foreground">
          These techniques can help you feel calmer in moments of distress.
        </p>

        {/* Quick breathing exercise */}
        <Card
          className="border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={startBreathing}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Wind className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Quick Breathing Exercise</h3>
                <p className="text-sm text-muted-foreground">Start a 2-minute box breathing session</p>
              </div>
              <Play className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Coping strategies grouped by category - matches CLI output */}
        {Object.entries(groupedStrategies).map(([category, strategies]) => (
          <div key={category}>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
              {category}
            </h2>
            <div className="space-y-2">
              {strategies.map((strategy) => {
                const Icon = getStrategyIcon(strategy.name)
                return (
                  <Card
                    key={strategy.id || strategy.name}
                    className="border-border/50 hover:border-primary/30 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedStrategy(strategy)
                      setView("coping-detail")
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-foreground">{strategy.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {strategy.estimatedMinutes} min
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{strategy.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  )

  const renderCopingDetail = () => {
    if (!selectedStrategy) return null
    const Icon = getStrategyIcon(selectedStrategy.name)

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedStrategy(null)
                setView("coping")
              }}
              className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">{selectedStrategy.name}</h1>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{selectedStrategy.name}</h2>
            <p className="text-muted-foreground">{selectedStrategy.description}</p>
            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Estimated time: {selectedStrategy.estimatedMinutes} minutes</span>
            </div>
          </div>

          {/* Steps - matches CLI output */}
          {selectedStrategy.steps && selectedStrategy.steps.length > 0 && (
            <Card className="border-border/50">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-medium text-foreground">Steps:</h3>
                <ol className="space-y-3">
                  {selectedStrategy.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">{index + 1}</span>
                      </div>
                      <p className="text-muted-foreground">{step}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Start button for breathing-related strategies */}
          {selectedStrategy.name.toLowerCase().includes("breath") && (
            <Button
              onClick={startBreathing}
              className="w-full h-14 text-lg rounded-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Guided Exercise
            </Button>
          )}
        </main>
      </div>
    )
  }

  const renderResources = () => (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("main")}
            className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Emergency Resources</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-4">
        <p className="text-muted-foreground">
          Free, confidential support available 24/7.
        </p>

        {/* Emergency resources from hub - matches CLI output */}
        {crisisHub?.emergencyResources && crisisHub.emergencyResources.map((resource, index) => (
          <Card
            key={index}
            className="border-destructive/30 bg-destructive/5"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground">{resource.name}</h3>
                    {resource.available24x7 && (
                      <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">24/7</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                  <a
                    href={`tel:${resource.phone.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-2 text-primary font-semibold"
                  >
                    <Phone className="w-4 h-4" />
                    {resource.phone}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  )

  const renderSafetyPlan = () => (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("main")}
              className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">My Safety Plan</h1>
          </div>
          <button
            onClick={() => setView("safety-plan-edit")}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <Edit2 className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-4">
        {!safetyPlan ? (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No Safety Plan Found</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Consider creating one with your therapist.
              </p>
              <Button onClick={() => setView("safety-plan-edit")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Safety Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-muted-foreground">
              Follow these steps when you are feeling overwhelmed.
            </p>

            {/* Warning Signals - matches CLI section 1 */}
            {safetyPlan.warningSignals && safetyPlan.warningSignals.length > 0 && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-3">1. Warning Signals</h3>
                  <ul className="space-y-2">
                    {safetyPlan.warningSignals.map((sign, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                        {sign}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Coping Strategies - matches CLI section 2 */}
            {safetyPlan.copingStrategies && safetyPlan.copingStrategies.length > 0 && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-3">2. Coping Strategies</h3>
                  <ul className="space-y-2">
                    {safetyPlan.copingStrategies.map((strategy, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Trusted Contacts - matches CLI section 3 */}
            {safetyPlan.trustedContacts && safetyPlan.trustedContacts.length > 0 && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-3">3. Trusted Contacts</h3>
                  <ul className="space-y-3">
                    {safetyPlan.trustedContacts.map((contact, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{contact.name} ({contact.relationship})</p>
                        </div>
                        <a href={`tel:${contact.phone}`} className="text-primary font-medium">
                          {contact.phone}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Professional Contacts - matches CLI section 4 */}
            {safetyPlan.professionalContacts && safetyPlan.professionalContacts.length > 0 && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-3">4. Professional Contacts</h3>
                  <ul className="space-y-2">
                    {safetyPlan.professionalContacts.map((contact, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {contact}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Environment Safety Steps - matches CLI section 5 */}
            {safetyPlan.environmentSafetySteps && safetyPlan.environmentSafetySteps.length > 0 && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-3">5. Environment Safety Steps</h3>
                  <ul className="space-y-2">
                    {safetyPlan.environmentSafetySteps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Reason for Living - matches CLI section 6 */}
            {safetyPlan.reasonForLiving && (
              <Card className="border-border/50 bg-success/5">
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-3">6. Reason for Living</h3>
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <Heart className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    {safetyPlan.reasonForLiving}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <Card className="border-border/50 bg-success/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Remember: Reaching out is a sign of strength. You deserve support and care.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )

  const renderSafetyPlanEdit = () => (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("safety-plan")}
              className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Edit Safety Plan</h1>
          </div>
          <Button onClick={saveSafetyPlan} disabled={saving} size="sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Save
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Warning Signals */}
        <div>
          <h3 className="font-medium text-foreground mb-2">Warning Signals</h3>
          <p className="text-sm text-muted-foreground mb-3">
            What thoughts, feelings, or behaviors signal that you might be struggling?
          </p>
          <Textarea
            value={editedPlan.warningSignals?.join("\n") || ""}
            onChange={(e) => setEditedPlan({
              ...editedPlan,
              warningSignals: e.target.value.split("\n").filter(Boolean),
            })}
            placeholder="Enter each warning sign on a new line..."
            className="min-h-[100px]"
          />
        </div>

        {/* Coping Strategies */}
        <div>
          <h3 className="font-medium text-foreground mb-2">Coping Strategies</h3>
          <p className="text-sm text-muted-foreground mb-3">
            What can you do on your own to feel better?
          </p>
          <Textarea
            value={editedPlan.copingStrategies?.join("\n") || ""}
            onChange={(e) => setEditedPlan({
              ...editedPlan,
              copingStrategies: e.target.value.split("\n").filter(Boolean),
            })}
            placeholder="Enter each strategy on a new line..."
            className="min-h-[100px]"
          />
        </div>

        {/* Reason for Living */}
        <div>
          <h3 className="font-medium text-foreground mb-2">Reason for Living</h3>
          <p className="text-sm text-muted-foreground mb-3">
            What matters most to you? What keeps you going?
          </p>
          <Textarea
            value={editedPlan.reasonForLiving || ""}
            onChange={(e) => setEditedPlan({
              ...editedPlan,
              reasonForLiving: e.target.value,
            })}
            placeholder="Write your reason for living..."
            className="min-h-[100px]"
          />
        </div>

        <Button onClick={saveSafetyPlan} disabled={saving} className="w-full h-12">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Safety Plan
            </>
          )}
        </Button>
      </main>
    </div>
  )

  if (activeCoping === "breathing") {
    return renderBreathingExercise()
  }

  switch (view) {
    case "main":
      return renderMain()
    case "coping":
      return renderCoping()
    case "coping-detail":
      return renderCopingDetail()
    case "resources":
      return renderResources()
    case "safety-plan":
      return renderSafetyPlan()
    case "safety-plan-edit":
      return renderSafetyPlanEdit()
    default:
      return renderMain()
  }
}
