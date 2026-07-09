'use client'

import { useEffect } from 'react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { clearAuth } from '@/lib/auth'

export function AuthInitializer() {
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => {
        // If the token is invalid/expired, wipe the cookies so the proxy
        // stops seeing a stale token and redirecting the user in a loop.
        clearAuth()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [setUser, setLoading])

  return null
}
