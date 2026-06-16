import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/shared/ui";
import { cn } from "@/shared/lib/utils";
import type { DashboardKpi } from "@/entities/dashboard";

export function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  const up = kpi.delta_direction === "up";
  const Arrow = up ? ArrowUpRight : ArrowDownRight;
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <p className="text-sm text-muted-foreground">{kpi.label}</p>
        <p className="text-3xl font-bold tracking-tight">{kpi.value}</p>
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
              up
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-red-500/10 text-red-600",
            )}
          >
            <Arrow className="h-3 w-3" />
            {kpi.delta}%
          </span>
          <span className="text-muted-foreground">к прошлому периоду</span>
        </div>
      </CardContent>
    </Card>
  );
}
