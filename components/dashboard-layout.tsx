"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Truck, Users, DollarSign, BarChart3, LogOut, Menu, X, MapPin, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Caminhões", href: "/trucks", icon: Truck },
  { name: "Máquinas", href: "/machinery", icon: Settings },
  { name: "Motoristas", href: "/drivers", icon: Users },
  { name: "Viagens", href: "/trips", icon: MapPin },
  { name: "Financeiro", href: "/finance", icon: DollarSign },
  { name: "Configurações", href: "/settings", icon: Settings },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg">
<img src="https://i.imgur.com/e9kut4B.png" alt="ICONFROTAS Logo" className="h-8 w-8" />              </div>
              <span className="text-lg font-bold text-sidebar-foreground">Controle de Frotas</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-sidebar-border p-4">
            <div className="mb-3">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate">{user?.company}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
