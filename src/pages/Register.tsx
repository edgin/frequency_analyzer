import { type FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { SupabaseNotice } from '../components/layout/SupabaseNotice'
import { Loading } from '../components/ui/Loading'
import { useAuth } from '../lib/auth/useAuth'

interface LocationState {
  from?: string
}

export default function Register() {
  const { signUp, session, loading, configured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as LocationState
  const redirectTo = state.from?.startsWith('/') ? state.from : '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)

  if (loading) return <Loading label="Checking your session…" />
  if (session && !needsConfirmation) return <Navigate to={redirectTo} replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Use a password with at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('The passwords do not match.')
      return
    }

    setBusy(true)
    const result = await signUp(email.trim(), password)
    setBusy(false)

    if (result.error) {
      setError(result.error)
      return
    }
    if (result.needsConfirmation) {
      setNeedsConfirmation(true)
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
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Create an account</h1>
        <p className="mt-1 text-sm text-mist">
          Email and password only. Presets are private to your account.
        </p>

        {!configured ? (
          <div className="mt-4">
            <SupabaseNotice />
          </div>
        ) : null}

        {needsConfirmation ? (
          <div className="mt-5 space-y-3">
            <p className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">
              Check your inbox to confirm <span className="font-semibold">{email}</span>, then log
              in.
            </p>
            <Link to="/login" state={{ from: redirectTo }} className="btn btn-primary w-full">
              Go to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div>
              <label
                htmlFor="register-email"
                className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mist"
              >
                Email
              </label>
              <input
                id="register-email"
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
                htmlFor="register-password"
                className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mist"
              >
                Password
              </label>
              <input
                id="register-password"
                type="password"
                className="field"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
            <div>
              <label
                htmlFor="register-confirm"
                className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mist"
              >
                Confirm password
              </label>
              <input
                id="register-confirm"
                type="password"
                className="field"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="new-password"
                minLength={6}
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
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-mist">
          Already registered?{' '}
          <Link
            to="/login"
            state={{ from: redirectTo }}
            className="font-semibold text-cyan-glow hover:underline"
          >
            Log in
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
