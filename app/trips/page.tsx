"use client"

import { useState, useMemo } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TripForm } from "@/components/trip-form"
import { TripList } from "@/components/trip-list"
import { CompleteTrip } from "@/components/complete-trip"
import { useTrips, type Trip } from "@/hooks/use-trips"
import { useToast } from "@/hooks/use-toast"
import { SearchFilter } from "@/components/search-filter"

export default function TripsPage() {
  const [showForm, setShowForm] = useState(false)
  const [showCompleteForm, setShowCompleteForm] = useState(false)
  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { trips, isLoading, addTrip, completeTrip, deleteTrip } = useTrips()
  const { toast } = useToast()

  const handleSubmit = async (data: Omit<Trip, "id" | "userId" | "status">) => {
    setIsSubmitting(true)

    try {
      const success = await addTrip(data)
      if (success) {
        toast({
          title: "Viagem iniciada",
          description: "A viagem foi registrada com sucesso.",
        })
        setShowForm(false)
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao iniciar a viagem. Tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleComplete = (trip: Trip) => {
    setCompletingTrip(trip)
    setShowCompleteForm(true)
  }

  const handleCompleteSubmit = async (endData: {
    endLocation: string
    endKm: number
    endDate: string
    endTime: string
  }) => {
    if (!completingTrip) return

    setIsSubmitting(true)

    try {
      const success = await completeTrip(completingTrip.id, endData)
      if (success) {
        toast({
          title: "Viagem finalizada",
          description: "A viagem foi finalizada com sucesso.",
        })
        setShowCompleteForm(false)
        setCompletingTrip(null)
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao finalizar a viagem. Tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteTrip(id)
      if (success) {
        toast({
          title: "Viagem excluída",
          description: "A viagem foi removida do sistema.",
        })
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir a viagem. Tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setShowCompleteForm(false)
    setCompletingTrip(null)
  }

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        trip.truckPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trip.endLocation && trip.endLocation.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "all" || trip.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [trips, searchTerm, statusFilter])

  const handleClearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Viagens</h1>
              <p className="text-muted-foreground">Gerencie as viagens da sua frota</p>
            </div>
            {!showForm && !showCompleteForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Viagem
              </Button>
            )}
          </div>

          {!showForm && !showCompleteForm && (
            <SearchFilter
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Pesquisar por placa, motorista ou local..."
              filters={[
                {
                  label: "Status",
                  value: statusFilter,
                  options: [
                    { label: "Em Andamento", value: "in_progress" },
                    { label: "Finalizada", value: "completed" },
                  ],
                  onChange: setStatusFilter,
                },
              ]}
              onClearFilters={handleClearFilters}
            />
          )}

          {showForm ? (
            <TripForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isSubmitting} />
          ) : showCompleteForm && completingTrip ? (
            <CompleteTrip
              trip={completingTrip}
              onSubmit={handleCompleteSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          ) : (
            <TripList trips={filteredTrips} onComplete={handleComplete} onDelete={handleDelete} isLoading={isLoading} />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
