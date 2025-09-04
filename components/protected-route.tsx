"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticating } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticating && !user) {
      console.log("[v0] ProtectedRoute - usuário não autenticado, redirecionando para login")
      router.push("/login")
    }
  }, [user, isLoading, isAuthenticating, router])

  if (isLoading || isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            {isAuthenticating ? "Autenticando..." : "Carregando..."}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
