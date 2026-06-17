'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import apiClient from '@/lib/api-client'

interface User {
  id: string
  email: string
  name?: string
  role: string
  followingNgoIds?: string[]
  recentSearchTerms?: string[]
  photoURL?: string
  displayName?: string
  emailVerified?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name?: string, role?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing token on mount
    const token = apiClient.getToken()
    if (token) {
      loadUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const response = await apiClient.getCurrentUser()
      setUser(response.user)
      setError(null)
    } catch (err) {
      console.error('Failed to load user:', err)
      apiClient.clearToken()
      setError('Failed to load user')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.login(email, password)
      setUser(response.user)
    } catch (err: any) {
      setError(err.message || 'Login failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name?: string, role?: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.signup(email, password, name, role)
      setUser(response.user)
    } catch (err: any) {
      setError(err.message || 'Signup failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    apiClient.clearToken()
    setUser(null)
    setError(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      error,
      login,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
