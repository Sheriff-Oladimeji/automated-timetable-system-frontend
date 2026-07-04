'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useFetch } from '@/hooks/use-fetch'
import { schedulerApi, timetableApi, timeSlotsApi } from '@/lib/api'
import { TimetableGrid } from '@/components/timetable/timetable-grid'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { CalendarDays } from 'lucide-react'
import type { ScheduleEntryOut } from '@/types'

export default function TimetablePage() {
  const { data: runs, isLoading: loadingRuns, refresh: refreshRuns } = useFetch(schedulerApi.listRuns)
  const { data: slots, isLoading: loadingSlots } = useFetch(timeSlotsApi.list)
  const [selectedRunId, setSelectedRunId] = useState<string>('')
  const [entries, setEntries] = useState<ScheduleEntryOut[] | null>(null)
  const [loadingEntries, setLoadingEntries] = useState(false)

  const completedRuns = runs?.filter((r) => r.status === 'optimal' || r.status === 'feasible') ?? []
  const selectedRun = runs?.find((r) => r.id === Number(selectedRunId))

  async function loadEntries(runId: string) {
    setSelectedRunId(runId)
    setLoadingEntries(true)
    try {
      setEntries(await timetableApi.getEntries(Number(runId)))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load timetable')
    } finally {
      setLoadingEntries(false)
    }
  }

  async function handlePublish() {
    if (!selectedRun) return
    try {
      if (selectedRun.is_published) {
        await timetableApi.unpublish(selectedRun.id)
        toast.success('Timetable unpublished')
      } else {
        await timetableApi.publish(selectedRun.id)
        toast.success('Timetable published — lecturers and students can now see it')
      }
      refreshRuns()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    }
  }

  const isLoading = loadingRuns || loadingSlots

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable"
        description="View, edit, and publish generated timetables"
        action={
          selectedRun && (
            <Button
              variant={selectedRun.is_published ? 'outline' : 'default'}
              onClick={handlePublish}
            >
              {selectedRun.is_published ? 'Unpublish' : 'Publish Timetable'}
            </Button>
          )
        }
      />

      <div className="flex items-center gap-4">
        {isLoading ? (
          <Skeleton className="h-10 w-64" />
        ) : (
          <Select value={selectedRunId} onValueChange={loadEntries}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a scheduling run" />
            </SelectTrigger>
            <SelectContent>
              {completedRuns.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  Run #{r.id} — {r.status}
                  {r.is_published ? ' (published)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {selectedRun?.is_published && <Badge>Published</Badge>}
      </div>

      {loadingEntries ? (
        <Skeleton className="h-96 w-full" />
      ) : !selectedRunId ? (
        <EmptyState
          icon={CalendarDays}
          title="Select a run to view the timetable"
          description="Choose a completed scheduling run from the dropdown above"
        />
      ) : !entries?.length ? (
        <EmptyState icon={CalendarDays} title="No entries in this run" />
      ) : (
        <TimetableGrid entries={entries} slots={slots ?? []} />
      )}
    </div>
  )
}
