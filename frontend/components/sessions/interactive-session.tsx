"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { sessionsApi, ApiRequestError } from "@/lib/api"
import type { SessionSummaryItem, ActiveSession, ChatMessage, SessionSummary } from "@/lib/api/types"
import {
  ArrowLeft,
  ArrowRight,
  Send,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Bot,
  User,
  Loader2,
  Smile,
  Frown,
  Meh,
  AlertTriangle,
} from "lucide-react"

interface InteractiveSessionProps {
  session: SessionSummaryItem
  onBack: () => void
  onComplete: (summary: { moodChange: number; insights: string[] }) => void
}

export function InteractiveSession({ session, onBack, onComplete }: InteractiveSessionProps) {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [moodBefore, setMoodBefore] = useState<number>(5)
  const [moodAfter, setMoodAfter] = useState<number>(5)
  const [showMoodBefore, setShowMoodBefore] = useState(true)
  const [showMoodAfter, setShowMoodAfter] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const startSession = async () => {
    setLoading(true)
    setError(null)
    try {
      // POST /sessions/{sessionId}/start with empty body, returns ActiveSession
      const response = await sessionsApi.startSession(session.id)
      setActiveSession(response)
      setShowMoodBefore(false)
    } catch (err) {
      const message = err instanceof ApiRequestError
        ? err.message
        : "Failed to start session. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || sending || !activeSession) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setSending(true)
    setError(null)

    try {
      // POST /sessions/{userSessionId}/chat - uses userSessionId from ActiveSession
      const response = await sessionsApi.sendMessage(activeSession.userSessionId, {
        message: userMessage.content,
        modality: "TEXT",
      })

      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + "-assistant",
        role: response.role || "assistant",
        content: response.message,
        timestamp: response.timestamp || new Date().toISOString(),
        crisisDetected: response.crisisDetected,
        crisisAction: response.crisisAction,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const message = err instanceof ApiRequestError
        ? err.message
        : "Failed to send message. Please try again."
      setError(message)
    } finally {
      setSending(false)
    }
  }

  const handleEndSession = async () => {
    if (!activeSession) return
    setShowMoodAfter(true)
  }

  const completeSession = async () => {
    if (!activeSession) return

    setLoading(true)
    setError(null)
    try {
      // POST /sessions/{userSessionId}/end with reason, returns SessionSummary
      const response = await sessionsApi.endSession(activeSession.userSessionId, "User ended session")

      // Calculate mood change from response or from our tracked values
      const moodChange = response.moodAfter && response.moodBefore
        ? response.moodAfter - response.moodBefore
        : moodAfter - moodBefore

      onComplete({
        moodChange,
        insights: response.keyInsights || response.insights || [],
      })
    } catch (err) {
      const message = err instanceof ApiRequestError
        ? err.message
        : "Failed to end session. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getMoodIcon = (mood: number) => {
    if (mood <= 3) return <Frown className="w-6 h-6" />
    if (mood <= 6) return <Meh className="w-6 h-6" />
    return <Smile className="w-6 h-6" />
  }

  const getMoodLabel = (mood: number) => {
    if (mood <= 2) return "Very Low"
    if (mood <= 4) return "Low"
    if (mood <= 6) return "Neutral"
    if (mood <= 8) return "Good"
    return "Great"
  }

  // Initial mood assessment screen
  if (showMoodBefore) {
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

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">{session.title}</h2>
            <p className="text-muted-foreground mb-8">
              Before we begin, how are you feeling right now?
            </p>

            <Card className="border-border/50 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className={`text-${moodBefore <= 3 ? "destructive" : moodBefore <= 6 ? "muted-foreground" : "success"}`}>
                    {getMoodIcon(moodBefore)}
                  </div>
                  <span className="text-2xl font-semibold text-foreground">{moodBefore}/10</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{getMoodLabel(moodBefore)}</p>
                <Slider
                  value={[moodBefore]}
                  onValueChange={(value) => setMoodBefore(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={startSession} disabled={loading} className="w-full h-14 text-lg">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  Begin Session
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Final mood assessment screen
  if (showMoodAfter) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Session Complete</p>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Great work!</h2>
            <p className="text-muted-foreground mb-8">
              How are you feeling now after the session?
            </p>

            <Card className="border-border/50 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className={`text-${moodAfter <= 3 ? "destructive" : moodAfter <= 6 ? "muted-foreground" : "success"}`}>
                    {getMoodIcon(moodAfter)}
                  </div>
                  <span className="text-2xl font-semibold text-foreground">{moodAfter}/10</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{getMoodLabel(moodAfter)}</p>
                <Slider
                  value={[moodAfter]}
                  onValueChange={(value) => setMoodAfter(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={completeSession} disabled={loading} className="w-full h-14 text-lg">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Session
                  <CheckCircle2 className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Chat interface
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h2 className="font-medium text-foreground text-sm">{session.title}</h2>
              <p className="text-xs text-muted-foreground">{session.durationMinutes} min session</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleEndSession}>
            End Session
          </Button>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-4 space-y-4">
          {/* Welcome message if no messages */}
          {messages.length === 0 && activeSession && (
            <Card className="border-border/50 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Therapy Assistant</p>
                    <p className="text-muted-foreground">
                      Welcome to your {activeSession.title} session. {activeSession.description && activeSession.description}
                      {" "}I&apos;m here to guide you through evidence-based techniques. Feel free to share your thoughts and
                      feelings - this is a safe, judgment-free space. Type &apos;exit&apos; or &apos;quit&apos; to end the session.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user" ? "bg-secondary" : "bg-primary/20"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Bot className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="max-w-[80%] space-y-2">
                <Card
                  className={`${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border/50"
                  }`}
                >
                  <CardContent className="p-3">
                    <p className={message.role === "user" ? "" : "text-foreground"}>
                      {message.content}
                    </p>
                  </CardContent>
                </Card>

                {/* Crisis alert if detected */}
                {message.crisisDetected && (
                  <Alert className="bg-destructive/10 border-destructive/30">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-destructive">
                      <strong>Crisis indicators detected.</strong>
                      {message.crisisAction && <span> Action: {message.crisisAction}</span>}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {sending && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <Card className="border-border/50">
                <CardContent className="p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Error */}
      {error && (
        <div className="px-4 pb-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Input */}
      <footer className="sticky bottom-0 bg-background border-t border-border px-4 py-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Share your thoughts..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
            disabled={sending}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || sending}
            size="icon"
            className="h-11 w-11 flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </footer>
    </div>
  )
}
