"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Truck, User, Trash2, CheckCircle, DollarSign, Weight } from "lucide-react"
import type { Trip } from "@/hooks/use-trips"

interface TripListProps {
  trips: Trip[]
  onComplete: (trip: Trip) => void
  onDelete: (id: string) => void
  onViewDetails?: (trip: Trip) => void
  isLoading: boolean
}

export function TripList({ trips, onComplete, onDelete, onViewDetails, isLoading }: TripListProps) {
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

  if (trips.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma viagem encontrada</h3>
          <p className="text-muted-foreground">Comece adicionando uma nova viagem à sua frota.</p>
        </CardContent>
      </Card>
    )
  }

  const formatDateTime = (date: string, time: string) => {
    return new Date(`${date}T${time}`).toLocaleString("pt-BR")
  }

  const getStatusBadge = (status: Trip["status"]) => {
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
      {trips.map((trip) => (
        <Card key={trip.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(trip.status)}
                <span className="text-sm text-muted-foreground">{formatDateTime(trip.startDate, trip.startTime)}</span>
              </div>
              <div className="flex gap-2">
                {onViewDetails && (
                  <Button size="sm" variant="outline" onClick={() => onViewDetails(trip)} className="h-8">
                    Ver Detalhes
                  </Button>
                )}
                {trip.status === "in_progress" && (
                  <Button size="sm" onClick={() => onComplete(trip)} className="h-8">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Finalizar
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(trip.id)}
                  className="h-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{trip.truckPlate}</p>
                  <p className="text-xs text-muted-foreground">Caminhão</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{trip.driverName}</p>
                  <p className="text-xs text-muted-foreground">Motorista</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{trip.startLocation}</p>
                  <p className="text-xs text-muted-foreground">Origem</p>
                </div>
              </div>

              {trip.endLocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{trip.endLocation}</p>
                    <p className="text-xs text-muted-foreground">Destino</p>
                  </div>
                </div>
              )}
            </div>

            {(trip.weightTons || trip.freightValue || trip.netProfit !== undefined) && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {trip.weightTons && (
                    <div className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{trip.weightTons} t</p>
                        <p className="text-xs text-muted-foreground">Peso</p>
                      </div>
                    </div>
                  )}

                  {trip.freightValue && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">R$ {trip.freightValue.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Valor do Frete</p>
                      </div>
                    </div>
                  )}

                  {trip.totalExpenses !== undefined && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">R$ {trip.totalExpenses.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Despesas</p>
                      </div>
                    </div>
                  )}

                  {trip.netProfit !== undefined && (
                    <div className="flex items-center gap-2">
                      <DollarSign className={`h-4 w-4 ${trip.netProfit >= 0 ? "text-green-600" : "text-red-600"}`} />
                      <div>
                        <p className={`text-sm font-medium ${trip.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                          R$ {trip.netProfit.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Lucro Líquido</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">KM Inicial:</span>
                  <p className="font-medium">{trip.startKm.toLocaleString()}</p>
                </div>
                {trip.endKm && (
                  <>
                    <div>
                      <span className="text-muted-foreground">KM Final:</span>
                      <p className="font-medium">{trip.endKm.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">KM Percorridos:</span>
                      <p className="font-medium text-primary">{(trip.endKm - trip.startKm).toLocaleString()}</p>
                    </div>
                  </>
                )}
                {trip.endDate && trip.endTime && (
                  <div>
                    <span className="text-muted-foreground">Finalizada em:</span>
                    <p className="font-medium">{formatDateTime(trip.endDate, trip.endTime)}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
