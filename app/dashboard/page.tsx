"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCards } from "@/components/stats-cards"
import { RevenueExpenseChart } from "@/components/revenue-expense-chart"
import { RecentTransactions } from "@/components/recent-transactions"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral da sua frota e finanças</p>
          </div>

          <StatsCards />

          <div className="grid gap-6 md:grid-cols-2">
            <RevenueExpenseChart />
            <RecentTransactions />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
