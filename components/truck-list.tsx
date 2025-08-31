"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import type { Truck } from "@/hooks/use-trucks"
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

interface TruckListProps {
  trucks: Truck[]
  onEdit: (truck: Truck) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

const statusLabels = {
  active: "Ativo",
  maintenance: "Manutenção",
  inactive: "Inativo",
}

const statusColors = {
  active: "default",
  maintenance: "secondary",
  inactive: "destructive",
} as const

export function TruckList({ trucks, onEdit, onDelete, isLoading }: TruckListProps) {
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
        <p className="mt-2 text-muted-foreground">Carregando caminhões...</p>
      </div>
    )
  }

  if (trucks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="h-12 w-12 text-muted-foreground mx-auto mb-4"></div>
          <h3 className="text-lg font-medium mb-2">Nenhum caminhão cadastrado</h3>
          <p className="text-muted-foreground">Adicione seu primeiro caminhão para começar a gerenciar sua frota.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trucks.map((truck) => (
          <Card key={truck.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{truck.plate}</CardTitle>
                <Badge variant={statusColors[truck.status]}>{statusLabels[truck.status]}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Marca:</span> {truck.brand}
                </p>
                <p>
                  <span className="font-medium">Modelo:</span> {truck.model}
                </p>
                <p>
                  <span className="font-medium">Ano:</span> {truck.year}
                </p>
                {truck.color && (
                  <p>
                    <span className="font-medium">Cor:</span> {truck.color}
                  </p>
                )}
                <p>
                  <span className="font-medium">Km:</span> {truck.mileage.toLocaleString("pt-BR")}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => onEdit(truck)}>
                  <div className="h-4 w-4 mr-1"></div>
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setDeleteId(truck.id)}>
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
              Tem certeza que deseja excluir este caminhão? Esta ação não pode ser desfeita.
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
