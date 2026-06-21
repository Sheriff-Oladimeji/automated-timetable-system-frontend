'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useFetch } from '@/hooks/use-fetch'
import { coursesApi, departmentsApi } from '@/lib/api'
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
import { BookOpen, Plus, Trash2 } from 'lucide-react'
import type { CourseType } from '@/types'

const LEVELS = [100, 200, 300, 400, 500, 600, 700]

function AddCourseDialog({
  departments,
  onCreated,
}: {
  departments: { id: number; name: string }[]
  onCreated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [fields, setFields] = useState({
    department_id: '',
    code: '',
    name: '',
    level: '',
    course_type: '' as CourseType | '',
    hours_per_week: '2',
    enrolled_count: '0',
  })

  function set(key: keyof typeof fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsPending(true)
    try {
      await coursesApi.create({
        department_id: Number(fields.department_id),
        code: fields.code,
        name: fields.name,
        level: Number(fields.level),
        course_type: fields.course_type as CourseType,
        hours_per_week: Number(fields.hours_per_week),
        enrolled_count: Number(fields.enrolled_count),
      })
      toast.success(`Course "${fields.name}" created`)
      setFields({ department_id: '', code: '', name: '', level: '', course_type: '', hours_per_week: '2', enrolled_count: '0' })
      setOpen(false)
      onCreated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create course')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 size-4" /> Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Course</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Department</Label>
              <Select value={fields.department_id} onValueChange={(v) => set('department_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-code">Course Code</Label>
              <Input id="c-code" value={fields.code} onChange={(e) => set('code', e.target.value)} placeholder="CSC 201" required />
            </div>
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={fields.level} onValueChange={(v) => set('level', v)}>
                <SelectTrigger><SelectValue placeholder="Level" /></SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => <SelectItem key={l} value={String(l)}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="c-name">Course Name</Label>
              <Input id="c-name" value={fields.name} onChange={(e) => set('name', e.target.value)} placeholder="Data Structures" required />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={fields.course_type} onValueChange={(v) => set('course_type', v)}>
                <SelectTrigger><SelectValue placeholder="Course type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="theory">Theory</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-hrs">Hours / Week</Label>
              <Input id="c-hrs" type="number" min="1" max="20" value={fields.hours_per_week} onChange={(e) => set('hours_per_week', e.target.value)} required />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="c-enrolled">Enrolled Count</Label>
              <Input id="c-enrolled" type="number" min="0" value={fields.enrolled_count} onChange={(e) => set('enrolled_count', e.target.value)} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending || !fields.department_id || !fields.level || !fields.course_type}>
              {isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function CoursesPage() {
  const { data: courses, isLoading: loadingCourses, refresh } = useFetch(coursesApi.list)
  const { data: departments, isLoading: loadingDepts } = useFetch(departmentsApi.list)

  const deptName = (id: number) => departments?.find((d) => d.id === id)?.name ?? '—'

  async function handleDelete(id: number, name: string) {
    await coursesApi.remove(id)
    toast.success(`Course "${name}" deleted`)
    refresh()
  }

  const isLoading = loadingCourses || loadingDepts

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="All courses available for scheduling"
        action={<AddCourseDialog departments={departments ?? []} onCreated={refresh} />}
      />

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : !courses?.length ? (
        <EmptyState icon={BookOpen} title="No courses yet" description="Add a course to get started" />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Hrs/Wk</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-sm">{c.code}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{deptName(c.department_id)}</TableCell>
                  <TableCell>{c.level}</TableCell>
                  <TableCell>
                    <Badge variant={c.course_type === 'lab' ? 'destructive' : 'secondary'}>{c.course_type}</Badge>
                  </TableCell>
                  <TableCell>{c.hours_per_week}</TableCell>
                  <TableCell>{c.enrolled_count}</TableCell>
                  <TableCell>
                    <ConfirmDialog
                      trigger={<Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="size-4" /></Button>}
                      title="Delete course"
                      description={`Delete "${c.name}"?`}
                      onConfirm={() => handleDelete(c.id, c.name)}
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
