import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import TailorPage from './pages/TailorPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tailor/:id" element={<TailorPage />} />
          </Routes>
        </main>

        <footer className="border-t border-ink-200 py-8 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="font-ui text-[10px] uppercase tracking-wide-xl text-ink-400">
              TailorConnect India
            </span>
            <span className="font-t italic text-[13px] text-ink-400">
              Measured, cut, connected.
            </span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  )
}
