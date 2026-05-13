"use client"

import { useState } from "react"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

type AuthView = "login" | "register"

export function AuthFlow() {
  const [view, setView] = useState<AuthView>("login")

  if (view === "register") {
    return <RegisterForm onSwitchToLogin={() => setView("login")} />
  }

  return <LoginForm onSwitchToRegister={() => setView("register")} />
}
