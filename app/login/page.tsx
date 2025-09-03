"use client"

import type React from "react"
import { useState, useTransition } from "react"
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
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const [resetEmail, setResetEmail] = useState("")
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  const { login, resetPassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    startTransition(async () => {
      const success = await login(email, password)

      if (success) {
        toast.success("Login realizado com sucesso!")
        router.push("/dashboard")
      } else {
        setError("Email ou senha incorretos")
        toast.error("Credenciais inválidas")
      }
    })
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600/80 via-red-700/70 to-black/60 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-border/40 backdrop-blur-sm bg-background/95 animate-in fade-in-50 slide-in-from-bottom-5">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Acesse sua conta</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Controle sua frota de forma simples e segura
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-md border border-destructive/20">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isPending || !email || !password}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="link" className="text-sm">Esqueci minha senha</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Recuperar Senha</DialogTitle>
                  <DialogDescription>
                    Digite seu email para receber um link de recuperação de senha.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="exemplo@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full" disabled={isResetLoading || !resetEmail}>
                    {isResetLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar link"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-6 text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
