"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Trash2, CheckCircle, DollarSign, Clock } from "lucide-react"
import type { Rental } from "@/hooks/use-rentals"
import { useRentals } from "@/hooks/use-rentals"

interface RentalListProps {
  rentals: Rental[]
  onComplete: (rental: Rental) => void
  onDelete: (id: string) => void
  onViewDetails?: (rental: Rental) => void
  isLoading: boolean
}

export function RentalList({ rentals, onComplete, onDelete, onViewDetails, isLoading }: RentalListProps) {
  const { calculateRentalStats } = useRentals()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (rentals.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma locação encontrada</h3>
          <p className="text-muted-foreground">Comece adicionando uma nova locação de máquina.</p>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const getStatusBadge = (status: Rental["status"]) => {
    switch (status) {
      case "in_progress":
        return <Badge variant="secondary">Em Andamento</Badge>
      case "completed":
        return <Badge variant="default">Finalizada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {rentals.map((rental) => {
        const stats = calculateRentalStats(rental)
        
        return (
          <Card key={rental.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusBadge(rental.status)}
                  <span className="text-sm text-muted-foreground">{formatDate(rental.date)}</span>
                </div>
                <div className="flex gap-2">
                  {onViewDetails && (
                    <Button size="sm" variant="outline" onClick={() => onViewDetails(rental)} className="h-8">
                      Ver Detalhes
                    </Button>
                  )}
                  {rental.status === "in_progress" && (
                    <Button size="sm" onClick={() => onComplete(rental)} className="h-8">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Finalizar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(rental.id)}
                    className="h-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{rental.machinerySerial}</p>
                    <p className="text-xs text-muted-foreground">Máquina</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{rental.driverName}</p>
                    <p className="text-xs text-muted-foreground">Motorista</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{rental.initialHours.toLocaleString()} h</p>
                    <p className="text-xs text-muted-foreground">Horímetro Inicial</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">R$ {rental.hourlyRate.toFixed(2)}/h</p>
                    <p className="text-xs text-muted-foreground">Valor da Hora</p>
                  </div>
                </div>
              </div>

              {rental.status === "completed" && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{stats.totalHours} h</p>
                        <p className="text-xs text-muted-foreground">Horas Trabalhadas</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium">{stats.workingDays} dias</p>
                        <p className="text-xs text-muted-foreground">Dias Trabalhados</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">{stats.effectiveHours} h</p>
                        <p className="text-xs text-muted-foreground">Horas Efetivas</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-600">R$ {stats.totalValue.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Valor Total</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Local de Saída:</span>
                    <p className="font-medium">{rental.startLocation}</p>
                  </div>
                  {rental.endLocation && (
                    <div>
                      <span className="text-muted-foreground">Local de Entrega:</span>
                      <p className="font-medium">{rental.endLocation}</p>
                    </div>
                  )}
                  {rental.finalHours && (
                    <div>
                      <span className="text-muted-foreground">Horímetro Final:</span>
                      <p className="font-medium">{rental.finalHours.toLocaleString()} h</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}