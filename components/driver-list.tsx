"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Phone, Mail } from "lucide-react"
import type { Driver } from "@/hooks/use-drivers"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DriverListProps {
  drivers: Driver[]
  onEdit: (driver: Driver) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

const statusLabels = {
  active: "Ativo",
  inactive: "Inativo",
  suspended: "Suspenso",
}

const statusColors = {
  active: "default",
  inactive: "secondary",
  suspended: "destructive",
} as const

export function DriverList({ drivers, onEdit, onDelete, isLoading }: DriverListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const isCNHExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Carregando motoristas...</p>
      </div>
    )
  }

  if (drivers.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="h-12 w-12 text-muted-foreground mx-auto mb-4"></div>
          <h3 className="text-lg font-medium mb-2">Nenhum motorista cadastrado</h3>
          <p className="text-muted-foreground">Adicione seu primeiro motorista para começar a gerenciar sua equipe.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {drivers.map((driver) => (
          <Card key={driver.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{driver.name}</CardTitle>
                <Badge variant={statusColors[driver.status]}>{statusLabels[driver.status]}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">CPF:</span> {driver.cpf}
                </p>
                <p>
                  <span className="font-medium">CNH:</span> {driver.cnh} ({driver.cnhCategory})
                </p>
                <p className={isCNHExpired(driver.cnhExpiry) ? "text-destructive" : ""}>
                  <span className="font-medium">Vencimento CNH:</span> {formatDate(driver.cnhExpiry)}
                  {isCNHExpired(driver.cnhExpiry) && " (Vencida)"}
                </p>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>{driver.phone}</span>
                </div>
                {driver.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span className="text-xs">{driver.email}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => onEdit(driver)}>
                  <div className="h-4 w-4 mr-1"></div>
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setDeleteId(driver.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este motorista? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
