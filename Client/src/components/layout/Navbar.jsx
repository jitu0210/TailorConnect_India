import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const ROLE_LABEL = { tailor: 'Tailor', customer: 'Customer', admin: 'Admin' }

function UserChip({ user, onSignOut }) {
  const navigate = useNavigate()
  const displayName =
    user.role === 'tailor' && user.tailorProfile?.shopName
      ? user.tailorProfile.shopName
      : user.fullName || user.email

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('')

  return (
    <div className="flex items-center gap-2">
      {/* Avatar */}
      <button
        type="button"
        onClick={() => user.role !== 'admin' && navigate('/profile')}
        className={['w-7 h-7 rounded-full bg-ink-900 border border-ink-700 flex items-center justify-center flex-shrink-0 transition-opacity duration-base', user.role !== 'admin' ? 'cursor-pointer hover:opacity-80' : 'cursor-default'].join(' ')}
        title={user.role !== 'admin' ? 'View profile' : undefined}
      >
        <span className="font-ui font-semibold text-[9px] text-paper-50 leading-none">
          {initials}
        </span>
      </button>

      {/* Name + role */}
      <button
        type="button"
        onClick={() => user.role !== 'admin' && navigate('/profile')}
        className={['hidden md:block leading-none text-left transition-opacity duration-base', user.role !== 'admin' ? 'cursor-pointer hover:opacity-70' : 'cursor-default'].join(' ')}
        title={user.role !== 'admin' ? 'View profile' : undefined}
      >
        <p className="font-ui font-semibold text-[11px] text-ink-900 truncate max-w-[120px]">
          {displayName}
        </p>
        <p className="font-ui text-[9px] uppercase tracking-wide-xs text-ink-400">
          {ROLE_LABEL[user.role] || user.role}
        </p>
      </button>

      <div className="w-px h-4 bg-ink-200 mx-0.5 hidden md:block" />

      <button
        onClick={onSignOut}
        className="font-ui font-semibold text-[11px] uppercase tracking-wide-xs px-2.5 py-1.5 rounded-sm text-ink-400 hover:text-ink-900 transition-colors duration-base cursor-pointer"
      >
        Sign out
      </button>
    </div>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks =
    user?.role === 'admin'
      ? [
          { to: '/', label: 'Find Tailors' },
          { to: '/top-rated', label: 'Top Rated' },
        ]
      : user?.role === 'tailor'
      ? [
          { to: '/', label: 'Find Tailors' },
          { to: '/top-rated', label: 'Top Rated' },
          { to: '/dashboard/tailor', label: 'My Shop' },
        ]
      : [
          { to: '/', label: 'Find Tailors' },
          { to: '/top-rated', label: 'Top Rated' },
          { to: '/register/tailor', label: 'List Your Shop' },
        ]

  const desktopLinkClass = ({ isActive }) =>
    [
      'font-ui font-semibold text-[11px] uppercase tracking-wide-xs px-3 py-1.5 rounded-sm',
      'transition-colors duration-base',
      isActive ? 'text-paper-50 bg-ink-900' : 'text-ink-500 hover:text-ink-900',
    ].join(' ')

  const mobileLinkClass = ({ isActive }) =>
    [
      'font-ui font-semibold text-[11px] uppercase tracking-wide-xs px-3 py-3 rounded-sm block w-full',
      'transition-colors duration-base',
      isActive ? 'text-paper-50 bg-ink-900' : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100',
    ].join(' ')

  const mobileDisplayName =
    user?.role === 'tailor' && user?.tailorProfile?.shopName
      ? user.tailorProfile.shopName
      : user?.fullName || user?.email || ''

  return (
    <header className="sticky top-0 z-50 bg-paper-50/95 backdrop-blur-md border-b border-ink-200">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">

        {/* Brand mark */}
        <Link to="/" className="flex items-center gap-2.5 no-underline flex-shrink-0" onClick={() => setMobileOpen(false)}>
          <img
            src="/logo.png"
            alt="TailorConnect India"
            className="h-8 w-8 object-contain"
            aria-hidden="true"
          />
          <div className="flex items-baseline gap-2">
            <span className="font-d font-semibold text-[20px] tracking-[-0.01em] text-ink-900 leading-none">
              TailorConnect
            </span>
            <span className="font-ui font-semibold text-[8px] uppercase tracking-wide-xl text-ink-500 border-l border-ink-300 pl-2 self-center hidden sm:inline">
              India
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          <nav className="flex gap-0.5">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} end={to === '/'} className={desktopLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="w-px h-4 bg-ink-200 mx-1.5" />

          {user ? (
            <UserChip user={user} onSignOut={logout} />
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                ['font-ui font-semibold text-[11px] uppercase tracking-wide-xs px-3 py-1.5 rounded-sm',
                 'transition-colors duration-base',
                 isActive ? 'text-paper-50 bg-ink-900' : 'text-ink-500 hover:text-ink-900'].join(' ')
              }
            >
              Sign in
            </NavLink>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex flex-col justify-center gap-[5px] w-8 h-8 cursor-pointer"
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <span className={['block h-[1.5px] bg-ink-900 transition-all duration-base origin-center', mobileOpen ? 'rotate-45 translate-y-[6.5px] w-5' : 'w-5'].join(' ')} />
          <span className={['block h-[1.5px] bg-ink-900 transition-all duration-fast w-5', mobileOpen ? 'opacity-0 scale-x-0' : ''].join(' ')} />
          <span className={['block h-[1.5px] bg-ink-900 transition-all duration-base origin-center', mobileOpen ? '-rotate-45 -translate-y-[6.5px] w-5' : 'w-4'].join(' ')} />
        </button>
      </div>

      {/* Mobile dropdown */}
      <div className={['sm:hidden border-t border-ink-200 bg-paper-50 overflow-hidden transition-all duration-base', mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'].join(' ')}>
        <nav className="px-4 py-3 flex flex-col gap-0.5">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
              {label}
            </NavLink>
          ))}

          <div className="my-1 border-t border-ink-100" />

          {user ? (
            <>
              {/* Who is logged in */}
              <div className="px-3 py-2">
                <p className="font-ui font-semibold text-[11px] text-ink-900 truncate">
                  {mobileDisplayName}
                </p>
                <p className="font-ui text-[9px] uppercase tracking-wide-xs text-ink-400 mt-0.5">
                  Logged in as {ROLE_LABEL[user.role] || user.role}
                </p>
              </div>
              {user.role !== 'admin' && (
                <NavLink
                  to="/profile"
                  className={mobileLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  My Profile
                </NavLink>
              )}
              <button
                onClick={() => { logout(); setMobileOpen(false) }}
                className="font-ui font-semibold text-[11px] uppercase tracking-wide-xs px-3 py-3 w-full text-left rounded-sm text-ink-400 hover:text-ink-900 hover:bg-ink-100 transition-colors duration-base cursor-pointer"
              >
                Sign out
              </button>
            </>
          ) : (
            <NavLink to="/login" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
              Sign in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
