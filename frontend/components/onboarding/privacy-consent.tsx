"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Shield, Lock, Eye, FileText, AlertTriangle } from "lucide-react"
import { useState } from "react"

interface PrivacyConsentProps {
  onConsent: () => void
  onBack: () => void
}

export function PrivacyConsent({ onConsent, onBack }: PrivacyConsentProps) {
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    hipaa: false,
    dataUse: false,
  })

  const allAgreed = Object.values(agreements).every(Boolean)

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
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-border" />
        <div className="h-1 flex-1 rounded-full bg-border" />
        <div className="h-1 flex-1 rounded-full bg-border" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Your Privacy Matters
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            We take your privacy seriously. Please review our policies and provide your consent to continue.
          </p>
        </div>

        {/* Privacy highlights */}
        <div className="grid grid-cols-2 gap-3 mb-6 animate-slide-up">
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <Lock className="w-5 h-5 text-primary mb-2" />
            <h4 className="font-medium text-sm text-foreground">End-to-End Encrypted</h4>
            <p className="text-xs text-muted-foreground mt-1">Your data is protected</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <Eye className="w-5 h-5 text-primary mb-2" />
            <h4 className="font-medium text-sm text-foreground">You Control Access</h4>
            <p className="text-xs text-muted-foreground mt-1">Share only what you want</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <FileText className="w-5 h-5 text-primary mb-2" />
            <h4 className="font-medium text-sm text-foreground">HIPAA Compliant</h4>
            <p className="text-xs text-muted-foreground mt-1">Healthcare standard</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border/50">
            <Shield className="w-5 h-5 text-primary mb-2" />
            <h4 className="font-medium text-sm text-foreground">Data Minimization</h4>
            <p className="text-xs text-muted-foreground mt-1">We collect only essentials</p>
          </div>
        </div>

        {/* Consent checkboxes */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4">
            <label className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50 cursor-pointer hover:border-primary/30 transition-colors">
              <Checkbox
                checked={agreements.terms}
                onCheckedChange={(checked) =>
                  setAgreements((prev) => ({ ...prev, terms: checked === true }))
                }
                className="mt-1"
              />
              <div>
                <h4 className="font-medium text-foreground">Terms of Service</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  I have read and agree to the{" "}
                  <button className="text-primary underline">Terms of Service</button>
                  {" "}governing my use of MindfulPath.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50 cursor-pointer hover:border-primary/30 transition-colors">
              <Checkbox
                checked={agreements.privacy}
                onCheckedChange={(checked) =>
                  setAgreements((prev) => ({ ...prev, privacy: checked === true }))
                }
                className="mt-1"
              />
              <div>
                <h4 className="font-medium text-foreground">Privacy Policy</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  I understand and accept the{" "}
                  <button className="text-primary underline">Privacy Policy</button>
                  {" "}describing how my personal information is collected and used.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50 cursor-pointer hover:border-primary/30 transition-colors">
              <Checkbox
                checked={agreements.hipaa}
                onCheckedChange={(checked) =>
                  setAgreements((prev) => ({ ...prev, hipaa: checked === true }))
                }
                className="mt-1"
              />
              <div>
                <h4 className="font-medium text-foreground">HIPAA Authorization</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  I authorize the use and disclosure of my health information as described in the{" "}
                  <button className="text-primary underline">HIPAA Notice</button>. I understand my rights under HIPAA.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50 cursor-pointer hover:border-primary/30 transition-colors">
              <Checkbox
                checked={agreements.dataUse}
                onCheckedChange={(checked) =>
                  setAgreements((prev) => ({ ...prev, dataUse: checked === true }))
                }
                className="mt-1"
              />
              <div>
                <h4 className="font-medium text-foreground">Data Usage Consent</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  I consent to anonymous data being used to improve the service. My identity will never be associated with this data.
                </p>
              </div>
            </label>
          </div>

          {/* Important notice */}
          <div className="mt-6 p-4 rounded-xl bg-accent/20 border border-accent/30 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground text-sm">Important Notice</h4>
              <p className="text-sm text-muted-foreground mt-1">
                MindfulPath is a supportive tool and does not replace professional mental health care. 
                In case of emergency, please contact emergency services or a crisis hotline immediately.
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Continue button */}
      <div className="pt-6">
        <Button
          onClick={onConsent}
          disabled={!allAgreed}
          className="w-full h-14 text-lg font-medium rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          I Agree & Continue
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          You can withdraw consent at any time in Settings
        </p>
      </div>
    </div>
  )
}
