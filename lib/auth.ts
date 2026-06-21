import type { UserRole } from '@/types'

const TOKEN_KEY = 'auth_token'
const ROLE_KEY = 'auth_role'

export function saveAuth(token: string, role: UserRole) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, role)
  // Mirror in cookie so Next.js middleware can read it for redirects
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24}`
  document.cookie = `${ROLE_KEY}=${role}; path=/; max-age=${60 * 60 * 24}`
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
  document.cookie = `${ROLE_KEY}=; path=/; max-age=0`
}

export function getStoredRole(): UserRole | null {
  if (typeof window === 'undefined') return null
  return (localStorage.getItem(ROLE_KEY) as UserRole) ?? null
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(localStorage.getItem(TOKEN_KEY))
}

export function roleDashboardPath(role: UserRole): string {
  if (role === 'admin') return '/admin'
  if (role === 'lecturer') return '/lecturer'
  return '/student'
}
