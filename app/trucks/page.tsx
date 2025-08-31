"use client"

import { useState, useMemo } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TruckForm } from "@/components/truck-form"
import { TruckList } from "@/components/truck-list"
import { useTrucks, type Truck } from "@/hooks/use-trucks"
import { useToast } from "@/hooks/use-toast"
import { SearchFilter } from "@/components/search-filter"

export default function TrucksPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { trucks, isLoading, addTruck, updateTruck, deleteTruck } = useTrucks()
  const { toast } = useToast()

  const handleSubmit = async (data: Omit<Truck, "id" | "userId">) => {
    setIsSubmitting(true)

    try {
      let success = false

      if (editingTruck) {
        success = await updateTruck(editingTruck.id, data)
        if (success) {
          toast({
            title: "Caminhão atualizado",
            description: "As informações do caminhão foram atualizadas com sucesso.",
          })
        }
      } else {
        success = await addTruck(data)
        if (success) {
          toast({
            title: "Caminhão adicionado",
            description: "O caminhão foi adicionado à sua frota com sucesso.",
          })
        }
      }

      if (success) {
        setShowForm(false)
        setEditingTruck(null)
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao salvar o caminhão. Tente novamente.",
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

  const handleEdit = (truck: Truck) => {
    setEditingTruck(truck)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteTruck(id)
      if (success) {
        toast({
          title: "Caminhão excluído",
          description: "O caminhão foi removido da sua frota.",
        })
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o caminhão. Tente novamente.",
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
    setEditingTruck(null)
  }

  const filteredTrucks = useMemo(() => {
    return trucks.filter((truck) => {
      const matchesSearch =
        truck.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        truck.brand.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || truck.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [trucks, searchTerm, statusFilter])

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
              <h1 className="text-3xl font-bold text-balance">Caminhões</h1>
              <p className="text-muted-foreground">Gerencie sua frota de caminhões</p>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Caminhão
              </Button>
            )}
          </div>

          {!showForm && (
            <SearchFilter
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Pesquisar por placa, modelo ou marca..."
              filters={[
                {
                  label: "Status",
                  value: statusFilter,
                  options: [
                    { label: "Ativo", value: "active" },
                    { label: "Manutenção", value: "maintenance" },
                    { label: "Inativo", value: "inactive" },
                  ],
                  onChange: setStatusFilter,
                },
              ]}
              onClearFilters={handleClearFilters}
            />
          )}

          {showForm ? (
            <TruckForm
              truck={editingTruck || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          ) : (
            <TruckList trucks={filteredTrucks} onEdit={handleEdit} onDelete={handleDelete} isLoading={isLoading} />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
