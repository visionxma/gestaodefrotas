"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, User, MapPin, Calendar, Clock, DollarSign } from "lucide-react"
import type { Rental } from "@/hooks/use-rentals"
import { useRentals } from "@/hooks/use-rentals"

interface RentalDetailsProps {
  rental: Rental
}

export function RentalDetails({ rental }: RentalDetailsProps) {
  const { calculateRentalStats } = useRentals()
  const stats = calculateRentalStats(rental)

  return (
    <div className="space-y-6">
      {/* Informações básicas da locação */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Locação #{rental.id.slice(-6)}
            </CardTitle>
            <Badge variant={rental.status === "completed" ? "default" : "secondary"}>
              {rental.status === "completed" ? "Finalizada" : "Em Andamento"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <span>{rental.machinerySerial}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>{rental.driverName}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{rental.startLocation}</span>
              {rental.endLocation && <span> → {rental.endLocation}</span>}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{rental.date}</span>
              {rental.endDate && <span> → {rental.endDate}</span>}
            </div>
          </div>

          {rental.status === "completed" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3 bg-blue-50 rounded-md">
                <div className="text-sm font-medium text-blue-800">Horas Trabalhadas</div>
                <div className="text-lg font-semibold text-blue-900">{stats.totalHours} h</div>
              </div>
              <div className="p-3 bg-green-50 rounded-md">
                <div className="text-sm font-medium text-green-800 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Dias Trabalhados
                </div>
                <div className="text-lg font-semibold text-green-900">{stats.workingDays} dias</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-md">
                <div className="text-sm font-medium text-purple-800 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Horas Efetivas
                </div>
                <div className="text-lg font-semibold text-purple-900">{stats.effectiveHours} h</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-md">
                <div className="text-sm font-medium text-yellow-800 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Valor Total
                </div>
                <div className="text-lg font-semibold text-yellow-900">R$ {stats.totalValue.toFixed(2)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Informações Financeiras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Valor por Hora</div>
              <div className="text-xl font-bold text-gray-900">R$ {rental.hourlyRate.toFixed(2)}</div>
            </div>
            
            {rental.status === "completed" && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-600">Receita Total</div>
                <div className="text-xl font-bold text-green-900">R$ {stats.totalValue.toFixed(2)}</div>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              Para gerenciar despesas e receitas relacionadas a esta locação, utilize o módulo{" "}
              <strong>Financeiro</strong> e associe as transações a esta locação.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}