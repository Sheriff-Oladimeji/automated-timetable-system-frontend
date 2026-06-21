'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { constraintsApi, lecturersApi, timeSlotsApi } from '@/lib/api'
import { useFetch } from '@/hooks/use-fetch'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Settings, Trash2 } from 'lucide-react'
import type { ConstraintConfig } from '@/types'

function PenaltyWeightsCard() {
  const { data: config, isLoading } = useFetch(constraintsApi.getConfig)
  const [local, setLocal] = useState<ConstraintConfig | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => { if (config) setLocal(config) }, [config])

  function setField(key: keyof ConstraintConfig, value: string) {
    setLocal((c) => c ? { ...c, [key]: Number(value) } : c)
  }

  async function save() {
    if (!local) return
    setIsSaving(true)
    try {
      await constraintsApi.updateConfig(local)
      toast.success('Constraint config saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const fields: { key: keyof ConstraintConfig; label: string; description: string }[] = [
    { key: 'unavailability_penalty', label: 'Unavailability Penalty', description: 'Cost when lecturer scheduled during an unavailable slot' },
    { key: 'back_to_back_penalty', label: 'Back-to-Back Penalty', description: 'Cost per consecutive same-group sessions on the same day' },
    { key: 'spread_sessions_penalty', label: 'Session Spread Penalty', description: 'Cost when a course has 2+ sessions on the same day' },
    { key: 'room_capacity_penalty', label: 'Room Capacity Penalty', description: 'Cost when room capacity is less than enrollment' },
    { key: 'time_limit_seconds', label: 'Solver Time Limit (s)', description: 'Max seconds the solver is allowed to run' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solver Penalty Weights</CardTitle>
        <CardDescription>
          Higher values make the solver work harder to avoid that constraint violation. Changes apply to the next scheduling run.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading || !local ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map(({ key, label, description }) => (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type="number"
                    min="0"
                    value={local[key]}
                    onChange={(e) => setField(key, e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
            <Button onClick={save} disabled={isSaving} className="mt-2">
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function UnavailabilityCard() {
  const { data: records, isLoading: loadingRecords, refresh } = useFetch(constraintsApi.listUnavailability)
  const { data: lecturers } = useFetch(lecturersApi.list)
  const { data: slots } = useFetch(timeSlotsApi.list)
  const [lecturerId, setLecturerId] = useState('')
  const [slotId, setSlotId] = useState('')
  const [reason, setReason] = useState('')
  const [isPending, setIsPending] = useState(false)

  const lecturerName = (id: number) => {
    const l = lecturers?.find((l) => l.id === id)
    return l ? `${l.title} ${l.last_name}` : '—'
  }
  const slotLabel = (id: number) => {
    const s = slots?.find((s) => s.id === id)
    return s ? `${s.day} ${s.start_time}–${s.end_time}` : '—'
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setIsPending(true)
    try {
      await constraintsApi.addUnavailability({
        lecturer_id: Number(lecturerId),
        time_slot_id: Number(slotId),
        reason: reason || undefined,
      })
      toast.success('Unavailability record added')
      setLecturerId('')
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
    await constraintsApi.removeUnavailability(id)
    toast.success('Record removed')
    refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lecturer Unavailability</CardTitle>
        <CardDescription>Mark time slots when lecturers are not available to teach</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Lecturer</Label>
            <Select value={lecturerId} onValueChange={setLecturerId}>
              <SelectTrigger><SelectValue placeholder="Lecturer" /></SelectTrigger>
              <SelectContent>{lecturers?.map((l) => <SelectItem key={l.id} value={String(l.id)}>{l.title} {l.last_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Time Slot</Label>
            <Select value={slotId} onValueChange={setSlotId}>
              <SelectTrigger><SelectValue placeholder="Time slot" /></SelectTrigger>
              <SelectContent>{slots?.map((s) => <SelectItem key={s.id} value={String(s.id)} className="capitalize">{s.day} {s.start_time}–{s.end_time}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-reason">Reason (optional)</Label>
            <Input id="u-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Meeting" />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={isPending || !lecturerId || !slotId} className="w-full">
              {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Add'}
            </Button>
          </div>
        </form>

        {loadingRecords ? (
          <Skeleton className="h-32 w-full" />
        ) : !records?.length ? (
          <EmptyState icon={Settings} title="No unavailability records" />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lecturer</TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{lecturerName(r.lecturer_id)}</TableCell>
                    <TableCell className="capitalize">{slotLabel(r.time_slot_id)}</TableCell>
                    <TableCell className="text-muted-foreground">{r.reason ?? '—'}</TableCell>
                    <TableCell>
                      <ConfirmDialog
                        trigger={<Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="size-4" /></Button>}
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
      </CardContent>
    </Card>
  )
}

export default function ConstraintsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Constraints" description="Configure solver behaviour and lecturer unavailability" />
      <PenaltyWeightsCard />
      <UnavailabilityCard />
    </div>
  )
}
