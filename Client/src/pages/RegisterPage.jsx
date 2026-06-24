import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import LocationSelector from '../components/ui/LocationSelector'
import { tailorsApi } from '../lib/api'

const SHOP_SPECIALTIES = [
  { label: 'Bridal Wear',      hindi: 'शादी के कपड़े' },
  { label: 'Ladies Suits',     hindi: 'सूट-सलवार' },
  { label: "Men's Kurta",      hindi: 'कुर्ता-पायजामा' },
  { label: 'Sherwani',         hindi: 'शेरवानी' },
  { label: 'Blouse Stitching', hindi: 'ब्लाउज़ सिलाई' },
  { label: 'Lehenga',          hindi: 'लहंगा' },
  { label: 'Alterations',      hindi: 'मरम्मत' },
  { label: 'School Uniforms',  hindi: 'यूनिफॉर्म' },
  { label: "Men's Formal",     hindi: 'फॉर्मल ड्रेस' },
  { label: 'Designer Wear',    hindi: 'डिज़ाइनर' },
  { label: 'Embroidery',       hindi: 'कढ़ाई' },
  { label: 'Saree Blouse',     hindi: 'साड़ी-ब्लाउज़' },
]

function SpecialtyPicker({ value, onChange }) {
  function toggle(label) {
    if (value.includes(label)) {
      onChange(value.filter(v => v !== label))
    } else {
      onChange([...value, label])
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="font-ui font-semibold text-[11px] uppercase tracking-wide-lg text-ink-700">
          Specialties
        </p>
        <p className="font-t italic text-[13px] text-ink-400 mt-0.5">
          Select all that apply — at least one required
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SHOP_SPECIALTIES.map(({ label, hindi }) => {
          const selected = value.includes(label)
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              className={[
                'relative text-left px-3 py-3 rounded-sm border transition-all duration-base cursor-pointer',
                selected
                  ? 'bg-ink-900 border-ink-900'
                  : 'bg-paper-0 border-ink-200 hover:border-ink-500',
              ].join(' ')}
            >
              {selected && (
                <span className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-paper-0 flex items-center justify-center">
                  <span className="text-ink-900 text-[8px] font-bold leading-none">✓</span>
                </span>
              )}
              <span className={[
                'block font-t italic text-[15px] leading-tight mb-0.5',
                selected ? 'text-paper-50' : 'text-ink-600',
              ].join(' ')}>
                {hindi}
              </span>
              <span className={[
                'block font-ui font-semibold text-[9px] uppercase tracking-wide-xs',
                selected ? 'text-ink-300' : 'text-ink-800',
              ].join(' ')}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function RegisterPage({ role = 'customer' }) {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '', email: '', mobile: '', password: '', confirmPassword: '',
    shopName: '', whatsapp: '',
    state: '', district: '', city: '', pincode: '',
    specialties: [],
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isTailor = role === 'tailor'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match')
    if (isTailor && form.specialties.length === 0) return setError('Please select at least one specialty')
    if (isTailor && (!form.pincode || form.pincode.length !== 6)) return setError('Please enter a valid 6-digit pincode')
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
        pincode: form.pincode,
      })

      if (form.city || form.district || form.state) {
        localStorage.setItem('tc_location', JSON.stringify({
          city: form.city, district: form.district, state: form.state, pincode: form.pincode,
        }))
      }

      if (isTailor) {
        const token = localStorage.getItem('tc_token')
        try {
          await tailorsApi.create({
            shopName: form.shopName,
            ownerName: form.fullName,
            whatsapp: form.whatsapp,
            mobile: form.mobile,
            email: form.email,
            state: form.state,
            district: form.district,
            city: form.city,
            pincode: form.pincode,
            specialties: form.specialties,
          }, token)
        } catch {
          // Account created — dashboard has a fallback setup form if shop creation fails
        }
        navigate('/dashboard/tailor')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const setLocation = ({ state, district, city, pincode = '' }) =>
    setForm(p => ({ ...p, state, district, city, pincode }))

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <h1 className="font-d text-4xl text-ink-900 mb-2">
            {isTailor ? 'List your shop' : 'Create account'}
          </h1>
          <p className="font-t text-ink-500 italic">
            {isTailor
              ? 'One form — your account and shop, ready to go'
              : 'Find and save your favourite tailors'}
          </p>
        </div>

        <div className="bg-paper-0 border border-ink-200 rounded-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Tailor: identity ── */}
            {isTailor && (
              <div className="space-y-4">
                <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-lg text-ink-400">
                  Your identity
                </p>
                <Input label="Owner name" value={form.fullName} onChange={set('fullName')}
                  placeholder="e.g. Rajesh Kumar" required />
                <Input label="Shop name" value={form.shopName} onChange={set('shopName')}
                  placeholder="e.g. Raj Tailors" required />
              </div>
            )}

            {/* ── Tailor: contact details ── */}
            {isTailor && (
              <div className="border-t border-ink-100 pt-5 space-y-4">
                <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-lg text-ink-400">
                  Contact details
                </p>
                <Input label="WhatsApp number" type="tel" value={form.whatsapp} onChange={set('whatsapp')}
                  placeholder="10-digit number"
                  hint="Customers will contact you on this number" required />
                <Input label="Mobile number" type="tel" value={form.mobile} onChange={set('mobile')}
                  placeholder="10-digit number"
                  hint="Customers can also call you on this number" required />
                <Input label="Email address" type="email" value={form.email} onChange={set('email')}
                  placeholder="you@example.com" required />
              </div>
            )}

            {/* ── Tailor: specialties ── */}
            {isTailor && (
              <div className="border-t border-ink-100 pt-5">
                <SpecialtyPicker
                  value={form.specialties}
                  onChange={v => setForm(p => ({ ...p, specialties: v }))}
                />
              </div>
            )}

            {/* ── Customer: account fields ── */}
            {!isTailor && (
              <div className="space-y-4">
                <Input label="Full name" value={form.fullName} onChange={set('fullName')} required />
                <Input label="Email address" type="email" value={form.email} onChange={set('email')} required />
                <Input label="Password" type="password" value={form.password} onChange={set('password')} required />
                <Input label="Confirm password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
              </div>
            )}

            {/* ── Location ── */}
            <div className="border-t border-ink-100 pt-5">
              <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-lg text-ink-400 mb-3">
                {isTailor ? 'Shop location' : 'Your location'}
              </p>
              <LocationSelector
                value={{ state: form.state, district: form.district, city: form.city, pincode: form.pincode }}
                onChange={setLocation}
                required={isTailor}
                showPincode={isTailor}
              />
              {isTailor && (
                <p className="font-t italic text-[13px] text-ink-400 mt-2">
                  Customers nearby are shown your shop first.
                </p>
              )}
            </div>

            {/* ── Tailor: password ── */}
            {isTailor && (
              <div className="border-t border-ink-100 pt-5 space-y-4">
                <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-lg text-ink-400">
                  Account password
                </p>
                <Input label="Password" type="password" value={form.password} onChange={set('password')} required />
                <Input label="Confirm password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
              </div>
            )}

            {error && <p className="text-sm font-ui text-red-600">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading
                ? (isTailor ? 'Setting up shop…' : 'Creating account…')
                : (isTailor ? 'List my shop' : 'Create account')}
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
