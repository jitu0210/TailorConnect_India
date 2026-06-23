import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import SearchBar from '../components/ui/SearchBar'
import TailorCard from '../components/ui/TailorCard'
import Tag from '../components/ui/Tag'
import Button from '../components/ui/Button'
import { tailorsApi } from '../lib/api'

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
    body: 'Read reviews, check specialties, and compare shops at a glance — all in one place.',
  },
  {
    n: '03',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" />
      </svg>
    ),
    title: 'Connect',
    body: 'WhatsApp your chosen tailor directly. No middleman, no platform fee, no waiting room.',
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
    title: 'WhatsApp, always',
    body: 'Your conversation stays between you and your tailor. No platform lock-in, no booking fees.',
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
    body: 'Results are sorted by distance so the closest shops appear first. Less commute, more craft.',
  },
]

const POPULAR_CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Kolkata', 'Chennai', 'Pune', 'Jaipur']

const STATS = [
  { value: '1,200+', label: 'Tailors listed',  sub: 'and growing daily' },
  { value: '48',     label: 'Cities covered',  sub: 'across 12 states'  },
  { value: '4.7★',   label: 'Avg. rating',     sub: 'from 10k+ reviews' },
  { value: '100%',   label: 'Verified shops',  sub: 'manually reviewed' },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const keyword  = searchParams.get('keyword')  || ''
  const location = searchParams.get('location') || ''
  const isSearchMode = searchParams.has('keyword') || searchParams.has('location') || searchParams.has('browse')

  const [tailors,    setTailors]    = useState([])
  const [loading,    setLoading]    = useState(false)
  const [pagination, setPagination] = useState(null)
  const [featured,   setFeatured]   = useState([])

  const fetchTailors = useCallback(async () => {
    setLoading(true)
    try {
      const data = await tailorsApi.search({ keyword, location })
      setTailors(data.tailors || [])
      setPagination({ total: data.total ?? (data.tailors?.length ?? 0) })
    } catch {
      setTailors(PLACEHOLDER_TAILORS)
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [keyword, location])

  useEffect(() => {
    if (isSearchMode) fetchTailors()
  }, [isSearchMode, fetchTailors])

  useEffect(() => {
    if (!isSearchMode) {
      tailorsApi.search({ limit: 3, sort: 'rating' })
        .then(d => setFeatured(d.tailors?.length ? d.tailors : PLACEHOLDER_TAILORS))
        .catch(() => setFeatured(PLACEHOLDER_TAILORS))
    }
  }, [isSearchMode])

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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back
            </button>
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-ink-100 rounded-md h-80 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && tailors.length === 0 && (
            <div className="text-center py-24 border border-dashed border-ink-200 rounded-md">
              <div className="w-10 h-10 mx-auto mb-4 text-ink-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tailors.map(t => <TailorCard key={t._id} tailor={t} />)}
            </div>
          )}
        </section>
      </div>
    )
  }

  // ── LANDING PAGE ──────────────────────────────────────────────────────────

  return (
    <div>

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-ink-900 relative overflow-hidden px-6 pt-24 pb-24 md:pt-40 md:pb-36">
        {/* Subtle dot-grid texture echoes woven fabric */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative">

          {/* Trust eyebrow badge */}
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

          {/* Popular city quick-links */}
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

        </div>
      </section>

      {/* ── 2. STATS STRIP ──────────────────────────────────────────────────── */}
      <section className="bg-paper-0 border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-ink-100">
            {STATS.map(({ value, label, sub }) => (
              <div key={label} className="px-6 py-2 text-center first:pl-0 last:pr-0">
                <p className="font-d text-[clamp(30px,3.5vw,44px)] text-ink-900 leading-none mb-1">
                  {value}
                </p>
                <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-lg text-ink-700 mb-0.5">
                  {label}
                </p>
                <p className="font-t italic text-[12px] text-ink-400 hidden sm:block">
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-paper-50 px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">

          <div className="max-w-xl mb-14">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-3">
              How it works
            </p>
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
                {/* Icon + number row */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-10 h-10 rounded-sm bg-ink-100 border border-ink-200 flex items-center justify-center text-ink-600 flex-shrink-0">
                    {icon}
                  </div>
                  <span className="font-d font-semibold text-[72px] leading-none text-ink-100 select-none -mb-2">
                    {n}
                  </span>
                </div>
                <h3 className="font-d text-[30px] text-ink-900 leading-tight mb-3">
                  {title}
                </h3>
                <p className="font-t italic text-[16px] leading-[1.65] text-ink-600">
                  {body}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 4. FEATURED TAILORS ─────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-paper-100 border-t border-b border-ink-200 px-6 py-20 md:py-24">
          <div className="max-w-6xl mx-auto">

            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-2">
                  Featured shops
                </p>
                <h2 className="font-d text-[clamp(30px,4vw,48px)] text-ink-900 leading-tight tracking-tight">
                  Trusted tailors near you.
                </h2>
              </div>
              <button
                onClick={() => setSearchParams({ browse: '1' })}
                className="font-ui font-semibold text-[11px] uppercase tracking-wide-xs text-ink-500 hover:text-ink-900 transition-colors duration-base cursor-pointer hidden sm:flex items-center gap-2 border-b border-ink-300 pb-0.5 hover:border-ink-900"
              >
                Browse all
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(t => <TailorCard key={t._id} tailor={t} />)}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <button
                onClick={() => setSearchParams({ browse: '1' })}
                className="font-ui font-semibold text-[11px] uppercase tracking-wide-xs text-ink-500 hover:text-ink-900 transition-colors duration-base cursor-pointer"
              >
                Browse all tailors →
              </button>
            </div>

          </div>
        </section>
      )}

      {/* ── 5. BROWSE BY SPECIALTY ──────────────────────────────────────────── */}
      <section className="bg-paper-50 px-6 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">

          <div className="mb-10">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-2">
              Browse by specialty
            </p>
            <h2 className="font-d text-[clamp(30px,4vw,48px)] text-ink-900 leading-tight tracking-tight">
              What are you looking for?
            </h2>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {SPECIALTIES.map(({ label, subLabel }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleSpecialty(label)}
                className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 rounded-sm transition-all duration-fast hover:-translate-y-0.5 hover:shadow-sm"
              >
                <Tag label={label} subLabel={subLabel} />
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ── 6. WHY TAILORCONNECT ────────────────────────────────────────────── */}
      <section className="bg-ink-900 px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">

          <div className="mb-14">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-600 mb-3">
              Why TailorConnect
            </p>
            <h2 className="font-d text-[clamp(34px,4.5vw,56px)] text-paper-50 leading-[0.95] tracking-tight max-w-xl">
              Built for the way tailoring works in India.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-0">
            {WHY_US.map(({ icon, title, body }, i) => (
              <div
                key={title}
                className={[
                  'border-t border-ink-800 py-8 group',
                  i >= 2 ? 'border-b border-ink-800 sm:border-b-0' : '',
                ].join(' ')}
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-sm border border-ink-700 flex items-center justify-center text-ink-500 flex-shrink-0 mt-0.5 group-hover:border-ink-500 group-hover:text-ink-300 transition-colors duration-base">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-d text-[26px] text-paper-50 leading-tight mb-2">
                      {title}
                    </h3>
                    <p className="font-t italic text-[16px] leading-[1.65] text-ink-500">
                      {body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 7. TAILOR CTA ───────────────────────────────────────────────────── */}
      <section className="bg-paper-50 px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center gap-5 mb-16">
            <div className="flex-1 cut-line" />
            <span className="text-ink-400 text-xl leading-none select-none">✂</span>
            <div className="flex-1 cut-line" />
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-5">
              For tailors
            </p>

            <h2 className="font-d font-medium text-[clamp(40px,6vw,72px)] text-ink-900 leading-[0.92] tracking-tight mb-6">
              Your shop deserves<br />to be found.
            </h2>

            <p className="font-t text-[clamp(16px,2vw,20px)] italic text-ink-600 leading-[1.6] mb-10 max-w-lg mx-auto">
              Open a free digital storefront on TailorConnect. Your customers are already searching for you.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register/tailor">
                <Button size="lg">List Your Shop — It's Free</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">Already listed? Sign in</Button>
              </Link>
            </div>

            <p className="font-t italic text-[13px] text-ink-400 mt-5">
              No fees. No commissions. Direct WhatsApp contact only.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
