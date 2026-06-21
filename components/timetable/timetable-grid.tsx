import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Day, ScheduleEntryOut, TimeSlotOut } from '@/types'

const DAYS: Day[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const DAY_LABELS: Record<Day, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
}

interface TimetableGridProps {
  entries: ScheduleEntryOut[]
  slots: TimeSlotOut[]
  /** Renders additional content inside each cell (e.g. edit buttons) */
  renderCellAction?: (entry: ScheduleEntryOut) => React.ReactNode
}

export function TimetableGrid({ entries, slots, renderCellAction }: TimetableGridProps) {
  const sortedSlots = [...slots].sort((a, b) => a.start_time.localeCompare(b.start_time))

  function entryAt(day: Day, slotId: number) {
    return entries.find(
      (e) => e.time_slot.day === day && e.time_slot_id === slotId,
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="w-28 px-3 py-2 text-left font-medium text-muted-foreground">
              Time
            </th>
            {DAYS.map((day) => (
              <th
                key={day}
                className="px-3 py-2 text-left font-medium text-muted-foreground capitalize"
              >
                {DAY_LABELS[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedSlots.map((slot) => (
            <tr key={slot.id} className="border-b last:border-0">
              <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                {slot.start_time}–{slot.end_time}
              </td>
              {DAYS.map((day) => {
                const entry = entryAt(day, slot.id)
                return (
                  <td
                    key={day}
                    className={cn(
                      'px-2 py-1.5 align-top',
                      entry?.is_manually_adjusted && 'bg-yellow-50 dark:bg-yellow-950/20',
                    )}
                  >
                    {entry ? (
                      <div className="group relative space-y-0.5 rounded-md border bg-card p-2 text-xs shadow-sm">
                        <p className="font-medium leading-tight">{entry.course.name}</p>
                        <p className="text-muted-foreground">{entry.course.code}</p>
                        <p className="text-muted-foreground">
                          {entry.lecturer.title} {entry.lecturer.last_name}
                        </p>
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          <Badge variant="secondary" className="text-[10px]">
                            {entry.room.name}
                          </Badge>
                          <Badge
                            variant={entry.course.course_type === 'lab' ? 'destructive' : 'outline'}
                            className="text-[10px]"
                          >
                            {entry.course.course_type}
                          </Badge>
                          {entry.is_manually_adjusted && (
                            <Badge className="text-[10px]">Adjusted</Badge>
                          )}
                        </div>
                        {renderCellAction?.(entry)}
                      </div>
                    ) : (
                      <div className="h-full min-h-[4rem] rounded-md border border-dashed border-muted" />
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
