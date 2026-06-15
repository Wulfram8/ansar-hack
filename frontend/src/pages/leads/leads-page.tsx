import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { LeadStatus } from '@/types';

const statusColors: Record<string, string> = {
  new: 'bg-blue-400/10 text-blue-400',
  contacted: 'bg-yellow-400/10 text-yellow-400',
  qualified: 'bg-green-400/10 text-green-400',
  unqualified: 'bg-red-400/10 text-red-400',
  converted: 'bg-purple-400/10 text-purple-400',
  lost: 'bg-gray-400/10 text-gray-400',
};

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground">Track and manage your sales leads</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          Add Lead
        </button>
      </div>

      {/* Pipeline status filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.values(LeadStatus).map((status) => (
          <button
            key={status}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors ${statusColors[status] || 'bg-muted text-muted-foreground'} hover:opacity-80`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Source</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Priority</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-4 py-16 text-center">
                <p className="text-sm text-muted-foreground">No leads yet. Start adding leads to your pipeline.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
