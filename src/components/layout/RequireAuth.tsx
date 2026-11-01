import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth/useAuth'
import { Loading } from '../ui/Loading'

export function RequireAuth() {
  const { session, loading, configured } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Loading label="Checking your session…" />
  }

  if (!configured || !session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}`, reason: 'auth-required' }}
      />
    )
  }

  return <Outlet />
}
