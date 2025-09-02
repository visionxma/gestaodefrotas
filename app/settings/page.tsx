"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useBackup } from "@/hooks/use-backup"
import { Mail, Globe, Phone, User, Shield, FileText, HelpCircle, ExternalLink, Edit, Save, X, Key } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { user, updateUserData, changePassword } = useAuth()
  const { downloadBackup, importBackup, clearAllData } = useBackup()

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(user?.name || "")
  const [editCompany, setEditCompany] = useState(user?.company || "")
  const [isUpdating, setIsUpdating] = useState(false)

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleSave = async () => {
    if (!editName.trim() || !editCompany.trim()) {
      toast.error("Nome e empresa são obrigatórios")
      return
    }

    setIsUpdating(true)
    const success = await updateUserData(editName.trim(), editCompany.trim())

    if (success) {
      toast.success("Dados atualizados com sucesso!")
      setIsEditing(false)
    } else {
      toast.error("Erro ao atualizar dados. Tente novamente.")
    }
    setIsUpdating(false)
  }

  const handleCancel = () => {
    setEditName(user?.name || "")
    setEditCompany(user?.company || "")
    setIsEditing(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem")
      return
    }

    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsChangingPassword(true)
    const success = await changePassword(currentPassword, newPassword)

    if (success) {
      toast.success("Senha alterada com sucesso!")
      setIsPasswordDialogOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } else {
      toast.error("Erro ao alterar senha. Verifique se a senha atual está correta.")
    }
    setIsChangingPassword(false)
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="mobile-spacing">
          <div>
            <h1 className="font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Gerencie suas configurações de conta e preferências do sistema</p>
          </div>

          <div className="grid gap-4 sm:gap-6">
            {/* Informações da Conta */}
            <Card>
              <CardHeader className="responsive-card-padding">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span className="text-base sm:text-lg">Informações da Conta</span>
                  </div>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="h-8 text-xs">
                      <Edit className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Editar</span>
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancel} disabled={isUpdating} className="h-8 text-xs">
                        <X className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Cancelar</span>
                      </Button>
                      <Button size="sm" onClick={handleSave} disabled={isUpdating} className="h-8 text-xs">
                        <Save className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">{isUpdating ? "Salvando..." : "Salvar"}</span>
                      </Button>
                    </div>
                  )}
                </CardTitle>
                <CardDescription className="text-sm">Visualize e gerencie as informações da sua conta</CardDescription>
              </CardHeader>
              <CardContent className="responsive-card-padding pt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">Nome</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Digite seu nome"
                        className="h-10 sm:h-9"
                      />
                    ) : (
                      <Input id="name" value={user?.name || ""} disabled className="h-10 sm:h-9" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input id="email" value={user?.email || ""} disabled className="h-10 sm:h-9" />
                    {isEditing && <p className="text-xs text-muted-foreground leading-tight">O email não pode ser alterado</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm">Empresa</Label>
                    {isEditing ? (
                      <Input
                        id="company"
                        value={editCompany}
                        onChange={(e) => setEditCompany(e.target.value)}
                        placeholder="Digite o nome da empresa"
                        className="h-10 sm:h-9"
                      />
                    ) : (
                      <Input id="company" value={user?.company || ""} disabled className="h-10 sm:h-9" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Status da Conta</Label>
                    <div>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Ativa
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm sm:text-base">Senha</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Altere sua senha de acesso</p>
                    </div>
                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          <Key className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Alterar Senha</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Alterar Senha</DialogTitle>
                          <DialogDescription>Digite sua senha atual e a nova senha para alterar.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleChangePassword} className="space-y-4 sm:space-y-5">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword" className="text-sm">Senha Atual</Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="h-10 sm:h-9"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-sm">Nova Senha</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="h-10 sm:h-9"
                              minLength={6}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm">Confirmar Nova Senha</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="h-10 sm:h-9"
                              minLength={6}
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full h-10 sm:h-9" disabled={isChangingPassword}>
                            {isChangingPassword ? "Alterando..." : "Alterar Senha"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suporte */}
            <Card>
              <CardHeader className="responsive-card-padding">
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  <span className="text-base sm:text-lg">Suporte</span>
                </CardTitle>
                <CardDescription className="text-sm">Entre em contato conosco para obter ajuda e suporte</CardDescription>
              </CardHeader>
              <CardContent className="responsive-card-padding pt-0 space-y-4">
                <div className="grid gap-3 sm:gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm sm:text-base">Email</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">visionxma@gmail.com</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="h-8 text-xs w-full sm:w-auto">
                      <a href="mailto:visionxma@gmail.com">
                        Enviar Email
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                      </a>
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm sm:text-base">Website</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">visionxma.com</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="h-8 text-xs w-full sm:w-auto">
                      <a href="https://visionxma.com" target="_blank" rel="noopener noreferrer">
                        Visitar Site
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                      </a>
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm sm:text-base">WhatsApp</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">+55 99 8468-0391</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="h-8 text-xs w-full sm:w-auto">
                      <a href="https://wa.me/5599984680391" target="_blank" rel="noopener noreferrer">
                        Abrir WhatsApp
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Termos de Uso e Políticas */}
            <Card>
              <CardHeader className="responsive-card-padding">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="text-base sm:text-lg">Termos e Políticas</span>
                </CardTitle>
                <CardDescription className="text-sm">Informações legais e políticas do sistema</CardDescription>
              </CardHeader>
              <CardContent className="responsive-card-padding pt-0 space-y-4">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3 sm:gap-0">
                    <div>
                      <p className="font-medium text-sm sm:text-base">Termos de Uso</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Condições de uso do sistema de Controle de frotas</p>
                    </div>
                    <Button variant="outline" size="sm" asChild className="h-8 text-xs w-full sm:w-auto">
                      <a
                        href="https://drive.google.com/file/d/1YUlgWRwq0x32AvsL8uBvIEsccboNfcVe/view?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visualizar
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                      </a>
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3 sm:gap-0">
                    <div>
                      <p className="font-medium text-sm sm:text-base">Política de Privacidade</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Como tratamos e protegemos seus dados</p>
                    </div>
                    <Button variant="outline" size="sm" asChild className="h-8 text-xs w-full sm:w-auto">
                      <a
                        href="https://drive.google.com/file/d/19lg6tVrXG1wiBC0-fyPoINJzkqTuQjdA/view?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visualizar
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                      </a>
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3 sm:gap-0">
                    <div>
                      <p className="font-medium text-sm sm:text-base">Política de Cookies</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Informações sobre o uso de cookies</p>
                    </div>
                    <Button variant="outline" size="sm" asChild className="h-8 text-xs w-full sm:w-auto">
                      <a
                        href="https://drive.google.com/file/d/11yApmqkKxjudVyEfm4H68M4m-S0J55yF/view?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visualizar
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Sistema */}
            <Card>
              <CardHeader className="responsive-card-padding">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-base sm:text-lg">Informações do Sistema</span>
                </CardTitle>
                <CardDescription className="text-sm">Detalhes técnicos e versão do sistema</CardDescription>
              </CardHeader>
              <CardContent className="responsive-card-padding pt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Versão do Sistema</Label>
                    <p className="text-xs sm:text-sm font-mono bg-muted p-2 rounded">v1.0.0</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Última Atualização</Label>
                    <p className="text-xs sm:text-sm font-mono bg-muted p-2 rounded">{new Date().toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Desenvolvido por</Label>
                    <p className="text-xs sm:text-sm bg-muted p-2 rounded">VisionX Inova Simples (I.S) </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Licença</Label>
                    <p className="text-xs sm:text-sm bg-muted p-2 rounded">Proprietária</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
