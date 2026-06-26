'use client'

import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { saveAuth, clearAuth, roleDashboardPath } from '@/lib/auth'
import { useAuthStore } from '@/store/auth'

export function useAuth() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const setUser = useAuthStore((s) => s.setUser)

  async function login(email: string, password: string) {
    const token = await authApi.login(email, password)
    saveAuth(token.access_token, token.role)
    const me = await authApi.me()
    setUser(me)
    router.push(roleDashboardPath(token.role))
  }

  function logout() {
    clearAuth()
    setUser(null)
    router.push('/login')
  }

  return { user, isLoading, login, logout }
}
