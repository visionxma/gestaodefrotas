"use client"

import { useState, useMemo } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"
import { MachineryForm } from "@/components/machinery-form"
import { MachineryList } from "@/components/machinery-list"
import { useMachinery, type Machinery } from "@/hooks/use-machinery"
import { useToast } from "@/hooks/use-toast"
import { SearchFilter } from "@/components/search-filter"
import { usePdfReports } from "@/hooks/use-pdf-reports"

export default function MachineryPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingMachinery, setEditingMachinery] = useState<Machinery | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const { machinery, isLoading, addMachinery, updateMachinery, deleteMachinery } = useMachinery()
  const { toast } = useToast()
  const { generateMachineryReport } = usePdfReports()

  const handleSubmit = async (data: Omit<Machinery, "id" | "userId">) => {
    setIsSubmitting(true)

    try {
      let success = false

      if (editingMachinery) {
        success = await updateMachinery(editingMachinery.id, data)
        if (success) {
          toast({
            title: "Máquina atualizada",
            description: "As informações da máquina foram atualizadas com sucesso.",
          })
        }
      } else {
        success = await addMachinery(data)
        if (success) {
          toast({
            title: "Máquina adicionada",
            description: "A máquina foi adicionada à sua frota com sucesso.",
          })
        }
      }

      if (success) {
        setShowForm(false)
        setEditingMachinery(null)
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao salvar a máquina. Tente novamente.",
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

  const handleEdit = (machine: Machinery) => {
    setEditingMachinery(machine)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteMachinery(id)
      if (success) {
        toast({
          title: "Máquina excluída",
          description: "A máquina foi removida da sua frota.",
        })
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir a máquina. Tente novamente.",
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
    setEditingMachinery(null)
  }

  const handleDownloadPDF = () => {
    generateMachineryReport(machinery)
  }

  const filteredMachinery = useMemo(() => {
    return machinery.filter((machine) => {
      const matchesSearch =
        machine.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.brand.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || machine.status === statusFilter
      const matchesType = typeFilter === "all" || machine.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [machinery, searchTerm, statusFilter, typeFilter])

  const handleClearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setTypeFilter("all")
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="mobile-spacing">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
            <div>
              <h1 className="font-bold text-balance">Máquinas Pesadas</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Gerencie sua frota de máquinas pesadas</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {!showForm && (
                <>
                  <Button onClick={handleDownloadPDF} variant="outline" className="h-10 sm:h-9">
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Baixar PDF</span>
                  </Button>
                  <Button onClick={() => setShowForm(true)} className="h-10 sm:h-9">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    Nova Máquina
                  </Button>
                </>
              )}
            </div>
          </div>

          {!showForm && (
            <SearchFilter
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Pesquisar por série, modelo ou marca..."
              filters={[
                {
                  label: "Status",
                  value: statusFilter,
                  options: [
                    { label: "Ativa", value: "active" },
                    { label: "Manutenção", value: "maintenance" },
                    { label: "Inativa", value: "inactive" },
                  ],
                  onChange: setStatusFilter,
                },
                {
                  label: "Tipo",
                  value: typeFilter,
                  options: [
                    { label: "Trator", value: "tractor" },
                    { label: "Retroescavadeira", value: "excavator" },
                    { label: "Carregadeira", value: "loader" },
                    { label: "Bulldozer", value: "bulldozer" },
                    { label: "Guindaste", value: "crane" },
                    { label: "Outros", value: "other" },
                  ],
                  onChange: setTypeFilter,
                },
              ]}
              onClearFilters={handleClearFilters}
            />
          )}

          {showForm ? (
            <MachineryForm
              machinery={editingMachinery || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          ) : (
            <MachineryList
              machinery={filteredMachinery}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}