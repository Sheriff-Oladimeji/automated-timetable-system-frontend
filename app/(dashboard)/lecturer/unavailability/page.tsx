'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useFetch } from '@/hooks/use-fetch'
import { myScheduleApi, timeSlotsApi } from '@/lib/api'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, Loader2, Trash2 } from 'lucide-react'

export default function LecturerUnavailabilityPage() {
  const { data: records, isLoading: loadingRecords, refresh } = useFetch(myScheduleApi.getUnavailability)
  const { data: slots, isLoading: loadingSlots } = useFetch(timeSlotsApi.list)

  const [slotId, setSlotId] = useState('')
  const [reason, setReason] = useState('')
  const [isPending, setIsPending] = useState(false)

  const slotLabel = (id: number) => {
    const s = slots?.find((s) => s.id === id)
    return s ? `${s.day} ${s.start_time}–${s.end_time}` : '—'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!slotId) return
    setIsPending(true)
    try {
      // lecturer_id will be validated server-side against the JWT
      await myScheduleApi.addUnavailability({
        lecturer_id: 0, // placeholder — server uses JWT identity
        time_slot_id: Number(slotId),
        reason: reason || undefined,
      })
      toast.success('Unavailability recorded')
      setSlotId('')
      setReason('')
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setIsPending(false)
    }
  }

  async function handleDelete(id: number) {
    await myScheduleApi.removeUnavailability(id)
    toast.success('Record removed')
    refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Unavailability"
        description="Tell the scheduler which time slots you cannot teach"
      />

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label>Time Slot</Label>
          {loadingSlots ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <Select value={slotId} onValueChange={setSlotId}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {slots?.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)} className="capitalize">
                    {s.day} {s.start_time}–{s.end_time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lu-reason">Reason (optional)</Label>
          <Input
            id="lu-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Departmental meeting"
            className="w-56"
          />
        </div>

        <Button type="submit" disabled={isPending || !slotId}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          Add
        </Button>
      </form>

      {loadingRecords ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : !records?.length ? (
        <EmptyState
          icon={Clock}
          title="No unavailability set"
          description="You haven't marked any time slots as unavailable yet."
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time Slot</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="capitalize">{slotLabel(r.time_slot_id)}</TableCell>
                  <TableCell className="text-muted-foreground">{r.reason ?? '—'}</TableCell>
                  <TableCell>
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="size-4" />
                        </Button>
                      }
                      title="Remove record"
                      description="Remove this unavailability record?"
                      onConfirm={() => handleDelete(r.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
