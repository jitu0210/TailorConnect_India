import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import LocationSelector from '../components/ui/LocationSelector'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import RatingStars from '../components/ui/RatingStars'
import { tailorsApi, subscriptionsApi, uploadsApi } from '../lib/api'

const SPECIALTY_SUGGESTIONS = [
  "Men's Formal","Men's Kurta",'Sherwani',"Women's Suits",'Salwar Kameez',
  'Lehenga','Blouse Stitching','Bridal Wear','Alterations','School Uniforms',
  'Designer Wear','Embroidery',
]

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = resolve
    s.onerror = reject
    document.body.appendChild(s)
  })
}

// ── Small UI pieces ──────────────────────────────────────────────────────────

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-paper-0 border border-ink-200 rounded-md px-5 py-4">
      <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-1">{label}</p>
      <p className="font-d text-3xl text-ink-900 leading-none">{value}</p>
      {sub && <p className="font-ui text-[11px] text-ink-500 mt-1">{sub}</p>}
    </div>
  )
}

function SpecialtyInput({ value = [], onChange }) {
  const [input, setInput] = useState('')

  function add(raw) {
    const v = raw.trim()
    if (v && !value.includes(v)) onChange([...value, v])
    setInput('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input) }
    if (e.key === 'Backspace' && !input && value.length) onChange(value.slice(0, -1))
  }

  return (
    <div className="flex flex-col gap-[7px]">
      <label className="font-ui font-semibold text-[11px] uppercase tracking-wide-lg text-ink-700">
        Specialties
      </label>
      <div className="border border-ink-200 rounded-sm p-2 bg-paper-0 flex flex-wrap gap-1.5 min-h-[44px] focus-within:border-ink-900 transition-colors duration-base">
        {value.map(s => (
          <span key={s} className="inline-flex items-center gap-1 bg-ink-900 text-paper-50 rounded-sm px-2.5 py-0.5 font-ui text-[11px]">
            {s}
            <button type="button" onClick={() => onChange(value.filter(x => x !== s))} className="opacity-60 hover:opacity-100 cursor-pointer leading-none">✕</button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && add(input)}
          placeholder={value.length === 0 ? 'Type and press Enter…' : ''}
          className="flex-1 min-w-[120px] font-t text-[15px] text-ink-900 bg-transparent outline-none placeholder:text-ink-400"
        />
      </div>
      <span className="font-t italic text-[13px] text-ink-400">
        Suggestions: {SPECIALTY_SUGGESTIONS.slice(0, 5).join(', ')}
      </span>
    </div>
  )
}

function OpenNowToggle({ checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="font-ui font-semibold text-[12px] uppercase tracking-wide-sm text-ink-700">Open now</p>
        <p className="font-t italic text-[14px] text-ink-500">Show customers your shop is currently open</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-pill border-2 cursor-pointer',
          'transition-colors duration-base',
          checked ? 'bg-ink-900 border-ink-900' : 'bg-ink-100 border-ink-200',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 rounded-full bg-white shadow-xs transition-transform duration-base',
            checked ? 'translate-x-[22px]' : 'translate-x-[2px]',
          ].join(' ')}
        />
      </button>
    </div>
  )
}

function ReviewRow({ review, token, onReplySaved }) {
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState(review.tailorReply?.text || '')
  const [saving, setSaving] = useState(false)
  const hasReply = Boolean(review.tailorReply?.text)

  async function handleReply(e) {
    e.preventDefault()
    if (!replyText.trim()) return
    setSaving(true)
    try {
      await tailorsApi.replyToReview(review._id, replyText, token)
      onReplySaved(review._id, replyText)
      setReplying(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="border-b border-ink-100 pb-6 last:border-0 last:pb-0">
      <div className="flex items-start gap-3">
        <Avatar initials={review.customerName?.charAt(0)?.toUpperCase()} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-ui font-semibold text-[13px] text-ink-900">{review.customerName}</span>
            <RatingStars rating={review.rating} size="sm" />
            {review.serviceType && (
              <span className="font-ui text-[10px] uppercase tracking-wide-xs text-ink-400">· {review.serviceType}</span>
            )}
          </div>
          <p className="font-ui text-[10px] text-ink-400 mb-2">
            {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          {review.comment && (
            <p className="font-t text-[15px] leading-relaxed text-ink-700">"{review.comment}"</p>
          )}

          {/* Existing reply */}
          {hasReply && !replying && (
            <div className="mt-3 bg-paper-100 rounded-sm px-4 py-3">
              <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-sm text-ink-500 mb-1">Your reply</p>
              <p className="font-t text-[14px] text-ink-700">{review.tailorReply.text}</p>
              <button
                type="button"
                onClick={() => setReplying(true)}
                className="font-ui text-[10px] uppercase tracking-wide-xs text-ink-400 hover:text-ink-900 mt-1.5 cursor-pointer transition-colors duration-base"
              >
                Edit
              </button>
            </div>
          )}

          {/* Reply CTA */}
          {!hasReply && !replying && (
            <button
              type="button"
              onClick={() => setReplying(true)}
              className="mt-2 font-ui text-[11px] uppercase tracking-wide-xs text-ink-400 hover:text-ink-900 cursor-pointer transition-colors duration-base"
            >
              + Reply
            </button>
          )}

          {/* Reply form */}
          {replying && (
            <form onSubmit={handleReply} className="mt-3 flex flex-col gap-2">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Write a reply…"
                className="w-full border border-ink-200 rounded-sm px-3 py-2.5 font-t text-[15px] text-ink-900 bg-paper-0 outline-none focus:border-ink-900 resize-none placeholder:text-ink-400"
                autoFocus
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={saving || !replyText.trim()}>
                  {saving ? 'Saving…' : 'Save reply'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => { setReplying(false); setReplyText(review.tailorReply?.text || '') }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </article>
  )
}

// ── Dashboard page ────────────────────────────────────────────────────────────

export default function TailorDashboardPage() {
  const { user, token, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('overview')
  const [profile, setProfile] = useState(undefined)  // undefined = not loaded yet
  const [reviews, setReviews] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [dataLoading, setDataLoading] = useState(true)

  // Setup form (no profile yet)
  const [setup, setSetup] = useState({ shopName: '', ownerName: '', whatsapp: '', mobile: '', email: '', state: '', district: '', city: '' })
  const [setupLoading, setSetupLoading] = useState(false)
  const [setupError, setSetupError] = useState('')

  // Edit form
  const [editForm, setEditForm] = useState({})
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Photo uploads
  const profileInputRef  = useRef(null)
  const coverInputRef    = useRef(null)
  const galleryInputRef  = useRef(null)
  const [photoLoading, setPhotoLoading] = useState(null) // 'profile'|'cover'|'gallery'
  const [photoError, setPhotoError]     = useState('')
  const [galleryCategory, setGalleryCategory] = useState('General')
  const [galleryCaption, setGalleryCaption]   = useState('')

  // Subscription / Razorpay
  const [selectedPlan, setSelectedPlan] = useState('semiannual')
  const [upgradeLoading, setUpgradeLoading] = useState(false)
  const [upgradeError, setUpgradeError] = useState('')
  const [upgradeSuccess, setUpgradeSuccess] = useState(false)

  // Auth guard
  useEffect(() => {
    if (authLoading) return
    if (!user) navigate('/login', { state: { from: '/dashboard/tailor' }, replace: true })
    else if (user.role !== 'tailor') navigate('/', { replace: true })
  }, [user, authLoading, navigate])

  const loadData = useCallback(async () => {
    if (!token) return
    setDataLoading(true)
    const [p, r, s] = await Promise.allSettled([
      tailorsApi.myProfile(token),
      tailorsApi.myReviews({}, token),
      subscriptionsApi.status(token),
    ])
    if (p.status === 'fulfilled') {
      setProfile(p.value)
      setEditForm({ ...p.value })
    } else {
      setProfile(null)  // 404 → first-time setup
    }
    if (r.status === 'fulfilled') setReviews(r.value.reviews || [])
    if (s.status === 'fulfilled') setSubscription(s.value)
    setDataLoading(false)
  }, [token])

  useEffect(() => {
    if (!authLoading && token) loadData()
  }, [authLoading, token, loadData])

  function setField(k, v) {
    setEditForm(f => ({ ...f, [k]: v }))
  }

  async function handleSetup(e) {
    e.preventDefault()
    setSetupError('')
    setSetupLoading(true)
    try {
      const body = { ...setup, ownerName: setup.ownerName || user?.fullName }
      const p = await tailorsApi.create(body, token)
      setProfile(p)
      setEditForm({ ...p })
    } catch (err) {
      setSetupError(err.message)
    } finally {
      setSetupLoading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaveError('')
    setSaveSuccess(false)
    setSaveLoading(true)
    try {
      const p = await tailorsApi.updateMe(editForm, token)
      setProfile(p)
      setEditForm({ ...p })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaveLoading(false)
    }
  }

  async function handleUpgrade(plan) {
    setUpgradeError('')
    setUpgradeSuccess(false)
    setUpgradeLoading(true)
    try {
      const order = await subscriptionsApi.createOrder(plan, token)
      await loadRazorpay()
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'TailorConnect India',
        description: `Premium · ${order.planLabel}`,
        order_id: order.orderId,
        prefill: order.prefill,
        theme: { color: '#111111' },
        handler: async (resp) => {
          try {
            await subscriptionsApi.verifyPayment({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }, token)
            const [s, p] = await Promise.all([
              subscriptionsApi.status(token),
              tailorsApi.myProfile(token),
            ])
            setSubscription(s)
            setProfile(p)
            setEditForm({ ...p })
            setUpgradeSuccess(true)
          } catch {
            setUpgradeError('Payment received but verification failed. Please contact support.')
          }
        },
        modal: { ondismiss: () => setUpgradeLoading(false) },
      })
      rzp.open()
    } catch (err) {
      setUpgradeError(err.message)
      setUpgradeLoading(false)
    }
  }

  function handleReplySaved(reviewId, text) {
    setReviews(rs =>
      rs.map(r => r._id === reviewId ? { ...r, tailorReply: { text, repliedAt: new Date() } } : r)
    )
  }

  async function handleProfilePhotoUpload(e, field) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError('')
    setPhotoLoading(field)
    try {
      const fd = new FormData()
      fd.append(field, file)
      const updated = await uploadsApi.tailorProfile(fd, token)
      setProfile(p => ({ ...p, ...updated }))
      setEditForm(f => ({ ...f, ...updated }))
    } catch (err) {
      setPhotoError(err.message)
    } finally {
      setPhotoLoading(null)
      e.target.value = ''
    }
  }

  async function handleGalleryAdd(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError('')
    setPhotoLoading('gallery')
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('category', galleryCategory)
      if (galleryCaption.trim()) fd.append('caption', galleryCaption.trim())
      const newItem = await uploadsApi.galleryAdd(fd, token)
      // Server returns the newly added item, so push it into existing gallery
      setProfile(p => ({ ...p, gallery: [...(p.gallery || []), newItem] }))
      setGalleryCaption('')
    } catch (err) {
      setPhotoError(err.message)
    } finally {
      setPhotoLoading(null)
      e.target.value = ''
    }
  }

  async function handleGalleryDelete(itemId) {
    setPhotoError('')
    try {
      await uploadsApi.galleryDelete(itemId, token)
      // Server returns { message } — filter locally instead
      setProfile(p => ({ ...p, gallery: (p.gallery || []).filter(g => g._id !== itemId) }))
    } catch (err) {
      setPhotoError(err.message)
    }
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (authLoading || dataLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-4">
        <div className="h-10 w-56 bg-ink-100 rounded-md animate-pulse" />
        <div className="h-4 w-32 bg-ink-100 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4 mt-6">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-ink-100 rounded-md animate-pulse" />)}
        </div>
      </div>
    )
  }

  // ── First-time shop setup ────────────────────────────────────────────────

  if (profile === null) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-d text-4xl text-ink-900 mb-2">Set up your shop</h1>
            <p className="font-t italic text-ink-500">A few details and you're live on TailorConnect</p>
          </div>
          <div className="bg-paper-0 border border-ink-200 rounded-md p-8">
            <form onSubmit={handleSetup} className="space-y-4">
              <Input
                label="Shop name"
                value={setup.shopName}
                onChange={e => setSetup(s => ({ ...s, shopName: e.target.value }))}
                placeholder="e.g. Raj Tailors"
                required
              />
              <Input
                label="Your name"
                value={setup.ownerName}
                onChange={e => setSetup(s => ({ ...s, ownerName: e.target.value }))}
                placeholder={user?.fullName}
              />
              <Input
                label="WhatsApp number"
                type="tel"
                value={setup.whatsapp}
                onChange={e => setSetup(s => ({ ...s, whatsapp: e.target.value }))}
                placeholder="10-digit number"
                required
              />
              <Input
                label="Mobile / contact number"
                type="tel"
                value={setup.mobile}
                onChange={e => setSetup(s => ({ ...s, mobile: e.target.value }))}
                placeholder="10-digit number"
                hint="Customers can call you on this number"
                required
              />
              <Input
                label="Email address"
                type="email"
                value={setup.email}
                onChange={e => setSetup(s => ({ ...s, email: e.target.value }))}
                placeholder="you@example.com"
                hint="Customers can also reach you by email"
                required
              />
              <div>
                <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-lg text-ink-400 mb-3">
                  Shop location
                </p>
                <LocationSelector
                  value={{ state: setup.state, district: setup.district, city: setup.city }}
                  onChange={({ state, district, city }) => setSetup(s => ({ ...s, state, district, city }))}
                  required
                />
                <p className="font-t italic text-[13px] text-ink-400 mt-2">
                  Customers nearby see your shop first.
                </p>
              </div>
              {setupError && <p className="font-t italic text-[14px] text-ink-700">{setupError}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={setupLoading}>
                {setupLoading ? 'Creating shop…' : 'Create shop'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── Main dashboard ────────────────────────────────────────────────────────

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'profile', label: 'Edit Profile' },
    { key: 'photos', label: profile?.gallery?.length ? `Photos (${profile.gallery.length})` : 'Photos' },
    { key: 'reviews', label: reviews.length ? `Reviews (${reviews.length})` : 'Reviews' },
    { key: 'subscription', label: 'Subscription' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="font-d text-[clamp(28px,5vw,40px)] text-ink-900 leading-tight truncate">
            {profile.shopName}
          </h1>
          <p className="font-ui text-[11px] uppercase tracking-wide-sm text-ink-500 mt-1">
            {[profile.city, profile.state].filter(Boolean).join(', ')}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {profile.isVerified && <Badge variant="solid">✓ Verified</Badge>}
            {profile.isTopRated && <Badge variant="outline">Top Rated</Badge>}
            <Badge variant={profile.status === 'approved' ? 'ghost' : 'muted'}>
              {profile.status}
            </Badge>
            {profile.subscriptionType === 'premium' && (
              <Badge variant="solid">★ Premium</Badge>
            )}
          </div>
        </div>
        {profile.status === 'approved' && (
          <Link to={`/tailor/${profile._id}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <Button variant="outline" size="sm">View Shop ↗</Button>
          </Link>
        )}
      </div>

      {/* Pending / rejected notice */}
      {profile.status === 'pending' && (
        <div className="border border-dashed border-ink-300 rounded-md px-5 py-4 mb-6 bg-paper-100">
          <p className="font-t italic text-[15px] text-ink-600">
            Your shop is under review. It will appear in search results once approved — usually within 1–2 business days.
          </p>
        </div>
      )}
      {profile.status === 'rejected' && (
        <div className="border border-ink-900 rounded-md px-5 py-4 mb-6">
          <p className="font-t italic text-[15px] text-ink-700">
            Your shop application was not approved. Please update your profile and contact support if you have questions.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-ink-200 mb-8">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={[
              'font-ui font-semibold text-[11px] uppercase tracking-wide-sm px-4 py-3 -mb-px',
              'border-b-2 transition-colors duration-base cursor-pointer',
              tab === key
                ? 'border-ink-900 text-ink-900'
                : 'border-transparent text-ink-400 hover:text-ink-700',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Rating"
              value={profile.rating ? profile.rating.toFixed(1) : '—'}
              sub={`${profile.reviewCount} review${profile.reviewCount === 1 ? '' : 's'}`}
            />
            <StatCard label="Reviews" value={profile.reviewCount} />
            <StatCard
              label="Plan"
              value={profile.subscriptionType === 'premium' ? 'Premium' : 'Free'}
            />
            <StatCard
              label="Status"
              value={profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
            />
          </div>

          <div className="cut-line" />

          <div>
            <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500 mb-4">
              Contact &amp; location
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
              {[
                ['WhatsApp', profile.whatsapp],
                ['Mobile', profile.mobile],
                ['Email', profile.email],
                ['Address', profile.address],
                ['Pincode', profile.pincode],
                ['Experience', profile.experience ? `${profile.experience} yr${profile.experience === 1 ? '' : 's'}` : null],
                ['Radius', profile.serviceRadius ? `${profile.serviceRadius} km` : null],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="font-ui font-semibold text-[10px] uppercase tracking-wide-xs text-ink-400 w-24 flex-shrink-0 pt-0.5">
                    {k}
                  </dt>
                  <dd className="font-t text-[15px] text-ink-800">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {profile.specialties?.length > 0 && (
            <div>
              <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500 mb-3">
                Specialties
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.specialties.map(s => (
                  <span key={s} className="border border-ink-200 rounded-sm px-3 py-1 font-ui text-[12px] text-ink-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.bio && (
            <div>
              <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500 mb-2">About</p>
              <p className="font-t text-[16px] leading-relaxed text-ink-700 italic">{profile.bio}</p>
            </div>
          )}

          <div className="cut-line" />

          <div className="flex gap-3">
            <Button size="sm" onClick={() => setTab('profile')}>Edit Profile</Button>
            {profile.subscriptionType === 'free' && (
              <Button size="sm" variant="outline" onClick={() => setTab('subscription')}>
                Upgrade to Premium
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Profile ── */}
      {tab === 'profile' && (
        <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Shop name"
              value={editForm.shopName || ''}
              onChange={e => setField('shopName', e.target.value)}
              required
            />
            <Input
              label="Owner name"
              value={editForm.ownerName || ''}
              onChange={e => setField('ownerName', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="WhatsApp number"
              type="tel"
              value={editForm.whatsapp || ''}
              onChange={e => setField('whatsapp', e.target.value)}
              required
              hint="Customers will contact you on this number"
            />
            <Input
              label="Mobile / contact number"
              type="tel"
              value={editForm.mobile || ''}
              onChange={e => setField('mobile', e.target.value)}
              required
              hint="Customers can call you on this number"
            />
          </div>

          <Input
            label="Email address"
            type="email"
            value={editForm.email || ''}
            onChange={e => setField('email', e.target.value)}
            required
            hint="Customers can also reach you by email"
          />

          <div className="cut-line" />

          <Input
            label="Street address"
            value={editForm.address || ''}
            onChange={e => setField('address', e.target.value)}
            placeholder="Locality / street"
          />

          <div>
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-lg text-ink-400 mb-3">
              Shop location
            </p>
            <LocationSelector
              value={{
                state: editForm.state || '',
                district: editForm.district || '',
                city: editForm.city || '',
              }}
              onChange={({ state, district, city }) => {
                setField('state', state)
                setField('district', district)
                setField('city', city)
              }}
              required
            />
          </div>

          <Input
            label="Pincode"
            value={editForm.pincode || ''}
            onChange={e => setField('pincode', e.target.value)}
          />

          <div className="cut-line" />

          <SpecialtyInput
            value={editForm.specialties || []}
            onChange={v => setField('specialties', v)}
          />

          <div className="flex flex-col gap-[7px]">
            <label className="font-ui font-semibold text-[11px] uppercase tracking-wide-lg text-ink-700">
              About your shop
            </label>
            <textarea
              value={editForm.bio || ''}
              onChange={e => setField('bio', e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Your experience, specialities, and what makes your work stand out…"
              className="w-full border border-ink-200 rounded-sm px-3 py-2.5 font-t text-[16px] text-ink-900 bg-paper-0 outline-none focus:border-ink-900 resize-none placeholder:text-ink-400 transition-colors duration-base"
            />
            <span className="font-t italic text-[13px] text-ink-400">
              {(editForm.bio || '').length}/500
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Experience (years)"
              type="number"
              min={0}
              max={80}
              value={editForm.experience ?? ''}
              onChange={e => setField('experience', e.target.value === '' ? 0 : +e.target.value)}
            />
            <Input
              label="Service radius (km)"
              type="number"
              min={1}
              max={100}
              value={editForm.serviceRadius ?? ''}
              onChange={e => setField('serviceRadius', e.target.value === '' ? 10 : +e.target.value)}
            />
          </div>

          <div className="cut-line" />

          <OpenNowToggle
            checked={Boolean(editForm.isOpenNow)}
            onChange={v => setField('isOpenNow', v)}
          />

          {saveError && <p className="font-t italic text-[14px] text-ink-700">{saveError}</p>}
          {saveSuccess && <p className="font-t italic text-[14px] text-ink-600">Profile saved.</p>}

          <div className="flex gap-3 pt-1">
            <Button type="submit" disabled={saveLoading}>
              {saveLoading ? 'Saving…' : 'Save changes'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setEditForm({ ...profile }); setSaveError(''); setSaveSuccess(false) }}
              disabled={saveLoading}
            >
              Reset
            </Button>
          </div>
        </form>
      )}

      {/* ── Photos ── */}
      {tab === 'photos' && (
        <div className="space-y-10 max-w-2xl">

          {photoError && (
            <p className="font-t italic text-[14px] text-ink-700 border border-ink-300 rounded-sm px-4 py-3">
              {photoError}
            </p>
          )}

          {/* Hidden camera inputs — capture="environment" forces back camera, no gallery */}
          <input ref={profileInputRef} type="file" accept="image/*" capture="environment"
            className="sr-only" onChange={e => handleProfilePhotoUpload(e, 'profileImage')} />
          <input ref={coverInputRef} type="file" accept="image/*" capture="environment"
            className="sr-only" onChange={e => handleProfilePhotoUpload(e, 'coverImage')} />
          <input ref={galleryInputRef} type="file" accept="image/*" capture="environment"
            className="sr-only" onChange={handleGalleryAdd} />

          {/* ── Profile & cover photos ── */}
          <section>
            <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500 mb-5">
              Profile &amp; cover photos
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Profile photo */}
              <div>
                <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-sm text-ink-500 mb-3">
                  Profile photo
                </p>
                <div className="w-full aspect-square rounded-sm overflow-hidden bg-paper-100 mb-3 relative">
                  {profile?.profileImage ? (
                    <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-300">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={photoLoading === 'profile'}
                  onClick={() => profileInputRef.current?.click()}
                >
                  {photoLoading === 'profile' ? 'Uploading…' : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                        <circle cx="12" cy="12" r="3"/><path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z"/>
                      </svg>
                      {profile?.profileImage ? 'Replace photo' : 'Take photo'}
                    </>
                  )}
                </Button>
                <p className="font-t italic text-[12px] text-ink-400 mt-2">Camera only · no gallery access</p>
              </div>

              {/* Cover photo */}
              <div>
                <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-sm text-ink-500 mb-3">
                  Cover photo
                </p>
                <div className="w-full aspect-[16/9] rounded-sm overflow-hidden bg-paper-100 mb-3 relative">
                  {profile?.coverImage ? (
                    <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-300">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={photoLoading === 'cover'}
                  onClick={() => coverInputRef.current?.click()}
                >
                  {photoLoading === 'cover' ? 'Uploading…' : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                        <circle cx="12" cy="12" r="3"/><path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z"/>
                      </svg>
                      {profile?.coverImage ? 'Replace cover' : 'Take photo'}
                    </>
                  )}
                </Button>
                <p className="font-t italic text-[12px] text-ink-400 mt-2">Camera only · no gallery access</p>
              </div>
            </div>
          </section>

          <div className="cut-line" />

          {/* ── Gallery ── */}
          <section>
            <div className="flex items-baseline justify-between mb-5 gap-3 flex-wrap">
              <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500">
                Shop gallery
              </p>
              {(profile?.gallery?.length || 0) > 0 && (
                <span className="font-t italic text-[13px] text-ink-400">
                  {profile.gallery.length} photo{profile.gallery.length === 1 ? '' : 's'}
                </span>
              )}
            </div>

            {/* Add new photo controls */}
            <div className="bg-paper-100 rounded-sm px-5 py-4 mb-6 space-y-3">
              <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-sm text-ink-500">
                Add a photo
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-ui font-semibold text-[10px] uppercase tracking-wide-xs text-ink-500">
                    Category
                  </label>
                  <select
                    value={galleryCategory}
                    onChange={e => setGalleryCategory(e.target.value)}
                    className="border border-ink-200 rounded-sm px-3 py-2 font-ui text-[13px] text-ink-900 bg-paper-0 outline-none focus:border-ink-900 transition-colors duration-base"
                  >
                    {["Men's Wear","Women's Wear","Bridal Wear","Alterations","Uniforms","Designer","General"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-ui font-semibold text-[10px] uppercase tracking-wide-xs text-ink-500">
                    Caption (optional)
                  </label>
                  <input
                    type="text"
                    value={galleryCaption}
                    onChange={e => setGalleryCaption(e.target.value)}
                    maxLength={80}
                    placeholder="Describe this photo…"
                    className="border border-ink-200 rounded-sm px-3 py-2 font-t text-[14px] text-ink-900 bg-paper-0 outline-none focus:border-ink-900 transition-colors duration-base placeholder:text-ink-400"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={photoLoading === 'gallery'}
                onClick={() => galleryInputRef.current?.click()}
              >
                {photoLoading === 'gallery' ? 'Uploading…' : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                      <circle cx="12" cy="12" r="3"/><path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z"/>
                    </svg>
                    Open camera &amp; add photo
                  </>
                )}
              </Button>
              <p className="font-t italic text-[12px] text-ink-400">
                Live camera only — your device's back camera will open. No gallery access.
              </p>
            </div>

            {/* Gallery grid */}
            {(profile?.gallery?.length || 0) === 0 ? (
              <p className="font-t italic text-ink-400 text-[15px]">
                No photos yet. Add some photos of your work to attract more customers.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(profile.gallery || []).map((item) => (
                  <div key={item._id || item.publicId} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-sm bg-paper-100">
                      <img
                        src={item.url}
                        alt={item.caption || item.category || 'Shop photo'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {(item.category || item.caption) && (
                      <div className="mt-1.5">
                        {item.category && (
                          <p className="font-ui text-[9px] uppercase tracking-wide-xs text-ink-400">{item.category}</p>
                        )}
                        {item.caption && (
                          <p className="font-t italic text-[12px] text-ink-600 truncate">{item.caption}</p>
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleGalleryDelete(item._id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink-900/80 text-paper-50 text-[11px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-base cursor-pointer hover:bg-ink-900"
                      aria-label="Delete photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ── Reviews ── */}
      {tab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-d text-2xl text-ink-700 mb-2">No reviews yet</p>
              <p className="font-t italic text-ink-500">
                Share your shop link with customers to start collecting feedback.
              </p>
              {profile.status === 'approved' && (
                <div className="mt-6">
                  <Link to={`/tailor/${profile._id}`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">Open shop page ↗</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map(r => (
                <ReviewRow key={r._id} review={r} token={token} onReplySaved={handleReplySaved} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Subscription ── */}
      {tab === 'subscription' && (
        <div className="max-w-2xl space-y-6">
          {/* Current plan card */}
          <div className="bg-paper-0 border border-ink-200 rounded-md px-6 py-5">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-1">
              Current plan
            </p>
            <p className="font-d text-4xl text-ink-900 capitalize leading-none">
              {subscription?.trialActive
                ? 'Early Bird Trial'
                : subscription?.plan || profile.subscriptionType || 'Free'}
            </p>
            {subscription?.trialActive && subscription?.freeTrialEnds && (
              <p className="font-t italic text-[14px] text-ink-500 mt-1.5">
                Free trial ends{' '}
                {new Date(subscription.freeTrialEnds).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
                {subscription.daysUntilTrialEnd != null && (
                  <span className="ml-1">({subscription.daysUntilTrialEnd} days left)</span>
                )}
              </p>
            )}
            {!subscription?.trialActive && subscription?.isActive && subscription?.expiryDate && (
              <p className="font-t italic text-[14px] text-ink-500 mt-1.5">
                Active until{' '}
                {new Date(subscription.expiryDate).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            )}
            {!subscription?.isActive && subscription?.plan === 'premium' && (
              <p className="font-t italic text-[14px] text-ink-500 mt-1.5">Expired</p>
            )}
          </div>

          {/* Plan picker + upsell (only when not on active paid premium) */}
          {!(subscription?.plan === 'premium' && subscription?.isActive) && (
            <div className="space-y-4">
              <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500">
                Choose a plan
              </p>

              {/* 3-plan selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: 'monthly',    label: 'Monthly',  price: '₹415',  per: '₹415 / mo',    save: null },
                  { key: 'semiannual', label: '6 Months', price: '₹1,660', per: '₹277 / mo', save: 'Save 33%' },
                  { key: 'annual',     label: 'Annual',   price: '₹2,905', per: '₹242 / mo', save: 'Best value' },
                ].map(plan => (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => setSelectedPlan(plan.key)}
                    className={[
                      'relative border rounded-md px-5 py-4 text-left transition-all duration-base cursor-pointer',
                      selectedPlan === plan.key
                        ? 'border-ink-900 bg-paper-0 shadow-sm'
                        : 'border-ink-200 bg-paper-50 hover:border-ink-400',
                    ].join(' ')}
                  >
                    {plan.save && (
                      <span className="absolute -top-2.5 left-4 font-ui font-semibold text-[9px] uppercase tracking-wide-xs bg-ink-900 text-paper-50 px-2 py-0.5 rounded-sm">
                        {plan.save}
                      </span>
                    )}
                    <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xs text-ink-500 mb-1">
                      {plan.label}
                    </p>
                    <p className="font-d text-2xl text-ink-900 leading-none">{plan.price}</p>
                    <p className="font-ui text-[11px] text-ink-400 mt-1">{plan.per}</p>
                    {selectedPlan === plan.key && (
                      <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-ink-900 flex items-center justify-center">
                        <span className="text-paper-50 text-[8px] font-bold leading-none">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Features list */}
              <div className="border border-dashed border-ink-300 rounded-md px-5 py-4">
                <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-sm text-ink-500 mb-3">
                  All premium plans include
                </p>
                <ul className="space-y-2">
                  {[
                    'Priority placement in search results',
                    'Featured listing badge',
                    'Unlimited gallery photos',
                    'Direct customer inquiries',
                    'Shop stays active — no deactivation',
                  ].map(f => (
                    <li key={f} className="font-t text-[15px] text-ink-700 flex gap-2.5">
                      <span className="text-ink-900 font-semibold flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {upgradeError && (
                <p className="font-t italic text-[14px] text-ink-700">{upgradeError}</p>
              )}
              {upgradeSuccess && (
                <p className="font-t italic text-[14px] text-ink-600">
                  Premium activated — thank you!
                </p>
              )}
              <Button
                onClick={() => handleUpgrade(selectedPlan)}
                disabled={upgradeLoading}
                className="w-full"
                size="lg"
              >
                {upgradeLoading ? 'Opening payment…' : 'Upgrade to Premium'}
              </Button>
            </div>
          )}

          {subscription?.plan === 'premium' && subscription?.isActive && (
            <p className="font-t italic text-[15px] text-ink-500 text-center">
              You're on the Premium plan. Thank you for supporting TailorConnect!
            </p>
          )}
        </div>
      )}

    </div>
  )
}
