import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Tag from '../components/ui/Tag'
import RatingStars from '../components/ui/RatingStars'
import Avatar from '../components/ui/Avatar'
import { tailorsApi } from '../lib/api'

// ── Helpers ───────────────────────────────────────────────────────────────────

function whatsappLink(number) {
  if (!number) return null
  const digits = number.replace(/\D/g, '')
  const e164 = digits.startsWith('91') ? digits : `91${digits}`
  return `https://wa.me/${e164}?text=${encodeURIComponent('Hi, I found your shop on TailorConnect India and would like to enquire about your services.')}`
}

function mailtoLink(email) {
  if (!email) return null
  return `mailto:${email}?subject=${encodeURIComponent('Enquiry from TailorConnect India')}&body=${encodeURIComponent('Hi,\n\nI found your shop on TailorConnect India and would like to enquire about your services.\n\nThank you.')}`
}

const GALLERY_CATEGORIES = ["Men's Wear", "Women's Wear", 'Bridal Wear', 'Alterations', 'Uniforms', 'Designer']

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-pulse">
      <div className="h-64 bg-ink-100 rounded-md mb-8" />
      <div className="h-10 bg-ink-100 rounded w-1/2 mb-3" />
      <div className="h-4 bg-ink-100 rounded w-1/3 mb-6" />
      <div className="flex gap-3 mb-8">
        <div className="h-12 w-40 bg-ink-100 rounded-sm" />
        <div className="h-12 w-36 bg-ink-100 rounded-sm" />
      </div>
      <div className="h-px bg-ink-100 mb-8" />
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-ink-100 rounded-sm" />)}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TailorPage() {
  const { id } = useParams()
  const [tailor, setTailor]   = useState(null)
  const [reviews, setReviews] = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [galleryFilter, setGalleryFilter] = useState('All')
  const [lightbox, setLightbox] = useState(null) // url string

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [t, r] = await Promise.all([
          tailorsApi.getById(id),
          tailorsApi.getReviews(id, { limit: 20 }),
        ])
        if (cancelled) return
        setTailor(t)
        setReviews(r.reviews || [])
        setTotal(r.total || 0)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  if (loading) return <Skeleton />

  if (error || !tailor) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="font-d text-2xl text-ink-700 mb-4">Shop not found</p>
        <Link to="/"><Button variant="outline">← Back to search</Button></Link>
      </div>
    )
  }

  if (!tailor.isActive || tailor.status !== 'approved') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-xl text-ink-400 mb-4">
          {tailor.status === 'pending' ? 'Under review' : 'Unavailable'}
        </p>
        <p className="font-d text-[clamp(28px,5vw,40px)] text-ink-900 mb-3">{tailor.shopName}</p>
        <p className="font-t italic text-[16px] text-ink-500 mb-8">
          {tailor.status === 'pending'
            ? 'This shop is currently under review and will be available once approved.'
            : 'This shop is temporarily unavailable.'}
        </p>
        <Link to="/"><Button variant="outline">← Find other tailors</Button></Link>
      </div>
    )
  }

  const waLink    = whatsappLink(tailor.whatsapp)
  const emailLink = mailtoLink(tailor.email)

  const gallery = tailor.gallery || []
  const filteredGallery = galleryFilter === 'All'
    ? gallery
    : gallery.filter(g => g.category === galleryFilter)

  const usedCategories = [...new Set(gallery.map(g => g.category).filter(Boolean))]

  return (
    <>
      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-ink-900/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Gallery"
            className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-lg"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-paper-50 text-2xl leading-none w-9 h-9 flex items-center justify-center hover:text-ink-300 transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-ui font-semibold text-[11px] uppercase tracking-wide-md text-ink-500 hover:text-ink-900 transition-colors duration-base mb-8"
        >
          ← All tailors
        </Link>

        {/* ── Cover image ──────────────────────────────────────────────────── */}
        <div className="relative w-full h-52 md:h-72 rounded-md mb-8 overflow-hidden bg-paper-100">
          {tailor.coverImage ? (
            <img
              src={tailor.coverImage}
              alt={`${tailor.shopName} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                backgroundImage: [
                  'repeating-linear-gradient(45deg,rgba(17,17,17,.07) 0 2px,transparent 2px 6px)',
                  'repeating-linear-gradient(-45deg,rgba(17,17,17,.07) 0 2px,transparent 2px 6px)',
                ].join(','),
                backgroundSize: '12px 12px',
              }}
            />
          )}
          {/* Profile image bubble */}
          {tailor.profileImage && (
            <div className="absolute bottom-4 left-6 w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 border-paper-0 shadow-md">
              <img src={tailor.profileImage} alt={tailor.ownerName} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* ── Shop header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tailor.isVerified  && <Badge variant="solid">✓ Verified</Badge>}
              {tailor.isTopRated  && <Badge variant="outline">Top Rated</Badge>}
              {tailor.subscriptionType === 'premium' && <Badge variant="solid">★ Premium</Badge>}
              {tailor.isOpenNow
                ? <Badge variant="ghost">Open Now</Badge>
                : <Badge variant="muted">Closed</Badge>}
            </div>

            <h1 className="font-d text-[clamp(28px,5vw,48px)] font-semibold text-ink-900 leading-tight tracking-tight mb-1">
              {tailor.shopName}
            </h1>

            <p className="font-ui text-[11px] uppercase tracking-wide-sm text-ink-500 mb-3">
              {[tailor.address, tailor.city, tailor.district, tailor.state].filter(Boolean).join(', ')}
              {tailor.pincode && ` — ${tailor.pincode}`}
            </p>

            <RatingStars rating={tailor.rating} count={tailor.reviewCount} size="md" />

            {tailor.experience > 0 && (
              <p className="font-t italic text-[14px] text-ink-500 mt-2">
                {tailor.experience} year{tailor.experience === 1 ? '' : 's'} of experience
              </p>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2.5 flex-shrink-0 min-w-[160px]">
            {waLink ? (
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="solid" className="w-full justify-center">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp
                </Button>
              </a>
            ) : (
              <Button size="lg" disabled className="w-full justify-center">WhatsApp not listed</Button>
            )}

            {tailor.mobile && (
              <a href={`tel:${tailor.mobile}`}>
                <Button size="lg" variant="outline" className="w-full justify-center">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.81 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z"/>
                  </svg>
                  Call {tailor.mobile}
                </Button>
              </a>
            )}

            {emailLink && (
              <a href={emailLink}>
                <Button size="lg" variant="outline" className="w-full justify-center">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                  </svg>
                  Send Email
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="cut-line mb-8" />

        {/* ── Bio ─────────────────────────────────────────────────────────── */}
        {tailor.bio && (
          <p className="font-t text-[18px] leading-relaxed text-ink-700 mb-8 italic">
            {tailor.bio}
          </p>
        )}

        {/* ── Specialties ──────────────────────────────────────────────────── */}
        {tailor.specialties?.length > 0 && (
          <div className="mb-8">
            <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500 mb-3">
              Specialties
            </p>
            <div className="flex flex-wrap gap-2">
              {tailor.specialties.map(s => <Tag key={s} label={s} />)}
            </div>
          </div>
        )}

        {/* ── Shop gallery ──────────────────────────────────────────────────── */}
        {gallery.length > 0 && (
          <div className="mb-10">
            <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
              <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500">
                Shop photos ({gallery.length})
              </p>
              {usedCategories.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {['All', ...usedCategories].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setGalleryFilter(cat)}
                      className={[
                        'font-ui text-[10px] uppercase tracking-wide-xs px-3 py-1 rounded-sm border transition-colors duration-base cursor-pointer',
                        galleryFilter === cat
                          ? 'bg-ink-900 border-ink-900 text-paper-50'
                          : 'border-ink-200 text-ink-500 hover:border-ink-700 hover:text-ink-900',
                      ].join(' ')}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredGallery.map((item, i) => (
                <button
                  key={item._id || i}
                  type="button"
                  onClick={() => setLightbox(item.url)}
                  className="group relative aspect-square overflow-hidden rounded-sm bg-paper-100 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900"
                >
                  <img
                    src={item.url}
                    alt={item.caption || item.category || 'Shop photo'}
                    className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-105"
                    loading="lazy"
                  />
                  {(item.caption || item.category) && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/80 to-transparent px-3 py-2 translate-y-full group-hover:translate-y-0 transition-transform duration-base">
                      {item.caption && (
                        <p className="font-t italic text-[13px] text-paper-50 leading-tight truncate">
                          {item.caption}
                        </p>
                      )}
                      {item.category && (
                        <p className="font-ui text-[9px] uppercase tracking-wide-xs text-ink-400 mt-0.5">
                          {item.category}
                        </p>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="cut-line mb-8" />

        {/* ── Contact & info ────────────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
          {tailor.whatsapp && (
            <div className="flex gap-3">
              <dt className="font-ui font-semibold text-[10px] uppercase tracking-wide-xs text-ink-400 w-24 flex-shrink-0 pt-0.5">WhatsApp</dt>
              <dd className="font-t text-[15px] text-ink-800">
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-2">
                  {tailor.whatsapp}
                </a>
              </dd>
            </div>
          )}
          {tailor.mobile && (
            <div className="flex gap-3">
              <dt className="font-ui font-semibold text-[10px] uppercase tracking-wide-xs text-ink-400 w-24 flex-shrink-0 pt-0.5">Mobile</dt>
              <dd className="font-t text-[15px] text-ink-800">
                <a href={`tel:${tailor.mobile}`} className="hover:underline underline-offset-2">
                  {tailor.mobile}
                </a>
              </dd>
            </div>
          )}
          {tailor.email && (
            <div className="flex gap-3">
              <dt className="font-ui font-semibold text-[10px] uppercase tracking-wide-xs text-ink-400 w-24 flex-shrink-0 pt-0.5">Email</dt>
              <dd className="font-t text-[15px] text-ink-800 min-w-0 break-words">
                <a href={emailLink} className="hover:underline underline-offset-2">
                  {tailor.email}
                </a>
              </dd>
            </div>
          )}
          {tailor.address && (
            <div className="flex gap-3">
              <dt className="font-ui font-semibold text-[10px] uppercase tracking-wide-xs text-ink-400 w-24 flex-shrink-0 pt-0.5">Address</dt>
              <dd className="font-t text-[15px] text-ink-800 min-w-0 break-words">{tailor.address}</dd>
            </div>
          )}
          {tailor.pincode && (
            <div className="flex gap-3">
              <dt className="font-ui font-semibold text-[10px] uppercase tracking-wide-xs text-ink-400 w-24 flex-shrink-0 pt-0.5">Pincode</dt>
              <dd className="font-t text-[15px] text-ink-800">{tailor.pincode}</dd>
            </div>
          )}
          {tailor.serviceRadius && (
            <div className="flex gap-3">
              <dt className="font-ui font-semibold text-[10px] uppercase tracking-wide-xs text-ink-400 w-24 flex-shrink-0 pt-0.5">Serves within</dt>
              <dd className="font-t text-[15px] text-ink-800">{tailor.serviceRadius} km</dd>
            </div>
          )}
        </div>

        <div className="cut-line mb-8" />

        {/* ── Reviews ──────────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-baseline gap-3 mb-6">
            <p className="font-ui font-bold text-[11px] uppercase tracking-wide-xl text-ink-500">
              Customer reviews
            </p>
            {total > 0 && (
              <span className="font-t italic text-[14px] text-ink-400">
                {total} review{total === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="font-t italic text-ink-400 text-[16px]">
              No reviews yet — be the first to share your experience.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-ink-100">
              {reviews.map(review => (
                <article key={review._id} className="py-6 first:pt-0">
                  <div className="flex gap-4">
                    <Avatar
                      initials={review.customerName?.charAt(0)?.toUpperCase() || review.customer?.fullName?.charAt(0)?.toUpperCase()}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <span className="font-ui font-semibold text-[13px] text-ink-900">
                          {review.customerName || review.customer?.fullName || 'Customer'}
                        </span>
                        <RatingStars rating={review.rating} size="sm" />
                        {review.serviceType && (
                          <span className="font-ui text-[10px] uppercase tracking-wide-sm text-ink-400">
                            · {review.serviceType}
                          </span>
                        )}
                      </div>

                      <p className="font-ui text-[10px] text-ink-400 mb-2">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>

                      {review.comment && (
                        <p className="font-t text-[16px] leading-relaxed text-ink-700">
                          "{review.comment}"
                        </p>
                      )}

                      {/* Tailor reply */}
                      {review.tailorReply?.text && (
                        <div className="mt-3 bg-paper-100 border-l-2 border-ink-200 pl-4 py-3 rounded-sm">
                          <p className="font-ui font-semibold text-[10px] uppercase tracking-wide-sm text-ink-500 mb-1">
                            Reply from {tailor.shopName}
                          </p>
                          <p className="font-t text-[14px] text-ink-700 leading-relaxed">
                            {review.tailorReply.text}
                          </p>
                          {review.tailorReply.repliedAt && (
                            <p className="font-ui text-[10px] text-ink-400 mt-1">
                              {new Date(review.tailorReply.repliedAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </>
  )
}
