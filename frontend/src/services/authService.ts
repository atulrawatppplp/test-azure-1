import { apiClient } from '../lib/apiClient'
import { config } from '../lib/config'
import type { AuthResult, User } from '../types'
import { delay } from './mock/mockDb'

const demoUser: User = {
  userId: 'USR-1',
  name: 'Aarav Sharma',
  email: 'admin@minioms.com',
  role: 'Admin',
  phone: '+91 98200 11223',
  company: 'Mini OMS Pvt Ltd',
}

const PROFILE_KEY = 'moms.profile'

function readStoredUser(): User | null {
  const raw = localStorage.getItem(config.userStorageKey)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

/**
 * Entra ID will issue the token in production; the mock branch keeps the same
 * shape so only the branch body has to be deleted later.
 */
export const authService = {
  async login(email: string, password: string): Promise<AuthResult> {
    if (!config.useMockApi) {
      const result = await apiClient.post<AuthResult>('/api/auth/login', { email, password })
      localStorage.setItem(config.tokenStorageKey, result.token)
      localStorage.setItem(config.userStorageKey, JSON.stringify(result.user))
      return result
    }

    await delay()
    if (password.length < 4) {
      throw new Error('Invalid email or password.')
    }
    const stored = localStorage.getItem(PROFILE_KEY)
    const profile = stored ? (JSON.parse(stored) as User) : demoUser
    const user: User = { ...profile, email }
    const result: AuthResult = { token: `mock.${btoa(email)}.jwt`, user }
    localStorage.setItem(config.tokenStorageKey, result.token)
    localStorage.setItem(config.userStorageKey, JSON.stringify(user))
    return result
  },

  async logout(): Promise<void> {
    if (!config.useMockApi) await apiClient.post<void>('/api/auth/logout')
    localStorage.removeItem(config.tokenStorageKey)
    localStorage.removeItem(config.userStorageKey)
  },

  async getCurrentUser(): Promise<User | null> {
    if (!config.useMockApi) {
      if (!localStorage.getItem(config.tokenStorageKey)) return null
      return apiClient.get<User>('/api/auth/me')
    }
    await delay(120)
    return readStoredUser()
  },

  async updateProfile(patch: Partial<User>): Promise<User> {
    if (!config.useMockApi) return apiClient.put<User>('/api/auth/me', patch)
    await delay()
    const current = readStoredUser() ?? demoUser
    const updated = { ...current, ...patch }
    localStorage.setItem(config.userStorageKey, JSON.stringify(updated))
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated))
    return updated
  },

  getToken: () => localStorage.getItem(config.tokenStorageKey),
  demoCredentials: { email: demoUser.email, password: 'Password@123' },
}
