import { defineStore } from 'pinia'

export type Role = 'admin' | 'merchant' | 'user'

type AuthState = {
  token: string | null
  userRole: Role | null
  userName: string | null
}

const STORAGE_KEY = 'hotel.auth'

function loadState(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { token: null, userRole: null, userName: null }
    }
    const parsed = JSON.parse(raw) as Partial<AuthState>
    return {
      token: parsed.token ?? null,
      userRole: parsed.userRole ?? null,
      userName: parsed.userName ?? null,
    }
  } catch {
    return { token: null, userRole: null, userName: null }
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
    setAuth(payload: { token: string; userRole: Role; userName: string }) {
      this.token = payload.token
      this.userRole = payload.userRole
      this.userName = payload.userName
      persistState(this.$state)
    },
    clear() {
      this.token = null
      this.userRole = null
      this.userName = null
      persistState(this.$state)
    },
  },
})

