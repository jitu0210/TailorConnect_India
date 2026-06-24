import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import RatingStars from '../components/ui/RatingStars'
import { Input, Select } from '../components/ui/Input'
import { adminApi } from '../lib/api'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtAmount(paise) {
  if (paise == null) return '—'
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}

function fmtRevenue(paise) {
  if (!paise) return '₹0'
  if (paise >= 10000000) return `₹${(paise / 10000000).toFixed(1)}Cr`
  if (paise >= 100000)   return `₹${(paise / 100000).toFixed(1)}L`
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}

function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className={['border rounded-md px-5 py-5', accent ? 'bg-ink-900 border-ink-900' : 'bg-paper-0 border-ink-200'].join(' ')}>
      <p className={['font-ui font-semibold text-[10px] uppercase tracking-wide-xl mb-1', accent ? 'text-ink-500' : 'text-ink-400'].join(' ')}>
        {label}
      </p>
      <p className={['font-d text-[clamp(24px,3vw,38px)] leading-none', accent ? 'text-paper-50' : 'text-ink-900'].join(' ')}>
        {value ?? '—'}
      </p>
      {sub && (
        <p className="font-ui text-[10px] mt-1.5 text-ink-500">
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

function TailorRow({ tailor, token, onUpdate, onDelete }) {
  const [busy, setBusy] = useState(null)

  async function act(key, fn) {
    setBusy(key)
    try {
      const result = await fn()
      if (key === 'delete') onDelete(tailor._id)
      else onUpdate(tailor._id, result)
    } finally {
      setBusy(null)
    }
  }

  const owner = tailor.owner || {}

  return (
    <tr className="border-b border-ink-100 hover:bg-paper-50 transition-colors duration-fast align-top">
      <td className="px-4 py-3">
        <p className="font-d text-[17px] text-ink-900 leading-tight">{tailor.shopName}</p>
        <p className="font-ui text-[10px] uppercase tracking-wide-xs text-ink-500 mt-0.5">
          {[tailor.city, tailor.state].filter(Boolean).join(', ')}
          {tailor.pincode && <span className="ml-1 text-ink-400">· {tailor.pincode}</span>}
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="font-t text-[14px] text-ink-900">{owner.fullName || '—'}</p>
        <p className="font-ui text-[10px] text-ink-500">{owner.email}</p>
        {owner.mobile && <p className="font-ui text-[10px] text-ink-400">{owner.mobile}</p>}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="font-ui text-[11px] text-ink-600">{tailor.whatsapp || '—'}</span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={tailor.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <Badge variant={tailor.isVerified ? 'solid' : 'muted'}>
            {tailor.isVerified ? '✓ Verified' : 'Unverified'}
          </Badge>
          {tailor.isTopRated && <Badge variant="outline">Top Rated</Badge>}
          {tailor.subscriptionType === 'premium' && <Badge variant="ghost">★ Premium</Badge>}
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="font-ui text-[11px] text-ink-500">{fmtDate(tailor.createdAt)}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {tailor.status === 'pending' && (
            <>
              <Button size="sm" disabled={busy === 'approve'}
                onClick={() => act('approve', () => adminApi.setTailorStatus(tailor._id, 'approved', token))}>
                {busy === 'approve' ? '…' : 'Approve'}
              </Button>
              <Button size="sm" variant="ghost" disabled={busy === 'reject'}
                onClick={() => act('reject', () => adminApi.setTailorStatus(tailor._id, 'rejected', token))}>
                {busy === 'reject' ? '…' : 'Reject'}
              </Button>
            </>
          )}
          {tailor.status === 'approved' && (
            <Button size="sm" variant="ghost" disabled={busy === 'reject'}
              onClick={() => act('reject', () => adminApi.setTailorStatus(tailor._id, 'rejected', token))}>
              {busy === 'reject' ? '…' : 'Suspend'}
            </Button>
          )}
          {tailor.status === 'rejected' && (
            <Button size="sm" variant="outline" disabled={busy === 'approve'}
              onClick={() => act('approve', () => adminApi.setTailorStatus(tailor._id, 'approved', token))}>
              {busy === 'approve' ? '…' : 'Re-approve'}
            </Button>
          )}
          <Button size="sm" variant={tailor.isVerified ? 'ghost' : 'outline'} disabled={busy === 'verify'}
            onClick={() => act('verify', () => adminApi.toggleVerify(tailor._id, token))}>
            {busy === 'verify' ? '…' : tailor.isVerified ? 'Unverify' : 'Verify'}
          </Button>
          <Button size="sm" variant={tailor.isTopRated ? 'ghost' : 'outline'} disabled={busy === 'top'}
            onClick={() => act('top', () => adminApi.toggleTopRated(tailor._id, token))}>
            {busy === 'top' ? '…' : tailor.isTopRated ? 'Remove Top' : '★ Top'}
          </Button>
          <a href={`/tailor/${tailor._id}`} target="_blank" rel="noreferrer"
            className="inline-flex items-center font-ui font-semibold text-[10px] uppercase tracking-wide-xs px-2 py-1 rounded-sm border border-ink-200 text-ink-500 hover:text-ink-900 hover:border-ink-900 transition-colors duration-base">
            View ↗
          </a>
          <Button size="sm" variant="ghost" disabled={busy === 'delete'}
            onClick={() => {
              if (!window.confirm(`Delete "${tailor.shopName}" permanently? This cannot be undone.`)) return
              act('delete', () => adminApi.deleteTailor(tailor._id, token))
            }}>
            {busy === 'delete' ? '…' : 'Delete'}
          </Button>
        </div>
      </td>
    </tr>
  )
}

function UserRow({ user, token, onUpdate, onDelete }) {
  const [busy, setBusy] = useState(null)

  async function toggle() {
    setBusy('toggle')
    try {
      const result = await adminApi.toggleUser(user._id, token)
      onUpdate(user._id, { isActive: result.isActive })
    } finally {
      setBusy(null)
    }
  }

  async function del() {
    if (!window.confirm(`Delete user "${user.fullName}"? This cannot be undone.`)) return
    setBusy('delete')
    try {
      await adminApi.deleteUser(user._id, token)
      onDelete(user._id)
    } finally {
      setBusy(null)
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
            {(user.city || user.state) && (
              <p className="font-ui text-[10px] text-ink-400">{[user.city, user.state].filter(Boolean).join(', ')}</p>
            )}
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
        <div className="flex gap-1.5">
          <Button size="sm" variant={user.isActive ? 'ghost' : 'outline'}
            disabled={busy === 'toggle' || user.role === 'admin'} onClick={toggle}>
            {busy === 'toggle' ? '…' : user.isActive ? 'Suspend' : 'Restore'}
          </Button>
          <Button size="sm" variant="ghost"
            disabled={busy === 'delete' || user.role === 'admin'} onClick={del}>
            {busy === 'delete' ? '…' : 'Delete'}
          </Button>
        </div>
      </td>
    </tr>
  )
}

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
        <p className="font-ui text-[10px] uppercase tracking-wide-xs text-ink-500 mt-0.5">{tailor.city || ''}</p>
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
          {tailor.pincode && ` · ${tailor.pincode}`}
          {tailor.whatsapp && ` · WhatsApp: ${tailor.whatsapp}`}
        </p>
        {owner.fullName && (
          <p className="font-t text-[14px] text-ink-700">
            {owner.fullName}
            {owner.email && <span className="text-ink-400"> · {owner.email}</span>}
            {owner.mobile && <span className="text-ink-400"> · {owner.mobile}</span>}
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
        <Button size="sm" disabled={busy === 'approve'}
          onClick={() => act('approve', async () => {
            const r = await adminApi.setTailorStatus(tailor._id, 'approved', token)
            onApprove(tailor._id, r)
          })}>
          {busy === 'approve' ? '…' : 'Approve'}
        </Button>
        <Button size="sm" variant="ghost" disabled={busy === 'reject'}
          onClick={() => act('reject', async () => {
            const r = await adminApi.setTailorStatus(tailor._id, 'rejected', token)
            onReject(tailor._id, r)
          })}>
          {busy === 'reject' ? '…' : 'Reject'}
        </Button>
        <a href={`/tailor/${tailor._id}`} target="_blank" rel="noreferrer"
          className="inline-flex items-center justify-center font-ui font-semibold text-[10px] uppercase tracking-wide-xs px-2 py-1.5 rounded-sm border border-ink-200 text-ink-500 hover:text-ink-900 hover:border-ink-900 transition-colors duration-base">
          Preview ↗
        </a>
      </div>
    </div>
  )
}

const RANGES = [
  { key: 'today',   label: 'Today' },
  { key: 'week',    label: 'Last 7 days' },
  { key: 'month',   label: 'Last 30 days' },
  { key: 'year',    label: 'Last year' },
  { key: '5years',  label: 'Last 5 years' },
  { key: 'max',     label: 'All time' },
]

const SERIES = [
  { key: 'users',         label: 'Users',         color: '#111111' },
  { key: 'tailors',       label: 'Tailors',        color: '#4a4a4a' },
  { key: 'reviews',       label: 'Reviews',        color: '#9a9a9a' },
  { key: 'subscriptions', label: 'Subscriptions',  color: '#c4c4c4' },
]

function GrowthCharts({ token }) {
  const [range, setRange]       = useState('month')
  const [chartType, setChartType] = useState('line')
  const [active, setActive]     = useState(['users', 'tailors', 'reviews', 'subscriptions'])
  const [data, setData]         = useState([])
  const [labelFmt, setLabelFmt] = useState('day')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    adminApi.timeseries(range, token)
      .then(r => { setData(r.data || []); setLabelFmt(r.labelFmt) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [range, token])

  function fmtLabel(str) {
    if (labelFmt === 'hour') return `${str}:00`
    if (labelFmt === 'month') {
      const [y, m] = str.split('-')
      return new Date(+y, +m - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    }
    const d = new Date(str)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  function toggleSeries(key) {
    setActive(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const chartData = data.map(d => ({ ...d, label: fmtLabel(d.label) }))

  const commonProps = {
    data: chartData,
    margin: { top: 4, right: 8, left: -16, bottom: 0 },
  }

  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#eceae3" />
      <XAxis dataKey="label" tick={{ fontFamily: 'Archivo', fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
      <YAxis tick={{ fontFamily: 'Archivo', fontSize: 10, fill: '#9a9a9a' }} tickLine={false} axisLine={false} allowDecimals={false} />
      <Tooltip
        contentStyle={{ fontFamily: 'Archivo', fontSize: 11, border: '1px solid #dcd9d2', borderRadius: 3, background: '#fff' }}
        labelStyle={{ fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 10 }}
      />
      <Legend
        wrapperStyle={{ fontFamily: 'Archivo', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}
      />
    </>
  )

  return (
    <div className="space-y-6">

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Range pills */}
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={[
                'font-ui font-semibold text-[10px] uppercase tracking-wide-xs px-3 py-1.5 rounded-sm border transition-colors duration-base cursor-pointer',
                range === r.key ? 'bg-ink-900 border-ink-900 text-paper-50' : 'bg-paper-0 border-ink-200 text-ink-500 hover:border-ink-900 hover:text-ink-900',
              ].join(' ')}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-ink-200 hidden sm:block" />

        {/* Chart type */}
        <div className="flex gap-1.5">
          {[['line','Line'],['bar','Bar']].map(([t,l]) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={[
                'font-ui font-semibold text-[10px] uppercase tracking-wide-xs px-3 py-1.5 rounded-sm border transition-colors duration-base cursor-pointer',
                chartType === t ? 'bg-ink-900 border-ink-900 text-paper-50' : 'bg-paper-0 border-ink-200 text-ink-500 hover:border-ink-900 hover:text-ink-900',
              ].join(' ')}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Series toggles */}
      <div className="flex flex-wrap gap-2">
        {SERIES.map(s => (
          <button
            key={s.key}
            onClick={() => toggleSeries(s.key)}
            className={[
              'flex items-center gap-1.5 font-ui font-semibold text-[10px] uppercase tracking-wide-xs px-3 py-1.5 rounded-sm border transition-all duration-base cursor-pointer',
              active.includes(s.key) ? 'border-ink-900 text-ink-900' : 'border-ink-200 text-ink-300',
            ].join(' ')}
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: active.includes(s.key) ? s.color : '#c4c4c4' }} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-paper-0 border border-ink-200 rounded-md p-6">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="font-t italic text-ink-400 text-[14px]">Loading…</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <p className="font-t italic text-ink-400 text-[14px]">No data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' ? (
              <LineChart {...commonProps}>
                {axes}
                {SERIES.filter(s => active.includes(s.key)).map(s => (
                  <Line key={s.key} type="monotone" dataKey={s.key} name={s.label}
                    stroke={s.color} strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
                ))}
              </LineChart>
            ) : (
              <BarChart {...commonProps}>
                {axes}
                {SERIES.filter(s => active.includes(s.key)).map(s => (
                  <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[2,2,0,0]} />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

    </div>
  )
}

const TABS = [
  { key: 'overview',      label: 'Overview' },
  { key: 'charts',        label: 'Growth' },
  { key: 'tailors',       label: 'Tailors' },
  { key: 'users',         label: 'Users' },
  { key: 'reviews',       label: 'Reviews' },
  { key: 'subscriptions', label: 'Subscriptions' },
]

export default function AdminDashboardPage() {
  const { user, token, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return
    if (!user) navigate('/admin/tci_01/login', { replace: true })
    else if (user.role !== 'admin') navigate('/', { replace: true })
  }, [user, authLoading, navigate])

  const [tab, setTab] = useState('overview')

  const [analytics,        setAnalytics]        = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [recent,           setRecent]           = useState(null)

  const [pending,        setPending]        = useState([])
  const [pendingLoading, setPendingLoading] = useState(true)

  const [tailors,        setTailors]        = useState([])
  const [tailorsTotal,   setTailorsTotal]   = useState(0)
  const [tailorsPages,   setTailorsPages]   = useState(1)
  const [tailorsPage,    setTailorsPage]    = useState(1)
  const [tailorsStatus,  setTailorsStatus]  = useState('')
  const [tailorsSearch,  setTailorsSearch]  = useState('')
  const [tailorsLoading, setTailorsLoading] = useState(false)

  const [users,        setUsers]        = useState([])
  const [usersTotal,   setUsersTotal]   = useState(0)
  const [usersPages,   setUsersPages]   = useState(1)
  const [usersPage,    setUsersPage]    = useState(1)
  const [usersRole,    setUsersRole]    = useState('')
  const [usersSearch,  setUsersSearch]  = useState('')
  const [usersLoading, setUsersLoading] = useState(false)

  const [reviews,        setReviews]        = useState([])
  const [reviewsTotal,   setReviewsTotal]   = useState(0)
  const [reviewsPages,   setReviewsPages]   = useState(1)
  const [reviewsPage,    setReviewsPage]    = useState(1)
  const [reviewsSearch,  setReviewsSearch]  = useState('')
  const [reviewsRating,  setReviewsRating]  = useState('')
  const [reviewsLoading, setReviewsLoading] = useState(false)

  const [subs,        setSubs]        = useState([])
  const [subsTotal,   setSubsTotal]   = useState(0)
  const [subsPages,   setSubsPages]   = useState(1)
  const [subsPage,    setSubsPage]    = useState(1)
  const [subsStatus,  setSubsStatus]  = useState('')
  const [subsRevenue, setSubsRevenue] = useState(0)
  const [subsLoading, setSubsLoading] = useState(false)

  const loadAnalytics = useCallback(async () => {
    if (!token) return
    try {
      const data = await adminApi.analytics(token)
      setAnalytics(data)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [token])

  const loadRecent = useCallback(async () => {
    if (!token) return
    try {
      const data = await adminApi.recent(token)
      setRecent(data)
    } catch { /* non-critical */ }
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
      const data = await adminApi.reviews({
        page: reviewsPage, limit: 20,
        ...(reviewsSearch && { search: reviewsSearch }),
        ...(reviewsRating && { rating: reviewsRating }),
      }, token)
      setReviews(data.reviews || [])
      setReviewsTotal(data.total || 0)
      setReviewsPages(data.pages || 1)
    } finally {
      setReviewsLoading(false)
    }
  }, [token, reviewsPage, reviewsSearch, reviewsRating])

  const loadSubs = useCallback(async () => {
    if (!token) return
    setSubsLoading(true)
    try {
      const data = await adminApi.subscriptions({
        page: subsPage, limit: 20,
        ...(subsStatus && { status: subsStatus }),
      }, token)
      setSubs(data.subs || [])
      setSubsTotal(data.total || 0)
      setSubsPages(data.pages || 1)
      const rev = (data.subs || []).filter(s => s.status === 'active').reduce((acc, s) => acc + (s.amount || 0), 0)
      setSubsRevenue(rev)
    } finally {
      setSubsLoading(false)
    }
  }, [token, subsPage, subsStatus])

  useEffect(() => {
    if (!authLoading && token) {
      loadAnalytics()
      loadPending()
      loadRecent()
    }
  }, [authLoading, token, loadAnalytics, loadPending, loadRecent])

  useEffect(() => { if (tab === 'tailors')       loadTailors()      }, [tab, loadTailors])
  useEffect(() => { if (tab === 'users')          loadUsers()        }, [tab, loadUsers])
  useEffect(() => { if (tab === 'reviews')        loadReviews()      }, [tab, loadReviews])
  useEffect(() => { if (tab === 'subscriptions')  loadSubs()         }, [tab, loadSubs])

  useEffect(() => { setTailorsPage(1) }, [tailorsStatus, tailorsSearch])
  useEffect(() => { setUsersPage(1)   }, [usersRole, usersSearch])
  useEffect(() => { setReviewsPage(1) }, [reviewsSearch, reviewsRating])
  useEffect(() => { setSubsPage(1)    }, [subsStatus])

  function updateTailor(id, patch) {
    setTailors(ts => ts.map(t => t._id === id ? { ...t, ...patch } : t))
    setPending(ps => ps.filter(p => p._id !== id))
    if (patch.status && patch.status !== 'pending') {
      setAnalytics(a => a ? { ...a, pendingTailors: Math.max(0, a.pendingTailors - 1) } : a)
    }
  }

  function deleteTailorLocal(id) {
    setTailors(ts => ts.filter(t => t._id !== id))
    setPending(ps => ps.filter(p => p._id !== id))
    setTailorsTotal(t => Math.max(0, t - 1))
    setAnalytics(a => a ? { ...a, tailors: Math.max(0, a.tailors - 1) } : a)
  }

  function updateUser(id, patch) {
    setUsers(us => us.map(u => u._id === id ? { ...u, ...patch } : u))
  }

  function deleteUserLocal(id) {
    setUsers(us => us.filter(u => u._id !== id))
    setUsersTotal(t => Math.max(0, t - 1))
    setAnalytics(a => a ? { ...a, users: Math.max(0, a.users - 1) } : a)
  }

  function removeReview(id) {
    setReviews(rs => rs.filter(r => r._id !== id))
    setReviewsTotal(t => Math.max(0, t - 1))
    setAnalytics(a => a ? { ...a, reviews: Math.max(0, a.reviews - 1) } : a)
  }

  if (authLoading || (analyticsLoading && !analytics)) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-4">
        <div className="h-8 w-40 bg-ink-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-ink-100 rounded-md animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-d text-[clamp(28px,4vw,40px)] text-ink-900 leading-tight">Control Panel</h1>
          <p className="font-ui text-[11px] uppercase tracking-wide-sm text-ink-500 mt-1">
            TailorConnect India · Admin
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

      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <StatCard label="Users"   value={analytics.users}   sub="customers & tailors" />
          <StatCard label="Tailors" value={analytics.tailors} sub={`${analytics.approvedTailors ?? '—'} approved · ${analytics.rejectedTailors ?? '—'} rejected`} />
          <StatCard label="Reviews" value={analytics.reviews} />
          <StatCard label="Revenue" value={fmtRevenue(analytics.revenue)} sub={`${analytics.activeSubscriptions ?? 0} active subscription${analytics.activeSubscriptions !== 1 ? 's' : ''}`} accent={analytics.revenue > 0} />
        </div>
      )}

      <div className="flex border-b border-ink-200 mb-8 overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={[
              'font-ui font-semibold text-[11px] uppercase tracking-wide-sm px-4 py-3 -mb-px whitespace-nowrap',
              'border-b-2 transition-colors duration-base cursor-pointer',
              tab === key ? 'border-ink-900 text-ink-900' : 'border-transparent text-ink-400 hover:text-ink-700',
            ].join(' ')}
          >
            {label}
            {key === 'overview' && analytics?.pendingTailors > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-ink-900 text-paper-50 text-[8px] font-bold">
                {analytics.pendingTailors}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="space-y-10">

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
                  <PendingCard key={t._id} tailor={t} token={token}
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

          {recent && (
            <div>
              <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500 mb-5">
                Recent activity
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div className="bg-paper-0 border border-ink-200 rounded-md p-5">
                  <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-4">
                    New customers
                  </p>
                  {recent.recentUsers?.length === 0 ? (
                    <p className="font-t italic text-[13px] text-ink-400">No customers yet</p>
                  ) : (
                    <div className="divide-y divide-ink-100">
                      {recent.recentUsers?.map(u => (
                        <div key={u._id} className="py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-t text-[14px] text-ink-900 truncate">{u.fullName}</p>
                            <p className="font-ui text-[10px] text-ink-500 truncate">{u.email}</p>
                            {(u.city || u.state) && (
                              <p className="font-ui text-[10px] text-ink-400">{[u.city, u.state].filter(Boolean).join(', ')}</p>
                            )}
                          </div>
                          <span className="font-ui text-[10px] text-ink-400 flex-shrink-0">{fmtDate(u.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-paper-0 border border-ink-200 rounded-md p-5">
                  <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-4">
                    Recent shop submissions
                  </p>
                  {recent.recentTailors?.length === 0 ? (
                    <p className="font-t italic text-[13px] text-ink-400">No shops yet</p>
                  ) : (
                    <div className="divide-y divide-ink-100">
                      {recent.recentTailors?.map(t => (
                        <div key={t._id} className="py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-d text-[17px] text-ink-900 leading-tight truncate">{t.shopName}</p>
                            <p className="font-ui text-[10px] text-ink-500">{[t.city, t.state].filter(Boolean).join(', ')}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <StatusBadge status={t.status} />
                            <span className="font-ui text-[10px] text-ink-400">{fmtDate(t.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* ── GROWTH CHARTS ── */}
      {tab === 'charts' && (
        <div>
          <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500 mb-6">
            Platform growth
          </p>
          <GrowthCharts token={token} />
        </div>
      )}

      {/* ── TAILORS ── */}
      {tab === 'tailors' && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <Input placeholder="Search by shop name or city…" value={tailorsSearch}
                onChange={e => setTailorsSearch(e.target.value)} />
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
              <table className="w-full min-w-[1050px]">
                <TableHead cols={['Shop', 'Owner', 'WhatsApp', 'Status', 'Flags', 'Joined', 'Actions']} />
                <tbody>
                  {tailors.map(t => (
                    <TailorRow key={t._id} tailor={t} token={token}
                      onUpdate={updateTailor} onDelete={deleteTailorLocal} />
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
              <Input placeholder="Search by name or email…" value={usersSearch}
                onChange={e => setUsersSearch(e.target.value)} />
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
                <TableHead cols={['User', 'Role', 'Mobile', 'Status', 'Joined', 'Actions']} />
                <tbody>
                  {users.map(u => (
                    <UserRow key={u._id} user={u} token={token}
                      onUpdate={updateUser} onDelete={deleteUserLocal} />
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
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <Input placeholder="Search by customer name…" value={reviewsSearch}
                onChange={e => setReviewsSearch(e.target.value)} />
            </div>
            <div className="sm:w-40">
              <Select value={reviewsRating} onChange={e => setReviewsRating(e.target.value)}>
                <option value="">All ratings</option>
                <option value="5">★★★★★ 5</option>
                <option value="4">★★★★ 4</option>
                <option value="3">★★★ 3</option>
                <option value="2">★★ 2</option>
                <option value="1">★ 1</option>
              </Select>
            </div>
          </div>

          {reviewsLoading ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-ink-100 rounded animate-pulse" />)}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-d text-xl text-ink-600">No reviews found</p>
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
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="sm:w-48">
              <Select value={subsStatus} onChange={e => setSubsStatus(e.target.value)}>
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="failed">Failed</option>
              </Select>
            </div>
            {subsRevenue > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-paper-0 border border-ink-200 rounded-sm">
                <span className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400">Page revenue</span>
                <span className="font-d text-[18px] text-ink-900 leading-none">{fmtAmount(subsRevenue)}</span>
              </div>
            )}
          </div>

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
