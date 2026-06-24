import { useState, useEffect, useCallback } from 'react'
import TailorCard from '../components/ui/TailorCard'
import LocationSelector from '../components/ui/LocationSelector'
import { tailorsApi } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { getUserLocation, getScopeLabel, sortByLocation } from '../lib/locationMatch'

const PLACEHOLDER = [
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
    rating: 4.2, reviewCount: 53, isTopRated: true, isOpenNow: false, distanceKm: 9, whatsapp: '9988776655',
  },
]

export default function TopRatedPage() {
  const { user } = useAuth()
  const [location, setLocation] = useState({ state: '', district: '', city: '' })
  const [autoDetected, setAutoDetected] = useState(false)
  const [tailors, setTailors] = useState([])
  const [total, setTotal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)

  // Auto-populate filter from user's saved location on first mount only
  useEffect(() => {
    const loc = getUserLocation(user)
    if (loc.city || loc.district || loc.state) {
      setLocation({ city: loc.city || '', district: loc.district || '', state: loc.state || '' })
      setAutoDetected(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally empty — only on mount

  const { state, district, city } = location

  const buildScope = () => {
    if (city) return `in ${city}`
    if (district) return `in ${district} district`
    if (state) return `in ${state}`
    return 'across India'
  }

  const fetchTailors = useCallback(async () => {
    setLoading(true)
    try {
      const params = { sort: 'rating', limit: 24, topRated: 'true' }
      if (city)     params.city     = city
      if (district) params.district = district
      if (state)    params.state    = state
      const data = await tailorsApi.search(params)
      let list = data.tailors || []

      // If no explicit location typed by the user (auto-detected), widen scope if empty
      if (list.length === 0 && (city || district || state)) {
        const wider = { sort: 'rating', limit: 24, topRated: 'true' }
        if (city && district) wider.district = district
        else if (city || district) wider.state = state
        const wider2 = await tailorsApi.search(wider)
        list = wider2.tailors || []
        setTotal(wider2.total ?? list.length)
      } else {
        setTotal(data.total ?? list.length)
      }

      // Within results, always put closest matches first, then sort by rating
      if (city || district || state) {
        list = sortByLocation(list, { city, district, state })
      }

      setTailors(list.length ? list : PLACEHOLDER)
    } catch {
      setTailors(PLACEHOLDER)
      setTotal(null)
    } finally {
      setLoading(false)
    }
  }, [city, district, state])

  useEffect(() => { fetchTailors() }, [fetchTailors])

  const clearLocation = () => {
    setLocation({ state: '', district: '', city: '' })
    setAutoDetected(false)
  }

  const hasFilter = !!(state || district || city)

  return (
    <div className="min-h-screen bg-paper-50">

      {/* ── Page header ── */}
      <section className="bg-ink-900 px-6 pt-16 pb-12">
        <div className="max-w-6xl mx-auto">
          <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-500 mb-3">
            Top rated
          </p>
          <h1 className="font-d text-[clamp(38px,6vw,72px)] text-paper-50 leading-[0.92] tracking-tight mb-4">
            The best tailors,<br />wherever you are.
          </h1>
          <p className="font-t italic text-[clamp(16px,2vw,20px)] text-ink-400 max-w-lg">
            Curated by customer ratings. Filter by location to find top-rated tailors near you.
          </p>
        </div>
      </section>

      {/* ── Filter bar ── */}
      <div className="bg-paper-0 border-b border-ink-200 sticky top-14 z-30">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4 flex-wrap">

          {/* Toggle filter panel */}
          <button
            type="button"
            onClick={() => setFilterOpen(v => !v)}
            className={[
              'inline-flex items-center gap-2 font-ui font-semibold text-[11px] uppercase tracking-wide-xs',
              'px-4 py-2 rounded-sm border transition-colors duration-base cursor-pointer',
              filterOpen || hasFilter
                ? 'border-ink-900 bg-ink-900 text-paper-50'
                : 'border-ink-200 text-ink-600 hover:border-ink-900 hover:text-ink-900',
            ].join(' ')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter by location
            {hasFilter && (
              <span className="ml-1 w-4 h-4 rounded-full bg-paper-50 text-ink-900 text-[9px] flex items-center justify-center font-bold">
                {[city, district, state].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Active filter chips */}
          {city && (
            <div className="inline-flex items-center gap-1.5 font-ui text-[11px] text-ink-700 bg-ink-100 border border-ink-200 rounded-sm px-3 py-1.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {city}
            </div>
          )}
          {district && !city && (
            <div className="inline-flex items-center gap-1.5 font-ui text-[11px] text-ink-700 bg-ink-100 border border-ink-200 rounded-sm px-3 py-1.5">
              {district} district
            </div>
          )}
          {state && !district && (
            <div className="inline-flex items-center gap-1.5 font-ui text-[11px] text-ink-700 bg-ink-100 border border-ink-200 rounded-sm px-3 py-1.5">
              {state}
            </div>
          )}

          {hasFilter && (
            <button
              type="button"
              onClick={clearLocation}
              className="font-ui text-[11px] text-ink-400 hover:text-ink-900 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}

          {/* Scope label + auto-detected hint */}
          <div className="ml-auto hidden sm:flex items-center gap-3">
            {autoDetected && hasFilter && (
              <span className="inline-flex items-center gap-1.5 font-ui text-[10px] uppercase tracking-wide-xs text-ink-400">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                Your location
              </span>
            )}
            <p className="font-t italic text-[14px] text-ink-400">
              Showing top-rated tailors {buildScope()}
            </p>
          </div>
        </div>

        {/* Collapsible location filter */}
        <div className={['overflow-hidden transition-all duration-base', filterOpen ? 'max-h-80' : 'max-h-0'].join(' ')}>
          <div className="border-t border-ink-100 bg-paper-50 px-6 py-5">
            <div className="max-w-lg">
              <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-lg text-ink-500 mb-3">
                Choose location
              </p>
              <LocationSelector
                value={location}
                onChange={setLocation}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <section className="max-w-6xl mx-auto px-6 py-10 pb-24">

        {/* Result count */}
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h2 className="font-d text-[clamp(22px,3vw,32px)] text-ink-900 leading-tight">
              Top-rated tailors {buildScope()}
            </h2>
            {total !== null && !loading && (
              <p className="font-t italic text-[14px] text-ink-400 mt-1">
                {total} {total === 1 ? 'shop' : 'shops'} found
              </p>
            )}
          </div>

          {/* Star decoration */}
          <div className="flex items-center gap-1 text-ink-300 flex-shrink-0">
            {['★', '★', '★', '★', '★'].map((s, i) => (
              <span key={i} className="text-[18px]">{s}</span>
            ))}
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-ink-100 rounded-md h-80 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && tailors.length === 0 && (
          <div className="text-center py-24 border border-dashed border-ink-200 rounded-md">
            <div className="w-10 h-10 mx-auto mb-4 text-ink-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <p className="font-d text-2xl text-ink-700 mb-2">No top-rated tailors found</p>
            <p className="font-t italic text-ink-500 mb-6">
              Try selecting a broader area, or{' '}
              <button onClick={clearLocation} className="underline hover:no-underline cursor-pointer">
                clear the filter
              </button>
              .
            </p>
          </div>
        )}

        {/* Tailor grid */}
        {!loading && tailors.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tailors.map(t => <TailorCard key={t._id} tailor={t} />)}
            </div>

            {/* Location scope notice */}
            {hasFilter && (
              <div className="mt-10 border-t border-dashed border-ink-200 pt-8 text-center">
                <p className="font-t italic text-[14px] text-ink-400 mb-3">
                  Looking for more options?
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {city && district && (
                    <button
                      onClick={() => setLocation({ state, district, city: '' })}
                      className="font-ui text-[11px] uppercase tracking-wide-xs border border-ink-200 px-4 py-2 rounded-sm text-ink-600 hover:border-ink-900 hover:text-ink-900 transition-colors cursor-pointer"
                    >
                      All of {district} district
                    </button>
                  )}
                  {district && state && (
                    <button
                      onClick={() => setLocation({ state, district: '', city: '' })}
                      className="font-ui text-[11px] uppercase tracking-wide-xs border border-ink-200 px-4 py-2 rounded-sm text-ink-600 hover:border-ink-900 hover:text-ink-900 transition-colors cursor-pointer"
                    >
                      All of {state}
                    </button>
                  )}
                  {state && (
                    <button
                      onClick={clearLocation}
                      className="font-ui text-[11px] uppercase tracking-wide-xs border border-ink-200 px-4 py-2 rounded-sm text-ink-600 hover:border-ink-900 hover:text-ink-900 transition-colors cursor-pointer"
                    >
                      All of India
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
