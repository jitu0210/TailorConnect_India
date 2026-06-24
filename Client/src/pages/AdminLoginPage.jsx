import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function AdminLoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const toast     = useToast()
  const [creds, setCreds]   = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      // username field is stored as the email field in the User model
      const user = await login(creds.username, creds.password)
      if (user.role !== 'admin') {
        toast('Access denied — admin accounts only', 'error')
        return
      }
      navigate('/admin/tci_01/dashboard_hidden')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-3">
            TailorConnect India
          </p>
          <h1 className="font-d text-4xl text-ink-900 mb-2">Admin access</h1>
          <p className="font-t italic text-ink-500 text-[15px]">Internal portal — authorised personnel only</p>
        </div>

        <div className="bg-paper-0 border border-ink-200 rounded-md p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              autoComplete="username"
              value={creds.username}
              onChange={e => setCreds(p => ({ ...p, username: e.target.value }))}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={creds.password}
              onChange={e => setCreds(p => ({ ...p, password: e.target.value }))}
              required
            />
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="text-center font-ui text-[10px] uppercase tracking-wide-lg text-ink-300 mt-6">
          This page is not publicly linked.
        </p>

      </div>
    </div>
  )
}
