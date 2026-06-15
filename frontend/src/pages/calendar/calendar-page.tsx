import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground">Schedule and manage your events</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          New Event
        </button>
      </div>

      {/* Calendar Header */}
      <div className="glass rounded-xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="rounded-lg border border-input p-2 transition-colors hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="rounded-lg border border-input px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="rounded-lg border border-input p-2 transition-colors hover:bg-secondary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-px">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-xs font-medium uppercase text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px">
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[80px] rounded-lg border border-transparent p-2 transition-colors hover:border-primary/20 hover:bg-secondary/50',
                !isSameMonth(day, currentDate) && 'opacity-30',
              )}
            >
              <span
                className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm',
                  isToday(day) && 'bg-primary text-primary-foreground font-bold',
                )}
              >
                {format(day, 'd')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
