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
import { Truck, Eye, EyeOff, Loader2 } from "lucide-react"
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-3 sm:p-4">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://infleet.com.br/wp-content/uploads/2025/05/tudo-o-que-voce-precisa-saber-sobre-gestao-de-frota-de-caminhoes.webp)'
          }}
        />
        {/* Red gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/80 via-red-700/70 to-black/60" />
        {/* Additional overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="text-center responsive-card-padding">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full backdrop-blur-sm">
              <img src="https://i.imgur.com/e9kut4B.png" alt="ICONFROTAS Logo" className="h-10 w-10 sm:h-12 sm:w-12" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Controle de Frotas</CardTitle>
          <CardDescription className="text-sm">Entre na sua conta para gerenciar sua frota</CardDescription>
        </CardHeader>
        <CardContent className="responsive-card-padding pt-0 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 sm:h-10 transition-all duration-200 focus:scale-[1.02] focus:shadow-lg"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-sm">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 sm:h-10 pr-12 transition-all duration-200 focus:scale-[1.02] focus:shadow-lg"
                  autoComplete="current-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-11 sm:h-10 px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            {error && (
              <div className="text-destructive text-sm text-center leading-tight bg-destructive/10 p-3 rounded-md border border-destructive/20 animate-in slide-in-from-top-2">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-11 sm:h-10 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg" 
              disabled={isPending || !email || !password}
            >
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
                <Button variant="link" className="text-sm h-auto p-2 hover:scale-105 transition-transform duration-200">
                  Esqueci minha senha
                </Button>
              </DialogTrigger>
              <DialogContent className="backdrop-blur-sm">
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
                      className="h-11 sm:h-10 transition-all duration-200 focus:scale-[1.02]"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 sm:h-10 transition-all duration-200 hover:scale-[1.02]" 
                    disabled={isResetLoading || !resetEmail}
                  >
                    {isResetLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Enviar Link de Recuperação"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground leading-tight">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-primary hover:underline hover:scale-105 transition-transform duration-200 inline-block">
                Cadastre-se
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
