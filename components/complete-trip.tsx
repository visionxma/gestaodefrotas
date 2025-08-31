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
  onSubmit: (data: { endLocation: string; endKm: number; endDate: string; endTime: string }) => void
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

    // Validar se a quilometragem final é maior que a inicial
    if (Number(formData.endKm) <= trip.startKm) {
      alert("A quilometragem final deve ser maior que a inicial")
      return
    }

    onSubmit({
      endLocation: formData.endLocation,
      endKm: Number(formData.endKm),
      endDate: formData.endDate,
      endTime: formData.endTime,
    })
  }

  const kmTraveled = formData.endKm ? Number(formData.endKm) - trip.startKm : 0

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

        <form onSubmit={handleSubmit} className="space-y-4">
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
                value={formData.endKm}
                onChange={(e) => setFormData((prev) => ({ ...prev, endKm: e.target.value }))}
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
          </div>

          {kmTraveled > 0 && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium">
                Quilômetros percorridos: <span className="text-primary">{kmTraveled.toLocaleString()} km</span>
              </p>
            </div>
          )}

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
