import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Tag from '../components/ui/Tag'
import RatingStars from '../components/ui/RatingStars'
import Avatar from '../components/ui/Avatar'
import { tailorsApi } from '../lib/api'

export default function TailorPage() {
  const { id } = useParams()
  const [tailor, setTailor] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [t, r] = await Promise.all([
          tailorsApi.getById(id),
          tailorsApi.getReviews(id),
        ])
        setTailor(t)
        setReviews(r)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="h-48 bg-ink-100 rounded-md animate-pulse mb-6" />
        <div className="h-8 bg-ink-100 rounded w-1/2 animate-pulse mb-3" />
        <div className="h-4 bg-ink-100 rounded w-1/3 animate-pulse" />
      </div>
    )
  }

  if (error || !tailor) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="font-d text-2xl text-ink-700 mb-4">Shop not found</p>
        <Link to="/">
          <Button variant="outline">← Back to search</Button>
        </Link>
      </div>
    )
  }

  const whatsappUrl = tailor.whatsapp
    ? `https://wa.me/91${tailor.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I found your shop on TailorConnect India and would like to enquire about your services.`)}`
    : null

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-ui font-semibold text-[11px] uppercase tracking-wide-md text-ink-500 hover:text-ink-900 transition-colors duration-base mb-8"
      >
        ← All tailors
      </Link>

      {/* Cover */}
      <div
        className="w-full h-48 md:h-64 rounded-md mb-8 overflow-hidden"
        style={{
          backgroundColor: '#e7e4dc',
          backgroundImage:
            'repeating-linear-gradient(45deg,rgba(17,17,17,.07) 0 2px,transparent 2px 6px),repeating-linear-gradient(-45deg,rgba(17,17,17,.07) 0 2px,transparent 2px 6px)',
          backgroundSize: '12px 12px',
        }}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tailor.isVerified && <Badge variant="solid">✓ Verified</Badge>}
            {tailor.isTopRated && <Badge variant="outline">Top Rated</Badge>}
            {tailor.isOpenNow ? (
              <Badge variant="ghost">Open Now</Badge>
            ) : (
              <Badge variant="muted">Closed</Badge>
            )}
          </div>

          <h1 className="font-d text-[clamp(32px,5vw,48px)] font-semibold text-ink-900 leading-tight tracking-tight mb-1">
            {tailor.shopName}
          </h1>

          <p className="font-ui text-[11px] uppercase tracking-wide-sm text-ink-500">
            {[tailor.address, tailor.city, tailor.state].filter(Boolean).join(', ')}
            {tailor.pincode && ` — ${tailor.pincode}`}
          </p>

          <div className="mt-3">
            <RatingStars rating={tailor.rating} count={tailor.reviewCount} size="md" />
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex-shrink-0">
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="solid">
                ✆ Chat on WhatsApp
              </Button>
            </a>
          ) : (
            <Button size="lg" disabled>
              WhatsApp not listed
            </Button>
          )}
        </div>
      </div>

      {/* Cut-line divider */}
      <div className="cut-line mb-6" />

      {/* Bio */}
      {tailor.bio && (
        <p className="font-t text-[18px] leading-relaxed text-ink-700 mb-8">{tailor.bio}</p>
      )}

      {/* Specialties */}
      {tailor.specialties?.length > 0 && (
        <div className="mb-8">
          <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500 mb-3">
            Specialties
          </p>
          <div className="flex flex-wrap gap-2">
            {tailor.specialties.map((s) => (
              <Tag key={s} label={s} />
            ))}
          </div>
        </div>
      )}

      {/* Cut-line divider */}
      <div className="cut-line mb-8" />

      {/* Reviews */}
      <section>
        <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500 mb-6">
          Customer reviews ({reviews.length})
        </p>

        {reviews.length === 0 ? (
          <p className="font-t italic text-ink-400 text-[16px]">
            No reviews yet — be the first to share your experience.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {reviews.map((review) => (
              <article key={review._id} className="flex gap-4">
                <Avatar initials={review.customerName?.charAt(0)?.toUpperCase()} size="md" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-ui font-semibold text-[13px] text-ink-900">
                      {review.customerName}
                    </span>
                    <RatingStars rating={review.rating} size="sm" />
                  </div>
                  {review.serviceType && (
                    <p className="font-ui text-[10px] uppercase tracking-wide-sm text-ink-400 mb-1">
                      {review.serviceType}
                    </p>
                  )}
                  {review.comment && (
                    <p className="font-t text-[16px] leading-relaxed text-ink-700">
                      "{review.comment}"
                    </p>
                  )}
                  <p className="font-ui text-[10px] text-ink-400 mt-1.5">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
