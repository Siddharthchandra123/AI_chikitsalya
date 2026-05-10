"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type AuthUser = {
  id: string
  name: string
  mobile?: string
  role?: string
  token?: string
}

type AuthContextType = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const STORAGE_KEY = "medicare-auth-user"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const savedUser = window.localStorage.getItem(STORAGE_KEY)
    if (!savedUser) {
      return
    }

    try {
      const parsedUser = JSON.parse(savedUser) as AuthUser
      if (!parsedUser?.token) {
        window.localStorage.removeItem(STORAGE_KEY)
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      fetch(`${apiUrl}/auth/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${parsedUser.token}`,
        },
      })
        .then((response) => response.json())
        .then((result) => {
          if (result?.valid && result.user) {
            setUser({ ...result.user, token: parsedUser.token })
          } else {
            window.localStorage.removeItem(STORAGE_KEY)
          }
        })
        .catch(() => {
          window.localStorage.removeItem(STORAGE_KEY)
        })
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const login = (userData: AuthUser) => {
    setUser(userData)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  }

  const logout = () => {
    if (user?.token) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      }).finally(() => {
        setUser(null)
        window.localStorage.removeItem(STORAGE_KEY)
      })
      return
    }

    setUser(null)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
