"use client"

import { useState } from "react"
import { DiaryList } from "./diary-list"
import { NewEntryForm } from "./new-entry-form"
import { EntryDetail } from "./entry-detail"
import { DiaryInsights } from "./diary-insights"
import { diaryApi } from "@/lib/api"
import type { DiaryEntrySummary } from "@/lib/api/types"

type DiaryView = "list" | "new" | "detail" | "insights"

export function DiaryFlow() {
  const [view, setView] = useState<DiaryView>("list")
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntrySummary | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleNewEntry = () => {
    setView("new")
  }

  const handleSelectEntry = (entry: DiaryEntrySummary) => {
    setSelectedEntry(entry)
    setView("detail")
  }

  const handleViewInsights = () => {
    setView("insights")
  }

  const handleBack = () => {
    setSelectedEntry(null)
    setView("list")
  }

  const handleDelete = async (id: string) => {
    try {
      await diaryApi.deleteEntry(id)
      setRefreshKey((prev) => prev + 1)
      handleBack()
    } catch (err) {
      console.error("Failed to delete entry:", err)
    }
  }

  const handleEntryComplete = () => {
    setRefreshKey((prev) => prev + 1)
    setView("list")
  }

  switch (view) {
    case "list":
      return (
        <DiaryList
          key={refreshKey}
          onNewEntry={handleNewEntry}
          onSelectEntry={handleSelectEntry}
          onViewInsights={handleViewInsights}
        />
      )
    case "new":
      return <NewEntryForm onBack={handleBack} onComplete={handleEntryComplete} />
    case "detail":
      return selectedEntry ? (
        <EntryDetail 
          entryId={selectedEntry.id} 
          initialEntry={selectedEntry} 
          onBack={handleBack} 
          onDelete={handleDelete}
        />
      ) : null
    case "insights":
      return <DiaryInsights onBack={handleBack} />
    default:
      return (
        <DiaryList
          key={refreshKey}
          onNewEntry={handleNewEntry}
          onSelectEntry={handleSelectEntry}
          onViewInsights={handleViewInsights}
        />
      )
  }
}
