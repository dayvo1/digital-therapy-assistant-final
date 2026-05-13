"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SessionsLibrary } from "./sessions-library"
import { SessionHistory } from "./session-history"
import { InteractiveSession } from "./interactive-session"
import { SessionComplete } from "./session-complete"
import type { SessionSummaryItem } from "@/lib/api/types"
import { BookOpen, History } from "lucide-react"

type SessionView = "browse" | "session" | "complete"

interface SessionSummary {
  moodChange: number
  insights: string[]
}

export function SessionsFlow() {
  const [view, setView] = useState<SessionView>("browse")
  const [selectedSession, setSelectedSession] = useState<SessionSummaryItem | null>(null)
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null)
  const [activeTab, setActiveTab] = useState<"library" | "history">("library")

  const handleSelectSession = (session: SessionSummaryItem) => {
    setSelectedSession(session)
    setView("session")
  }

  const handleSessionComplete = (summary: SessionSummary) => {
    setSessionSummary(summary)
    setView("complete")
  }

  const handleBackToLibrary = () => {
    setSelectedSession(null)
    setSessionSummary(null)
    setView("browse")
    // Switch to history tab to see the completed session
    setActiveTab("history")
  }

  const handleBackToBrowse = () => {
    setSelectedSession(null)
    setSessionSummary(null)
    setView("browse")
  }

  // Show interactive session
  if (view === "session" && selectedSession) {
    return (
      <InteractiveSession
        session={selectedSession}
        onBack={handleBackToBrowse}
        onComplete={handleSessionComplete}
      />
    )
  }

  // Show session complete summary
  if (view === "complete" && selectedSession && sessionSummary) {
    return (
      <SessionComplete
        session={selectedSession}
        summary={sessionSummary}
        onContinue={handleBackToLibrary}
      />
    )
  }

  // Show tabbed browse interface
  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "library" | "history")}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="library" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Browse Sessions
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="-mx-4 lg:-mx-8 -mt-6">
          <SessionsLibrary onSelectSession={handleSelectSession} />
        </TabsContent>

        <TabsContent value="history">
          <SessionHistory onViewSession={handleSelectSession} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
