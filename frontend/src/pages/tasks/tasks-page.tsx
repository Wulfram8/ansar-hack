import { Plus, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { TaskStatus, TaskPriority } from '@/types';

const priorityColors: Record<string, string> = {
  low: 'text-gray-400',
  medium: 'text-blue-400',
  high: 'text-amber-400',
  urgent: 'text-red-400',
};

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">Manage your tasks and to-dos</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
        {Object.values(TaskStatus).map((status) => (
          <button
            key={status}
            className="rounded-md px-4 py-2 text-sm font-medium capitalize text-muted-foreground transition-colors hover:text-foreground first:bg-background first:text-foreground first:shadow-sm"
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        <div className="glass flex h-48 items-center justify-center rounded-xl">
          <div className="text-center">
            <CheckSquare className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">No tasks yet</p>
            <p className="text-xs text-muted-foreground">Create your first task to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
}
