import { create } from 'zustand'
import { setToken } from '../services/api'

interface AuthState {
  token: string | null
  user: any | null
  isAuthenticated: boolean
  login: (token: string, user: any) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  login: (token, user) => {
    setToken(token)
    set({ token, user, isAuthenticated: true })
  },
  logout: () => {
    setToken('')
    set({ token: null, user: null, isAuthenticated: false })
  }
}))