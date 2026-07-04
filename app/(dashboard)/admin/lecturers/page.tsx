'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useFetch } from '@/hooks/use-fetch'
import { lecturersApi, departmentsApi, coursesApi } from '@/lib/api'
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
import { BookOpen, Loader2, Plus, Trash2, Users, X } from 'lucide-react'
import type { LecturerCourseOut, CourseOut } from '@/types'

const TITLES = ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.', 'Engr.']

function AddLecturerDialog({
  departments,
  onCreated,
}: {
  departments: { id: number; name: string }[]
  onCreated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [fields, setFields] = useState({ title: '', first_name: '', last_name: '', email: '', department_id: '' })

  function set(k: keyof typeof fields, v: string) {
    setFields((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsPending(true)
    try {
      await lecturersApi.create({ ...fields, department_id: Number(fields.department_id) })
      toast.success(`Lecturer ${fields.title} ${fields.last_name} created`)
      setFields({ title: '', first_name: '', last_name: '', email: '', department_id: '' })
      setOpen(false)
      onCreated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create lecturer')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="mr-2 size-4" />Add Lecturer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Lecturer</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Select value={fields.title} onValueChange={(v) => set('title', v)}>
                <SelectTrigger><SelectValue placeholder="Title" /></SelectTrigger>
                <SelectContent>{TITLES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="l-fname">First Name</Label>
              <Input id="l-fname" value={fields.first_name} onChange={(e) => set('first_name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="l-lname">Last Name</Label>
              <Input id="l-lname" value={fields.last_name} onChange={(e) => set('last_name', e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="l-email">Email</Label>
            <Input id="l-email" type="email" value={fields.email} onChange={(e) => set('email', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={fields.department_id} onValueChange={(v) => set('department_id', v)}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">Default password: <code>changeme123</code></p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !fields.title || !fields.department_id}>
              {isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AssignCourseDialog({
  lecturerId,
  allCourses,
  assignments,
  onChanged,
}: {
  lecturerId: number
  allCourses: CourseOut[]
  assignments: LecturerCourseOut[]
  onChanged: () => void
}) {
  const [open, setOpen] = useState(false)
  const [courseId, setCourseId] = useState('')
  const [isPending, setIsPending] = useState(false)

  const myAssignments = assignments.filter((a) => a.lecturer_id === lecturerId)
  const assignedCourseIds = new Set(myAssignments.map((a) => a.course_id))
  const availableCourses = allCourses.filter((c) => !assignedCourseIds.has(c.id))

  async function handleAssign() {
    if (!courseId) return
    setIsPending(true)
    try {
      await lecturersApi.assignCourse({ lecturer_id: lecturerId, course_id: Number(courseId) })
      toast.success('Course assigned')
      setCourseId('')
      onChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign course')
    } finally {
      setIsPending(false)
    }
  }

  async function handleUnassign(assignmentId: number, courseName: string) {
    try {
      await lecturersApi.unassignCourse(assignmentId)
      toast.success(`${courseName} unassigned`)
      onChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to unassign')
    }
  }

  const courseLabel = (courseId: number) => {
    const c = allCourses.find((c) => c.id === courseId)
    return c ? `${c.code} — ${c.name}` : '—'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Manage course assignments">
          <BookOpen className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Course Assignments</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {myAssignments.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Currently assigned</p>
              {myAssignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span>{courseLabel(a.course_id)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-destructive"
                    onClick={() => handleUnassign(a.id, courseLabel(a.course_id))}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No courses assigned yet.</p>
          )}

          {allCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground border-t pt-4">
              No courses exist yet. Go to <strong>Courses</strong> in the sidebar to add courses first.
            </p>
          ) : availableCourses.length === 0 && myAssignments.length > 0 ? (
            <p className="text-sm text-muted-foreground border-t pt-4">All available courses are already assigned.</p>
          ) : availableCourses.length > 0 ? (
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium text-muted-foreground">Assign a course</p>
              <div className="flex gap-2">
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.code} — {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAssign} disabled={isPending || !courseId}>
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : 'Assign'}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function LecturersPage() {
  const { data: lecturers, isLoading: loadingL, refresh: refreshL } = useFetch(lecturersApi.list)
  const { data: departments, isLoading: loadingD } = useFetch(departmentsApi.list)
  const { data: courses, isLoading: loadingC } = useFetch(coursesApi.list)
  const { data: assignments, isLoading: loadingA, refresh: refreshA } = useFetch(lecturersApi.listAssignments)

  const deptName = (id: number) => departments?.find((d) => d.id === id)?.name ?? '—'

  function handleChanged() {
    refreshL()
    refreshA()
  }

  async function handleDelete(id: number, name: string) {
    await lecturersApi.remove(id)
    toast.success(`Lecturer "${name}" deleted`)
    handleChanged()
  }

  const isLoading = loadingL || loadingD || loadingC || loadingA

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lecturers"
        description="Teaching staff and their course assignments"
        action={<AddLecturerDialog departments={departments ?? []} onCreated={handleChanged} />}
      />

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : !lecturers?.length ? (
        <EmptyState icon={Users} title="No lecturers yet" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lecturers.map((l) => {
                const count = assignments?.filter((a) => a.lecturer_id === l.id).length ?? 0
                return (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.title} {l.first_name} {l.last_name}</TableCell>
                    <TableCell className="text-muted-foreground">{l.email}</TableCell>
                    <TableCell><Badge variant="outline">{deptName(l.department_id)}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={count > 0 ? 'secondary' : 'outline'}>{count} course{count !== 1 ? 's' : ''}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <AssignCourseDialog
                          lecturerId={l.id}
                          allCourses={courses ?? []}
                          assignments={assignments ?? []}
                          onChanged={handleChanged}
                        />
                        <ConfirmDialog
                          trigger={<Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="size-4" /></Button>}
                          title="Delete lecturer"
                          description={`Delete ${l.title} ${l.last_name}?`}
                          onConfirm={() => handleDelete(l.id, `${l.title} ${l.last_name}`)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
