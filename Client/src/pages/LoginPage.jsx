import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role === 'tailor') navigate('/dashboard/tailor')
      else if (user.role === 'admin') navigate('/admin')
      else navigate(from)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-d text-4xl text-ink-900 mb-2">Welcome back</h1>
          <p className="font-t text-ink-500 italic">Sign in to your TailorConnect account</p>
        </div>

        <div className="bg-paper-0 border border-ink-200 rounded-md p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
            {error && <p className="text-sm font-ui text-red-600">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="cut-line my-6" />

          <div className="text-center space-y-2">
            <p className="font-ui text-sm text-ink-600">
              New customer?{' '}
              <Link to="/register" className="text-ink-900 underline hover:no-underline">Create account</Link>
            </p>
            <p className="font-ui text-sm text-ink-600">
              Are you a tailor?{' '}
              <Link to="/register/tailor" className="text-ink-900 underline hover:no-underline">Register your shop</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
