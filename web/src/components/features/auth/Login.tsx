import { useState } from 'react'
import { signIn, setAuth } from '../../../lib/auth'
import './Auth.css'

interface LoginProps {
  onSuccess: () => void
  onGoRegister: () => void
}

const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL ?? 'demo@nestconnect.dev'
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD ?? 'demopass123'

export function Login({ onSuccess, onGoRegister }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function login(emailArg: string, passwordArg: string) {
    setError('')
    setLoading(true)
    try {
      const res = await signIn(emailArg, passwordArg)
      setAuth(res)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await login(email, password)
  }

  async function handleDemoLogin() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    await login(DEMO_EMAIL, DEMO_PASSWORD)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Log in</h1>
        <p className="auth-subtitle">Welcome back to NestConnect</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={loading}
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </label>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Log in'}
          </button>

          {import.meta.env.DEV && (
            <button
              type="button"
              className="auth-demo"
              onClick={handleDemoLogin}
              disabled={loading}
              title={`${DEMO_EMAIL} / ${DEMO_PASSWORD}`}
            >
              Fill demo login (dev)
            </button>
          )}
        </form>

        <p className="auth-switch">
          Don&apos;t have an account?{' '}
          <button type="button" className="auth-link" onClick={onGoRegister}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}
