import { Plus } from 'lucide-react';
import { OpportunityStage } from '@/types';

const stageColors: Record<string, string> = {
  prospecting: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  qualification: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  proposal: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  negotiation: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  closed_won: 'bg-green-400/10 text-green-400 border-green-400/20',
  closed_lost: 'bg-red-400/10 text-red-400 border-red-400/20',
};

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Opportunities</h1>
          <p className="text-sm text-muted-foreground">Track your sales pipeline and deals</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          Add Opportunity
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Object.values(OpportunityStage).map((stage) => (
          <div
            key={stage}
            className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-card/50"
          >
            <div className={`flex items-center justify-between border-b border-border px-4 py-3`}>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${stageColors[stage]?.split(' ')[0]?.replace('/10', '') || 'bg-muted'}`} />
                <span className="text-sm font-semibold capitalize text-foreground">
                  {stage.replace('_', ' ')}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">0</span>
            </div>
            <div className="flex-1 space-y-2 p-3">
              <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border">
                <p className="text-xs text-muted-foreground">No deals</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
