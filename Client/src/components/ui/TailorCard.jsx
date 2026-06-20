import { Link } from 'react-router-dom'
import Badge from './Badge'
import RatingStars from './RatingStars'
import Button from './Button'

export default function TailorCard({ tailor }) {
  const {
    _id,
    shopName,
    city,
    state,
    specialties = [],
    rating = 0,
    reviewCount = 0,
    isVerified = false,
    isTopRated = false,
    isOpenNow = false,
    distanceKm,
    whatsapp,
    coverTexture = true,
  } = tailor

  const whatsappUrl = whatsapp
    ? `https://wa.me/91${whatsapp.replace(/\D/g, '')}`
    : null

  return (
    <article className="bg-paper-0 border border-ink-200 rounded-md flex flex-col transition-[box-shadow,transform] duration-base ease-out-tc hover:shadow-md hover:-translate-y-0.5">
      {/* Cover */}
      <div className="aspect-[4/3] bg-ink-100 relative rounded-t-md overflow-hidden">
        {coverTexture && (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: '#e7e4dc',
              backgroundImage:
                'repeating-linear-gradient(45deg,rgba(17,17,17,.07) 0 2px,transparent 2px 6px),repeating-linear-gradient(-45deg,rgba(17,17,17,.07) 0 2px,transparent 2px 6px)',
              backgroundSize: '12px 12px',
            }}
          />
        )}

        {/* Badges top-left */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
          {isVerified && <Badge variant="solid">✓ Verified</Badge>}
          {isTopRated && <Badge variant="outline" className="bg-paper-0">Top Rated</Badge>}
          {isOpenNow && <Badge variant="ghost" className="bg-paper-0/80">Open Now</Badge>}
        </div>

        {/* Distance badge top-right */}
        {distanceKm !== undefined && (
          <div className="absolute bottom-2.5 right-2.5 bg-paper-0/90 backdrop-blur-sm border border-ink-200 rounded-sm px-2 py-1 font-ui font-semibold text-[11px] text-ink-700 tracking-wide-xs">
            {distanceKm} km
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div>
          <h3 className="font-d text-2xl font-semibold text-ink-900 leading-tight tracking-tight mb-1">
            {shopName}
          </h3>
          <p className="font-ui text-[11px] uppercase tracking-wide-sm text-ink-500">
            {city}{state ? `, ${state}` : ''}
          </p>
        </div>

        <RatingStars rating={rating} count={reviewCount} />

        {specialties.length > 0 && (
          <p className="font-t italic text-[15px] text-ink-600 leading-snug">
            {specialties.slice(0, 3).join(' · ')}
          </p>
        )}

        {/* Actions — separated by the cut-line */}
        <div className="mt-auto pt-3.5 cut-line flex gap-2">
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button size="sm" variant="solid" className="w-full">
                WhatsApp
              </Button>
            </a>
          ) : (
            <Button size="sm" variant="solid" className="flex-1" disabled>
              WhatsApp
            </Button>
          )}
          <Link to={`/tailor/${_id}`} className="flex-1">
            <Button size="sm" variant="outline" className="w-full">
              View Shop
            </Button>
          </Link>
        </div>
      </div>
    </article>
  )
}
