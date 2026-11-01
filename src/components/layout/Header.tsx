import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth/useAuth'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive ? 'bg-charcoal-800 text-white' : 'text-mist hover:text-white',
  ].join(' ')

function BrandMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-charcoal-900">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M1 9h2.2l1.4-5 2.2 10 1.8-7 1.5 4 1.4-2H17"
          stroke="#22d3ee"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function Header() {
  const { user, loading, configured, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-charcoal-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-sm font-semibold tracking-tight text-white">
            Delay Resonance <span className="text-cyan-glow">Explorer</span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1" aria-label="Main navigation">
          <NavLink to="/" end className={navLinkClass}>
            Explore
          </NavLink>
          <NavLink to="/presets" className={navLinkClass}>
            Presets
          </NavLink>
        </nav>

        <div className="flex items-center gap-2 border-l border-line pl-3">
          {loading ? (
            <span className="text-xs text-mist">…</span>
          ) : user ? (
            <>
              <span
                className="hidden max-w-[12rem] truncate text-xs text-mist sm:inline"
                title={user.email ?? ''}
              >
                {user.email}
              </span>
              <button type="button" className="btn px-3 py-1.5 text-xs" onClick={handleSignOut}>
                Log out
              </button>
            </>
          ) : (
            <>
              {!configured ? (
                <span className="hidden text-[11px] text-amber-glow/80 sm:inline">
                  Supabase not configured
                </span>
              ) : null}
              <NavLink to="/login" className="btn px-3 py-1.5 text-xs">
                Log in
              </NavLink>
              <NavLink to="/register" className="btn btn-primary px-3 py-1.5 text-xs">
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
