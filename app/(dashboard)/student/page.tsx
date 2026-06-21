'use client'

import { useState } from 'react'
import { useFetch } from '@/hooks/use-fetch'
import { studentApi } from '@/lib/api'
import { TimetableGrid } from '@/components/timetable/timetable-grid'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays } from 'lucide-react'
import type { Day } from '@/types'

const DAYS: { value: Day; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
]

const LEVELS = [100, 200, 300, 400, 500, 600, 700]

export default function StudentTimetablePage() {
  const { data: departments, isLoading: loadingDepts } = useFetch(studentApi.getDepartments)

  const [deptId, setDeptId] = useState<string>('')
  const [level, setLevel] = useState<string>('')
  const [day, setDay] = useState<Day | 'all'>('all')

  const { data: entries, isLoading: loadingEntries } = useFetch(
    () => {
      if (!deptId || !level) return Promise.resolve([])
      return studentApi.getTimetable({
        department_id: Number(deptId),
        level: Number(level),
        day: day === 'all' ? undefined : day,
      })
    },
  )

  const allSlots = entries
    ? [...new Map(entries.map((e) => [e.time_slot.id, e.time_slot])).values()]
    : []

  const hasFilter = Boolean(deptId && level)

  return (
    <div className="space-y-6">
      <PageHeader title="My Timetable" description="View your published class schedule" />

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label>Department</Label>
          {loadingDepts ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <Select value={deptId} onValueChange={setDeptId}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments?.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => (
                <SelectItem key={l} value={String(l)}>
                  {l} Level
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Day</Label>
          <Select value={day} onValueChange={(v) => setDay(v as Day | 'all')}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              {DAYS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!hasFilter ? (
        <EmptyState
          icon={CalendarDays}
          title="Select your department and level"
          description="Choose your department and level above to view your timetable."
        />
      ) : loadingEntries ? (
        <Skeleton className="h-80 w-full" />
      ) : !entries?.length ? (
        <EmptyState
          icon={CalendarDays}
          title="No sessions found"
          description="No published timetable entries for the selected filters."
        />
      ) : (
        <TimetableGrid entries={entries} slots={allSlots} />
      )}
    </div>
  )
}
