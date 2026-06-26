'use client'

import { useState } from 'react'
import { useFetch } from '@/hooks/use-fetch'
import { myScheduleApi } from '@/lib/api'
import { TimetableGrid } from '@/components/timetable/timetable-grid'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

export default function LecturerSchedulePage() {
  const [day, setDay] = useState<Day | 'all'>('all')

  const { data: entries, isLoading, error } = useFetch(
    () => myScheduleApi.getSchedule(day === 'all' ? undefined : day),
    [day],
  )

  const allSlots = entries
    ? [...new Map(entries.map((e) => [e.time_slot.id, e.time_slot])).values()]
    : []

  return (
    <div className="space-y-6">
      <PageHeader title="My Schedule" description="Your published teaching timetable" />

      <div className="flex items-center gap-3">
        <Select value={day} onValueChange={(v) => setDay(v as Day | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Days</SelectItem>
            {DAYS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : error ? (
        <EmptyState icon={CalendarDays} title="No published timetable" description="Your timetable will appear here once the admin publishes a schedule." />
      ) : !entries?.length ? (
        <EmptyState icon={CalendarDays} title="No sessions scheduled" description="You have no sessions in the selected period." />
      ) : (
        <TimetableGrid entries={entries} slots={allSlots} />
      )}
    </div>
  )
}
