import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  const navLinks =
    user?.role === 'admin'
      ? [{ to: '/', label: 'Find Tailors' }, { to: '/admin', label: 'Admin' }]
      : user?.role === 'tailor'
      ? [{ to: '/', label: 'Find Tailors' }, { to: '/dashboard/tailor', label: 'My Shop' }]
      : [{ to: '/', label: 'Find Tailors' }, { to: '/register/tailor', label: 'List Your Shop' }]

  return (
    <header className="sticky top-0 z-50 bg-paper-50/92 backdrop-blur-md border-b border-ink-200">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">

        {/* Brand mark */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <img
            src="/logo.png"
            alt="TailorConnect India"
            className="h-10 w-10 object-contain"
            aria-hidden="true"
          />
          <div className="flex items-baseline gap-2.5">
            <span className="font-d font-semibold text-[20px] tracking-[-0.01em] text-ink-900 leading-none">
              TailorConnect
            </span>
            <span className="font-ui font-semibold text-[8px] uppercase tracking-wide-xl text-ink-500 border-l border-ink-300 pl-2.5 self-center">
              India
            </span>
          </div>
        </Link>

        {/* Nav links + auth */}
        <div className="flex items-center gap-1">
          <nav className="flex gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  [
                    'font-ui font-semibold text-[11px] uppercase tracking-wide-xs px-2.5 py-1.5 rounded-sm',
                    'transition-colors duration-base',
                    isActive
                      ? 'text-paper-50 bg-ink-900'
                      : 'text-ink-500 hover:text-ink-900',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {user ? (
            <button
              onClick={logout}
              className="ml-2 font-ui font-semibold text-[11px] uppercase tracking-wide-xs px-2.5 py-1.5 rounded-sm text-ink-400 hover:text-ink-900 transition-colors duration-base cursor-pointer"
            >
              Sign out
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                [
                  'ml-2 font-ui font-semibold text-[11px] uppercase tracking-wide-xs px-2.5 py-1.5 rounded-sm',
                  'transition-colors duration-base',
                  isActive ? 'text-paper-50 bg-ink-900' : 'text-ink-500 hover:text-ink-900',
                ].join(' ')
              }
            >
              Sign in
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}
