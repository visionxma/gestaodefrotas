"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Truck {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  color: string
  status: "active" | "maintenance" | "inactive"
  mileage: number
  userId: string
}

export function useTrucks() {
  const { user } = useAuth()
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] useTrucks - user:", user)
    console.log("[v0] useTrucks - user.id:", user?.id)

    if (user) {
      const trucksQuery = query(collection(db, "trucks"), where("userId", "==", user.id))
      console.log("[v0] useTrucks - criando query para userId:", user.id)

      const unsubscribe = onSnapshot(
        trucksQuery,
        (snapshot) => {
          console.log("[v0] useTrucks - snapshot recebido, docs:", snapshot.docs.length)
          const trucksData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Truck[]

          setTrucks(trucksData)
          setIsLoading(false)
        },
        (error) => {
          console.error("[v0] useTrucks - Erro ao carregar caminhões:", error)
          console.error("[v0] useTrucks - Error code:", error.code)
          console.error("[v0] useTrucks - Error message:", error.message)
          setTrucks([])
          setIsLoading(false)
        },
      )

      return () => unsubscribe()
    } else {
      console.log("[v0] useTrucks - usuário não autenticado")
      setTrucks([])
      setIsLoading(false)
    }
  }, [user])

  const addTruck = async (truckData: Omit<Truck, "id" | "userId">) => {
    if (!user) return false

    try {
      await addDoc(collection(db, "trucks"), {
        ...truckData,
        userId: user.id,
        createdAt: new Date(),
      })
      return true
    } catch (error) {
      console.error("Erro ao adicionar caminhão:", error)
      return false
    }
  }

  const updateTruck = async (id: string, truckData: Partial<Omit<Truck, "id" | "userId">>) => {
    try {
      const truckRef = doc(db, "trucks", id)
      await updateDoc(truckRef, {
        ...truckData,
        updatedAt: new Date(),
      })
      return true
    } catch (error) {
      console.error("Erro ao atualizar caminhão:", error)
      return false
    }
  }

  const deleteTruck = async (id: string) => {
    try {
      const truckRef = doc(db, "trucks", id)
      await deleteDoc(truckRef)
      return true
    } catch (error) {
      console.error("Erro ao deletar caminhão:", error)
      return false
    }
  }

  return {
    trucks,
    isLoading,
    addTruck,
    updateTruck,
    deleteTruck,
  }
}
