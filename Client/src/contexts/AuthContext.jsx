import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('tc_token'))
  const [loading, setLoading] = useState(true)

  // Restore session on mount / token change
  useEffect(() => {
    if (!token) { setLoading(false); return }
    authApi.me(token)
      .then(({ user: u, tailorProfile }) => setUser({ ...u, tailorProfile }))
      .catch(() => {
        localStorage.removeItem('tc_token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = async (email, password) => {
    const data = await authApi.login({ email, password })
    localStorage.setItem('tc_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const register = async (payload) => {
    const data = await authApi.register(payload)
    localStorage.setItem('tc_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('tc_token')
    localStorage.removeItem('tc_location')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    if (!token) return
    try {
      const { user: u, tailorProfile } = await authApi.me(token)
      setUser({ ...u, tailorProfile })
    } catch { /* token expired — let next request handle it */ }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
