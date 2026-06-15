import { useEffect, useState } from "react"
import { getPatients } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function Dashboard() {
  const [stats, setStats] = useState({ patients: 0, appointments: 0, leads: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getPatients().catch(() => ({ data: [] })),
    ]).then(([patientsRes]) => {
      const patients = Array.isArray(patientsRes.data) ? patientsRes.data : patientsRes.data.results || []
      setStats({ patients: patients.length, appointments: 0, leads: 0 })
      setLoading(false)
    })
  }, [])

  const kpis = [
    { label: "Новые пациенты", value: stats.patients, change: "+12%" },
    { label: "Выручка", value: "₽ 0", change: "+8%" },
    { label: "Конверсия лидов", value: "0%", change: "+3%" },
    { label: "Средний чек", value: "₽ 0", change: "-2%" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Обзор</h1>
          <p className="text-sm text-neutral-500">Ключевые показатели клиники</p>
        </div>
        <Button variant="outline">Экспорт отчёта</Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <p className="text-sm text-neutral-500">{kpi.label}</p>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{loading ? "..." : kpi.value}</p>
              <p className="text-xs text-neutral-500 mt-1">{kpi.change} vs прошлый мес.</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader><CardTitle>Выручка по дням</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-neutral-400 border rounded-md">
              Данные графика загружаются из API
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Источники пациентов</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-neutral-400 border rounded-md">
              Распределение по источникам
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
