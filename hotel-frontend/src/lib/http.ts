import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '')

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers = config.headers ?? {}
    config.headers['satoken'] = auth.token
  }
  return config
})

http.interceptors.response.use(
  (resp) => resp,
  (err) => {
    const status = err?.response?.status
    if (status === 401) {
      const auth = useAuthStore()
      auth.clear()
    }
    return Promise.reject(err)
  },
)

export function resolveBackendAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null
  const trimmed = path.trim()
  if (!trimmed) return null
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed
  }
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${API_BASE_URL}${normalizedPath}`
}
