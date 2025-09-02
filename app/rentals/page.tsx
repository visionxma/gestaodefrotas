"use client"

import { useState, useMemo } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"
import { RentalForm } from "@/components/rental-form"
import { RentalList } from "@/components/rental-list"
import { CompleteRental } from "@/components/complete-rental"
import { RentalDetails } from "@/components/rental-details"
import { useRentals, type Rental } from "@/hooks/use-rentals"
import { useToast } from "@/hooks/use-toast"
import { SearchFilter } from "@/components/search-filter"
import { usePdfReports } from "@/hooks/use-pdf-reports"

export default function RentalsPage() {
  const [showForm, setShowForm] = useState(false)
  const [showCompleteForm, setShowCompleteForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [completingRental, setCompletingRental] = useState<Rental | null>(null)
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { rentals, isLoading, addRental, completeRental, deleteRental } = useRentals()
  const { toast } = useToast()
  const { generateRentalsReport } = usePdfReports()

  const handleSubmit = async (data: Omit<Rental, "id" | "userId" | "status">) => {
    setIsSubmitting(true)

    try {
      const success = await addRental(data)
      if (success) {
        toast({
          title: "Locação iniciada",
          description: "A locação foi registrada com sucesso.",
        })
        setShowForm(false)
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao iniciar a locação. Tente novamente.",
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

  const handleComplete = (rental: Rental) => {
    setCompletingRental(rental)
    setShowCompleteForm(true)
  }

  const handleCompleteSubmit = async (endData: {
    endLocation: string
    finalHours: number
    endDate: string
  }) => {
    if (!completingRental) return

    setIsSubmitting(true)

    try {
      const success = await completeRental(completingRental.id, endData)
      if (success) {
        toast({
          title: "Locação finalizada",
          description: "A locação foi finalizada com sucesso.",
        })
        setShowCompleteForm(false)
        setCompletingRental(null)
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao finalizar a locação. Tente novamente.",
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
      const success = await deleteRental(id)
      if (success) {
        toast({
          title: "Locação excluída",
          description: "A locação foi removida do sistema.",
        })
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir a locação. Tente novamente.",
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

  const handleViewDetails = (rental: Rental) => {
    setSelectedRental(rental)
    setShowDetails(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setShowCompleteForm(false)
    setShowDetails(false)
    setCompletingRental(null)
    setSelectedRental(null)
  }

  const handleDownloadPDF = () => {
    generateRentalsReport(rentals)
  }

  const filteredRentals = useMemo(() => {
    return rentals.filter((rental) => {
      const matchesSearch =
        rental.machinerySerial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rental.endLocation && rental.endLocation.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "all" || rental.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [rentals, searchTerm, statusFilter])

  const handleClearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="mobile-spacing">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
            <div>
              <h1 className="font-bold text-balance">Locações</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Gerencie as locações de máquinas pesadas</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {!showForm && !showCompleteForm && !showDetails && (
                <>
                  <Button onClick={handleDownloadPDF} variant="outline" className="h-10 sm:h-9">
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Baixar PDF</span>
                  </Button>
                  <Button onClick={() => setShowForm(true)} className="h-10 sm:h-9">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    Nova Locação
                  </Button>
                </>
              )}
            </div>
          </div>

          {!showForm && !showCompleteForm && !showDetails && (
            <SearchFilter
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Pesquisar por máquina, motorista ou local..."
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
            <RentalForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isSubmitting} />
          ) : showCompleteForm && completingRental ? (
            <CompleteRental
              rental={completingRental}
              onSubmit={handleCompleteSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          ) : showDetails && selectedRental ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  ← Voltar
                </Button>
              </div>
              <RentalDetails rental={selectedRental} />
            </div>
          ) : (
            <RentalList
              rentals={filteredRentals}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
              isLoading={isLoading}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}