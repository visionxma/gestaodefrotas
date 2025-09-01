"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { useTransactions, type Transaction } from "@/hooks/use-transactions"
import { useToast } from "@/hooks/use-toast"
import { usePdfReports } from "@/hooks/use-pdf-reports"

export default function FinancePage() {
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction } = useTransactions()
  const { toast } = useToast()
  const { generateFinanceReport } = usePdfReports()

  const handleSubmit = async (data: Omit<Transaction, "id" | "userId">) => {
    setIsSubmitting(true)

    try {
      let success = false

      if (editingTransaction) {
        success = await updateTransaction(editingTransaction.id, data)
        if (success) {
          toast({
            title: "Transação atualizada",
            description: "A transação foi atualizada com sucesso.",
          })
        }
      } else {
        success = await addTransaction(data)
        if (success) {
          toast({
            title: "Transação adicionada",
            description: "A transação foi registrada com sucesso.",
          })
        }
      }

      if (success) {
        setShowForm(false)
        setEditingTransaction(null)
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao salvar a transação. Tente novamente.",
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

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteTransaction(id)
      if (success) {
        toast({
          title: "Transação excluída",
          description: "A transação foi removida com sucesso.",
        })
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir a transação. Tente novamente.",
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
    setEditingTransaction(null)
  }

  const handleDownloadPDF = () => {
    generateFinanceReport(transactions)
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Financeiro</h1>
              <p className="text-muted-foreground">Controle suas receitas e despesas</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDownloadPDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Transação
                </Button>
              )}
            </div>
          </div>

          {showForm ? (
            <TransactionForm
              transaction={editingTransaction || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          ) : (
            <TransactionList
              transactions={transactions}
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
