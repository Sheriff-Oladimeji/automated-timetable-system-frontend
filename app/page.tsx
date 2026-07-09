'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { roleDashboardPath } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CalendarDays, Clock, BookOpen, Users, Building2,
  CheckCircle2, GraduationCap, UserCheck,
} from 'lucide-react'

const FEATURES = [
  { icon: CalendarDays, title: 'Automated Scheduling', desc: 'CP-SAT constraint solver generates conflict-free timetables in seconds.' },
  { icon: BookOpen, title: 'Course Management', desc: 'Manage faculties, departments, courses, rooms, and time slots from one place.' },
  { icon: Users, title: 'Lecturer Assignments', desc: 'Assign lecturers to courses and mark their unavailable time slots.' },
  { icon: Clock, title: 'Constraint-Aware', desc: 'No double-bookings, no room-type mismatches, no back-to-back clashes.' },
  { icon: Building2, title: 'Room Allocation', desc: 'Match lecture halls, seminar rooms, and labs to appropriate course types.' },
  { icon: CheckCircle2, title: 'Live Timetable', desc: 'Publish instantly — lecturers and students see their schedules immediately.' },
]

const ROLES = [
  {
    icon: UserCheck,
    role: 'Lecturer',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    description: 'View your weekly teaching schedule and mark the time slots when you are unavailable.',
    actions: (
      <Button className="w-full" asChild>
        <Link href="/login/lecturer">Sign In as Lecturer</Link>
      </Button>
    ),
    note: 'Login credentials are provided by the administrator.',
  },
  {
    icon: GraduationCap,
    role: 'Student',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    border: 'border-violet-200 dark:border-violet-800',
    description: 'Register with your matric number and view your department\'s published timetable.',
    actions: (
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/login/student">Sign In</Link>
        </Button>
        <Button className="flex-1" asChild>
          <Link href="/register">Register</Link>
        </Button>
      </div>
    ),
    note: 'Self-registration is open — use your matric number.',
  },
]

export default function LandingPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(roleDashboardPath(user.role))
    }
  }, [user, isLoading, router])

  if (isLoading) return null

  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2 font-semibold">
            <CalendarDays className="size-5 text-primary" />
            CSET Timetable
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/register">Register</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/login/student">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-16 text-center">
        <Badge variant="secondary" className="text-xs">
          UNIOSUN · College of Science, Engineering and Technology
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Automated Timetable<br />Scheduling System
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Eliminate scheduling conflicts for good. CSET's constraint-based
          scheduler assigns courses, rooms, and lecturers automatically — no
          more manual spreadsheets.
        </p>
      </section>

      {/* Role cards */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <p className="mb-6 text-center text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Who are you?
        </p>
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto w-full">
          {ROLES.map(({ icon: Icon, role, color, bg, border, description, actions, note }) => (
            <div key={role} className={`rounded-xl border ${border} ${bg} p-6 flex flex-col gap-4`}>
              <div className="flex items-center gap-2">
                <Icon className={`size-5 ${color}`} />
                <h2 className="font-semibold">{role}</h2>
              </div>
              <p className="text-sm text-muted-foreground flex-1">{description}</p>
              {actions}
              <p className="text-xs text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Features */}
      <section className="mx-auto grid max-w-5xl gap-5 px-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-3 mb-2">
          <h2 className="text-xl font-semibold">How it works</h2>
        </div>
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-lg border bg-card p-5 shadow-sm">
            <Icon className="mb-3 size-5 text-primary" />
            <h3 className="mb-1 font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CSET, UNIOSUN · Automated Timetable System
      </footer>
    </div>
  )
}
