import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../lib/api'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import LocationSelector from '../components/ui/LocationSelector'

const ROLE_LABEL = { tailor: 'Tailor', customer: 'Customer', admin: 'Admin' }

export default function ProfilePage() {
  const { user, token, loading: authLoading, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [editMode, setEditMode]       = useState(false)
  const [form, setForm]               = useState({})
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError]     = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [pwForm, setPwForm]         = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading]   = useState(false)
  const [pwError, setPwError]       = useState('')
  const [pwSuccess, setPwSuccess]   = useState(false)
  const [showPw, setShowPw]         = useState(false)

  // Auth guard
  useEffect(() => {
    if (authLoading) return
    if (!user) navigate('/login', { state: { from: '/profile' }, replace: true })
  }, [user, authLoading, navigate])

  // Sync form when user loads
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        mobile:   user.mobile   || '',
        state:    user.state    || '',
        district: user.district || '',
        city:     user.city     || '',
      })
    }
  }, [user])

  function set(k) {
    return (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaveError('')
    setSaveSuccess(false)
    setSaveLoading(true)
    try {
      await authApi.updateMe({
        fullName: form.fullName,
        mobile:   form.mobile,
        state:    form.state,
        district: form.district,
        city:     form.city,
      }, token)
      await refreshUser()
      setSaveSuccess(true)
      setEditMode(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaveLoading(false)
    }
  }

  function cancelEdit() {
    setEditMode(false)
    setSaveError('')
    if (user) {
      setForm({
        fullName: user.fullName || '',
        mobile:   user.mobile   || '',
        state:    user.state    || '',
        district: user.district || '',
        city:     user.city     || '',
      })
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setPwError('New passwords do not match')
    }
    if (pwForm.newPassword.length < 6) {
      return setPwError('New password must be at least 6 characters')
    }
    setPwLoading(true)
    try {
      await authApi.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      }, token)
      setPwSuccess(true)
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPw(false)
      setTimeout(() => setPwSuccess(false), 4000)
    } catch (err) {
      setPwError(err.message)
    } finally {
      setPwLoading(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-4 animate-pulse">
        <div className="h-10 w-48 bg-ink-100 rounded-md" />
        <div className="h-4 w-32 bg-ink-100 rounded" />
        <div className="h-64 bg-ink-100 rounded-md mt-6" />
      </div>
    )
  }

  const initials = (user.fullName || user.email || '')
    .split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-ink-900 flex items-center justify-center flex-shrink-0">
            <span className="font-ui font-semibold text-[18px] text-paper-50 leading-none">
              {initials}
            </span>
          </div>
          <div>
            <h1 className="font-d text-[clamp(26px,5vw,36px)] text-ink-900 leading-tight">
              {user.fullName}
            </h1>
            <p className="font-ui text-[10px] uppercase tracking-wide-xl text-ink-400 mt-0.5">
              {ROLE_LABEL[user.role] || user.role}
            </p>
          </div>
        </div>

        {!editMode && (
          <Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="flex-shrink-0">
            Edit profile
          </Button>
        )}
      </div>

      {/* Role-specific shortcut */}
      {user.role === 'tailor' && (
        <div className="mb-6 border border-dashed border-ink-300 rounded-md px-5 py-4 flex items-center justify-between gap-3">
          <p className="font-t italic text-[15px] text-ink-600">
            Manage your shop, gallery, and subscription
          </p>
          <Link to="/dashboard/tailor">
            <Button variant="outline" size="sm">My Shop →</Button>
          </Link>
        </div>
      )}
      {user.role === 'admin' && (
        <div className="mb-6 border border-dashed border-ink-300 rounded-md px-5 py-4 flex items-center justify-between gap-3">
          <p className="font-t italic text-[15px] text-ink-600">
            Manage users, tailors and reviews
          </p>
          <Link to="/admin">
            <Button variant="outline" size="sm">Admin Panel →</Button>
          </Link>
        </div>
      )}

      {/* ── View Mode ─────────────────────────────────────────────────────── */}
      {!editMode && (
        <div className="bg-paper-0 border border-ink-200 rounded-md divide-y divide-ink-100">

          <div className="px-6 py-5">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-4">
              Account details
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              {[
                ['Full name',  user.fullName],
                ['Email',      user.email],
                ['Mobile',     user.mobile   || '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-ui font-semibold text-[9px] uppercase tracking-wide-lg text-ink-400 mb-0.5">{k}</dt>
                  <dd className="font-t text-[16px] text-ink-800">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {(user.state || user.district || user.city) && (
            <div className="px-6 py-5">
              <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-4">
                Location
              </p>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-8">
                {[
                  ['State',    user.state    || '—'],
                  ['District', user.district || '—'],
                  ['City',     user.city     || '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-ui font-semibold text-[9px] uppercase tracking-wide-lg text-ink-400 mb-0.5">{k}</dt>
                    <dd className="font-t text-[16px] text-ink-800">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {!(user.state || user.district || user.city) && (
            <div className="px-6 py-5">
              <p className="font-t italic text-[14px] text-ink-400">
                No location set.{' '}
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="underline hover:no-underline text-ink-600 cursor-pointer"
                >
                  Add your location
                </button>{' '}
                to see nearby tailors first.
              </p>
            </div>
          )}
        </div>
      )}

      {saveSuccess && !editMode && (
        <p className="font-t italic text-[14px] text-ink-600 mt-3">Profile updated.</p>
      )}

      {/* ── Edit Mode ─────────────────────────────────────────────────────── */}
      {editMode && (
        <form onSubmit={handleSave} className="bg-paper-0 border border-ink-200 rounded-md px-6 py-6 space-y-5">
          <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400">
            Edit profile
          </p>

          <Input
            label="Full name"
            value={form.fullName}
            onChange={set('fullName')}
            required
          />

          <div>
            <label className="block font-ui font-semibold text-[11px] uppercase tracking-wide-lg text-ink-700 mb-1.5">
              Email address
            </label>
            <p className="font-t text-[16px] text-ink-400 border border-ink-100 bg-paper-100 rounded-sm px-3 py-2.5">
              {user.email}
            </p>
            <p className="font-t italic text-[12px] text-ink-400 mt-1">Email cannot be changed.</p>
          </div>

          <Input
            label="Mobile number"
            type="tel"
            value={form.mobile}
            onChange={set('mobile')}
            required
          />

          <div className="border-t border-ink-100 pt-5">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-lg text-ink-400 mb-3">
              Location
            </p>
            <LocationSelector
              value={{ state: form.state, district: form.district, city: form.city }}
              onChange={({ state, district, city }) =>
                setForm(f => ({ ...f, state, district, city }))
              }
            />
            <p className="font-t italic text-[13px] text-ink-400 mt-2">
              Helps surface tailors near you on the homepage.
            </p>
          </div>

          {saveError && (
            <p className="font-t italic text-[14px] text-ink-700">{saveError}</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={saveLoading}>
              {saveLoading ? 'Saving…' : 'Save changes'}
            </Button>
            <Button type="button" variant="ghost" onClick={cancelEdit} disabled={saveLoading}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* ── Change password ────────────────────────────────────────────────── */}
      <div className="mt-8">
        <div className="border-t border-ink-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400">
              Password
            </p>
            {!showPw && (
              <button
                type="button"
                onClick={() => setShowPw(true)}
                className="font-ui font-semibold text-[11px] uppercase tracking-wide-xs text-ink-500 hover:text-ink-900 transition-colors duration-base cursor-pointer"
              >
                Change password
              </button>
            )}
          </div>

          {pwSuccess && (
            <p className="font-t italic text-[14px] text-ink-600 mb-3">Password changed successfully.</p>
          )}

          {showPw && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current password"
                type="password"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                required
              />
              <Input
                label="New password"
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                required
              />
              <Input
                label="Confirm new password"
                type="password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                required
              />

              {pwError && (
                <p className="font-t italic text-[14px] text-ink-700">{pwError}</p>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={pwLoading}>
                  {pwLoading ? 'Updating…' : 'Update password'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setShowPw(false); setPwError(''); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) }}
                  disabled={pwLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

    </div>
  )
}
