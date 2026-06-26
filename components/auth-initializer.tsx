'use client'

import { useEffect } from 'react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'

export function AuthInitializer() {
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [setUser, setLoading])

  return null
}
