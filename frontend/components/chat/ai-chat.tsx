"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Bot, User, AlertCircle, RefreshCw, Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { api, ApiRequestError } from "@/lib/api"
import { PulseDots } from "@/components/ui/loading"
import { ErrorAlert } from "@/components/ui/error-display"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isStreaming?: boolean
  error?: string
}

interface AIChatProps {
  sessionId?: string
  placeholder?: string
  welcomeMessage?: string
  className?: string
  onMessageSent?: (message: string) => void
  onResponseReceived?: (response: string) => void
}

export function AIChat({
  sessionId,
  placeholder = "Type your message...",
  welcomeMessage = "Hello! I'm here to support you on your wellness journey. How are you feeling today?",
  className,
  onMessageSent,
  onResponseReceived,
}: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: welcomeMessage,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput((prev) => prev + " " + transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      recognitionRef.current?.abort()
      synthRef.current?.cancel()
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }, [isListening])

  const speakMessage = useCallback((text: string) => {
    if (!synthRef.current) return

    if (isSpeaking) {
      synthRef.current.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synthRef.current.speak(utterance)
    setIsSpeaking(true)
  }, [isSpeaking])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)
    onMessageSent?.(userMessage.content)

    // Create placeholder for assistant response
    const assistantMessageId = `assistant-${Date.now()}`
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      // Use streaming endpoint for real-time responses
      await api.stream(
        sessionId ? `/sessions/${sessionId}/chat` : "/chat",
        { message: userMessage.content },
        // onChunk - update message content as chunks arrive
        (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          )
        },
        // onComplete - mark streaming as complete
        () => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, isStreaming: false }
                : msg
            )
          )
          setIsLoading(false)

          // Get final message content for callback
          const finalMessage = messages.find((m) => m.id === assistantMessageId)
          if (finalMessage) {
            onResponseReceived?.(finalMessage.content)
          }
        },
        // onError - handle streaming errors
        (err) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, isStreaming: false, error: err.getUserMessage() }
                : msg
            )
          )
          setIsLoading(false)
          setError(err.getUserMessage())
        }
      )
    } catch (err) {
      // Fallback to polling if streaming fails
      try {
        const response = await api.post<{ response: string }>(
          sessionId ? `/sessions/${sessionId}/chat` : "/chat",
          { message: userMessage.content }
        )

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: response.response, isStreaming: false }
              : msg
          )
        )
        onResponseReceived?.(response.response)
      } catch (fallbackErr) {
        const errorMessage = fallbackErr instanceof ApiRequestError
          ? fallbackErr.getUserMessage()
          : "Failed to send message. Please try again."

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, isStreaming: false, error: errorMessage }
              : msg
          )
        )
        setError(errorMessage)
      }
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const retryMessage = (messageId: string) => {
    const failedMessageIndex = messages.findIndex((m) => m.id === messageId)
    if (failedMessageIndex === -1) return

    // Find the user message before the failed assistant message
    let userMessage: ChatMessage | undefined
    for (let i = failedMessageIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        userMessage = messages[i]
        break
      }
    }

    if (userMessage) {
      // Remove the failed message and resend
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      setInput(userMessage.content)
    }
  }

  return (
    <div className={cn("flex flex-col h-full bg-background rounded-xl border", className)}>
      {/* Chat header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Avatar className="h-10 w-10 bg-primary/10">
          <AvatarFallback>
            <Bot className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-foreground">Therapy Assistant</h3>
          <p className="text-xs text-muted-foreground">
            {isLoading ? "Typing..." : "Online"}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 pt-4">
          <ErrorAlert error={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 bg-primary/10 flex-shrink-0">
                  <AvatarFallback>
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                  message.error && "border-2 border-destructive"
                )}
              >
                {message.isStreaming && !message.content ? (
                  <PulseDots size="sm" />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}

                {message.error && (
                  <div className="mt-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-xs text-destructive">{message.error}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => retryMessage(message.id)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                )}

                {message.role === "assistant" && !message.isStreaming && !message.error && message.content && (
                  <div className="mt-2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => speakMessage(message.content)}
                      title={isSpeaking ? "Stop speaking" : "Read aloud"}
                    >
                      {isSpeaking ? (
                        <VolumeX className="h-3 w-3" />
                      ) : (
                        <Volume2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <Avatar className="h-8 w-8 bg-primary flex-shrink-0">
                  <AvatarFallback>
                    <User className="h-4 w-4 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className="min-h-[44px] max-h-32 resize-none pr-24"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              {recognitionRef.current && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    isListening && "text-primary bg-primary/10"
                  )}
                  onClick={toggleListening}
                  disabled={isLoading}
                  title={isListening ? "Stop listening" : "Voice input"}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="h-11 px-4"
          >
            {isLoading ? (
              <PulseDots size="sm" className="[&>div]:bg-primary-foreground" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
