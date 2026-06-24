import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import LocationSelector from '../components/ui/LocationSelector'

export default function RegisterPage({ role = 'customer' }) {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '', email: '', mobile: '', password: '', confirmPassword: '',
    state: '', district: '', city: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isTailor = role === 'tailor'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match')
    setLoading(true)
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        role,
        state: form.state,
        district: form.district,
        city: form.city,
      })
      if (form.city || form.district || form.state) {
        localStorage.setItem('tc_location', JSON.stringify({
          city: form.city, district: form.district, state: form.state,
        }))
      }
      navigate(isTailor ? '/dashboard/tailor' : '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const setLocation = ({ state, district, city }) =>
    setForm(p => ({ ...p, state, district, city }))

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-d text-4xl text-ink-900 mb-2">
            {isTailor ? 'List your shop' : 'Create account'}
          </h1>
          <p className="font-t text-ink-500 italic">
            {isTailor
              ? 'Open your digital storefront on TailorConnect'
              : 'Find and save your favourite tailors'}
          </p>
        </div>

        <div className="bg-paper-0 border border-ink-200 rounded-md p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" value={form.fullName} onChange={set('fullName')} required />
            <Input label="Email address" type="email" value={form.email} onChange={set('email')} required />
            <Input label="Mobile number" type="tel" value={form.mobile} onChange={set('mobile')} required />
            <Input label="Password" type="password" value={form.password} onChange={set('password')} required />
            <Input label="Confirm password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required />

            {/* ── Location ── */}
            <div className="border-t border-ink-100 pt-4">
              <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-lg text-ink-400 mb-3">
                {isTailor ? 'Shop location' : 'Your location'}
              </p>
              <LocationSelector
                value={{ state: form.state, district: form.district, city: form.city }}
                onChange={setLocation}
                required={isTailor}
              />
              {isTailor && (
                <p className="font-t italic text-[13px] text-ink-400 mt-2">
                  Customers nearby are shown your shop first.
                </p>
              )}
            </div>

            {error && <p className="text-sm font-ui text-red-600">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Creating account…' : isTailor ? 'List my shop' : 'Create account'}
            </Button>
          </form>

          <div className="cut-line my-6" />

          <div className="text-center space-y-2">
            <p className="font-ui text-sm text-ink-600">
              Already have an account?{' '}
              <Link to="/login" className="text-ink-900 underline hover:no-underline">Sign in</Link>
            </p>
            {!isTailor && (
              <p className="font-ui text-sm text-ink-600">
                Are you a tailor?{' '}
                <Link to="/register/tailor" className="text-ink-900 underline hover:no-underline">Register your shop</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
