"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface User {
  id: string
  name: string
  email: string
  company: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, company: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("[v0] AuthProvider - iniciando onAuthStateChanged")

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log("[v0] AuthProvider - onAuthStateChanged triggered, firebaseUser:", firebaseUser)
      console.log("[v0] AuthProvider - firebaseUser.uid:", firebaseUser?.uid)

      if (firebaseUser) {
        try {
          // Buscar dados adicionais do usuário no Firestore
          console.log("[v0] AuthProvider - buscando dados do usuário no Firestore")
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          console.log("[v0] AuthProvider - userDoc exists:", userDoc.exists())

          if (userDoc.exists()) {
            const userData = userDoc.data()
            console.log("[v0] AuthProvider - userData:", userData)

            const user = {
              id: firebaseUser.uid,
              name: userData.name,
              email: firebaseUser.email!,
              company: userData.company,
            }
            console.log("[v0] AuthProvider - setting user:", user)
            setUser(user)
          } else {
            console.log("[v0] AuthProvider - documento do usuário não encontrado")
            setUser(null)
          }
        } catch (error) {
          console.error("[v0] AuthProvider - erro ao buscar dados do usuário:", error)
          setUser(null)
        }
      } else {
        console.log("[v0] AuthProvider - usuário não autenticado")
        setUser(null)
      }
      setIsLoading(false)
      console.log("[v0] AuthProvider - isLoading set to false")
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string, company: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Salvar dados adicionais no Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        name,
        company,
        createdAt: new Date().toISOString(),
      })

      return true
    } catch (error) {
      console.error("Erro no registro:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Erro no logout:", error)
    }
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
