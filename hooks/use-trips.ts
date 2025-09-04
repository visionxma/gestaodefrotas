"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useTrucks } from "./use-trucks"

export interface Trip {
  id: string
  truckId: string
  truckPlate: string
  driverId: string
  driverName: string
  startLocation: string
  endLocation?: string
  startKm: number
  endKm?: number
  startDate: string
  startTime: string
  endDate?: string
  endTime?: string
  fuelLiters?: number
  fuelConsumption?: number // Litros por KM
  status: "in_progress" | "completed"
  userId: string
}

export function useTrips() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { updateTruck } = useTrucks()

  useEffect(() => {
    if (user) {
      console.log("[v0] useTrips - user:", user)
      console.log("[v0] useTrips - user.id:", user.id)
      console.log("[v0] useTrips - criando query para userId:", user.id)

      const tripsQuery = query(collection(db, "trips"), where("userId", "==", user.id))

      const unsubscribe = onSnapshot(
        tripsQuery,
        (snapshot) => {
          console.log("[v0] useTrips - snapshot recebido, docs:", snapshot.docs.length)
          const tripsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Trip[]

          tripsData.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

          setTrips(tripsData)
          setIsLoading(false)
        },
        (error) => {
          console.error("Erro ao carregar viagens:", error)
          console.log("[v0] useTrips - Error code:", error.code)
          console.log("[v0] useTrips - Error message:", error.message)
          setTrips([])
          setIsLoading(false)
        },
      )

      return () => unsubscribe()
    } else {
      setTrips([])
      setIsLoading(false)
    }
  }, [user])

  const addTrip = async (tripData: Omit<Trip, "id" | "userId" | "status">) => {
    if (!user) return false

    try {
      console.log("[v0] useTrips - addTrip chamado com:", tripData)
      console.log("[v0] useTrips - user.id:", user.id)

      const docData = {
        ...tripData,
        status: "in_progress" as const,
        userId: user.id,
        createdAt: new Date(),
      }

      console.log("[v0] useTrips - dados para salvar:", docData)

      await addDoc(collection(db, "trips"), docData)
      console.log("[v0] useTrips - viagem adicionada com sucesso")
      return true
    } catch (error) {
      console.error("Erro ao adicionar viagem:", error)
      console.log("[v0] useTrips - Error code:", (error as any).code)
      console.log("[v0] useTrips - Error message:", (error as any).message)
      return false
    }
  }

  const updateTrip = async (id: string, tripData: Partial<Omit<Trip, "id" | "userId">>) => {
    try {
      const tripRef = doc(db, "trips", id)
      await updateDoc(tripRef, {
        ...tripData,
        updatedAt: new Date(),
      })
      return true
    } catch (error) {
      console.error("Erro ao atualizar viagem:", error)
      return false
    }
  }

  const calculateTripDuration = (startDate: string, startTime: string, endDate?: string, endTime?: string) => {
    if (!endDate || !endTime) return { hours: 0, days: 0 }

    const start = new Date(`${startDate}T${startTime}`)
    const end = new Date(`${endDate}T${endTime}`)

    const diffMs = end.getTime() - start.getTime()
    const hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100 // 2 casas decimais
    const days = Math.round((diffMs / (1000 * 60 * 60 * 24)) * 100) / 100 // 2 casas decimais

    return { hours, days }
  }

  const completeTrip = async (
    id: string,
    endData: {
      endLocation: string
      endKm: number
      endDate: string
      endTime: string
      fuelLiters: number
    },
  ) => {
    try {
      const currentTrip = trips.find((trip) => trip.id === id)
      if (!currentTrip) {
        console.error("Viagem não encontrada para atualização")
        return false
      }

      const kmTraveled = endData.endKm - currentTrip.startKm
      const fuelConsumption = kmTraveled > 0 ? endData.fuelLiters / kmTraveled : 0
      const tripRef = doc(db, "trips", id)
      await updateDoc(tripRef, {
        endLocation: endData.endLocation,
        endKm: endData.endKm,
        endDate: endData.endDate,
        endTime: endData.endTime,
        fuelLiters: endData.fuelLiters,
        fuelConsumption: Math.round(fuelConsumption * 1000) / 1000, // 3 casas decimais
        status: "completed",
        updatedAt: new Date(),
      })

      if (kmTraveled > 0) {
        console.log(`[v0] Atualizando quilometragem do caminhão ${currentTrip.truckId} com +${kmTraveled} km`)

        // Usar a quilometragem final da viagem como nova quilometragem do caminhão
        await updateTruck(currentTrip.truckId, { mileage: endData.endKm })
        console.log(`[v0] Quilometragem do caminhão atualizada para ${endData.endKm} km`)
      }

      return true
    } catch (error) {
      console.error("Erro ao finalizar viagem:", error)
      return false
    }
  }

  const deleteTrip = async (id: string) => {
    try {
      const tripRef = doc(db, "trips", id)
      await deleteDoc(tripRef)
      return true
    } catch (error) {
      console.error("Erro ao deletar viagem:", error)
      return false
    }
  }

  return {
    trips,
    isLoading,
    addTrip,
    updateTrip,
    completeTrip,
    deleteTrip,
    calculateTripDuration,
  }
}
