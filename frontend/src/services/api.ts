import axios from 'axios'
import { useAuthStore } from '../store/authStore'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://fraudshield-backend-az3h.onrender.com'
})

let token: string | null = null

export const setToken = (t: string) => { token = t }
export const getToken = () => token

api.interceptors.request.use(config => {
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear auth and redirect
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, full_name: string) =>
    api.post('/auth/register', { email, password, full_name }),
  me: () => api.get('/auth/me')
}

export const transactionsApi = {
  list: (params?: any) => api.get('/transactions', { params }),
  stats: () => api.get('/transactions/stats/summary'),
  create: (data: any) => api.post('/transactions', data)
}

export const alertsApi = {
  list: (params?: any) => api.get('/alerts', { params }),
  update: (id: string, status: string) => api.patch(`/alerts/${id}`, { status })
}

export const rulesApi = {
  list: () => api.get('/rules'),
  update: (id: string, data: any) => api.patch(`/rules/${id}`, data)
}

export const simulatorApi = {
  run: (data: any) => api.post('/transactions', data)
}

export default api