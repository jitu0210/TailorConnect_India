import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import SearchBar from '../components/ui/SearchBar'
import TailorCard from '../components/ui/TailorCard'
import Button from '../components/ui/Button'
import RatingStars from '../components/ui/RatingStars'
import { tailorsApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { sortByLocation, getUserLocation, getScopeLabel, matchScore, TIER_LABEL } from '../lib/locationMatch'

// ── Static data ──────────────────────────────────────────────────────────────

const PLACEHOLDER_TAILORS = [
  {
    _id: '1', shopName: 'Raj Tailors', city: 'Korba', state: 'Chhattisgarh',
    specialties: ['Bridal Wear', "Men's Formal", 'Fine Alterations'],
    rating: 4.8, reviewCount: 124, isVerified: true, isTopRated: true, isOpenNow: true, distanceKm: 3, whatsapp: '9876543210',
  },
  {
    _id: '2', shopName: 'Anita Boutique', city: 'Raipur', state: 'Chhattisgarh',
    specialties: ['Ladies Suits', 'Lehenga', 'Blouse Stitching'],
    rating: 4.5, reviewCount: 87, isVerified: true, isOpenNow: true, distanceKm: 7, whatsapp: '9123456780',
  },
  {
    _id: '3', shopName: 'Kumar Master', city: 'Nagpur', state: 'Maharashtra',
    specialties: ["Men's Kurta", 'Sherwani', 'School Uniforms'],
    rating: 4.2, reviewCount: 53, isOpenNow: false, distanceKm: 9, whatsapp: '9988776655',
  },
]

const SPECIALTIES = [
  { label: 'Bridal Wear',      subLabel: 'शादी के कपड़े' },
  { label: 'Ladies Suits',     subLabel: 'सूट-सलवार' },
  { label: "Men's Kurta",      subLabel: 'कुर्ता-पायजामा' },
  { label: 'Sherwani',         subLabel: 'शेरवानी' },
  { label: 'Blouse Stitching', subLabel: 'ब्लाउज़ सिलाई' },
  { label: 'Lehenga',          subLabel: 'लहंगा' },
  { label: 'Alterations',      subLabel: 'मरम्मत' },
  { label: 'School Uniforms',  subLabel: 'यूनिफॉर्म' },
  { label: "Men's Formal",     subLabel: 'फॉर्मल ड्रेस' },
  { label: 'Designer Wear',    subLabel: 'डिज़ाइनर' },
  { label: 'Embroidery',       subLabel: 'कढ़ाई' },
  { label: 'Saree Blouse',     subLabel: 'साड़ी-ब्लाउज़' },
]

const HOW_IT_WORKS = [
  {
    n: '01',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: 'Search',
    body: 'Enter your city, pincode, or the service you need. We surface shops working nearest to you.',
  },
  {
    n: '02',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: 'Browse',
    body: 'Read reviews, check specialties, view gallery photos, and compare shops — all in one place.',
  },
  {
    n: '03',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" />
      </svg>
    ),
    title: 'Connect',
    body: 'WhatsApp or email your chosen tailor directly. No middleman, no platform fee, no waiting room.',
  },
]

const WHY_US = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'Verified listings',
    body: 'Every shop is reviewed before it goes live. You see only real tailors accepting real work.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" />
      </svg>
    ),
    title: 'WhatsApp & email',
    body: 'Reach tailors by WhatsApp for quick chats or email for measurements and photos. Your conversation stays between you and them.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'Honest reviews',
    body: 'Real customers write them. Tailors can reply. Nothing gets hidden or quietly removed.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Found nearby',
    body: 'Results are sorted by distance — city first, then district, then state. The closest shops appear first.',
  },
]

const POPULAR_CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Kolkata', 'Chennai', 'Pune', 'Jaipur']

const STATS = [
  { value: '1,200+', label: 'Tailors listed',  sub: 'and growing daily' },
  { value: '48',     label: 'Cities covered',  sub: 'across 12 states'  },
  { value: '4.7★',   label: 'Avg. rating',     sub: 'from 10k+ reviews' },
  { value: '100%',   label: 'Verified shops',  sub: 'manually reviewed' },
]

const TESTIMONIALS = [
  {
    quote: "I found Anita Boutique here and sent photos on WhatsApp. She stitched my wedding lehenga in 10 days — the fit was perfect, the work was beautiful.",
    name: "Priya Sharma",
    city: "Raipur, Chhattisgarh",
    service: "Bridal Lehenga",
    rating: 5,
  },
  {
    quote: "Finally got my sherwani done by someone local. Raj Tailors replied within minutes and took measurements the same day. Zero hassle from start to finish.",
    name: "Arjun Mehta",
    city: "Nagpur, Maharashtra",
    service: "Sherwani",
    rating: 5,
  },
  {
    quote: "Kumar Master has stitched school uniforms for my kids for three years now. The quality is consistent and the price is always fair. I recommend them to everyone.",
    name: "Sunita Devi",
    city: "Korba, Chhattisgarh",
    service: "School Uniforms",
    rating: 5,
  },
]

const CITY_DATA = [
  { city: 'Delhi',     state: 'DL', count: 214 },
  { city: 'Mumbai',    state: 'MH', count: 186 },
  { city: 'Bengaluru', state: 'KA', count: 143 },
  { city: 'Kolkata',   state: 'WB', count: 121 },
  { city: 'Hyderabad', state: 'TS', count: 98  },
  { city: 'Chennai',   state: 'TN', count: 87  },
  { city: 'Pune',      state: 'MH', count: 76  },
  { city: 'Jaipur',    state: 'RJ', count: 65  },
]

const PLANS = [
  {
    key: 'monthly',
    label: 'Monthly',
    price: '$5',
    sub: 'per month',
    per: '$5 / month',
    highlight: false,
    badge: 'Try it out',
  },
  {
    key: 'semiannual',
    label: '6 Months',
    price: '$20',
    sub: 'one payment · save 33%',
    per: '$3.33 / month',
    highlight: true,
    badge: 'Most popular',
  },
  {
    key: 'annual',
    label: 'Annual',
    price: '$35',
    sub: 'one payment · save 42%',
    per: '$2.92 / month',
    highlight: false,
    badge: 'Best value',
  },
]

const PLAN_FEATURES = [
  'Digital storefront page',
  'WhatsApp & email contact buttons',
  'Photo gallery (unlimited)',
  'Customer reviews & replies',
  'Location-based discovery',
  'Verified badge (after review)',
  'Mobile-first design',
  'Appears in city, district & state search',
]

const FAQS = [
  {
    q: "Is TailorConnect free to use for customers?",
    a: "Yes — completely free. Customers browse and connect for free. We never charge a booking fee or take a commission, ever.",
  },
  {
    q: "How do I contact a tailor?",
    a: "Every listing has a WhatsApp button and an email button. Tap WhatsApp for a quick conversation, or email the tailor for measurement details, fabric photos, or longer correspondence — your choice, directly to them.",
  },
  {
    q: "Are all the tailors verified?",
    a: "Yes. Every shop is reviewed by our team before it goes live. We confirm the tailor is real, operating, and actively accepting orders. Verified shops carry the ✓ Verified badge on their listing.",
  },
  {
    q: "Can I read reviews before reaching out?",
    a: "Yes. Each shop page shows real customer reviews with star ratings and the tailor's own replies. Nothing gets filtered, hidden, or quietly removed.",
  },
  {
    q: "Is it free for tailors to list their shop?",
    a: "The first 100 tailors to join get 6 months completely free — no credit card needed. After the trial, plans start at $5/month. We never take a commission on your work, ever.",
  },
  {
    q: "What happens after the free trial ends?",
    a: "You'll receive an email reminder 7 days before your trial ends. After expiry, your shop is paused and hidden from search until you subscribe. Your data is kept safe — subscribe anytime to go live again.",
  },
  {
    q: "My city isn't listed — can I request it?",
    a: "Try searching your city name first — we may already have listings there. If not, drop us a message on WhatsApp or email and we'll add it. We're adding 2–3 new cities every month.",
  },
  {
    q: "I'm a tailor. How do I list my shop?",
    a: "Tap \"List Your Shop\" in the nav or footer. Add your details, upload photos, and you're live in minutes. First 100 tailors get 6 months free.",
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchByLocation({ city, district, state }, totalLimit = 6) {
  const seen = new Set()
  const tiers = []

  async function fetchTier(params, tier) {
    const need = totalLimit - seen.size
    if (need <= 0) return
    try {
      const data = await tailorsApi.search({ ...params, sort: 'rating', limit: Math.max(need, 4) })
      const fresh = (data.tailors || []).filter(t => !seen.has(t._id))
      fresh.forEach(t => seen.add(t._id))
      if (fresh.length) tiers.push(fresh.map(t => ({ ...t, _tier: tier })))
    } catch { /* fall through */ }
  }

  if (city)     await fetchTier({ city },     0)
  if (district) await fetchTier({ district }, 1)
  if (state)    await fetchTier({ state },    2)
  await fetchTier({},                          3)

  return tiers.flat().slice(0, totalLimit)
}

function TieredCards({ tailors, userLoc }) {
  const groups = []
  const seen = new Map()

  for (const t of tailors) {
    const tier = t._tier ?? matchScore(t, userLoc)
    if (!seen.has(tier)) { seen.set(tier, groups.length); groups.push({ tier, items: [] }) }
    groups[seen.get(tier)].items.push(t)
  }

  if (groups.length <= 1) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tailors.map(t => <TailorCard key={t._id} tailor={t} />)}
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {groups.map(({ tier, items }) => (
        <div key={tier}>
          <div className="flex items-center gap-3 mb-5">
            <span className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400">
              {TIER_LABEL[tier] || 'Nearby'}
            </span>
            <span className="flex-1 border-t border-dashed border-ink-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(t => <TailorCard key={t._id} tailor={t} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const keyword  = searchParams.get('keyword')  || ''
  const location = searchParams.get('location') || ''
  const isSearchMode = searchParams.has('keyword') || searchParams.has('location') || searchParams.has('browse')

  const [tailors,    setTailors]    = useState([])
  const [loading,    setLoading]    = useState(false)
  const [pagination, setPagination] = useState(null)
  const [featured,   setFeatured]   = useState([])
  const [featuredScope, setFeaturedScope] = useState('')
  const [userLoc,    setUserLoc]    = useState({ city: '', district: '', state: '' })
  const [openFaq,    setOpenFaq]    = useState(null)

  const fetchTailors = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (keyword)  params.keyword = keyword
      if (location) {
        if (/^\d{6}$/.test(location.trim())) params.pincode = location.trim()
        else params.city = location
      }
      const data = await tailorsApi.search(params)
      let list = data.tailors || []
      if (!location) list = sortByLocation(list, userLoc)
      setTailors(list)
      setPagination({ total: data.total ?? list.length })
    } catch {
      setTailors(PLACEHOLDER_TAILORS)
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [keyword, location, userLoc])

  useEffect(() => {
    if (isSearchMode) fetchTailors()
  }, [isSearchMode, fetchTailors])

  useEffect(() => {
    if (isSearchMode) return
    const loc = getUserLocation(user)
    setUserLoc(loc)
    if (loc.city || loc.district || loc.state) localStorage.setItem('tc_location', JSON.stringify(loc))
    setFeaturedScope(getScopeLabel(loc))
    fetchByLocation(loc, 6)
      .then(list => setFeatured(list.length ? list : PLACEHOLDER_TAILORS))
      .catch(() => setFeatured(PLACEHOLDER_TAILORS))
  }, [isSearchMode, user])

  function handleSearch({ keyword: kw, location: loc }) {
    const p = {}
    if (kw)  p.keyword  = kw
    if (loc) p.location = loc
    setSearchParams(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSpecialty(label) {
    setSearchParams({ keyword: label })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── SEARCH-RESULTS VIEW ────────────────────────────────────────────────────

  if (isSearchMode) {
    return (
      <div>
        <section className="bg-ink-900 px-6 py-8 border-b border-ink-800">
          <div className="max-w-3xl mx-auto">
            <SearchBar onSearch={handleSearch} initialKeyword={keyword} initialLocation={location} />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-10 pb-24">
          <div className="flex items-start justify-between mb-8 gap-4">
            <div>
              <h2 className="font-d text-[clamp(24px,3vw,34px)] text-ink-900 leading-tight">
                {keyword ? `"${keyword}"` : location ? location : 'All tailors'}
              </h2>
              {pagination && (
                <p className="font-t italic text-[15px] text-ink-400 mt-1">
                  {pagination.total} {pagination.total === 1 ? 'shop' : 'shops'} found
                  {location ? ` near ${location}` : ''}
                </p>
              )}
            </div>
            <button
              onClick={() => setSearchParams({})}
              className="font-ui text-[11px] uppercase tracking-wide-xs text-ink-400 hover:text-ink-900 cursor-pointer transition-colors duration-base flex items-center gap-1.5 flex-shrink-0 mt-1"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
              Back
            </button>
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-ink-100 rounded-md h-80 animate-pulse" />)}
            </div>
          )}

          {!loading && tailors.length === 0 && (
            <div className="text-center py-24 border border-dashed border-ink-200 rounded-md">
              <div className="w-10 h-10 mx-auto mb-4 text-ink-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              </div>
              <p className="font-d text-2xl text-ink-700 mb-2">No tailors found</p>
              <p className="font-t italic text-ink-500 mb-6">Try a different city or service name.</p>
              <button
                onClick={() => setSearchParams({})}
                className="font-ui font-semibold text-[11px] uppercase tracking-wide-xs text-ink-500 border border-ink-300 px-4 py-2 rounded-sm hover:border-ink-900 hover:text-ink-900 transition-colors duration-base cursor-pointer"
              >
                Clear search
              </button>
            </div>
          )}

          {!loading && tailors.length > 0 && (
            <>
              {!location && (userLoc.city || userLoc.district || userLoc.state) && (
                <div className="flex items-center gap-2 mb-6 font-ui text-[11px] text-ink-400">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  Sorted by proximity · {getScopeLabel(userLoc)} first
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tailors.map(t => <TailorCard key={t._id} tailor={t} />)}
              </div>
            </>
          )}
        </section>
      </div>
    )
  }

  // ── LANDING PAGE ──────────────────────────────────────────────────────────

  return (
    <div>

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-ink-900 relative overflow-hidden px-6 pt-24 pb-20 md:pt-40 md:pb-32">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: [
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 32px)',
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 32px)',
            ].join(', '),
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />

        <div className="max-w-4xl mx-auto text-center relative">

          <div className="inline-flex items-center gap-2.5 border border-ink-700 rounded-pill px-4 py-1.5 mb-9">
            <span className="w-1.5 h-1.5 rounded-full bg-ink-500 flex-shrink-0" />
            <span className="font-ui text-[10px] uppercase tracking-wide-lg text-ink-400">
              1,200+ verified tailors · 48 cities across India
            </span>
          </div>

          <h1 className="font-d font-medium text-[clamp(52px,8.5vw,104px)] leading-[0.91] tracking-[-0.025em] text-paper-50 mb-8">
            Find a trusted<br />tailor near you.
          </h1>

          <p className="font-t text-[clamp(17px,2vw,22px)] leading-[1.6] text-ink-300 max-w-lg mx-auto mb-12">
            Local tailors. Digital storefronts. Honest reviews.
            <br />
            <em>Bespoke, nearby.</em>
          </p>

          <div className="max-w-2xl mx-auto shadow-lg">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 mt-6">
            <span className="font-ui text-[10px] uppercase tracking-wide-lg text-ink-600">Popular:</span>
            {POPULAR_CITIES.map(city => (
              <button
                key={city}
                onClick={() => handleSearch({ keyword: '', location: city })}
                className="font-ui text-[10px] uppercase tracking-wide-xs text-ink-500 hover:text-paper-50 transition-colors duration-base cursor-pointer underline underline-offset-2 decoration-ink-700 hover:decoration-ink-400"
              >
                {city}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 mt-10">
            <div className="flex -space-x-2">
              {['P', 'A', 'S', 'K'].map((initial, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-ink-700 border-2 border-ink-900 flex items-center justify-center font-ui font-semibold text-[9px] text-ink-300">
                  {initial}
                </div>
              ))}
            </div>
            <span className="font-t italic text-[14px] text-ink-500">340 new tailors joined this month</span>
          </div>

        </div>
      </section>

      {/* ── 2. STATS STRIP ──────────────────────────────────────────────────── */}
      <section className="bg-paper-0 border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-ink-100">
            {STATS.map(({ value, label, sub }) => (
              <div key={label} className="px-6 py-2 text-center first:pl-0 last:pr-0">
                <p className="font-d text-[clamp(30px,3.5vw,44px)] text-ink-900 leading-none mb-1">{value}</p>
                <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-lg text-ink-700 mb-0.5">{label}</p>
                <p className="font-t italic text-[12px] text-ink-400 hidden sm:block">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-paper-50 px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-14">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-3">How it works</p>
            <h2 className="font-d text-[clamp(34px,4.5vw,56px)] text-ink-900 leading-[0.95] tracking-tight">
              Three steps to your tailor.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0">
            {HOW_IT_WORKS.map(({ n, icon, title, body }, i) => (
              <div
                key={n}
                className={[
                  'relative',
                  i < HOW_IT_WORKS.length - 1 ? 'md:border-r md:border-dashed md:border-ink-200 md:pr-10' : '',
                  i > 0 ? 'md:pl-10' : '',
                ].join(' ')}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-10 h-10 rounded-sm bg-ink-100 border border-ink-200 flex items-center justify-center text-ink-600 flex-shrink-0">
                    {icon}
                  </div>
                  <span className="font-d font-semibold text-[72px] leading-none text-ink-100 select-none -mb-2">{n}</span>
                </div>
                <h3 className="font-d text-[30px] text-ink-900 leading-tight mb-3">{title}</h3>
                <p className="font-t italic text-[16px] leading-[1.65] text-ink-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. CRAFT QUOTE ──────────────────────────────────────────────────── */}
      <section className="bg-paper-100 border-t border-b border-ink-200 px-6 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-d font-medium text-[clamp(26px,3.5vw,42px)] text-ink-800 leading-[1.25] tracking-tight">
            "Every city has a tailor worth knowing.
            <br />
            <em>We help you find yours.</em>"
          </p>
          <div className="flex items-center gap-5 justify-center mt-10">
            <div className="flex-1 max-w-[100px] cut-line-muted" />
            <span className="text-ink-400 text-lg select-none">✂</span>
            <div className="flex-1 max-w-[100px] cut-line-muted" />
          </div>
          <p className="font-ui text-[10px] uppercase tracking-wide-lg text-ink-400 mt-5">Measured, cut, connected.</p>
        </div>
      </section>

      {/* ── 5. FEATURED TAILORS ─────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-paper-50 border-b border-ink-200 px-6 py-20 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-2">
                  {featuredScope ? `Near you · ${featuredScope}` : 'Featured shops'}
                </p>
                <h2 className="font-d text-[clamp(30px,4vw,48px)] text-ink-900 leading-tight tracking-tight">
                  {featuredScope ? `Top tailors in ${featuredScope}.` : 'Trusted tailors near you.'}
                </h2>
              </div>
              <button
                onClick={() => setSearchParams({ browse: '1' })}
                className="font-ui font-semibold text-[11px] uppercase tracking-wide-xs text-ink-500 hover:text-ink-900 transition-colors duration-base cursor-pointer hidden sm:flex items-center gap-2 border-b border-ink-300 pb-0.5 hover:border-ink-900"
              >
                Browse all
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>

            {featuredScope
              ? <TieredCards tailors={featured} userLoc={userLoc} />
              : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featured.map(t => <TailorCard key={t._id} tailor={t} />)}
                </div>
              )
            }

            <div className="mt-8 text-center sm:hidden">
              <button onClick={() => setSearchParams({ browse: '1' })} className="font-ui font-semibold text-[11px] uppercase tracking-wide-xs text-ink-500 hover:text-ink-900 transition-colors duration-base cursor-pointer">
                Browse all tailors →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── 6. TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="bg-paper-100 border-b border-ink-200 px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-3">Customer stories</p>
            <h2 className="font-d text-[clamp(34px,4.5vw,56px)] text-ink-900 leading-[0.95] tracking-tight max-w-xl">What customers say.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {TESTIMONIALS.map(({ quote, name, city, service, rating }) => (
              <figure key={name} className="bg-paper-0 border border-ink-200 rounded-md p-7 flex flex-col transition-all duration-base hover:shadow-sm hover:-translate-y-0.5">
                <div className="font-d text-[64px] leading-none text-ink-100 select-none -mb-4 -mt-2">"</div>
                <blockquote className="font-t italic text-[17px] leading-[1.65] text-ink-700 flex-1 mb-6">{quote}</blockquote>
                <figcaption className="border-t border-ink-100 pt-5">
                  <RatingStars rating={rating} />
                  <p className="font-ui font-semibold text-[11px] uppercase tracking-wide-sm text-ink-900 mt-2.5">{name}</p>
                  <p className="font-t italic text-[13px] text-ink-400 mt-0.5">{city} · {service}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. BROWSE BY SPECIALTY ──────────────────────────────────────────── */}
      <section className="bg-paper-50 px-6 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-2">Browse by specialty</p>
            <h2 className="font-d text-[clamp(30px,4vw,48px)] text-ink-900 leading-tight tracking-tight">What are you looking for?</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {SPECIALTIES.map(({ label, subLabel }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleSpecialty(label)}
                className="group text-left px-5 py-5 border border-ink-200 rounded-md bg-paper-0 hover:bg-ink-900 hover:border-ink-900 transition-all duration-base cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900"
              >
                <span className="block font-t text-[clamp(18px,2vw,22px)] italic leading-tight text-ink-600 group-hover:text-ink-400 mb-1.5 transition-colors duration-base">{subLabel}</span>
                <span className="block font-ui font-semibold text-[10px] uppercase tracking-wide-sm text-ink-900 group-hover:text-paper-50 transition-colors duration-base">{label}</span>
                <span className="block mt-3.5 font-ui text-[9px] uppercase tracking-wide-xs text-ink-300 group-hover:text-ink-600 transition-colors duration-base">Browse →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. CITY EXPLORER ────────────────────────────────────────────────── */}
      <section className="bg-paper-0 border-t border-b border-ink-200 px-6 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div>
              <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-2">Coverage</p>
              <h2 className="font-d text-[clamp(30px,4vw,48px)] text-ink-900 leading-tight tracking-tight">We're in your city.</h2>
            </div>
            <p className="font-t italic text-[15px] text-ink-500 max-w-[260px] text-right leading-snug hidden sm:block">
              48 cities and growing — 2–3 new cities added every month.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CITY_DATA.map(({ city, state, count }) => (
              <button
                key={city}
                type="button"
                onClick={() => handleSearch({ keyword: '', location: city })}
                className="group text-left px-5 py-5 border border-ink-200 rounded-md bg-paper-50 hover:bg-ink-900 hover:border-ink-900 transition-all duration-base cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="font-d text-[24px] text-ink-900 group-hover:text-paper-50 leading-tight transition-colors duration-base">{city}</span>
                  <span className="font-ui text-[9px] uppercase tracking-wide-lg text-ink-400 group-hover:text-ink-600 transition-colors duration-base mt-1">{state}</span>
                </div>
                <span className="block font-ui font-semibold text-[10px] uppercase tracking-wide-sm text-ink-500 group-hover:text-ink-400 transition-colors duration-base">{count} tailors</span>
              </button>
            ))}
          </div>

          <p className="font-t italic text-[14px] text-ink-400 mt-6 sm:hidden">48 cities and growing — 2–3 new cities added every month.</p>
        </div>
      </section>

      {/* ── 9. WHY TAILORCONNECT ────────────────────────────────────────────── */}
      <section className="bg-ink-900 px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-600 mb-3">Why TailorConnect</p>
            <h2 className="font-d text-[clamp(34px,4.5vw,56px)] text-paper-50 leading-[0.95] tracking-tight max-w-xl">
              Built for the way tailoring works in India.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-0">
            {WHY_US.map(({ icon, title, body }, i) => (
              <div key={title} className={['border-t border-ink-800 py-8 group', i >= 2 ? 'border-b border-ink-800 sm:border-b-0' : ''].join(' ')}>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-sm border border-ink-700 flex items-center justify-center text-ink-500 flex-shrink-0 mt-0.5 group-hover:border-ink-500 group-hover:text-ink-300 transition-colors duration-base">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-d text-[26px] text-paper-50 leading-tight mb-2">{title}</h3>
                    <p className="font-t italic text-[16px] leading-[1.65] text-ink-500">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. STOREFRONT PLANS ────────────────────────────────────────────── */}
      <section className="bg-paper-0 border-b border-ink-200 px-6 py-20 md:py-28" id="pricing">
        <div className="max-w-6xl mx-auto">

          <div className="max-w-xl mb-4">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-3">For tailors · Storefront plans</p>
            <h2 className="font-d text-[clamp(34px,4.5vw,56px)] text-ink-900 leading-[0.95] tracking-tight">
              Simple, honest pricing.
            </h2>
            <p className="font-t italic text-[17px] text-ink-600 leading-[1.6] mt-4">
              No commissions. No hidden fees. No cut of your earnings — ever.
            </p>
          </div>

          {/* Early-bird banner */}
          <div className="my-10 border border-dashed border-ink-900 rounded-md bg-paper-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-ink-900 text-xl select-none">✂</span>
              <div>
                <p className="font-ui font-semibold text-[11px] uppercase tracking-wide-sm text-ink-900">
                  Early bird — first 100 tailors
                </p>
                <p className="font-ui text-[10px] text-ink-400 uppercase tracking-wide-xs mt-0.5">Limited offer</p>
              </div>
            </div>
            <p className="font-t italic text-[16px] text-ink-700 sm:flex-1">
              Get <strong>6 months completely free</strong> — no credit card required. Just list your shop and go live instantly.
            </p>
            <Link to="/register/tailor" className="flex-shrink-0">
              <Button size="sm">Claim your free trial</Button>
            </Link>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {PLANS.map(({ key, label, price, sub, per, highlight, badge }) => (
              <div
                key={key}
                className={[
                  'relative rounded-md p-7 flex flex-col',
                  highlight
                    ? 'border-2 border-ink-900 bg-paper-0'
                    : 'border border-ink-200 bg-paper-50',
                ].join(' ')}
              >
                {badge && (
                  <div className={['absolute -top-3.5 left-1/2 -translate-x-1/2 font-ui font-bold text-[11px] uppercase tracking-wide-sm px-4 py-1.5 rounded-pill whitespace-nowrap shadow-xs', highlight ? 'bg-ink-900 text-paper-50' : 'bg-ink-800 text-paper-50'].join(' ')}>
                    {badge}
                  </div>
                )}

                <p className="font-d text-[22px] text-ink-900 leading-tight mb-3">{label}</p>

                <div className="mb-1">
                  <span className="font-d text-[56px] leading-none text-ink-900">{price}</span>
                </div>
                <p className="font-t italic text-[14px] text-ink-800 mb-1">{sub}</p>
                <p className="font-ui text-[10px] uppercase tracking-wide-xs text-ink-600 mb-6">{per}</p>

                {/* Feature list */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {PLAN_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <svg className="w-3.5 h-3.5 text-ink-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span className="font-t italic text-[14px] text-ink-600 leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to={user?.role === 'tailor' ? '/dashboard/tailor' : '/register/tailor'}>
                  <Button variant={highlight ? 'solid' : 'outline'} className="w-full">
                    {user?.role === 'tailor' ? 'Upgrade plan' : 'Get started'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <p className="font-t italic text-[13px] text-ink-400 text-center">
            Payments processed securely via Razorpay · Cancel anytime · Prices in USD, charged in INR
          </p>

        </div>
      </section>

      {/* ── 11. FAQ ─────────────────────────────────────────────────────────── */}
      <section className="bg-paper-50 px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-3">Common questions</p>
            <h2 className="font-d text-[clamp(34px,4.5vw,56px)] text-ink-900 leading-[0.95] tracking-tight">
              Everything you need to know.
            </h2>
          </div>

          <div>
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="border-t border-ink-200 last:border-b">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-6 py-5 text-left cursor-pointer group"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-d text-[clamp(19px,2vw,24px)] text-ink-900 leading-tight group-hover:text-ink-700 transition-colors duration-base">{q}</span>
                  <span className="font-ui text-[18px] text-ink-400 flex-shrink-0 transition-transform duration-base" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
                </button>
                {openFaq === i && (
                  <p className="font-t italic text-[17px] text-ink-600 leading-[1.65] pb-6 pr-10">{a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. TAILOR CTA ──────────────────────────────────────────────────── */}
      <section className="bg-paper-0 border-t border-ink-200 px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center gap-5 mb-16">
            <div className="flex-1 cut-line" />
            <span className="text-ink-400 text-xl leading-none select-none">✂</span>
            <div className="flex-1 cut-line" />
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-5">For tailors</p>

            <h2 className="font-d font-medium text-[clamp(40px,6vw,72px)] text-ink-900 leading-[0.92] tracking-tight mb-6">
              Your shop deserves<br />to be found.
            </h2>

            <p className="font-t text-[clamp(16px,2vw,20px)] italic text-ink-600 leading-[1.6] mb-10 max-w-lg mx-auto">
              Open a digital storefront on TailorConnect. Your customers are already searching for you — and now they can reach you by WhatsApp or email.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              {user?.role === 'tailor' ? (
                <Link to="/dashboard/tailor">
                  <Button size="lg">Go to my shop</Button>
                </Link>
              ) : (
                <>
                  <Link to="/register/tailor">
                    <Button size="lg">List Your Shop — 6 Months Free</Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline">Already listed? Sign in</Button>
                  </Link>
                </>
              )}
            </div>

            <div className="border-t border-ink-100 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {[
                { icon: '◈', title: '6 months free', body: 'First 100 tailors get 6 months free — no credit card required.' },
                { icon: '◈', title: 'WhatsApp & email', body: 'Customers contact you directly on WhatsApp or email. No middlemen.' },
                { icon: '◈', title: 'Verified badge', body: 'Build trust with a manually reviewed shop profile.' },
              ].map(({ icon, title, body }) => (
                <div key={title} className="flex gap-3">
                  <span className="text-ink-300 text-[14px] mt-0.5 flex-shrink-0">{icon}</span>
                  <div>
                    <p className="font-ui font-semibold text-[11px] uppercase tracking-wide-sm text-ink-900 mb-1">{title}</p>
                    <p className="font-t italic text-[14px] text-ink-500 leading-snug">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
