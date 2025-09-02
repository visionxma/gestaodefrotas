"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Settings } from "lucide-react"
import type { Machinery } from "@/hooks/use-machinery"
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

interface MachineryListProps {
  machinery: Machinery[]
  onEdit: (machinery: Machinery) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

const statusLabels = {
  active: "Ativa",
  maintenance: "Manutenção",
  inactive: "Inativa",
}

const statusColors = {
  active: "default",
  maintenance: "secondary",
  inactive: "destructive",
} as const

const typeLabels = {
  tractor: "Trator",
  excavator: "Retroescavadeira",
  loader: "Carregadeira",
  bulldozer: "Bulldozer",
  crane: "Guindaste",
  other: "Outros",
}

export function MachineryList({ machinery, onEdit, onDelete, isLoading }: MachineryListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Carregando máquinas...</p>
      </div>
    )
  }

  if (machinery.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma máquina cadastrada</h3>
          <p className="text-muted-foreground">Adicione sua primeira máquina para começar a gerenciar sua frota.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {machinery.map((machine) => (
          <Card key={machine.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{machine.serialNumber}</CardTitle>
                <Badge variant={statusColors[machine.status]}>{statusLabels[machine.status]}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Tipo:</span> {typeLabels[machine.type]}
                </p>
                <p>
                  <span className="font-medium">Marca:</span> {machine.brand}
                </p>
                <p>
                  <span className="font-medium">Modelo:</span> {machine.model}
                </p>
                <p>
                  <span className="font-medium">Ano:</span> {machine.year}
                </p>
                <p>
                  <span className="font-medium">Horímetro:</span> {machine.hours.toLocaleString("pt-BR")} h
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => onEdit(machine)}>
                  <div className="h-4 w-4 mr-1"></div>
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setDeleteId(machine.id)}>
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
              Tem certeza que deseja excluir esta máquina? Esta ação não pode ser desfeita.
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