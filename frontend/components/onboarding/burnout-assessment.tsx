"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useState } from "react"
import type { AssessmentAnswers } from "@/lib/app-context"

interface BurnoutAssessmentProps {
  onComplete: (answers: AssessmentAnswers) => void
  onBack: () => void
}

const questions = [
  {
    key: "exhaustion",
    category: "Exhaustion",
    question: "How often do you feel emotionally drained from your work?",
    description: "Consider how frequently you feel depleted of emotional energy.",
  },
  {
    key: "cynicism",
    category: "Cynicism",
    question: "How often do you feel disconnected or cynical about your work?",
    description: "Think about your attitude toward your responsibilities and colleagues.",
  },
  {
    key: "efficacy",
    category: "Efficacy",
    question: "How confident do you feel in your ability to accomplish tasks effectively?",
    description: "Reflect on your sense of competence and productivity.",
  },
  {
    key: "workload",
    category: "Workload",
    question: "How manageable does your current workload feel?",
    description: "Consider the volume and intensity of your daily responsibilities.",
  },
  {
    key: "control",
    category: "Control",
    question: "How much control do you feel you have over your work decisions?",
    description: "Think about your autonomy and ability to influence outcomes.",
  },
  {
    key: "reward",
    category: "Reward",
    question: "How recognized and appreciated do you feel for your efforts?",
    description: "Reflect on the acknowledgment you receive for your contributions.",
  },
  {
    key: "community",
    category: "Community",
    question: "How supported do you feel by your colleagues and community?",
    description: "Consider your sense of belonging and social connection at work.",
  },
  {
    key: "fairness",
    category: "Fairness",
    question: "How fair do you perceive your work environment to be?",
    description: "Think about equity in decisions, workload distribution, and treatment.",
  },
  {
    key: "values",
    category: "Values",
    question: "How aligned does your work feel with your personal values?",
    description: "Reflect on whether your work contributes to what matters to you.",
  },
]

const scaleLabels = [
  { value: 1, label: "Never", shortLabel: "1" },
  { value: 2, label: "Rarely", shortLabel: "2" },
  { value: 3, label: "Sometimes", shortLabel: "3" },
  { value: 4, label: "Often", shortLabel: "4" },
  { value: 5, label: "Always", shortLabel: "5" },
]

export function BurnoutAssessment({ onComplete, onBack }: BurnoutAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Partial<AssessmentAnswers>>({})

  const question = questions[currentQuestion]
  const currentAnswer = answers[question.key as keyof AssessmentAnswers]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleAnswer = (value: number) => {
    setAnswers((prev) => ({ ...prev, [question.key]: value }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      onComplete(answers as AssessmentAnswers)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    } else {
      onBack()
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevious}
          className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <span className="text-sm text-muted-foreground">
          {currentQuestion + 1} of {questions.length}
        </span>
      </div>

      {/* Progress indicator */}
      <div className="flex gap-2 mb-4">
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-border" />
        <div className="h-1 flex-1 rounded-full bg-border" />
      </div>

      {/* Assessment progress bar */}
      <div className="mb-8">
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col">
        <div className="mb-8 animate-fade-in" key={currentQuestion}>
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {question.category}
          </span>
          <h2 className="text-xl font-semibold text-foreground mb-3 leading-relaxed">
            {question.question}
          </h2>
          <p className="text-muted-foreground">
            {question.description}
          </p>
        </div>

        {/* Scale */}
        <div className="space-y-3 animate-slide-up" key={`scale-${currentQuestion}`}>
          {scaleLabels.map((scale) => (
            <button
              key={scale.value}
              onClick={() => handleAnswer(scale.value)}
              className={`w-full p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-4 ${
                currentAnswer === scale.value
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/30 bg-card"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-medium transition-colors ${
                  currentAnswer === scale.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {scale.shortLabel}
              </div>
              <span className="font-medium text-foreground">{scale.label}</span>
            </button>
          ))}
        </div>

        {/* Visual scale indicator */}
        <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground">
          <span>Less frequent</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-8 h-2 rounded-full transition-colors ${
                  currentAnswer && i <= currentAnswer ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
          <span>More frequent</span>
        </div>
      </div>

      {/* Continue button */}
      <div className="pt-6">
        <Button
          onClick={handleNext}
          disabled={!currentAnswer}
          className="w-full h-14 text-lg font-medium rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {currentQuestion < questions.length - 1 ? (
            <>
              Next Question
              <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            "Complete Assessment"
          )}
        </Button>
      </div>
    </div>
  )
}
