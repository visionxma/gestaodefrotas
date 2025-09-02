"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Users, TrendingUp, MapPin, Fuel, Settings } from "lucide-react"
import { useTrucks } from "@/hooks/use-trucks"
import { useDrivers } from "@/hooks/use-drivers"
import { useTransactions } from "@/hooks/use-transactions"
import { useTrips } from "@/hooks/use-trips"
import { useMachinery } from "@/hooks/use-machinery"
import { useRentals } from "@/hooks/use-rentals"

interface EnhancedStatsCardsProps {
  period: string
  truckFilter: string | null
  driverFilter: string | null
}

export function EnhancedStatsCards({ period, truckFilter, driverFilter }: EnhancedStatsCardsProps) {
  const { trucks } = useTrucks()
  const { drivers } = useDrivers()
  const { machinery } = useMachinery()
  const { getFilteredStats } = useTransactions()
  const { trips } = useTrips()
  const { rentals } = useRentals()

  const filteredTrucks = truckFilter ? trucks.filter((t) => t.id === truckFilter) : trucks
  const filteredDrivers = driverFilter ? drivers.filter((d) => d.id === driverFilter) : drivers
  const filteredTrips = trips.filter((trip) => {
    if (truckFilter && trip.truckId !== truckFilter) return false
    if (driverFilter && trip.driverId !== driverFilter) return false
    return true
  })

  const { revenue, expenses, profit } = getFilteredStats(period, truckFilter, driverFilter)

  console.log("[v0] EnhancedStatsCards - revenue:", revenue)
  console.log("[v0] EnhancedStatsCards - expenses:", expenses)
  console.log("[v0] EnhancedStatsCards - profit:", profit)

  const activeTrips = filteredTrips.filter((trip) => trip.status === "in_progress").length
  const completedTrips = filteredTrips.filter((trip) => trip.status === "completed").length
  const totalKm = filteredTrips
    .filter((trip) => trip.status === "completed")
    .reduce((sum, trip) => sum + (trip.endKm - trip.startKm), 0)

  const activeRentals = rentals.filter((rental) => rental.status === "in_progress").length
  const completedRentals = rentals.filter((rental) => rental.status === "completed").length

  const revenueChange = Math.random() * 20 - 10 // Simulação de variação
  const profitChange = Math.random() * 30 - 15

  return (
    <div className="responsive-stats-grid gap-3 sm:gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Caminhões</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{filteredTrucks.length}</div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {filteredTrucks.filter((t) => t.status === "active").length} ativos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Máquinas</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{machinery.length}</div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {machinery.filter((m) => m.status === "active").length} ativas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Locações</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{activeRentals}</div>
          <p className="text-xs sm:text-sm text-muted-foreground">{completedRentals} finalizadas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Motoristas</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{filteredDrivers.length}</div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {filteredDrivers.filter((d) => d.status === "active").length} disponíveis
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Viagens</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{activeTrips}</div>
          <p className="text-xs sm:text-sm text-muted-foreground">{completedTrips} concluídas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">KM Rodados</CardTitle>
          <Fuel className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold">{totalKm.toLocaleString()}</div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {totalKm > 0 ? (totalKm / Math.max(completedTrips, 1)).toFixed(0) : 0} km/viagem
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Receita</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold text-green-600">R$ {revenue.toLocaleString("pt-BR")}</div>
          <p className={`text-xs sm:text-sm ${revenueChange >= 0 ? "text-green-600" : "text-red-600"}`}>
            {revenueChange >= 0 ? "+" : ""}
            {revenueChange.toFixed(1)}% vs anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Lucro</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="text-xl sm:text-2xl font-bold text-primary">R$ {profit.toLocaleString("pt-BR")}</div>
          <p className={`text-xs sm:text-sm ${profitChange >= 0 ? "text-green-600" : "text-red-600"}`}>
            {profitChange >= 0 ? "+" : ""}
            {profitChange.toFixed(1)}% margem
          </p>
        </CardContent>
      </Card>
    </div>
  )
}