'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { schedulerApi, timetableApi } from '@/lib/api'
import { useFetch } from '@/hooks/use-fetch'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, Loader2, Play, Globe } from 'lucide-react'
import type { SchedulerRunOut, SolverStatus } from '@/types'

const STATUS_BADGE: Record<SolverStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'outline',
  running: 'outline',
  optimal: 'default',
  feasible: 'secondary',
  infeasible: 'destructive',
  failed: 'destructive',
}

const isTerminal = (s: SolverStatus) =>
  ['optimal', 'feasible', 'infeasible', 'failed'].includes(s)

export default function SchedulerPage() {
  const { data: runs, isLoading, refresh } = useFetch(schedulerApi.listRuns)
  const [activeRunId, setActiveRunId] = useState<number | null>(null)
  const [activeStatus, setActiveStatus] = useState<SolverStatus | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = null
  }, [])

  const startPolling = useCallback(
    (runId: number) => {
      stopPolling()
      pollRef.current = setInterval(async () => {
        try {
          const run = await schedulerApi.getStatus(runId)
          setActiveStatus(run.status)
          if (isTerminal(run.status)) {
            stopPolling()
            setActiveRunId(null)
            refresh()
            toast[run.status === 'optimal' || run.status === 'feasible' ? 'success' : 'error'](
              `Solver finished: ${run.status}`,
            )
          }
        } catch {
          stopPolling()
        }
      }, 3000)
    },
    [stopPolling, refresh],
  )

  useEffect(() => () => stopPolling(), [stopPolling])

  async function handleTrigger() {
    try {
      const run = await schedulerApi.trigger()
      setActiveRunId(run.id)
      setActiveStatus(run.status)
      toast.info(`Run #${run.id} started`)
      refresh()
      startPolling(run.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start scheduler')
    }
  }

  async function handlePublish(runId: number) {
    try {
      await timetableApi.publish(runId)
      toast.success(`Timetable #${runId} published`)
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish')
    }
  }

  async function handleUnpublish(runId: number) {
    try {
      await timetableApi.unpublish(runId)
      toast.success(`Timetable #${runId} unpublished`)
      refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to unpublish')
    }
  }

  const isRunning = activeStatus === 'running' || activeStatus === 'pending'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduler"
        description="Trigger the CP-SAT solver and manage scheduling runs"
        action={
          <Button onClick={handleTrigger} disabled={isRunning}>
            {isRunning ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Play className="mr-2 size-4" />}
            {isRunning ? 'Running…' : 'Run Scheduler'}
          </Button>
        }
      />

      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Solving in progress</CardTitle>
            <CardDescription>Run #{activeRunId} · Status: {activeStatus}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress className="h-2 animate-pulse" value={undefined} />
            <p className="mt-2 text-xs text-muted-foreground">
              The solver is running. This page will update automatically when it finishes.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Run History</CardTitle>
          <CardDescription>All scheduling attempts, newest first</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !runs?.length ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CalendarDays className="size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No runs yet. Click "Run Scheduler" to generate a timetable.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Solver</TableHead>
                  <TableHead>Time (s)</TableHead>
                  <TableHead>Objective</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-mono text-sm">{run.id}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[run.status]} className="capitalize">{run.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{run.solver_status ?? '—'}</TableCell>
                    <TableCell>{run.computation_seconds?.toFixed(2) ?? '—'}</TableCell>
                    <TableCell>{run.objective_value?.toFixed(1) ?? '—'}</TableCell>
                    <TableCell>
                      {run.is_published ? <Badge>Published</Badge> : <span className="text-muted-foreground text-sm">—</span>}
                    </TableCell>
                    <TableCell>
                      {isTerminal(run.status) && (
                        <div className="flex items-center gap-2">
                          {run.is_published ? (
                            <Button variant="outline" size="sm" onClick={() => handleUnpublish(run.id)}>Unpublish</Button>
                          ) : (run.status === 'optimal' || run.status === 'feasible') && (
                            <Button size="sm" onClick={() => handlePublish(run.id)}>
                              <Globe className="mr-1 size-3" />Publish
                            </Button>
                          )}
                        </div>
                      )}
                      {run.notes && (
                        <p className="mt-1 text-xs text-muted-foreground truncate max-w-48" title={run.notes}>{run.notes}</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
