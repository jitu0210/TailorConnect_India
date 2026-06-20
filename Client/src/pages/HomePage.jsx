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
  { label: "Ladies Suits",     subLabel: 'सूट-सलवार' },
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
    title: 'Search',
    body: 'Enter your city, pincode, or the service you need. We surface shops working nearest to you.',
  },
  {
    n: '02',
    title: 'Browse',
    body: 'Read reviews, check specialties, and compare shops at a glance — all in one place.',
  },
  {
    n: '03',
    title: 'Connect',
    body: 'WhatsApp your chosen tailor directly. No middleman, no platform fee, no waiting room.',
  },
]

const WHY_US = [
  {
    title: 'Verified listings',
    body: 'Every shop is reviewed before it goes live. You see only real tailors accepting real work.',
  },
  {
    title: 'WhatsApp, always',
    body: 'Your conversation stays between you and your tailor. No platform lock-in, no booking fees.',
  },
  {
    title: 'Honest reviews',
    body: 'Real customers write them. Tailors can reply. Nothing gets hidden or quietly removed.',
  },
  {
    title: 'Found nearby',
    body: 'Results are sorted by distance so the closest shops appear first. Less commute, more craft.',
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const keyword  = searchParams.get('keyword')  || ''
  const location = searchParams.get('location') || ''
  // 'browse' param triggers the results view without a keyword filter
  const isSearchMode = searchParams.has('keyword') || searchParams.has('location') || searchParams.has('browse')

  const [tailors,    setTailors]    = useState([])
  const [loading,    setLoading]    = useState(false)
  const [pagination, setPagination] = useState(null)
  const [featured,   setFeatured]   = useState([])

  // Search results
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

  // Featured tailors for landing page
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
        {/* Compact header */}
        <section className="bg-ink-900 px-6 py-10">
          <div className="max-w-3xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              initialKeyword={keyword}
              initialLocation={location}
            />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-10 pb-20">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500">
                {keyword || location ? 'Search results' : 'All tailors'}
              </p>
              {pagination && (
                <p className="font-t italic text-[14px] text-ink-400 mt-0.5">
                  {pagination.total} {pagination.total === 1 ? 'shop' : 'shops'} found
                </p>
              )}
            </div>
            <button
              onClick={() => setSearchParams({})}
              className="font-ui text-[11px] uppercase tracking-wide-xs text-ink-400 hover:text-ink-900 cursor-pointer transition-colors duration-base"
            >
              ← Back
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
            <div className="text-center py-20">
              <p className="font-d text-2xl text-ink-700 mb-2">No tailors found</p>
              <p className="font-t italic text-ink-500">Try a different city or service name.</p>
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
      <section className="bg-ink-900 px-6 pt-24 pb-24 md:pt-36 md:pb-32">
        <div className="max-w-4xl mx-auto text-center">

          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="h-16 w-16 object-contain mx-auto mb-6 brightness-0 invert"
          />
          <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-500 mb-7">
            Location-based · Tailoring marketplace
          </p>

          <h1 className="font-d font-medium text-[clamp(52px,8.5vw,104px)] leading-[0.91] tracking-[-0.025em] text-paper-50 mb-8">
            Find a trusted<br />tailor near you.
          </h1>

          <p className="font-t text-[clamp(17px,2vw,22px)] leading-[1.6] text-ink-300 max-w-lg mx-auto mb-12">
            Local tailors. Digital storefronts. Honest reviews.
            <br />
            <em>Bespoke, nearby.</em>
          </p>

          <div className="max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>

          <p className="font-ui text-[10px] uppercase tracking-wide-lg text-ink-600 mt-6">
            Or&nbsp;
            <button
              onClick={() => setSearchParams({ browse: '1' })}
              className="underline underline-offset-2 hover:text-ink-400 cursor-pointer transition-colors duration-base"
            >
              browse all tailors
            </button>
          </p>

        </div>
      </section>

      {/* ── 2. STATS STRIP ──────────────────────────────────────────────────── */}
      <section className="bg-paper-100 border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 sm:divide-x sm:divide-ink-200 text-center">
          {[
            { value: '1,200+', label: 'Tailors listed' },
            { value: '48',     label: 'Cities covered' },
            { value: '4.7',    label: 'Avg. rating' },
            { value: '100%',   label: 'Verified shops' },
          ].map(({ value, label }) => (
            <div key={label} className="px-6 py-2 first:pl-0 last:pr-0">
              <p className="font-d text-[clamp(30px,3.5vw,44px)] text-ink-900 leading-none mb-1.5">
                {value}
              </p>
              <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-lg text-ink-500">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-paper-50 px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">

          <div className="mb-14">
            <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-3">
              How it works
            </p>
            <h2 className="font-d text-[clamp(34px,4.5vw,56px)] text-ink-900 leading-[0.95] tracking-tight">
              Three steps to your tailor.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
            {HOW_IT_WORKS.map(({ n, title, body }) => (
              <div key={n}>
                <span
                  className="font-d font-semibold text-[88px] leading-none select-none block mb-0"
                  style={{ color: '#eceae3' }}
                >
                  {n}
                </span>
                <h3 className="font-d text-[30px] text-ink-900 leading-tight -mt-3 mb-3">
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
                className="font-ui font-semibold text-[11px] uppercase tracking-wide-xs text-ink-500 hover:text-ink-900 transition-colors duration-base cursor-pointer hidden sm:block"
              >
                Browse all →
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

          <div className="mb-8">
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
                className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 rounded-sm"
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
            {WHY_US.map(({ title, body }, i) => (
              <div
                key={title}
                className={[
                  'border-t border-ink-700 py-8',
                  i >= 2 ? 'border-b border-ink-800 sm:border-b-0' : '',
                ].join(' ')}
              >
                <h3 className="font-d text-[26px] text-paper-50 leading-tight mb-2.5">
                  {title}
                </h3>
                <p className="font-t italic text-[16px] leading-[1.65] text-ink-500">
                  {body}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── 7. TAILOR CTA ───────────────────────────────────────────────────── */}
      <section className="bg-paper-50 px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">

          {/* Brand cut-line divider */}
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
                <Button size="lg">List Your Shop</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">Already listed? Sign in</Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}
