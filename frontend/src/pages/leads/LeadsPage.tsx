import { useList } from "@refinedev/core";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/shared/ui";
import {
  type Lead,
  LEAD_PIPELINE,
  LEAD_STATUS_LABELS,
  LEAD_CHANNEL_LABELS,
} from "@/entities/lead";
import { formatMoneyKopecks } from "@/shared/lib/utils";

export function LeadsPage() {
  const { data, isLoading } = useList<Lead>({
    resource: "leads",
    pagination: { mode: "off" },
  });
  const leads: Lead[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Лиды</h1>
        <p className="text-muted-foreground">Воронка продаж</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {LEAD_PIPELINE.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage);
          return (
            <div key={stage} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{LEAD_STATUS_LABELS[stage]}</h2>
                <Badge variant="secondary">{stageLeads.length}</Badge>
              </div>
              <div className="space-y-2">
                {isLoading && <Skeleton className="h-20 w-full" />}
                {!isLoading && stageLeads.length === 0 && (
                  <p className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">
                    Пусто
                  </p>
                )}
                {stageLeads.map((lead) => (
                  <Card key={lead.id}>
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-sm">
                        {lead.first_name} {lead.last_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 p-3 pt-0 text-xs text-muted-foreground">
                      <p>{lead.phone || lead.email || "—"}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{LEAD_CHANNEL_LABELS[lead.channel]}</Badge>
                        <span className="font-medium text-foreground">
                          {formatMoneyKopecks(lead.estimated_value_kopecks)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
