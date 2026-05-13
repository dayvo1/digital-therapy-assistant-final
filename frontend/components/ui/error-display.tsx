"use client"

import { AlertCircle, RefreshCw, ArrowLeft, WifiOff, Lock, FileQuestion, ServerCrash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { ApiRequestError } from "@/lib/api"

interface ErrorAlertProps {
  error: Error | ApiRequestError | string
  onDismiss?: () => void
  className?: string
}

export function ErrorAlert({ error, onDismiss, className }: ErrorAlertProps) {
  const message = typeof error === "string" 
    ? error 
    : error instanceof ApiRequestError 
      ? error.getUserMessage() 
      : error.message

  return (
    <Alert variant="destructive" className={cn("relative", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="pr-8">{message}</AlertDescription>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-destructive-foreground/70 hover:text-destructive-foreground"
          aria-label="Dismiss error"
        >
          <span className="sr-only">Dismiss</span>
          &times;
        </button>
      )}
    </Alert>
  )
}

interface ErrorPageProps {
  error: Error | ApiRequestError | string
  onRetry?: () => void
  onGoBack?: () => void
  className?: string
}

export function ErrorPage({ error, onRetry, onGoBack, className }: ErrorPageProps) {
  const apiError = error instanceof ApiRequestError ? error : null
  const status = apiError?.status || 500
  
  const getErrorIcon = () => {
    if (status === 0) return <WifiOff className="h-16 w-16 text-muted-foreground" />
    if (status === 401 || status === 403) return <Lock className="h-16 w-16 text-muted-foreground" />
    if (status === 404) return <FileQuestion className="h-16 w-16 text-muted-foreground" />
    if (status >= 500) return <ServerCrash className="h-16 w-16 text-muted-foreground" />
    return <AlertCircle className="h-16 w-16 text-muted-foreground" />
  }

  const getErrorTitle = () => {
    if (status === 0) return "Connection Error"
    if (status === 401) return "Session Expired"
    if (status === 403) return "Access Denied"
    if (status === 404) return "Not Found"
    if (status === 422) return "Validation Error"
    if (status >= 500) return "Server Error"
    return "Something Went Wrong"
  }

  const message = typeof error === "string"
    ? error
    : apiError
      ? apiError.getUserMessage()
      : error.message

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[400px] p-8 text-center", className)}>
      <div className="mb-6">
        {getErrorIcon()}
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        {getErrorTitle()}
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        {message}
      </p>
      <div className="flex gap-4">
        {onGoBack && (
          <Button variant="outline" onClick={onGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        )}
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}

interface ValidationErrorListProps {
  errors: { field: string; message: string }[]
  className?: string
}

export function ValidationErrorList({ errors, className }: ValidationErrorListProps) {
  if (!errors || errors.length === 0) return null

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Please fix the following errors:</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 list-disc list-inside space-y-1">
          {errors.map((error, index) => (
            <li key={index} className="text-sm">
              <span className="font-medium">{error.field}:</span> {error.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

interface InlineErrorProps {
  message: string
  className?: string
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <p className={cn("text-sm text-destructive flex items-center gap-1", className)}>
      <AlertCircle className="h-3 w-3" />
      {message}
    </p>
  )
}

interface ErrorBoundaryFallbackProps {
  error: Error
  resetErrorBoundary?: () => void
}

export function ErrorBoundaryFallback({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <ServerCrash className="h-16 w-16 text-destructive mx-auto mb-6" />
        <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="text-left text-xs bg-muted p-4 rounded-lg overflow-auto mb-6">
            {error.message}
          </pre>
        )}
        {resetErrorBoundary && (
          <Button onClick={resetErrorBoundary}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}
