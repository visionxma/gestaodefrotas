"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Transaction {
  id: string
  type: "receita" | "despesa"
  description: string
  amount: number
  date: string
  category: string
  truckId?: string
  driverId?: string
  userId: string
  createdAt?: Date
  updatedAt?: Date
}

export function useTransactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] useTransactions - user:", user)
    console.log("[v0] useTransactions - user.id:", user?.id)

    if (user) {
      const transactionsQuery = query(collection(db, "transactions"), where("userId", "==", user.id))
      console.log("[v0] useTransactions - criando query para userId:", user.id)

      const unsubscribe = onSnapshot(
        transactionsQuery,
        (snapshot) => {
          console.log("[v0] useTransactions - snapshot recebido, docs:", snapshot.docs.length)
          const transactionsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Transaction[]

          transactionsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          setTransactions(transactionsData)
          setIsLoading(false)
        },
        (error) => {
          console.error("[v0] useTransactions - Erro ao carregar transações:", error)
          console.error("[v0] useTransactions - Error code:", error.code)
          console.error("[v0] useTransactions - Error message:", error.message)
          setTransactions([])
          setIsLoading(false)
        },
      )

      return () => unsubscribe()
    } else {
      console.log("[v0] useTransactions - usuário não autenticado")
      setTransactions([])
      setIsLoading(false)
    }
  }, [user])

  const addTransaction = async (transactionData: Omit<Transaction, "id" | "userId">) => {
    if (!user) return false

    try {
      const cleanData = Object.fromEntries(
        Object.entries({
          ...transactionData,
          userId: user.id,
          createdAt: new Date(),
        }).filter(([_, value]) => value !== undefined),
      )

      await addDoc(collection(db, "transactions"), cleanData)
      return true
    } catch (error) {
      console.error("Erro ao adicionar transação:", error)
      return false
    }
  }

  const updateTransaction = async (id: string, transactionData: Partial<Omit<Transaction, "id" | "userId">>) => {
    try {
      const cleanData = Object.fromEntries(
        Object.entries({
          ...transactionData,
          updatedAt: new Date(),
        }).filter(([_, value]) => value !== undefined),
      )

      const transactionRef = doc(db, "transactions", id)
      await updateDoc(transactionRef, cleanData)
      return true
    } catch (error) {
      console.error("Erro ao atualizar transação:", error)
      return false
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const transactionRef = doc(db, "transactions", id)
      await deleteDoc(transactionRef)
      return true
    } catch (error) {
      console.error("Erro ao deletar transação:", error)
      return false
    }
  }

  const getMonthlyStats = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthlyTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
    })

    const revenue = monthlyTransactions.filter((t) => t.type === "receita").reduce((sum, t) => sum + t.amount, 0)

    const expenses = monthlyTransactions.filter((t) => t.type === "despesa").reduce((sum, t) => sum + t.amount, 0)

    return { revenue, expenses, profit: revenue - expenses }
  }

  const getChartData = () => {
    const last6Months = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate.getMonth() === date.getMonth() && transactionDate.getFullYear() === date.getFullYear()
      })

      const receita = monthTransactions.filter((t) => t.type === "receita").reduce((sum, t) => sum + t.amount, 0)

      const despesa = monthTransactions.filter((t) => t.type === "despesa").reduce((sum, t) => sum + t.amount, 0)

      last6Months.push({
        month: date.toLocaleDateString("pt-BR", { month: "short" }),
        receita,
        despesa,
      })
    }

    return last6Months
  }

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getMonthlyStats,
    getChartData,
  }
}
