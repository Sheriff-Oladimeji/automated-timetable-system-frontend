'use client'

import { useAuth } from '@/hooks/use-auth'
import { useFetch } from '@/hooks/use-fetch'
import { coursesApi, lecturersApi, roomsApi, schedulerApi, facultiesApi, departmentsApi, timeSlotsApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, CalendarDays, DoorOpen, Users, School, Building2, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const { data: faculties, isLoading: loadingF } = useFetch(facultiesApi.list)
  const { data: departments, isLoading: loadingD } = useFetch(departmentsApi.list)
  const { data: courses, isLoading: loadingC } = useFetch(coursesApi.list)
  const { data: lecturers, isLoading: loadingL } = useFetch(lecturersApi.list)
  const { data: rooms, isLoading: loadingR } = useFetch(roomsApi.list)
  const { data: timeSlots, isLoading: loadingT } = useFetch(timeSlotsApi.list)
  const { data: runs, isLoading: loadingRuns } = useFetch(schedulerApi.listRuns)

  const publishedRun = runs?.find((r) => r.is_published)
  const latestRun = runs?.[0]

  const stats = [
    { label: 'Faculties', value: faculties?.length, icon: School, href: '/admin/faculties', loading: loadingF },
    { label: 'Departments', value: departments?.length, icon: Building2, href: '/admin/departments', loading: loadingD },
    { label: 'Courses', value: courses?.length, icon: BookOpen, href: '/admin/courses', loading: loadingC },
    { label: 'Lecturers', value: lecturers?.length, icon: Users, href: '/admin/lecturers', loading: loadingL },
    { label: 'Rooms', value: rooms?.length, icon: DoorOpen, href: '/admin/rooms', loading: loadingR },
    { label: 'Time Slots', value: timeSlots?.length, icon: Clock, href: '/admin/timeslots', loading: loadingT },
    { label: 'Scheduler Runs', value: runs?.length, icon: CalendarDays, href: '/admin/scheduler', loading: loadingRuns },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {user?.email}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href, loading }) => (
          <Link key={label} href={href}>
            <Card className="transition-shadow hover:shadow-md cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription>{label}</CardDescription>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{value ?? 0}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Published Timetable</CardTitle>
            <CardDescription>Currently visible to lecturers and students</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRuns ? (
              <Skeleton className="h-10 w-full" />
            ) : publishedRun ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Run #{publishedRun.id}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {publishedRun.status} · {publishedRun.computation_seconds?.toFixed(1)}s
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/timetable">View</Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No timetable published.{' '}
                <Link href="/admin/scheduler" className="underline">
                  Run the scheduler
                </Link>{' '}
                to generate one.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Run</CardTitle>
            <CardDescription>Most recent scheduling attempt</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRuns ? (
              <Skeleton className="h-10 w-full" />
            ) : latestRun ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Run #{latestRun.id}</p>
                  <Badge
                    variant={
                      latestRun.status === 'optimal'
                        ? 'default'
                        : latestRun.status === 'feasible'
                          ? 'secondary'
                          : latestRun.status === 'running' || latestRun.status === 'pending'
                            ? 'outline'
                            : 'destructive'
                    }
                    className="capitalize"
                  >
                    {latestRun.status}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/scheduler">Scheduler</Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No runs yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
