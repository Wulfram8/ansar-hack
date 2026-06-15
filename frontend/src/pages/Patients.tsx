import { useEffect, useState, FormEvent } from "react"
import { getPatients, createPatient, deletePatient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Patient {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string
  status: string
  birth_date: string | null
}

export function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", email: "" })

  const fetchPatients = () => {
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (statusFilter) params.status = statusFilter
    getPatients(params)
      .then(res => {
        setPatients(Array.isArray(res.data) ? res.data : res.data.results || [])
        setLoading(false)
      })
      .catch(() => { setError("Ошибка загрузки"); setLoading(false) })
  }

  useEffect(() => { fetchPatients() }, [search, statusFilter])

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    await createPatient(form)
    setForm({ first_name: "", last_name: "", phone: "", email: "" })
    setShowForm(false)
    fetchPatients()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Удалить пациента?")) {
      await deletePatient(id)
      fetchPatients()
    }
  }

  const statuses = ["", "NEW", "ACTIVE", "INACTIVE", "ARCHIVED", "BLOCKED"]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Пациенты</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Отмена" : "+ Добавить пациента"}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <input
          className="border rounded-md px-3 py-1.5 text-sm flex-1"
          placeholder="Поиск по имени, телефону, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border rounded-md px-3 py-1.5 text-sm"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          {statuses.map(s => (
            <option key={s} value={s}>{s || "Все статусы"}</option>
          ))}
        </select>
      </div>

      {/* Create form */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Новый пациент</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
              <input className="border rounded-md px-3 py-2 text-sm" placeholder="Имя" required
                value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
              <input className="border rounded-md px-3 py-2 text-sm" placeholder="Фамилия" required
                value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
              <input className="border rounded-md px-3 py-2 text-sm" placeholder="Телефон" required
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <input className="border rounded-md px-3 py-2 text-sm" placeholder="Email"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Button type="submit" className="col-span-2">Создать</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? <p className="p-6">Загрузка...</p> : error ? <p className="p-6 text-red-600">{error}</p> : (
            <table className="w-full text-sm">
              <thead className="border-b bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Имя</th>
                  <th className="px-4 py-3 text-left font-medium">Телефон</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Статус</th>
                  <th className="px-4 py-3 text-left font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-neutral-500">Нет пациентов</td></tr>
                ) : patients.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3">{p.first_name} {p.last_name}</td>
                    <td className="px-4 py-3">{p.phone}</td>
                    <td className="px-4 py-3">{p.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>Удалить</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
