import { type FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { SupabaseNotice } from '../components/layout/SupabaseNotice'
import { Loading } from '../components/ui/Loading'
import { useAuth } from '../lib/auth/useAuth'

interface LocationState {
  from?: string
  reason?: string
}

export default function Login() {
  const { signIn, session, loading, configured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as LocationState
  const redirectTo = state.from?.startsWith('/') ? state.from : '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) return <Loading label="Checking your session…" />
  if (session) return <Navigate to={redirectTo} replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const result = await signIn(email.trim(), password)
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-10">
      <div className="panel p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-glow/80">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-mist">
          Log in to save presets and audio snapshots to your private library.
        </p>

        {state.reason === 'save' ? (
          <p className="mt-4 rounded-lg border border-cyan-glow/25 bg-cyan-glow/5 p-3 text-xs text-cyan-100">
            Log in to save your preset. Your current explorer settings are waiting for you.
          </p>
        ) : null}

        {!configured ? (
          <div className="mt-4">
            <SupabaseNotice />
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div>
            <label
              htmlFor="login-email"
              className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mist"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className="field"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mist"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="field"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-red-400/30 bg-red-400/10 p-2.5 text-xs text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={busy || !configured}
          >
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-mist">
          No account yet?{' '}
          <Link
            to="/register"
            state={{ from: redirectTo }}
            className="font-semibold text-cyan-glow hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
      <p className="mt-4 text-center text-xs text-mist">
        <Link to="/" className="hover:text-white">
          ← Back to the explorer
        </Link>
      </p>
    </div>
  )
}
