'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi, ApiError, studentApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, Loader2 } from 'lucide-react'
import { useFetch } from '@/hooks/use-fetch'

const LEVELS = [100, 200, 300, 400, 500, 600, 700]
const MATRIC_RE = /^\d{4}\/\d{5}$/

export default function RegisterPage() {
  const router = useRouter()
  const { data: departments, isLoading: loadingDepts, error: deptsError } = useFetch(studentApi.getDepartments)

  const [fields, setFields] = useState({
    email: '',
    password: '',
    confirm: '',
    matric_number: '',
    department_id: '',
    level: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function set(k: keyof typeof fields, v: string) {
    setFields((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!MATRIC_RE.test(fields.matric_number)) {
      setError('Matric number must be in the format YYYY/NNNNN (e.g. 2020/15210)')
      return
    }
    if (fields.password !== fields.confirm) {
      setError('Passwords do not match')
      return
    }
    if (fields.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await authApi.registerStudent({
        email: fields.email,
        password: fields.password,
        matric_number: fields.matric_number,
        department_id: Number(fields.department_id),
        level: Number(fields.level),
      })
      router.push('/login?registered=1')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const noDepts = !loadingDepts && !deptsError && departments?.length === 0
  const canSubmit = !isSubmitting && !!fields.department_id && !!fields.level && !noDepts

  return (
    <div className="flex min-h-full items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight">CSET Timetable</span>
          </div>
          <p className="text-sm text-muted-foreground">Student Registration</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Register with your matric number to view your class timetable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {deptsError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Could not load departments — make sure the server is running.
                  </AlertDescription>
                </Alert>
              )}

              {noDepts && (
                <Alert>
                  <AlertDescription>
                    No departments available yet. Ask the admin to add departments first.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="r-email">Email</Label>
                <Input
                  id="r-email"
                  type="email"
                  placeholder="your@email.com"
                  value={fields.email}
                  onChange={(e) => set('email', e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="r-matric">Matric Number</Label>
                <Input
                  id="r-matric"
                  placeholder="e.g. 2020/15210"
                  value={fields.matric_number}
                  onChange={(e) => set('matric_number', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Format: YYYY/NNNNN</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  {loadingDepts ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={fields.department_id}
                      onValueChange={(v) => set('department_id', v)}
                      disabled={!departments?.length}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={departments?.length ? 'Select' : 'None yet'} />
                      </SelectTrigger>
                      <SelectContent>
                        {departments?.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={fields.level} onValueChange={(v) => set('level', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => (
                        <SelectItem key={l} value={String(l)}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="r-pw">Password</Label>
                <Input
                  id="r-pw"
                  type="password"
                  value={fields.password}
                  onChange={(e) => set('password', e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="r-cpw">Confirm Password</Label>
                <Input
                  id="r-cpw"
                  type="password"
                  value={fields.confirm}
                  onChange={(e) => set('confirm', e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                Create Account
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
