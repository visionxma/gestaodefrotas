"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Truck } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [resetEmail, setResetEmail] = useState("")
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  const { login, resetPassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const success = await login(email, password)

    if (success) {
      router.push("/dashboard")
    } else {
      setError("Email ou senha incorretos")
    }

    setIsLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail.trim()) {
      toast.error("Digite seu email")
      return
    }

    setIsResetLoading(true)
    const success = await resetPassword(resetEmail)

    if (success) {
      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.")
      setIsResetDialogOpen(false)
      setResetEmail("")
    } else {
      toast.error("Erro ao enviar email de recuperação. Verifique se o email está correto.")
    }
    setIsResetLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-3 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center responsive-card-padding">
          <div className="flex justify-center mb-4">
            <div className="p-3  rounded-full">
<img src="https://i.imgur.com/e9kut4B.png" alt="ICONFROTAS Logo" className="h-10 w-10 sm:h-12 sm:w-12" />            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Controle de Frotas</CardTitle>
          <CardDescription className="text-sm">Entre na sua conta para gerenciar sua frota</CardDescription>
        </CardHeader>
        <CardContent className="responsive-card-padding pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 sm:h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 sm:h-10"
                required
              />
            </div>
            {error && <div className="text-destructive text-sm text-center leading-tight">{error}</div>}
            <Button type="submit" className="w-full h-11 sm:h-10" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="text-sm h-auto p-2">
                  Esqueci minha senha
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recuperar Senha</DialogTitle>
                  <DialogDescription>Digite seu email para receber um link de recuperação de senha.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail" className="text-sm">Email</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="seu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="h-11 sm:h-10"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 sm:h-10" disabled={isResetLoading}>
                    {isResetLoading ? "Enviando..." : "Enviar Link de Recuperação"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground leading-tight">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
