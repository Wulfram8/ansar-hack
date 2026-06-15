import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { login as apiLogin } from '@/lib/api'

interface AuthContextType {
  token: string | null
  username: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'))
  const [username, setUsername] = useState<string | null>(localStorage.getItem('auth_username'))

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }, [token])

  useEffect(() => {
    if (username) {
      localStorage.setItem('auth_username', username)
    } else {
      localStorage.removeItem('auth_username')
    }
  }, [username])

  const login = async (user: string, password: string) => {
    const res = await apiLogin(user, password)
    setToken(res.data.token)
    setUsername(user)
  }

  const logout = () => {
    setToken(null)
    setUsername(null)
  }

  return (
    <AuthContext.Provider value={{ token, username, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
