'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { roleDashboardPath } from '@/lib/auth'
import { Skeleton } from '@/components/ui/skeleton'

export default function RootPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    router.replace(user ? roleDashboardPath(user.role) : '/login')
  }, [user, isLoading, router])

  return (
    <div className="flex h-full items-center justify-center">
      <Skeleton className="h-8 w-48" />
    </div>
  )
}
