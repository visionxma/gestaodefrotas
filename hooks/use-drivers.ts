"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Driver {
  id: string
  name: string
  cpf: string
  cnh: string
  cnhCategory: string
  cnhExpiry: string
  phone: string
  email?: string
  address?: string
  birthDate: string
  status: "active" | "inactive" | "suspended"
  userId: string
  createdAt?: Date
  updatedAt?: Date
}

export function useDrivers() {
  const { user } = useAuth()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] useDrivers - user:", user)
    console.log("[v0] useDrivers - user.id:", user?.id)

    if (user) {
      const driversQuery = query(collection(db, "drivers"), where("userId", "==", user.id))
      console.log("[v0] useDrivers - criando query para userId:", user.id)

      const unsubscribe = onSnapshot(
        driversQuery,
        (snapshot) => {
          console.log("[v0] useDrivers - snapshot recebido, docs:", snapshot.docs.length)
          const driversData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Driver[]

          setDrivers(driversData)
          setIsLoading(false)
        },
        (error) => {
          console.error("[v0] useDrivers - Erro ao carregar motoristas:", error)
          console.error("[v0] useDrivers - Error code:", error.code)
          console.error("[v0] useDrivers - Error message:", error.message)
          setDrivers([])
          setIsLoading(false)
        },
      )

      return () => unsubscribe()
    } else {
      console.log("[v0] useDrivers - usuário não autenticado")
      setDrivers([])
      setIsLoading(false)
    }
  }, [user])

  const addDriver = async (driverData: Omit<Driver, "id" | "userId">) => {
    if (!user) return false

    try {
      const driversQuery = query(
        collection(db, "drivers"),
        where("userId", "==", user.id),
        where("cpf", "==", driverData.cpf),
      )
      const existingDrivers = await getDocs(driversQuery)

      if (!existingDrivers.empty) {
        return false // CPF já cadastrado
      }

      await addDoc(collection(db, "drivers"), {
        ...driverData,
        userId: user.id,
        createdAt: new Date(),
      })
      return true
    } catch (error) {
      console.error("Erro ao adicionar motorista:", error)
      return false
    }
  }

  const updateDriver = async (id: string, driverData: Partial<Omit<Driver, "id" | "userId">>) => {
    try {
      const driverRef = doc(db, "drivers", id)
      await updateDoc(driverRef, {
        ...driverData,
        updatedAt: new Date(),
      })
      return true
    } catch (error) {
      console.error("Erro ao atualizar motorista:", error)
      return false
    }
  }

  const deleteDriver = async (id: string) => {
    try {
      const driverRef = doc(db, "drivers", id)
      await deleteDoc(driverRef)
      return true
    } catch (error) {
      console.error("Erro ao deletar motorista:", error)
      return false
    }
  }

  return {
    drivers,
    isLoading,
    addDriver,
    updateDriver,
    deleteDriver,
  }
}
