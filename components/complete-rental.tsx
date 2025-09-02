"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Rental } from "@/hooks/use-rentals"

interface CompleteRentalProps {
  rental: Rental
  onSubmit: (data: {
    endLocation: string
    finalHours: number
    endDate: string
  }) => void
  onCancel: () => void
  isLoading: boolean
}

export function CompleteRental({ rental, onSubmit, onCancel, isLoading }: CompleteRentalProps) {
  const [formData, setFormData] = useState({
    endLocation: "",
    finalHours: "",
    endDate: "",
  })

  // Preencher data atual por padrão
  useEffect(() => {
    const now = new Date()
    const date = now.toISOString().split("T")[0]

    setFormData((prev) => ({
      ...prev,
      endDate: date,
    }))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.endLocation || !formData.finalHours) {
      return
    }

    const finalHoursValue = Number.parseFloat(formData.finalHours)

    if (isNaN(finalHoursValue) || finalHoursValue <= rental.initialHours) {
      alert("O horímetro final deve ser maior que o inicial")
      return
    }

    onSubmit({
      endLocation: formData.endLocation,
      finalHours: finalHoursValue,
      endDate: formData.endDate,
    })
  }

  const hoursWorked = formData.finalHours ? Number.parseFloat(formData.finalHours) - rental.initialHours : 0
  const totalValue = hoursWorked * rental.hourlyRate

  // Calcular dias trabalhados
  const startDate = new Date(rental.date)
  const endDate = new Date(formData.endDate)
  const timeDiff = endDate.getTime() - startDate.getTime()
  const workingDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finalizar Locação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Informações da Locação</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Máquina:</span> {rental.machinerySerial}
            </div>
            <div>
              <span className="text-muted-foreground">Motorista:</span> {rental.driverName}
            </div>
            <div>
              <span className="text-muted-foreground">Saída:</span> {rental.startLocation}
            </div>
            <div>
              <span className="text-muted-foreground">Horímetro Inicial:</span> {rental.initialHours.toLocaleString()} h
            </div>
            <div>
              <span className="text-muted-foreground">Data Início:</span>{" "}
              {new Date(rental.date).toLocaleDateString("pt-BR")}
            </div>
            <div>
              <span className="text-muted-foreground">Valor/Hora:</span> R$ {rental.hourlyRate.toFixed(2)}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Dados de Encerramento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endLocation">Local de Entrega *</Label>
                <Input
                  id="endLocation"
                  value={formData.endLocation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endLocation: e.target.value }))}
                  placeholder="Ex: Rio de Janeiro - RJ"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="finalHours">Horímetro Final *</Label>
                <Input
                  id="finalHours"
                  type="number"
                  step="0.1"
                  value={formData.finalHours}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData((prev) => ({ ...prev, finalHours: value }))
                  }}
                  placeholder="Ex: 1650.5"
                  min={rental.initialHours + 0.1}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Encerramento *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                  min={rental.date}
                  required
                />
              </div>

              {hoursWorked > 0 && (
                <div className="space-y-2">
                  <Label>Resumo da Locação</Label>
                  <div className="p-3 bg-primary/10 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Horas Trabalhadas:</span>
                      <span className="font-semibold">{hoursWorked.toFixed(1)} h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Dias Trabalhados:</span>
                      <span className="font-semibold">{workingDays} dias</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Horas Efetivas:</span>
                      <span className="font-semibold">{workingDays * 8} h</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-primary border-t pt-2">
                      <span>Valor Total:</span>
                      <span>R$ {totalValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Finalizando..." : "Finalizar Locação"}
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