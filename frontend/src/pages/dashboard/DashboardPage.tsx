import { useMemo, useState } from "react";
import type { Options } from "highcharts";
import { Download, UserPlus, Calendar, Loader2 } from "lucide-react";
import { Chart, KpiCard } from "@/widgets/dashboard-charts";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import { formatMoneyKopecks } from "@/shared/lib/utils";
import { useNavigation } from "@refinedev/core";
import { http } from "@/shared/api/http";
import { toastStore } from "@/shared/ui";
import { useDashboard } from "./useDashboard";

export function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const dash = data?.data;

  const { create, list } = useNavigation();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await http.get("/patients/export/", { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `patients-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toastStore.push({ message: "Экспорт готов", description: "База пациентов выгружена в CSV.", type: "success" });
    } catch {
      toastStore.push({ message: "Не удалось выполнить экспорт", type: "error" });
    } finally {
      setExporting(false);
    }
  };

  const revenueOptions: Options = useMemo(() => {
    const points = dash?.revenue_by_month ?? [];
    return {
      chart: { type: "column", height: 300, backgroundColor: "transparent" },
      title: { text: undefined },
      xAxis: {
        categories: points.map((p) => p.month),
        lineColor: "#e5e5e5",
        labels: { style: { color: "#737373", fontSize: "11px" } },
      },
      yAxis: {
        title: { text: undefined },
        gridLineColor: "#f0f0f0",
        labels: {
          style: { color: "#737373", fontSize: "11px" },
          formatter() {
            return "₽ " + (Number(this.value) / 1000).toLocaleString("ru-RU") + "к";
          },
        },
      },
      legend: { align: "right", verticalAlign: "top", itemStyle: { fontSize: "12px" } },
      tooltip: {
        shared: true,
        valuePrefix: "₽ ",
        valueDecimals: 0,
      },
      plotOptions: {
        column: { borderRadius: 3, pointPadding: 0.08, groupPadding: 0.16 },
      },
      series: [
        {
          type: "column",
          name: "План",
          data: points.map((p) => p.plan),
          color: "#d4d4d8",
        },
        {
          type: "column",
          name: "Факт",
          data: points.map((p) => p.fact),
          color: "#18181b",
        },
      ],
    };
  }, [dash]);

  const sourcesOptions: Options = useMemo(() => {
    const slices = dash?.patient_sources ?? [];
    return {
      chart: { type: "pie", height: 280, backgroundColor: "transparent" },
      title: { text: undefined },
      tooltip: { pointFormat: "<b>{point.y}</b> ({point.percentage:.0f}%)" },
      plotOptions: {
        pie: {
          innerSize: "68%",
          borderWidth: 2,
          borderColor: "#fff",
          dataLabels: { enabled: false },
        },
      },
      series: [
        {
          type: "pie",
          name: "Пациенты",
          data: slices.map((s) => ({ name: s.label, y: s.value, color: s.color })),
        },
      ],
    };
  }, [dash]);

  if (isLoading || !dash) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 w-full lg:col-span-2" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Обзор клиники</h1>
          <p className="text-sm text-muted-foreground">
            Аналитика и ключевые показатели за выбранный период
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-9 items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {dash.period_label}
          </div>
          <Button variant="outline" disabled={exporting} onClick={handleExport}>
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Экспорт
          </Button>
          <Button onClick={() => create("patients")}>
            <UserPlus className="h-4 w-4" />
            Записать пациента
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dash.kpis.map((kpi) => (
          <KpiCard key={kpi.key} kpi={kpi} />
        ))}
      </div>

      {/* Выручка + источники */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Выручка по месяцам</CardTitle>
            <p className="text-sm text-muted-foreground">План и факт, ₽</p>
          </CardHeader>
          <CardContent>
            <Chart options={revenueOptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Источники пациентов</CardTitle>
            <p className="text-sm text-muted-foreground">Распределение по каналам</p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Chart options={sourcesOptions} />
              <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
                <div className="text-2xl font-bold leading-none">
                  {dash.patient_sources_total.toLocaleString("ru-RU")}
                </div>
                <div className="text-xs text-muted-foreground">пациентов</div>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {dash.patient_sources.map((s) => (
                <li key={s.label} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="flex-1 truncate">{s.label}</span>
                  <span className="text-muted-foreground">{s.value}</span>
                  <span className="w-10 text-right font-medium">{s.percent}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Загруженность врачей + топ услуги */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Загруженность врачей</CardTitle>
            <Button
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={() => list("schedule")}
            >
              Все врачи
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Врач</TableHead>
                  <TableHead>Специальность</TableHead>
                  <TableHead className="text-right">Приёмы</TableHead>
                  <TableHead className="text-right">Выручка</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dash.doctor_load.map((d) => (
                  <TableRow key={d.name}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-muted-foreground">{d.specialty}</TableCell>
                    <TableCell className="text-right">{d.appointments}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMoneyKopecks(d.revenue_kopecks)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Топ услуги</CardTitle>
            <p className="text-sm text-muted-foreground">По выручке за период</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {dash.top_services.map((s) => (
              <div key={s.title} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{s.title}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatMoneyKopecks(s.revenue_kopecks)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
