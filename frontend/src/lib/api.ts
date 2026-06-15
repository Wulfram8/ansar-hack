import axios from 'axios'

const API_BASE = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE,
})

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

// Auth
export const login = (username: string, password: string) =>
  api.post('/auth-token/', { username, password })

// Users
export const getUsers = () => api.get('/users/')
export const getUser = (id: string) => api.get(`/users/${id}/`)
export const createUser = (data: Record<string, unknown>) => api.post('/users/', data)
export const updateUser = (id: string, data: Record<string, unknown>) => api.patch(`/users/${id}/`, data)
export const deleteUser = (id: string) => api.delete(`/users/${id}/`)

// Patients
export const getPatients = (params?: Record<string, string>) => api.get('/patients/', { params })
export const getPatient = (id: string) => api.get(`/patients/${id}/`)
export const createPatient = (data: Record<string, unknown>) => api.post('/patients/', data)
export const updatePatient = (id: string, data: Record<string, unknown>) => api.patch(`/patients/${id}/`, data)
export const deletePatient = (id: string) => api.delete(`/patients/${id}/`)

// Appointments
export const getAppointments = (params?: Record<string, string>) => api.get('/appointments/', { params })
export const getAppointment = (id: string) => api.get(`/appointments/${id}/`)
export const createAppointment = (data: Record<string, unknown>) => api.post('/appointments/', data)
export const updateAppointment = (id: string, data: Record<string, unknown>) => api.patch(`/appointments/${id}/`, data)
export const deleteAppointment = (id: string) => api.delete(`/appointments/${id}/`)

// Leads
export const getLeads = (params?: Record<string, string>) => api.get('/leads/', { params })
export const getLead = (id: string) => api.get(`/leads/${id}/`)
export const createLead = (data: Record<string, unknown>) => api.post('/leads/', data)
export const updateLead = (id: string, data: Record<string, unknown>) => api.patch(`/leads/${id}/`, data)
export const deleteLead = (id: string) => api.delete(`/leads/${id}/`)

// Notification Templates
export const getNotificationTemplates = () => api.get('/notifications/templates/')
export const createNotificationTemplate = (data: Record<string, unknown>) => api.post('/notifications/templates/', data)
export const deleteNotificationTemplate = (id: string) => api.delete(`/notifications/templates/${id}/`)

// Automation Rules
export const getAutomationRules = () => api.get('/notifications/rules/')
export const createAutomationRule = (data: Record<string, unknown>) => api.post('/notifications/rules/', data)

// Scheduled Notifications
export const getScheduledNotifications = () => api.get('/notifications/scheduled/')

export default api
