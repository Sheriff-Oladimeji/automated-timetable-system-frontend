'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useFetch } from '@/hooks/use-fetch'
import { timeSlotsApi } from '@/lib/api'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, Plus, Trash2 } from 'lucide-react'
import type { Day } from '@/types'

const DAYS: { value: Day; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
]

function AddTimeSlotDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState<Day | ''>('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [duration, setDuration] = useState('60')
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsPending(true)
    try {
      await timeSlotsApi.create({
        day: day as Day,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: Number(duration),
      })
      toast.success('Time slot created')
      setDay('')
      setStartTime('')
      setEndTime('')
      setDuration('60')
      setOpen(false)
      onCreated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create time slot')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="mr-2 size-4" />Add Time Slot</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Time Slot</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Day</Label>
            <Select value={day} onValueChange={(v) => setDay(v as Day)}>
              <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
              <SelectContent>{DAYS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ts-start">Start (HH:MM)</Label>
              <Input id="ts-start" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="08:00" pattern="\d{2}:\d{2}" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ts-end">End (HH:MM)</Label>
              <Input id="ts-end" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="10:00" pattern="\d{2}:\d{2}" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ts-dur">Duration (minutes)</Label>
            <Input id="ts-dur" type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !day}>{isPending ? 'Creating…' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function TimeSlotsPage() {
  const { data: slots, isLoading, refresh } = useFetch(timeSlotsApi.list)

  async function handleDelete(id: number, label: string) {
    await timeSlotsApi.remove(id)
    toast.success(`Time slot "${label}" deleted`)
    refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Time Slots" description="Schedulable periods in the academic week" action={<AddTimeSlotDialog onCreated={refresh} />} />

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : !slots?.length ? (
        <EmptyState icon={Clock} title="No time slots yet" description="Add time slots to define when courses can be scheduled" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="capitalize font-medium">{s.day}</TableCell>
                  <TableCell>{s.start_time}</TableCell>
                  <TableCell>{s.end_time}</TableCell>
                  <TableCell className="text-muted-foreground">{s.duration_minutes} min</TableCell>
                  <TableCell>
                    <ConfirmDialog
                      trigger={<Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="size-4" /></Button>}
                      title="Delete time slot"
                      description={`Delete ${s.day} ${s.start_time}–${s.end_time}?`}
                      onConfirm={() => handleDelete(s.id, `${s.day} ${s.start_time}–${s.end_time}`)}
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
