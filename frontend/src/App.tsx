import { Routes, Route } from "react-router-dom"
import { Layout } from "./components/Layout"
import { Patients } from "./pages/Patients"

// Placeholder pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full">
    <h1 className="text-2xl font-bold text-slate-400">{title}</h1>
  </div>
)

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Placeholder title="Analytics Dashboard" />} />
        <Route path="patients" element={<Patients />} />
        <Route path="appointments" element={<Placeholder title="Appointments Calendar" />} />
        <Route path="schedule" element={<Placeholder title="Doctor Schedule" />} />
        <Route path="leads" element={<Placeholder title="Leads Kanban" />} />
        <Route path="ai" element={<Placeholder title="AI Assistant" />} />
      </Route>
    </Routes>
  )
}

export default App
