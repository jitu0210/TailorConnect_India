import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import TailorPage from './pages/TailorPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TailorDashboardPage from './pages/TailorDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tailor/:id" element={<TailorPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register/tailor" element={<RegisterPage role="tailor" />} />
            <Route path="/dashboard/tailor" element={<TailorDashboardPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Routes>
        </main>

        <footer className="border-t border-ink-200 py-8 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="" aria-hidden="true" className="h-8 w-8 object-contain opacity-30" />
              <span className="font-ui text-[10px] uppercase tracking-wide-xl text-ink-400">
                TailorConnect India
              </span>
            </div>
            <span className="font-t italic text-[13px] text-ink-400">
              Measured, cut, connected.
            </span>
          </div>
        </footer>
      </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
