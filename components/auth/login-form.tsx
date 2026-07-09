'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CalendarDays, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface LoginFormProps {
  title: string
  description: string
  switchLink?: { label: string; href: string; text: string }
  registerLink?: { href: string; text: string }
}

function Toasts() {
  const params = useSearchParams()
  useEffect(() => {
    if (params.get('setup') === 'done') toast.success('Admin account created. Please sign in.')
    if (params.get('setup') === 'exists') toast.info('An admin account already exists. Please sign in.')
    if (params.get('registered') === '1') toast.success('Account created. Please sign in.')
  }, [params])
  return null
}

export function LoginForm({ title, description, switchLink, registerLink }: LoginFormProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-muted/40 px-4">
      <Suspense><Toasts /></Suspense>
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="flex items-center gap-2 font-semibold hover:opacity-80">
            <CalendarDays className="size-7 text-primary" />
            <span className="text-xl font-bold tracking-tight">CSET Timetable</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-2 text-center text-sm text-muted-foreground">
          {registerLink && (
            <p>
              No account?{' '}
              <Link href={registerLink.href} className="underline underline-offset-4 text-foreground">
                {registerLink.text}
              </Link>
            </p>
          )}
          {switchLink && (
            <p>
              {switchLink.label}{' '}
              <Link href={switchLink.href} className="underline underline-offset-4 text-foreground">
                {switchLink.text}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
