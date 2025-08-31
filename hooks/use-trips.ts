"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { collection, query, where, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

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
  status: "in_progress" | "completed"
  userId: string
}

export function useTrips() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      const tripsQuery = query(collection(db, "trips"), where("userId", "==", user.id), orderBy("startDate", "desc"))

      const unsubscribe = onSnapshot(
        tripsQuery,
        (snapshot) => {
          const tripsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Trip[]

          setTrips(tripsData)
          setIsLoading(false)
        },
        (error) => {
          console.error("Erro ao carregar viagens:", error)
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
      await addDoc(collection(db, "trips"), {
        ...tripData,
        status: "in_progress",
        userId: user.id,
        createdAt: new Date(),
      })
      return true
    } catch (error) {
      console.error("Erro ao adicionar viagem:", error)
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

  const completeTrip = async (
    id: string,
    endData: { endLocation: string; endKm: number; endDate: string; endTime: string },
  ) => {
    try {
      const tripRef = doc(db, "trips", id)
      await updateDoc(tripRef, {
        ...endData,
        status: "completed",
        updatedAt: new Date(),
      })
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
  }
}
