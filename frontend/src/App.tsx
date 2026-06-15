import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/store';
import { authApi } from '@/api';

// Pages
import LoginPage from '@/pages/auth/login-page';
import RegisterPage from '@/pages/auth/register-page';
import DashboardPage from '@/pages/dashboard/dashboard-page';
import ContactsPage from '@/pages/contacts/contacts-page';
import LeadsPage from '@/pages/leads/leads-page';
import OpportunitiesPage from '@/pages/opportunities/opportunities-page';
import TasksPage from '@/pages/tasks/tasks-page';
import CalendarPage from '@/pages/calendar/calendar-page';
import SettingsPage from '@/pages/settings/settings-page';

// Layout
import AppLayout from '@/components/layout/app-layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
        try {
          const profile = await authApi.getProfile();
          setUser(profile);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="opportunities" element={<OpportunitiesPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#18181b',
            border: '1px solid #27272a',
            color: '#fafafa',
          },
        }}
      />
    </QueryClientProvider>
  );
}
