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

  // Keep the Render free-tier backend warm — ping every 14 minutes so it
  // never hits the 15-minute inactivity sleep threshold.
  useEffect(() => {
    const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''
    if (!BASE) return
    const id = setInterval(() => {
      fetch(`${BASE}/auth/setup-status`).catch(() => {})
    }, 14 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  return null
}
