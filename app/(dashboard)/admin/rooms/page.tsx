'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useFetch } from '@/hooks/use-fetch'
import { roomsApi } from '@/lib/api'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DoorOpen, Plus, Trash2 } from 'lucide-react'
import type { RoomType } from '@/types'

const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  lecture_hall: 'Lecture Hall',
  seminar_room: 'Seminar Room',
  laboratory: 'Laboratory',
}

function AddRoomDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [roomType, setRoomType] = useState<RoomType | ''>('')
  const [capacity, setCapacity] = useState('30')
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsPending(true)
    try {
      await roomsApi.create({ name, room_type: roomType as RoomType, capacity: Number(capacity) })
      toast.success(`Room "${name}" created`)
      setName('')
      setRoomType('')
      setCapacity('30')
      setOpen(false)
      onCreated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create room')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="mr-2 size-4" />Add Room</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Room</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="r-name">Room Name</Label>
            <Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="LT1" required />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={roomType} onValueChange={(v) => setRoomType(v as RoomType)}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {(Object.keys(ROOM_TYPE_LABELS) as RoomType[]).map((t) => (
                  <SelectItem key={t} value={t}>{ROOM_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="r-cap">Capacity</Label>
            <Input id="r-cap" type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !roomType}>{isPending ? 'Creating…' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function RoomsPage() {
  const { data: rooms, isLoading, refresh } = useFetch(roomsApi.list)

  async function handleDelete(id: number, name: string) {
    await roomsApi.remove(id)
    toast.success(`Room "${name}" deleted`)
    refresh()
  }

  async function toggleAvailability(id: number, current: boolean) {
    await roomsApi.update(id, { is_available: !current })
    toast.success(current ? 'Room marked unavailable' : 'Room marked available')
    refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Rooms" description="Schedulable spaces and their capacities" action={<AddRoomDialog onCreated={refresh} />} />

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : !rooms?.length ? (
        <EmptyState icon={DoorOpen} title="No rooms yet" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell><Badge variant="outline">{ROOM_TYPE_LABELS[r.room_type]}</Badge></TableCell>
                  <TableCell>{r.capacity}</TableCell>
                  <TableCell>
                    <Badge variant={r.is_available ? 'default' : 'secondary'}>
                      {r.is_available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleAvailability(r.id, r.is_available)}>
                        Toggle
                      </Button>
                      <ConfirmDialog
                        trigger={<Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="size-4" /></Button>}
                        title="Delete room"
                        description={`Delete room "${r.name}"?`}
                        onConfirm={() => handleDelete(r.id, r.name)}
                      />
                    </div>
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
