import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../lib/api'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useToast } from '../contexts/ToastContext'

// ── 10-minute countdown hook ──────────────────────────────────────────────────
function useCountdown(active) {
  const [secs, setSecs] = useState(0)
  const ref = useRef(null)

  function start() {
    setSecs(600)
    clearInterval(ref.current)
    ref.current = setInterval(() => {
      setSecs(s => {
        if (s <= 1) { clearInterval(ref.current); return 0 }
        return s - 1
      })
    }, 1000)
  }

  useEffect(() => () => clearInterval(ref.current), [])

  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')
  return { start, display: `${mm}:${ss}`, expired: secs === 0, secs }
}

// ── OTP panel ─────────────────────────────────────────────────────────────────
function OtpPanel({ email, otp, onOtpChange, onSubmit, onBack, onResend, submitLabel, loading, resendLoading, countdown }) {
  return (
    <div className="space-y-6">

      {/* Sent-to banner */}
      <div className="bg-paper-100 border border-ink-100 rounded-sm px-4 py-3 flex items-start gap-3">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5 text-ink-500">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
        </svg>
        <div className="min-w-0">
          <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-sm text-ink-500 mb-0.5">Code sent to</p>
          <p className="font-t text-[15px] text-ink-900 truncate">{email}</p>
        </div>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-between">
        <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-lg text-ink-500">
          One-time code
        </p>
        <span className={[
          'font-ui font-semibold text-[13px] tabular-nums',
          countdown.expired ? 'text-ink-400' : 'text-ink-900',
        ].join(' ')}>
          {countdown.expired ? 'Expired' : countdown.display}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-ink-100 rounded-pill -mt-4 overflow-hidden">
        <div
          className="h-full bg-ink-900 transition-all duration-1000 ease-linear"
          style={{ width: `${(countdown.secs / 600) * 100}%` }}
        />
      </div>

      {/* OTP input */}
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={e => onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="0  0  0  0  0  0"
          className={[
            'w-full border rounded-sm px-4 py-4 font-ui text-[32px] tracking-[0.4em] text-ink-900 bg-paper-0',
            'outline-none transition-colors duration-base text-center placeholder:text-ink-200',
            countdown.expired ? 'border-ink-200 opacity-50 pointer-events-none' : 'border-ink-200 focus:border-ink-900',
          ].join(' ')}
          autoFocus
          disabled={countdown.expired}
          required
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading || otp.length !== 6 || countdown.expired}
        >
          {loading ? 'Verifying…' : submitLabel}
        </Button>
      </form>

      {/* Actions row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="font-ui text-[11px] uppercase tracking-wide-xs text-ink-400 hover:text-ink-900 transition-colors duration-base cursor-pointer"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={onResend}
          disabled={resendLoading || !countdown.expired}
          className="font-ui text-[11px] uppercase tracking-wide-xs text-ink-400 hover:text-ink-900 transition-colors duration-base cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {resendLoading ? 'Sending…' : countdown.expired ? 'Resend code' : `Resend in ${countdown.display}`}
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const toast     = useToast()
  const from      = location.state?.from || '/'

  const [mode, setMode] = useState(from === '/dashboard/tailor' ? 'tailor' : 'customer')

  // customer
  const [creds, setCreds]     = useState({ email: '', password: '' })
  const [loginL, setLoginL]   = useState(false)

  // tailor
  const [tCreds, setTCreds]   = useState({ email: '', password: '' })
  const [tLoginL, setTLoginL] = useState(false)

  // reset
  const [rStep, setRStep]     = useState('email')
  const [rEmail, setREmail]   = useState('')
  const [rOtp, setROtp]       = useState('')
  const [rPw, setRPw]         = useState({ password: '', confirm: '' })
  const [rSendL, setRSendL]   = useState(false)
  const [rVerifyL, setRVerifyL] = useState(false)
  const [rDone, setRDone]     = useState(false)

  const resetCountdown = useCountdown()

  function switchMode(m) {
    setMode(m)
    setRStep('email'); setROtp(''); setRDone(false)
  }

  async function handleCustomerLogin(e) {
    e.preventDefault(); setLoginL(true)
    try {
      const user = await login(creds.email, creds.password)
      if (user.role === 'tailor') navigate('/dashboard/tailor')
      else if (user.role === 'admin') navigate('/admin')
      else navigate(from)
    } catch (err) { toast(err.message, 'error') }
    finally { setLoginL(false) }
  }

  async function handleTailorLogin(e) {
    e.preventDefault(); setTLoginL(true)
    try {
      const user = await login(tCreds.email, tCreds.password)
      if (user.role !== 'tailor') return toast('This login is for tailor accounts only', 'error')
      navigate('/dashboard/tailor')
    } catch (err) { toast(err.message, 'error') }
    finally { setTLoginL(false) }
  }

  async function handleResetSend(e) {
    if (e?.preventDefault) e.preventDefault()
    setRSendL(true)
    try {
      const res = await authApi.forgotSend({ email: rEmail })
      setREmail(res.email)
      setRStep('otp')
      resetCountdown.start()
      toast(`Reset code sent to ${res.email}`)
    } catch (err) { toast(err.message, 'error') }
    finally { setRSendL(false) }
  }

  async function handleResetVerify(e) {
    e.preventDefault()
    if (rOtp.length !== 6) return toast('Enter the 6-digit code', 'error')
    setRStep('password')
  }

  async function handleResetPassword(e) {
    e.preventDefault()
    if (rPw.password !== rPw.confirm) return toast('Passwords do not match', 'error')
    if (rPw.password.length < 6) return toast('Password must be at least 6 characters', 'error')
    setRVerifyL(true)
    try {
      await authApi.forgotReset({ email: rEmail, otp: rOtp, newPassword: rPw.password })
      setRDone(true)
      toast('Password updated. You can now sign in.')
    } catch (err) { toast(err.message, 'error') }
    finally { setRVerifyL(false) }
  }

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="font-d text-4xl text-ink-900 mb-2">
            {mode === 'reset' ? 'Reset password' : 'Welcome back'}
          </h1>
          <p className="font-t italic text-ink-500">
            {mode === 'reset' ? "We'll send a code to your email" : 'Sign in to your TailorConnect account'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex border border-ink-200 rounded-md overflow-hidden mb-6">
          {[
            { key: 'customer', label: 'Customer' },
            { key: 'tailor',   label: 'Shop Login' },
            { key: 'reset',    label: 'Forgot Password' },
          ].map(({ key, label }) => (
            <button key={key} type="button" onClick={() => switchMode(key)}
              className={[
                'flex-1 py-2.5 font-ui font-semibold text-[10px] uppercase tracking-wide-xs transition-colors duration-base cursor-pointer',
                mode === key ? 'bg-ink-900 text-paper-50' : 'bg-paper-0 text-ink-500 hover:text-ink-900',
              ].join(' ')}>
              {label}
            </button>
          ))}
        </div>

        <div className="bg-paper-0 border border-ink-200 rounded-md p-8">

          {/* Customer */}
          {mode === 'customer' && (
            <form onSubmit={handleCustomerLogin} className="space-y-4">
              <Input label="Email address" type="email" value={creds.email}
                onChange={e => setCreds(p => ({ ...p, email: e.target.value }))} required />
              <Input label="Password" type="password" value={creds.password}
                onChange={e => setCreds(p => ({ ...p, password: e.target.value }))} required />
              <Button type="submit" className="w-full" size="lg" disabled={loginL}>
                {loginL ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          )}

          {/* Tailor */}
          {mode === 'tailor' && (
            <form onSubmit={handleTailorLogin} className="space-y-4">
              <Input label="Email address" type="email" value={tCreds.email}
                onChange={e => setTCreds(p => ({ ...p, email: e.target.value }))} required />
              <Input label="Password" type="password" value={tCreds.password}
                onChange={e => setTCreds(p => ({ ...p, password: e.target.value }))} required />
              <Button type="submit" className="w-full" size="lg" disabled={tLoginL}>
                {tLoginL ? 'Signing in…' : 'Sign in to shop'}
              </Button>
            </form>
          )}

          {/* Reset: email */}
          {mode === 'reset' && rStep === 'email' && (
            <form onSubmit={handleResetSend} className="space-y-4">
              <Input label="Your registered email" type="email" value={rEmail}
                onChange={e => setREmail(e.target.value)} required
                hint="We'll send a 6-digit code to this address" />
              <Button type="submit" className="w-full" size="lg" disabled={rSendL}>
                {rSendL ? 'Sending code…' : 'Send reset code →'}
              </Button>
            </form>
          )}

          {/* Reset: OTP */}
          {mode === 'reset' && rStep === 'otp' && (
            <OtpPanel
              email={rEmail}
              otp={rOtp}
              onOtpChange={setROtp}
              onSubmit={handleResetVerify}
              onBack={() => { setRStep('email'); setROtp('') }}
              onResend={handleResetSend}
              submitLabel="Verify code →"
              loading={false}
              resendLoading={rSendL}
              countdown={resetCountdown}
            />
          )}

          {/* Reset: new password */}
          {mode === 'reset' && rStep === 'password' && !rDone && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input label="New password" type="password" value={rPw.password}
                onChange={e => setRPw(p => ({ ...p, password: e.target.value }))}
                hint="At least 6 characters" required />
              <Input label="Confirm new password" type="password" value={rPw.confirm}
                onChange={e => setRPw(p => ({ ...p, confirm: e.target.value }))} required />
              <Button type="submit" className="w-full" size="lg" disabled={rVerifyL}>
                {rVerifyL ? 'Saving…' : 'Set new password'}
              </Button>
            </form>
          )}

          {/* Reset: done */}
          {mode === 'reset' && rDone && (
            <div className="text-center space-y-4 py-2">
              <p className="font-d text-2xl text-ink-900">Password updated.</p>
              <p className="font-t italic text-ink-500">You can now sign in with your new password.</p>
              <Button className="w-full" size="lg" onClick={() => switchMode('customer')}>Sign in</Button>
            </div>
          )}

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
