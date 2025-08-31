"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useTransactions } from "@/hooks/use-transactions"
import { useTrucks } from "@/hooks/use-trucks"
import { useDrivers } from "@/hooks/use-drivers"

export function RecentTransactions() {
  const { transactions } = useTransactions()
  const { trucks } = useTrucks()
  const { drivers } = useDrivers()

  const recentTransactions = transactions.slice(0, 5)

  const getTruckName = (truckId?: string) => {
    if (!truckId) return null
    const truck = trucks.find((t) => t.id === truckId)
    return truck ? `${truck.plate}` : null
  }

  const getDriverName = (driverId?: string) => {
    if (!driverId) return null
    const driver = drivers.find((d) => d.id === driverId)
    return driver?.name || null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
        <CardDescription>Últimas movimentações financeiras</CardDescription>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma transação registrada ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.type === "receita" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {transaction.type === "receita" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {getTruckName(transaction.truckId) || getDriverName(transaction.driverId) || "Geral"} •{" "}
                      {new Date(transaction.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${transaction.type === "receita" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "receita" ? "+" : "-"}R${" "}
                    {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <Badge variant={transaction.type === "receita" ? "default" : "secondary"} className="text-xs">
                    {transaction.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
