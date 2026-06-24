import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import TailorPage from './pages/TailorPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TailorDashboardPage from './pages/TailorDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import TopRatedPage from './pages/TopRatedPage'
import ProfilePage from './pages/ProfilePage'

const FOOTER_LINKS = {
  Platform: [
    { to: '/',                  label: 'Find Tailors'    },
    { to: '/?browse=1',         label: 'Browse All'      },
    { to: '/top-rated',         label: 'Top Rated'       },
    { to: '/register/tailor',   label: 'List Your Shop'  },
  ],
  Account: [
    { to: '/login',             label: 'Sign In'         },
    { to: '/register',          label: 'Create Account'  },
    { to: '/dashboard/tailor',  label: 'Tailor Dashboard'},
  ],
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />

          <main className="flex-1">
            <Routes>
              <Route path="/"                    element={<HomePage />}                         />
              <Route path="/tailor/:id"          element={<TailorPage />}                       />
              <Route path="/login"               element={<LoginPage />}                        />
              <Route path="/register"            element={<RegisterPage />}                     />
              <Route path="/register/tailor"     element={<RegisterPage role="tailor" />}       />
              <Route path="/dashboard/tailor"    element={<TailorDashboardPage />}              />
              <Route path="/admin"               element={<AdminDashboardPage />}               />
              <Route path="/top-rated"           element={<TopRatedPage />}                     />
              <Route path="/profile"            element={<ProfilePage />}                      />
            </Routes>
          </main>

          {/* ── Footer ──────────────────────────────────────────────────────── */}
          <footer className="bg-paper-100 border-t border-ink-200">
            <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">

              {/* Top: brand + nav columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">

                {/* Brand */}
                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <img src="/logo.png" alt="" aria-hidden="true" className="h-8 w-8 object-contain opacity-35" />
                    <span className="font-d font-semibold text-[18px] text-ink-700 leading-none">
                      TailorConnect
                    </span>
                  </div>
                  <p className="font-t italic text-[14px] text-ink-500 leading-relaxed max-w-[200px]">
                    Local tailors. Digital storefronts. Honest reviews.
                  </p>
                  <p className="font-ui text-[10px] uppercase tracking-wide-lg text-ink-400 mt-3">
                    India · Est. 2025
                  </p>
                </div>

                {/* Nav columns */}
                {Object.entries(FOOTER_LINKS).map(([section, links]) => (
                  <div key={section}>
                    <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-lg text-ink-400 mb-3">
                      {section}
                    </p>
                    <div className="flex flex-col gap-2">
                      {links.map(({ to, label }) => (
                        <Link
                          key={to}
                          to={to}
                          className="font-ui text-[12px] text-ink-600 hover:text-ink-900 transition-colors duration-base no-underline"
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom bar */}
              <div className="border-t border-ink-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="font-ui text-[10px] uppercase tracking-wide-xl text-ink-400">
                  © 2025 TailorConnect India · All rights reserved
                </span>
                <span className="font-t italic text-[13px] text-ink-400">
                  Measured, cut, connected.
                </span>
              </div>

            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
