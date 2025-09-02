"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMachinery } from "@/hooks/use-machinery"
import { useDrivers } from "@/hooks/use-drivers"
import type { Rental } from "@/hooks/use-rentals"

interface RentalFormProps {
  onSubmit: (data: Omit<Rental, "id" | "userId" | "status">) => void
  onCancel: () => void
  isLoading: boolean
}

export function RentalForm({ onSubmit, onCancel, isLoading }: RentalFormProps) {
  const { machinery } = useMachinery()
  const { drivers } = useDrivers()

  const [formData, setFormData] = useState({
    machineryId: "",
    machinerySerial: "",
    driverId: "",
    driverName: "",
    startLocation: "",
    initialHours: "",
    date: "",
    hourlyRate: "",
  })

  useEffect(() => {
    const now = new Date()
    const date = now.toISOString().split("T")[0]

    setFormData((prev) => ({
      ...prev,
      date: date,
    }))
  }, [])

  const availableMachinery = machinery.filter((machine) => machine.status === "active")
  const availableDrivers = drivers.filter((driver) => driver.status === "active")

  const handleMachineryChange = (machineryId: string) => {
    const selectedMachinery = machinery.find((machine) => machine.id === machineryId)
    setFormData((prev) => ({
      ...prev,
      machineryId,
      machinerySerial: selectedMachinery?.serialNumber || "",
      initialHours: selectedMachinery?.hours.toString() || "",
    }))
  }

  const handleDriverChange = (driverId: string) => {
    const selectedDriver = drivers.find((driver) => driver.id === driverId)
    setFormData((prev) => ({
      ...prev,
      driverId,
      driverName: selectedDriver?.name || "",
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.machineryId || !formData.driverId || !formData.startLocation || !formData.initialHours || !formData.hourlyRate) {
      return
    }

    onSubmit({
      machineryId: formData.machineryId,
      machinerySerial: formData.machinerySerial,
      driverId: formData.driverId,
      driverName: formData.driverName,
      startLocation: formData.startLocation,
      initialHours: Number(formData.initialHours),
      date: formData.date,
      hourlyRate: Number(formData.hourlyRate),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Locação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Informações da Locação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="machinery">Máquina *</Label>
                <Select value={formData.machineryId} onValueChange={handleMachineryChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma máquina" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMachinery.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id}>
                        {machine.serialNumber} - {machine.brand} {machine.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver">Motorista *</Label>
                <Select value={formData.driverId} onValueChange={handleDriverChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startLocation">Local de Saída *</Label>
                <Input
                  id="startLocation"
                  value={formData.startLocation}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startLocation: e.target.value }))}
                  placeholder="Ex: São Paulo - SP"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialHours">Horímetro Inicial *</Label>
                <Input
                  id="initialHours"
                  type="number"
                  step="0.1"
                  value={formData.initialHours}
                  onChange={(e) => setFormData((prev) => ({ ...prev, initialHours: e.target.value }))}
                  placeholder="Ex: 1500.5"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Valor da Hora (R$) *</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hourlyRate: e.target.value }))}
                  placeholder="Ex: 150.00"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Iniciar Locação"}
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