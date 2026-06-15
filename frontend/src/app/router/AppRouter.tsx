import { Routes, Route, Outlet } from "react-router-dom";
import { Authenticated } from "@refinedev/core";
import { NavigateToResource, CatchAllNavigate } from "@refinedev/react-router-v6";
import { Layout } from "@/widgets/layout";
import {
  DashboardPage,
  PatientsListPage,
  PatientCreatePage,
  PatientEditPage,
  PatientShowPage,
  AppointmentsListPage,
  LeadsPage,
  NotificationTemplatesPage,
  LoginPage,
  NotFoundPage,
} from "@/pages";

export function AppRouter() {
  return (
    <Routes>
      {/* Защищённые маршруты */}
      <Route
        element={
          <Authenticated key="protected" fallback={<CatchAllNavigate to="/login" />}>
            <Layout>
              <Outlet />
            </Layout>
          </Authenticated>
        }
      >
        <Route index element={<DashboardPage />} />

        <Route path="/patients">
          <Route index element={<PatientsListPage />} />
          <Route path="create" element={<PatientCreatePage />} />
          <Route path="edit/:id" element={<PatientEditPage />} />
          <Route path="show/:id" element={<PatientShowPage />} />
        </Route>

        <Route path="/appointments" element={<AppointmentsListPage />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/notifications/templates" element={<NotificationTemplatesPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Публичные маршруты */}
      <Route
        element={
          <Authenticated key="public" fallback={<Outlet />}>
            <NavigateToResource resource="dashboard" />
          </Authenticated>
        }
      >
        <Route path="/login" element={<LoginPage />} />
      </Route>
    </Routes>
  );
}
