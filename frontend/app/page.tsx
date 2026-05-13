"use client"


import { AuthProvider, useAuth } from "@/lib/auth-context"
import { AuthFlow } from "@/components/auth/auth-flow"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { HomeDashboard } from "@/components/dashboard/home-dashboard"
import { SessionsFlow } from "@/components/sessions/sessions-flow"
import { DiaryFlow } from "@/components/diary/diary-flow"
import { CrisisSupport } from "@/components/crisis/crisis-support"
import { ProgressDashboard } from "@/components/progress/progress-dashboard"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"

export type AppView = "home" | "sessions" | "diary" | "crisis" | "progress"

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Spinner className="h-8 w-8 mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading your wellness journey...</p>
      </div>
    </div>
  )
}

function AppContent() {
  const { isAuthenticated, isLoading: authLoading, hasCompletedOnboarding, setHasCompletedOnboarding } = useAuth()
  const [currentView, setCurrentView] = useState<AppView>("home")

  // Show loading while checking auth
  if (authLoading) {
    return <LoadingScreen />
  }

  // Show auth flow if not authenticated
  if (!isAuthenticated) {
    return <AuthFlow />
  }

  // Show crisis support if crisis view is selected
  if (currentView === "crisis") {
    return <CrisisSupport onBack={() => setCurrentView("home")} />
  }

  // Show onboarding if user hasn't completed it
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={() => setHasCompletedOnboarding(true)} />
  }

  // Render main app views
  const renderContent = () => {
    switch (currentView) {
      case "home":
        return <HomeDashboard onNavigate={(tab) => setCurrentView(tab)} />
      case "sessions":
        return <SessionsFlow />
      case "diary":
        return <DiaryFlow />
      case "progress":
        return <ProgressDashboard />
      default:
        return <HomeDashboard onNavigate={(tab) => setCurrentView(tab)} />
    }
  }

  return (
    <DashboardLayout activeTab={currentView} onTabChange={setCurrentView}>
      {renderContent()}
    </DashboardLayout>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
