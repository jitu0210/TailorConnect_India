import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import RatingStars from '../components/ui/RatingStars'
import { Input, Select } from '../components/ui/Input'
import { adminApi } from '../lib/api'

// ── Shared helpers ────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtAmount(paise) {
  if (paise == null) return '—'
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className={['border rounded-md px-5 py-5', accent ? 'bg-ink-900 border-ink-900' : 'bg-paper-0 border-ink-200'].join(' ')}>
      <p className={['font-ui font-semibold text-[10px] uppercase tracking-wide-xl mb-1', accent ? 'text-ink-500' : 'text-ink-400'].join(' ')}>
        {label}
      </p>
      <p className={['font-d text-[clamp(28px,3vw,40px)] leading-none', accent ? 'text-paper-50' : 'text-ink-900'].join(' ')}>
        {value ?? '—'}
      </p>
      {sub && (
        <p className={['font-ui text-[11px] mt-1.5', accent ? 'text-ink-500' : 'text-ink-500'].join(' ')}>
          {sub}
        </p>
      )}
    </div>
  )
}

function Paginator({ page, pages, total, onPage }) {
  if (!pages || pages <= 1) return null
  return (
    <div className="flex items-center justify-between border-t border-ink-100 pt-4 mt-4">
      <span className="font-ui text-[11px] text-ink-400">{total} total · page {page} of {pages}</span>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</Button>
        <Button size="sm" variant="ghost" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next →</Button>
      </div>
    </div>
  )
}

function TableHead({ cols }) {
  return (
    <thead>
      <tr className="border-b border-ink-200">
        {cols.map(c => (
          <th key={c} className="px-4 py-3 text-left font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 whitespace-nowrap">
            {c}
          </th>
        ))}
      </tr>
    </thead>
  )
}

function StatusBadge({ status }) {
  const map = {
    pending:  { variant: 'muted',   label: 'Pending' },
    approved: { variant: 'ghost',   label: 'Approved' },
    rejected: { variant: 'solid',   label: 'Rejected' },
  }
  const { variant, label } = map[status] || { variant: 'muted', label: status }
  return <Badge variant={variant}>{label}</Badge>
}

// ── Tailor table row ──────────────────────────────────────────────────────────

function TailorRow({ tailor, token, onUpdate }) {
  const [busy, setBusy] = useState(null) // which action is loading

  async function act(key, fn) {
    setBusy(key)
    try {
      const result = await fn()
      onUpdate(tailor._id, result)
    } finally {
      setBusy(null)
    }
  }

  const owner = tailor.owner || {}

  return (
    <tr className="border-b border-ink-100 hover:bg-paper-50 transition-colors duration-fast align-top">
      {/* Shop */}
      <td className="px-4 py-3">
        <p className="font-d text-[18px] text-ink-900 leading-tight">{tailor.shopName}</p>
        <p className="font-ui text-[10px] uppercase tracking-wide-xs text-ink-500 mt-0.5">
          {[tailor.city, tailor.state].filter(Boolean).join(', ')}
        </p>
      </td>

      {/* Owner */}
      <td className="px-4 py-3">
        <p className="font-t text-[14px] text-ink-900">{owner.fullName || '—'}</p>
        <p className="font-ui text-[10px] text-ink-500">{owner.email}</p>
        {owner.mobile && <p className="font-ui text-[10px] text-ink-400">{owner.mobile}</p>}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={tailor.status} />
      </td>

      {/* Flags */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <Badge variant={tailor.isVerified ? 'solid' : 'muted'}>
            {tailor.isVerified ? '✓ Verified' : 'Unverified'}
          </Badge>
          {tailor.isTopRated && <Badge variant="outline">Top Rated</Badge>}
          {tailor.subscriptionType === 'premium' && <Badge variant="ghost">★ Premium</Badge>}
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="font-ui text-[11px] text-ink-500">{fmtDate(tailor.createdAt)}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {tailor.status === 'pending' && (
            <>
              <Button
                size="sm"
                disabled={busy === 'approve'}
                onClick={() => act('approve', () => adminApi.setTailorStatus(tailor._id, 'approved', token))}
              >
                {busy === 'approve' ? '…' : 'Approve'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy === 'reject'}
                onClick={() => act('reject', () => adminApi.setTailorStatus(tailor._id, 'rejected', token))}
              >
                {busy === 'reject' ? '…' : 'Reject'}
              </Button>
            </>
          )}
          {tailor.status === 'approved' && (
            <Button
              size="sm"
              variant="ghost"
              disabled={busy === 'reject'}
              onClick={() => act('reject', () => adminApi.setTailorStatus(tailor._id, 'rejected', token))}
            >
              {busy === 'reject' ? '…' : 'Suspend'}
            </Button>
          )}
          {tailor.status === 'rejected' && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy === 'approve'}
              onClick={() => act('approve', () => adminApi.setTailorStatus(tailor._id, 'approved', token))}
            >
              {busy === 'approve' ? '…' : 'Re-approve'}
            </Button>
          )}
          <Button
            size="sm"
            variant={tailor.isVerified ? 'ghost' : 'outline'}
            disabled={busy === 'verify'}
            onClick={() => act('verify', () => adminApi.toggleVerify(tailor._id, token))}
          >
            {busy === 'verify' ? '…' : tailor.isVerified ? 'Unverify' : 'Verify'}
          </Button>
          <Button
            size="sm"
            variant={tailor.isTopRated ? 'ghost' : 'outline'}
            disabled={busy === 'top'}
            onClick={() => act('top', () => adminApi.toggleTopRated(tailor._id, token))}
          >
            {busy === 'top' ? '…' : tailor.isTopRated ? 'Remove Top' : '★ Top Rated'}
          </Button>
        </div>
      </td>
    </tr>
  )
}

// ── User table row ────────────────────────────────────────────────────────────

function UserRow({ user, token, onUpdate }) {
  const [busy, setBusy] = useState(false)

  async function toggle() {
    setBusy(true)
    try {
      const result = await adminApi.toggleUser(user._id, token)
      onUpdate(user._id, { isActive: result.isActive })
    } finally {
      setBusy(false)
    }
  }

  const roleVariant = { admin: 'solid', tailor: 'outline', customer: 'muted' }

  return (
    <tr className="border-b border-ink-100 hover:bg-paper-50 transition-colors duration-fast align-middle">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar initials={user.fullName?.charAt(0)?.toUpperCase()} size="sm" />
          <div>
            <p className="font-t text-[15px] text-ink-900">{user.fullName}</p>
            <p className="font-ui text-[10px] text-ink-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={roleVariant[user.role] || 'muted'}>{user.role}</Badge>
      </td>
      <td className="px-4 py-3">
        <span className="font-ui text-[11px] text-ink-500">{user.mobile || '—'}</span>
      </td>
      <td className="px-4 py-3">
        <Badge variant={user.isActive ? 'ghost' : 'muted'}>
          {user.isActive ? 'Active' : 'Suspended'}
        </Badge>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="font-ui text-[11px] text-ink-500">{fmtDate(user.createdAt)}</span>
      </td>
      <td className="px-4 py-3">
        <Button
          size="sm"
          variant={user.isActive ? 'ghost' : 'outline'}
          disabled={busy || user.role === 'admin'}
          onClick={toggle}
        >
          {busy ? '…' : user.isActive ? 'Suspend' : 'Restore'}
        </Button>
      </td>
    </tr>
  )
}

// ── Review table row ──────────────────────────────────────────────────────────

function ReviewRow({ review, token, onDelete }) {
  const [busy, setBusy] = useState(false)

  async function del() {
    if (!window.confirm(`Remove this review by "${review.customerName}"?`)) return
    setBusy(true)
    try {
      await adminApi.deleteReview(review._id, token)
      onDelete(review._id)
    } finally {
      setBusy(false)
    }
  }

  const tailor = review.tailor || {}

  return (
    <tr className="border-b border-ink-100 hover:bg-paper-50 transition-colors duration-fast align-top">
      <td className="px-4 py-3">
        <p className="font-d text-[17px] text-ink-900">{tailor.shopName || '—'}</p>
        <p className="font-ui text-[10px] uppercase tracking-wide-xs text-ink-500 mt-0.5">
          {tailor.city || ''}
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="font-t text-[14px] text-ink-900">{review.customerName}</p>
        {review.serviceType && (
          <p className="font-ui text-[10px] uppercase tracking-wide-xs text-ink-400 mt-0.5">{review.serviceType}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <RatingStars rating={review.rating} size="sm" />
      </td>
      <td className="px-4 py-3 max-w-xs">
        {review.comment ? (
          <p className="font-t italic text-[14px] text-ink-600 line-clamp-2">"{review.comment}"</p>
        ) : (
          <span className="font-t italic text-[13px] text-ink-300">No comment</span>
        )}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="font-ui text-[11px] text-ink-500">{fmtDate(review.createdAt)}</span>
      </td>
      <td className="px-4 py-3">
        <Button size="sm" variant="ghost" disabled={busy} onClick={del}>
          {busy ? '…' : 'Remove'}
        </Button>
      </td>
    </tr>
  )
}

// ── Subscription table row ────────────────────────────────────────────────────

function SubRow({ sub }) {
  const tailor = sub.tailor || {}
  const statusVariant = { active: 'ghost', pending: 'muted', expired: 'muted', failed: 'solid' }
  return (
    <tr className="border-b border-ink-100 hover:bg-paper-50 transition-colors duration-fast align-middle">
      <td className="px-4 py-3">
        <p className="font-d text-[17px] text-ink-900">{tailor.shopName || '—'}</p>
        <p className="font-ui text-[10px] uppercase tracking-wide-xs text-ink-500">{tailor.city || ''}</p>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className="uppercase">{sub.plan}</Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant={statusVariant[sub.status] || 'muted'}>{sub.status}</Badge>
      </td>
      <td className="px-4 py-3">
        <span className="font-t text-[15px] text-ink-900">{fmtAmount(sub.amount)}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="font-ui text-[11px] text-ink-500">{fmtDate(sub.startDate)}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="font-ui text-[11px] text-ink-500">{fmtDate(sub.expiryDate)}</span>
      </td>
    </tr>
  )
}

// ── Pending tailor quick-action card (Overview) ───────────────────────────────

function PendingCard({ tailor, token, onApprove, onReject }) {
  const [busy, setBusy] = useState(null)
  const owner = tailor.owner || {}

  async function act(key, fn) {
    setBusy(key)
    try { await fn() } finally { setBusy(null) }
  }

  return (
    <div className="bg-paper-0 border border-ink-200 rounded-md p-5 flex flex-col sm:flex-row sm:items-start gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-d text-[22px] text-ink-900 leading-tight">{tailor.shopName}</h3>
          {tailor.subscriptionType === 'premium' && <Badge variant="solid">★ Premium</Badge>}
        </div>
        <p className="font-ui text-[10px] uppercase tracking-wide-xs text-ink-500 mb-2">
          {[tailor.city, tailor.state].filter(Boolean).join(', ')}
          {tailor.whatsapp && ` · WhatsApp: ${tailor.whatsapp}`}
        </p>
        {owner.fullName && (
          <p className="font-t text-[14px] text-ink-700">
            {owner.fullName}
            {owner.email && <span className="text-ink-400"> · {owner.email}</span>}
          </p>
        )}
        {tailor.specialties?.length > 0 && (
          <p className="font-t italic text-[13px] text-ink-500 mt-1">
            {tailor.specialties.slice(0, 4).join(' · ')}
          </p>
        )}
        {tailor.bio && (
          <p className="font-t text-[14px] text-ink-600 mt-1.5 line-clamp-2 italic">"{tailor.bio}"</p>
        )}
        <p className="font-ui text-[10px] text-ink-400 mt-2">Submitted {fmtDate(tailor.createdAt)}</p>
      </div>

      <div className="flex sm:flex-col gap-2 flex-shrink-0">
        <Button
          size="sm"
          disabled={busy === 'approve'}
          onClick={() => act('approve', async () => {
            const r = await adminApi.setTailorStatus(tailor._id, 'approved', token)
            onApprove(tailor._id, r)
          })}
        >
          {busy === 'approve' ? '…' : 'Approve'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={busy === 'reject'}
          onClick={() => act('reject', async () => {
            const r = await adminApi.setTailorStatus(tailor._id, 'rejected', token)
            onReject(tailor._id, r)
          })}
        >
          {busy === 'reject' ? '…' : 'Reject'}
        </Button>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'overview',      label: 'Overview' },
  { key: 'tailors',       label: 'Tailors' },
  { key: 'users',         label: 'Users' },
  { key: 'reviews',       label: 'Reviews' },
  { key: 'subscriptions', label: 'Subscriptions' },
]

export default function AdminDashboardPage() {
  const { user, token, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Auth guard
  useEffect(() => {
    if (authLoading) return
    if (!user) navigate('/login', { state: { from: '/admin' }, replace: true })
    else if (user.role !== 'admin') navigate('/', { replace: true })
  }, [user, authLoading, navigate])

  const [tab, setTab] = useState('overview')

  // ── Analytics ──────────────────────────────────────────────────────────────
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  // ── Pending (for Overview) ─────────────────────────────────────────────────
  const [pending,        setPending]        = useState([])
  const [pendingLoading, setPendingLoading] = useState(true)

  // ── Tailors tab ────────────────────────────────────────────────────────────
  const [tailors,        setTailors]        = useState([])
  const [tailorsTotal,   setTailorsTotal]   = useState(0)
  const [tailorsPages,   setTailorsPages]   = useState(1)
  const [tailorsPage,    setTailorsPage]    = useState(1)
  const [tailorsStatus,  setTailorsStatus]  = useState('')
  const [tailorsSearch,  setTailorsSearch]  = useState('')
  const [tailorsLoading, setTailorsLoading] = useState(false)

  // ── Users tab ──────────────────────────────────────────────────────────────
  const [users,        setUsers]        = useState([])
  const [usersTotal,   setUsersTotal]   = useState(0)
  const [usersPages,   setUsersPages]   = useState(1)
  const [usersPage,    setUsersPage]    = useState(1)
  const [usersRole,    setUsersRole]    = useState('')
  const [usersSearch,  setUsersSearch]  = useState('')
  const [usersLoading, setUsersLoading] = useState(false)

  // ── Reviews tab ────────────────────────────────────────────────────────────
  const [reviews,        setReviews]        = useState([])
  const [reviewsTotal,   setReviewsTotal]   = useState(0)
  const [reviewsPages,   setReviewsPages]   = useState(1)
  const [reviewsPage,    setReviewsPage]    = useState(1)
  const [reviewsLoading, setReviewsLoading] = useState(false)

  // ── Subscriptions tab ──────────────────────────────────────────────────────
  const [subs,        setSubs]        = useState([])
  const [subsTotal,   setSubsTotal]   = useState(0)
  const [subsPages,   setSubsPages]   = useState(1)
  const [subsPage,    setSubsPage]    = useState(1)
  const [subsLoading, setSubsLoading] = useState(false)

  // ── Loaders ────────────────────────────────────────────────────────────────

  const loadAnalytics = useCallback(async () => {
    if (!token) return
    try {
      const data = await adminApi.analytics(token)
      setAnalytics(data)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [token])

  const loadPending = useCallback(async () => {
    if (!token) return
    setPendingLoading(true)
    try {
      const data = await adminApi.tailors({ status: 'pending', limit: 10 }, token)
      setPending(data.tailors || [])
    } finally {
      setPendingLoading(false)
    }
  }, [token])

  const loadTailors = useCallback(async () => {
    if (!token) return
    setTailorsLoading(true)
    try {
      const data = await adminApi.tailors({
        page: tailorsPage, limit: 20,
        ...(tailorsStatus && { status: tailorsStatus }),
        ...(tailorsSearch && { search: tailorsSearch }),
      }, token)
      setTailors(data.tailors || [])
      setTailorsTotal(data.total || 0)
      setTailorsPages(data.pages || 1)
    } finally {
      setTailorsLoading(false)
    }
  }, [token, tailorsPage, tailorsStatus, tailorsSearch])

  const loadUsers = useCallback(async () => {
    if (!token) return
    setUsersLoading(true)
    try {
      const data = await adminApi.users({
        page: usersPage, limit: 20,
        ...(usersRole   && { role:   usersRole }),
        ...(usersSearch && { search: usersSearch }),
      }, token)
      setUsers(data.users || [])
      setUsersTotal(data.total || 0)
      setUsersPages(data.pages || 1)
    } finally {
      setUsersLoading(false)
    }
  }, [token, usersPage, usersRole, usersSearch])

  const loadReviews = useCallback(async () => {
    if (!token) return
    setReviewsLoading(true)
    try {
      const data = await adminApi.reviews({ page: reviewsPage, limit: 20 }, token)
      setReviews(data.reviews || [])
      setReviewsTotal(data.total || 0)
      setReviewsPages(data.pages || 1)
    } finally {
      setReviewsLoading(false)
    }
  }, [token, reviewsPage])

  const loadSubs = useCallback(async () => {
    if (!token) return
    setSubsLoading(true)
    try {
      const data = await adminApi.subscriptions({ page: subsPage, limit: 20 }, token)
      setSubs(data.subs || [])
      setSubsTotal(data.total || 0)
      setSubsPages(data.pages || 1)
    } finally {
      setSubsLoading(false)
    }
  }, [token, subsPage])

  // Initial load
  useEffect(() => {
    if (!authLoading && token) {
      loadAnalytics()
      loadPending()
    }
  }, [authLoading, token, loadAnalytics, loadPending])

  // Tab-triggered loads
  useEffect(() => { if (tab === 'tailors')       loadTailors()       }, [tab, loadTailors])
  useEffect(() => { if (tab === 'users')          loadUsers()         }, [tab, loadUsers])
  useEffect(() => { if (tab === 'reviews')        loadReviews()       }, [tab, loadReviews])
  useEffect(() => { if (tab === 'subscriptions')  loadSubs()          }, [tab, loadSubs])

  // Reset page on filter change
  useEffect(() => { setTailorsPage(1) }, [tailorsStatus, tailorsSearch])
  useEffect(() => { setUsersPage(1)   }, [usersRole, usersSearch])

  // ── Inline updaters ────────────────────────────────────────────────────────

  function updateTailor(id, patch) {
    setTailors(ts => ts.map(t => t._id === id ? { ...t, ...patch } : t))
    setPending(ps => ps.filter(p => p._id !== id)) // remove from pending queue if acted on
    // Keep analytics in sync
    if (patch.status && patch.status !== 'pending') {
      setAnalytics(a => a ? { ...a, pendingTailors: Math.max(0, a.pendingTailors - 1) } : a)
    }
  }

  function updateUser(id, patch) {
    setUsers(us => us.map(u => u._id === id ? { ...u, ...patch } : u))
  }

  function removeReview(id) {
    setReviews(rs => rs.filter(r => r._id !== id))
    setReviewsTotal(t => Math.max(0, t - 1))
    setAnalytics(a => a ? { ...a, reviews: Math.max(0, a.reviews - 1) } : a)
  }

  // ── Loading / auth skeleton ────────────────────────────────────────────────

  if (authLoading || (analyticsLoading && !analytics)) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-4">
        <div className="h-8 w-40 bg-ink-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-ink-100 rounded-md animate-pulse" />)}
        </div>
      </div>
    )
  }

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Page title */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-d text-[clamp(28px,4vw,40px)] text-ink-900 leading-tight">
            Admin
          </h1>
          <p className="font-ui text-[11px] uppercase tracking-wide-sm text-ink-500 mt-1">
            TailorConnect India · Control panel
          </p>
        </div>
        {analytics?.pendingTailors > 0 && (
          <button
            onClick={() => { setTab('tailors'); setTailorsStatus('pending') }}
            className="font-ui font-semibold text-[11px] uppercase tracking-wide-xs text-ink-900 border border-ink-900 rounded-sm px-3 py-1.5 hover:bg-ink-900 hover:text-paper-50 transition-colors duration-base cursor-pointer"
          >
            {analytics.pendingTailors} pending review{analytics.pendingTailors !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Stat cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
          <StatCard label="Users"         value={analytics.users}               />
          <StatCard label="Tailors"       value={analytics.tailors}             />
          <StatCard label="Reviews"       value={analytics.reviews}             />
          <StatCard label="Subscriptions" value={analytics.activeSubscriptions} sub="active" />
          <StatCard label="Pending"       value={analytics.pendingTailors}      accent={analytics.pendingTailors > 0} />
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-ink-200 mb-8">
        {TABS.map(({ key, label }) => (
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

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="space-y-8">
          <div>
            <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500 mb-5">
              Pending shop applications
            </p>

            {pendingLoading && (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-28 bg-ink-100 rounded-md animate-pulse" />)}
              </div>
            )}

            {!pendingLoading && pending.length === 0 && (
              <div className="border border-dashed border-ink-200 rounded-md px-6 py-10 text-center">
                <p className="font-d text-xl text-ink-600">No pending applications</p>
                <p className="font-t italic text-[14px] text-ink-400 mt-1">All caught up.</p>
              </div>
            )}

            {!pendingLoading && pending.length > 0 && (
              <div className="space-y-3">
                {pending.map(t => (
                  <PendingCard
                    key={t._id}
                    tailor={t}
                    token={token}
                    onApprove={(id, r) => updateTailor(id, r)}
                    onReject={(id, r)  => updateTailor(id, r)}
                  />
                ))}
                {pending.length === 10 && (
                  <button
                    onClick={() => { setTab('tailors'); setTailorsStatus('pending') }}
                    className="font-ui font-semibold text-[11px] uppercase tracking-wide-xs text-ink-400 hover:text-ink-900 cursor-pointer transition-colors duration-base"
                  >
                    View all pending →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAILORS ── */}
      {tab === 'tailors' && (
        <div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by shop name or city…"
                value={tailorsSearch}
                onChange={e => setTailorsSearch(e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <Select value={tailorsStatus} onChange={e => setTailorsStatus(e.target.value)}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
          </div>

          {tailorsLoading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-ink-100 rounded animate-pulse" />)}
            </div>
          ) : tailors.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-d text-xl text-ink-600">No tailors found</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[900px]">
                <TableHead cols={['Shop', 'Owner', 'Status', 'Flags', 'Joined', 'Actions']} />
                <tbody>
                  {tailors.map(t => (
                    <TailorRow
                      key={t._id}
                      tailor={t}
                      token={token}
                      onUpdate={updateTailor}
                    />
                  ))}
                </tbody>
              </table>
              <Paginator page={tailorsPage} pages={tailorsPages} total={tailorsTotal} onPage={setTailorsPage} />
            </div>
          )}
        </div>
      )}

      {/* ── USERS ── */}
      {tab === 'users' && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email…"
                value={usersSearch}
                onChange={e => setUsersSearch(e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <Select value={usersRole} onChange={e => setUsersRole(e.target.value)}>
                <option value="">All roles</option>
                <option value="customer">Customer</option>
                <option value="tailor">Tailor</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
          </div>

          {usersLoading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-ink-100 rounded animate-pulse" />)}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-d text-xl text-ink-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[700px]">
                <TableHead cols={['User', 'Role', 'Mobile', 'Status', 'Joined', 'Action']} />
                <tbody>
                  {users.map(u => (
                    <UserRow key={u._id} user={u} token={token} onUpdate={updateUser} />
                  ))}
                </tbody>
              </table>
              <Paginator page={usersPage} pages={usersPages} total={usersTotal} onPage={setUsersPage} />
            </div>
          )}
        </div>
      )}

      {/* ── REVIEWS ── */}
      {tab === 'reviews' && (
        <div>
          {reviewsLoading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-ink-100 rounded animate-pulse" />)}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-d text-xl text-ink-600">No reviews yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[700px]">
                <TableHead cols={['Shop', 'Customer', 'Rating', 'Comment', 'Date', 'Action']} />
                <tbody>
                  {reviews.map(r => (
                    <ReviewRow key={r._id} review={r} token={token} onDelete={removeReview} />
                  ))}
                </tbody>
              </table>
              <Paginator page={reviewsPage} pages={reviewsPages} total={reviewsTotal} onPage={setReviewsPage} />
            </div>
          )}
        </div>
      )}

      {/* ── SUBSCRIPTIONS ── */}
      {tab === 'subscriptions' && (
        <div>
          {subsLoading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-ink-100 rounded animate-pulse" />)}
            </div>
          ) : subs.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-d text-xl text-ink-600">No subscriptions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[700px]">
                <TableHead cols={['Shop', 'Plan', 'Status', 'Amount', 'Started', 'Expires']} />
                <tbody>
                  {subs.map(s => <SubRow key={s._id} sub={s} />)}
                </tbody>
              </table>
              <Paginator page={subsPage} pages={subsPages} total={subsTotal} onPage={setSubsPage} />
            </div>
          )}
        </div>
      )}

    </div>
  )
}
