"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Trip } from "@/hooks/use-trips"

interface CompleteTripProps {
  trip: Trip
  onSubmit: (data: {
    endLocation: string
    endKm: number
    endDate: string
    endTime: string
  }) => void
  onCancel: () => void
  isLoading: boolean
}

export function CompleteTrip({ trip, onSubmit, onCancel, isLoading }: CompleteTripProps) {
  const [formData, setFormData] = useState({
    endLocation: "",
    endKm: "",
    endDate: "",
    endTime: "",
  })

  // Preencher data e hora atuais por padrão
  useEffect(() => {
    const now = new Date()
    const date = now.toISOString().split("T")[0]
    const time = now.toTimeString().slice(0, 5)

    setFormData((prev) => ({
      ...prev,
      endDate: date,
      endTime: time,
    }))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.endLocation || !formData.endKm) {
      return
    }

    const endKmValue = Number.parseInt(formData.endKm, 10)

    if (isNaN(endKmValue) || endKmValue <= trip.startKm) {
      alert("A quilometragem final deve ser maior que a inicial")
      return
    }

    onSubmit({
      endLocation: formData.endLocation,
      endKm: endKmValue,
      endDate: formData.endDate,
      endTime: formData.endTime,
    })
  }

  const kmTraveled = formData.endKm ? Number.parseInt(formData.endKm, 10) - trip.startKm : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finalizar Viagem</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Informações da Viagem</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Caminhão:</span> {trip.truckPlate}
            </div>
            <div>
              <span className="text-muted-foreground">Motorista:</span> {trip.driverName}
            </div>
            <div>
              <span className="text-muted-foreground">Saída:</span> {trip.startLocation}
            </div>
            <div>
              <span className="text-muted-foreground">KM Inicial:</span> {trip.startKm.toLocaleString()}
            </div>
            <div>
              <span className="text-muted-foreground">Data/Hora Saída:</span>{" "}
              {new Date(`${trip.startDate}T${trip.startTime}`).toLocaleString("pt-BR")}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Dados de Chegada</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endLocation">Local de Chegada</Label>
                <Input
                  id="endLocation"
                  value={formData.endLocation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endLocation: e.target.value }))}
                  placeholder="Ex: Rio de Janeiro - RJ"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endKm">Quilometragem Final</Label>
                <Input
                  id="endKm"
                  type="number"
                  step="1"
                  value={formData.endKm}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData((prev) => ({ ...prev, endKm: value }))
                  }}
                  placeholder="Ex: 150500"
                  min={trip.startKm + 1}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Chegada</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  min={trip.startDate}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">Horário de Chegada</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>

              {kmTraveled > 0 && (
                <div className="space-y-2">
                  <Label>Quilômetros Percorridos</Label>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <span className="text-lg font-semibold text-primary">{kmTraveled.toLocaleString()} km</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Finalizando..." : "Finalizar Viagem"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
