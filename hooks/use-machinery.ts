"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Machinery {
  id: string
  model: string
  brand: string
  serialNumber: string
  year: number
  type: "tractor" | "excavator" | "loader" | "bulldozer" | "crane" | "other"
  status: "active" | "maintenance" | "inactive"
  hours: number // Horímetro
  userId: string
  createdAt?: Date
  updatedAt?: Date
}

export function useMachinery() {
  const { user } = useAuth()
  const [machinery, setMachinery] = useState<Machinery[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] useMachinery - user:", user)
    console.log("[v0] useMachinery - user.id:", user?.id)

    if (user) {
      const machineryQuery = query(collection(db, "machinery"), where("userId", "==", user.id))
      console.log("[v0] useMachinery - criando query para userId:", user.id)

      const unsubscribe = onSnapshot(
        machineryQuery,
        (snapshot) => {
          console.log("[v0] useMachinery - snapshot recebido, docs:", snapshot.docs.length)
          const machineryData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Machinery[]

          setMachinery(machineryData)
          setIsLoading(false)
        },
        (error) => {
          console.error("[v0] useMachinery - Erro ao carregar máquinas:", error)
          console.error("[v0] useMachinery - Error code:", error.code)
          console.error("[v0] useMachinery - Error message:", error.message)
          setMachinery([])
          setIsLoading(false)
        },
      )

      return () => unsubscribe()
    } else {
      console.log("[v0] useMachinery - usuário não autenticado")
      setMachinery([])
      setIsLoading(false)
    }
  }, [user])

  const addMachinery = async (machineryData: Omit<Machinery, "id" | "userId">) => {
    if (!user) return false

    try {
      await addDoc(collection(db, "machinery"), {
        ...machineryData,
        userId: user.id,
        createdAt: new Date(),
      })
      return true
    } catch (error) {
      console.error("Erro ao adicionar máquina:", error)
      return false
    }
  }

  const updateMachinery = async (id: string, machineryData: Partial<Omit<Machinery, "id" | "userId">>) => {
    try {
      const machineryRef = doc(db, "machinery", id)
      await updateDoc(machineryRef, {
        ...machineryData,
        updatedAt: new Date(),
      })
      return true
    } catch (error) {
      console.error("Erro ao atualizar máquina:", error)
      return false
    }
  }

  const deleteMachinery = async (id: string) => {
    try {
      const machineryRef = doc(db, "machinery", id)
      await deleteDoc(machineryRef)
      return true
    } catch (error) {
      console.error("Erro ao deletar máquina:", error)
      return false
    }
  }

  return {
    machinery,
    isLoading,
    addMachinery,
    updateMachinery,
    deleteMachinery,
  }
}