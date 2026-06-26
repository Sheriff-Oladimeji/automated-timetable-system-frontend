import { create } from 'zustand'
import type { UserOut } from '@/types'

interface AuthState {
  user: UserOut | null
  isLoading: boolean
  setUser: (user: UserOut | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}))
