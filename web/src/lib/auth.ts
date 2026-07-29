import { api } from './api'
import { useAuthStore } from '../store/authStore'
import type { AuthResponse, AuthUser } from '../store/authStore'

export type { AuthUser, AuthResponse }

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  return api<AuthResponse>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function signUp(name: string, email: string, password: string): Promise<AuthResponse> {
  return api<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export function getAccessToken(): string | null {
  return useAuthStore.getState().getAccessToken()
}

export function isLoggedIn(): boolean {
  return useAuthStore.getState().isLoggedIn()
}

export function setAuth(res: AuthResponse): void {
  useAuthStore.getState().setAuth(res)
}

export function clearAuth(): void {
  useAuthStore.getState().clearAuth()
}

export function getStoredUser(): AuthUser | null {
  return useAuthStore.getState().user
}
