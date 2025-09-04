"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
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
  isAuthenticating: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)

  const loadUserData = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
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
        return true
      } else {
        console.log("[v0] AuthProvider - documento do usuário não encontrado")
        setUser(null)
        return false
      }
    } catch (error) {
      console.error("[v0] AuthProvider - erro ao buscar dados do usuário:", error)
      setUser(null)
      return false
    }
  }, [])
  useEffect(() => {
    console.log("[v0] AuthProvider - iniciando onAuthStateChanged")

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log("[v0] AuthProvider - onAuthStateChanged triggered, firebaseUser:", firebaseUser)
      console.log("[v0] AuthProvider - firebaseUser.uid:", firebaseUser?.uid)

      if (firebaseUser) {
        await loadUserData(firebaseUser)
      } else {
        console.log("[v0] AuthProvider - usuário não autenticado")
        setUser(null)
      }
      
      if (!authInitialized) {
        setAuthInitialized(true)
      }
      setIsLoading(false)
      console.log("[v0] AuthProvider - isLoading set to false")
    })

    return () => unsubscribe()
  }, [loadUserData, authInitialized])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (isAuthenticating) return false
    
    setIsAuthenticating(true)
    try {
      console.log("[v0] AuthProvider - iniciando login para:", email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log("[v0] AuthProvider - login bem-sucedido")
      
      // Carregar dados do usuário imediatamente após o login
      const success = await loadUserData(userCredential.user)
      if (!success) {
        console.error("[v0] AuthProvider - falha ao carregar dados do usuário após login")
        await signOut(auth)
        return false
      }
      
      return true
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    } finally {
      setIsAuthenticating(false)
    }
  }, [isAuthenticating, loadUserData])

  const register = useCallback(async (name: string, email: string, password: string, company: string): Promise<boolean> => {
    if (isAuthenticating) return false
    
    setIsAuthenticating(true)
    try {
      console.log("[v0] AuthProvider - iniciando registro para:", email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Salvar dados adicionais no Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        name,
        company,
        createdAt: new Date().toISOString(),
      })

      // Carregar dados do usuário imediatamente após o registro
      await loadUserData(firebaseUser)
      console.log("[v0] AuthProvider - registro bem-sucedido")
      
      return true
    } catch (error) {
      console.error("Erro no registro:", error)
      return false
    } finally {
      setIsAuthenticating(false)
    }
  }, [isAuthenticating, loadUserData])

  const logout = useCallback(async () => {
    try {
      console.log("[v0] AuthProvider - fazendo logout")
      setUser(null) // Limpar estado imediatamente
      await signOut(auth)
    } catch (error) {
      console.error("Erro no logout:", error)
    }
  }, [])

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
        isAuthenticating,
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
