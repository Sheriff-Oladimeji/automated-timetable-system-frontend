'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CalendarDays, Loader2, ShieldCheck } from 'lucide-react'

export default function SetupPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Guard: redirect to login if an admin already exists
  useEffect(() => {
    authApi.setupStatus().then(({ needs_setup }) => {
      if (!needs_setup) {
        router.replace('/login?setup=exists')
      } else {
        setChecking(false)
      }
    }).catch(() => setChecking(false))
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await authApi.registerAdmin(email, password)
      router.push('/login?setup=done')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Setup failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (checking) return null

  return (
    <div className="flex min-h-full items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight">CSET Timetable</span>
          </div>
          <p className="text-sm text-muted-foreground">First-time setup</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5" /> Create Admin Account
            </CardTitle>
            <CardDescription>
              This can only be done once. After this, use the admin panel to manage all accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="s-email">Admin Email</Label>
                <Input
                  id="s-email"
                  type="email"
                  placeholder="admin@cset.edu.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-pw">Password</Label>
                <Input
                  id="s-pw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-cpw">Confirm Password</Label>
                <Input
                  id="s-cpw"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Create Admin Account
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
