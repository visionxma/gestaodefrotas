"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
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
  updateUserData: (name: string, company: string) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
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

  const updateUserData = async (name: string, company: string): Promise<boolean> => {
    if (!user) return false

    try {
      // Atualizar no Firestore
      await updateDoc(doc(db, "users", user.id), {
        name,
        company,
        updatedAt: new Date().toISOString(),
      })

      // Atualizar estado local
      setUser({
        ...user,
        name,
        company,
      })

      return true
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error)
      return false
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (error) {
      console.error("Erro ao enviar email de recuperação:", error)
      return false
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!auth.currentUser || !user) return false

    try {
      // Reautenticar o usuário com a senha atual
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Atualizar para a nova senha
      await updatePassword(auth.currentUser, newPassword)
      return true
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUserData,
        resetPassword,
        changePassword,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
