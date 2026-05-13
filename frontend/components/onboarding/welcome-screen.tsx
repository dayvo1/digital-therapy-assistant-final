"use client"

import { Button } from "@/components/ui/button"
import { Heart, Shield, Brain, Sparkles } from "lucide-react"

interface WelcomeScreenProps {
  onContinue: () => void
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      {/* Animated breathing circle */}
      <div className="relative mb-12">
        <div className="w-32 h-32 rounded-full bg-primary/20 animate-breathe flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/40 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Title and description */}
      <div className="text-center max-w-md animate-fade-in">
        <h1 className="text-4xl font-semibold text-foreground mb-4 text-balance">
          MindfulPath
        </h1>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          Your compassionate companion on the journey to mental wellness and burnout recovery.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 gap-4 w-full max-w-sm mb-12 animate-slide-up">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Evidence-Based Support</h3>
            <p className="text-sm text-muted-foreground">Guided CBT sessions tailored to you</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
          <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Personalized Journey</h3>
            <p className="text-sm text-muted-foreground">Insights that grow with you</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Safe & Confidential</h3>
            <p className="text-sm text-muted-foreground">Your privacy is our priority</p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="w-full max-w-sm">
        <Button
          onClick={onContinue}
          className="w-full h-14 text-lg font-medium rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-[1.02]"
        >
          Begin Your Journey
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Takes about 5 minutes to get started
        </p>
      </div>
    </div>
  )
}
