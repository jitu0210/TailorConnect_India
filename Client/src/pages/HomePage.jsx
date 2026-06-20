import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/ui/SearchBar'
import TailorCard from '../components/ui/TailorCard'
import { tailorsApi } from '../lib/api'

const PLACEHOLDER_TAILORS = [
  {
    _id: '1',
    shopName: 'Raj Tailors',
    city: 'Korba',
    state: 'Chhattisgarh',
    specialties: ['Bridal Wear', "Men's Formal", 'Fine Alterations'],
    rating: 4.8,
    reviewCount: 124,
    isVerified: true,
    isTopRated: true,
    isOpenNow: true,
    distanceKm: 3,
    whatsapp: '9876543210',
  },
  {
    _id: '2',
    shopName: 'Anita Boutique',
    city: 'Raipur',
    state: 'Chhattisgarh',
    specialties: ['Ladies Suits', 'Lehenga', 'Blouse Stitching'],
    rating: 4.5,
    reviewCount: 87,
    isVerified: true,
    isOpenNow: true,
    distanceKm: 7,
    whatsapp: '9123456780',
  },
  {
    _id: '3',
    shopName: 'Kumar Master',
    city: 'Nagpur',
    state: 'Maharashtra',
    specialties: ["Men's Kurta", 'Sherwani', 'School Uniforms'],
    rating: 4.2,
    reviewCount: 53,
    isOpenNow: false,
    distanceKm: 9,
    whatsapp: '9988776655',
  },
]

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tailors, setTailors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  const keyword = searchParams.get('keyword') || ''
  const location = searchParams.get('location') || ''
  const hasQuery = keyword || location

  const fetchTailors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await tailorsApi.search({ keyword, location })
      setTailors(data.tailors)
      setPagination(data.pagination)
    } catch {
      // Fall back to placeholder data during development
      setTailors(PLACEHOLDER_TAILORS)
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [keyword, location])

  useEffect(() => {
    fetchTailors()
  }, [fetchTailors])

  function handleSearch({ keyword: kw, location: loc }) {
    const params = {}
    if (kw) params.keyword = kw
    if (loc) params.location = loc
    setSearchParams(params)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-ink-900 text-paper-50 px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-8">
            Location-based · Tailoring marketplace
          </p>

          <h1 className="font-d font-medium text-[clamp(48px,8vw,96px)] leading-[0.95] tracking-[-0.02em] text-paper-50 mb-8">
            Find a trusted tailor near you.
          </h1>

          <p className="font-t text-[clamp(17px,2vw,22px)] leading-relaxed text-ink-300 max-w-xl mx-auto mb-12">
            Local tailors. Digital storefronts. Honest reviews.
            <br />
            <em>Bespoke, nearby.</em>
          </p>

          <div className="max-w-2xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              initialKeyword={keyword}
              initialLocation={location}
            />
          </div>
        </div>
      </section>

      {/* Cut-line — brand signature divider */}
      <div className="max-w-6xl mx-auto px-6 my-10 flex items-center gap-4">
        <div className="flex-1 cut-line" />
        <span className="text-ink-500 text-xl select-none">✂</span>
        <div className="flex-1 cut-line" />
      </div>

      {/* Results */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500">
              {hasQuery ? 'Search results' : 'Tailors near you'}
            </p>
            {pagination && (
              <p className="font-t text-[14px] italic text-ink-400 mt-0.5">
                {pagination.total} {pagination.total === 1 ? 'shop' : 'shops'} found
              </p>
            )}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-ink-100 rounded-md h-80 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <p className="font-t italic text-ink-500 text-center py-12">{error}</p>
        )}

        {!loading && tailors.length === 0 && (
          <div className="text-center py-16">
            <p className="font-d text-2xl text-ink-700 mb-2">No tailors found</p>
            <p className="font-t italic text-ink-500">Try a different city or service name.</p>
          </div>
        )}

        {!loading && tailors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tailors.map((tailor) => (
              <TailorCard key={tailor._id} tailor={tailor} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
