"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, Users, ArrowLeft, Check } from "lucide-react"
import { useState } from "react"
import type { UserType } from "@/lib/app-context"

interface UserTypeSelectionProps {
  onSelect: (type: UserType) => void
  onBack: () => void
}

export function UserTypeSelection({ onSelect, onBack }: UserTypeSelectionProps) {
  const [selected, setSelected] = useState<UserType>(null)

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-background">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-border" />
        <div className="h-1 flex-1 rounded-full bg-border" />
        <div className="h-1 flex-1 rounded-full bg-border" />
        <div className="h-1 flex-1 rounded-full bg-border" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-semibold text-foreground mb-3">
            How are you joining us?
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            This helps us personalize your experience and provide the most relevant support.
          </p>
        </div>

        <div className="space-y-4 animate-slide-up">
          <Card
            className={`cursor-pointer transition-all duration-300 hover:border-primary/50 ${
              selected === "individual"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border"
            }`}
            onClick={() => setSelected("individual")}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    selected === "individual" ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <User
                    className={`w-6 h-6 ${
                      selected === "individual" ? "text-primary-foreground" : "text-secondary-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground text-lg">Individual User</h3>
                    {selected === "individual" && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">
                    I am exploring mental wellness support on my own and want personalized guidance for managing stress and burnout.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all duration-300 hover:border-primary/50 ${
              selected === "therapist-referred"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border"
            }`}
            onClick={() => setSelected("therapist-referred")}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    selected === "therapist-referred" ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <Users
                    className={`w-6 h-6 ${
                      selected === "therapist-referred" ? "text-primary-foreground" : "text-secondary-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground text-lg">Therapist Referred</h3>
                    {selected === "therapist-referred" && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1">
                    My healthcare provider recommended this app as part of my treatment plan. I may have a referral code.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info note */}
        <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border/50">
          <p className="text-sm text-muted-foreground">
            Your selection helps us customize your experience but does not affect your access to any features. You can change this later in settings.
          </p>
        </div>
      </div>

      {/* Continue button */}
      <div className="pt-6">
        <Button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="w-full h-14 text-lg font-medium rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
