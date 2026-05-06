import { defineStore } from 'pinia'
import { resolveBackendAssetUrl } from '@/lib/http'

export type Role = 'admin' | 'merchant' | 'user'

type AuthState = {
  token: string | null
  userRole: Role | null
  userName: string | null
  avatarUrl: string | null
}

const STORAGE_KEY = 'hotel.auth'

function loadState(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { token: null, userRole: null, userName: null, avatarUrl: null }
    }
    const parsed = JSON.parse(raw) as Partial<AuthState>
    return {
      token: parsed.token ?? null,
      userRole: parsed.userRole ?? null,
      userName: parsed.userName ?? null,
      avatarUrl: resolveBackendAssetUrl(parsed.avatarUrl ?? null),
    }
  } catch {
    return { token: null, userRole: null, userName: null, avatarUrl: null }
  }
}

function persistState(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => loadState(),
  getters: {
    isAuthed: (s) => Boolean(s.token && s.userRole),
  },
  actions: {
    setAuth(payload: { token: string; userRole: Role; userName: string; avatarUrl?: string | null }) {
      this.token = payload.token
      this.userRole = payload.userRole
      this.userName = payload.userName
      this.avatarUrl = resolveBackendAssetUrl(payload.avatarUrl ?? null)
      persistState(this.$state)
    },
    setAvatarUrl(avatarUrl: string | null) {
      this.avatarUrl = resolveBackendAssetUrl(avatarUrl)
      persistState(this.$state)
    },
    clear() {
      this.token = null
      this.userRole = null
      this.userName = null
      this.avatarUrl = null
      persistState(this.$state)
    },
  },
})
