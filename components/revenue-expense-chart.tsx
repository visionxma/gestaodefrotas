"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useTransactions } from "@/hooks/use-transactions"

const chartConfig = {
  receita: {
    label: "Receita",
    color: "#dc2626", // Usando cor vermelha da paleta
  },
  despesa: {
    label: "Despesa",
    color: "#374151", // Usando cor escura da paleta
  },
}

interface RevenueExpenseChartProps {
  period?: string
  truckFilter?: string | null
  driverFilter?: string | null
}

export function RevenueExpenseChart({
  period = "6m",
  truckFilter = null,
  driverFilter = null,
}: RevenueExpenseChartProps) {
  const { getFilteredChartData } = useTransactions()
  const chartData = getFilteredChartData(period, truckFilter, driverFilter)

  const getDescription = () => {
    switch (period) {
      case "7d":
        return "Últimos 7 dias"
      case "30d":
        return "Últimos 30 dias"
      case "3m":
        return "Últimos 3 meses"
      case "6m":
        return "Últimos 6 meses"
      case "1y":
        return "Último ano"
      default:
        return "Todo período"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receitas vs Despesas</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              <Bar dataKey="receita" fill="#dc2626" radius={4} />
              <Bar dataKey="despesa" fill="#374151" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
