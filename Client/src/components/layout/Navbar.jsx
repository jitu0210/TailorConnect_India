import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-paper-50/92 backdrop-blur-md border-b border-ink-200">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">

        {/* Brand mark */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <svg width="28" height="28" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <g fill="#111111">
              <polygon points="120,490 380,570 380,540" />
              <polygon points="120,590 380,510 380,540" />
              <polygon points="420,300 750,530 750,420" />
              <polygon points="420,780 750,550 750,660" />
              <rect x="780" y="525" width="260" height="30" rx="4" />
              <rect x="780" y="525" width="40" height="30" rx="4" opacity="0" />
            </g>
          </svg>
          <div className="flex items-baseline gap-2.5">
            <span className="font-d font-semibold text-[20px] tracking-[-0.01em] text-ink-900 leading-none">
              TailorConnect
            </span>
            <span className="font-ui font-semibold text-[8px] uppercase tracking-wide-xl text-ink-500 border-l border-ink-300 pl-2.5 self-center">
              India
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex gap-1">
          {[
            { to: '/', label: 'Find Tailors' },
            { to: '/register', label: 'List Your Shop' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
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
      </div>
    </header>
  )
}
