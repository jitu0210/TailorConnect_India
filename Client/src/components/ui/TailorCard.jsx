import { Link } from 'react-router-dom'
import Badge from './Badge'
import RatingStars from './RatingStars'
import Button from './Button'

// Scissors icon for cover placeholder
function ScissorsIcon() {
  return (
    <svg
      width="52" height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(17,17,17,0.13)"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  )
}

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
    ? (() => {
        const digits = whatsapp.replace(/\D/g, '')
        const e164 = digits.startsWith('91') && digits.length > 10 ? digits : `91${digits}`
        return `https://wa.me/${e164}`
      })()
    : null

  return (
    <article className="bg-paper-0 border border-ink-200 rounded-md flex flex-col transition-all duration-base ease-out-tc hover:shadow-md hover:-translate-y-0.5 hover:border-ink-300">
      {/* Cover */}
      <div className="aspect-[4/3] relative rounded-t-md overflow-hidden">
        {coverTexture && (
          <>
            {/* Woven grid texture */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: '#e8e5dc',
                backgroundImage: [
                  'repeating-linear-gradient(0deg, rgba(17,17,17,0.05) 0 1px, transparent 1px 24px)',
                  'repeating-linear-gradient(90deg, rgba(17,17,17,0.05) 0 1px, transparent 1px 24px)',
                ].join(', '),
                backgroundSize: '24px 24px',
              }}
            />
            {/* Centered scissors motif */}
            <div className="absolute inset-0 flex items-center justify-center">
              <ScissorsIcon />
            </div>
            {/* Subtle vignette */}
            <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(17,17,17,0.06) 100%)' }}
            />
          </>
        )}

        {/* Badges top-left */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
          {isVerified  && <Badge variant="solid">✓ Verified</Badge>}
          {isTopRated  && <Badge variant="outline" className="bg-paper-0">Top Rated</Badge>}
          {isOpenNow   && <Badge variant="ghost"   className="bg-paper-0/85 backdrop-blur-sm">Open Now</Badge>}
        </div>

        {/* Distance badge bottom-right */}
        {distanceKm !== undefined && (
          <div className="absolute bottom-2.5 right-2.5 bg-paper-0/90 backdrop-blur-sm border border-ink-200 rounded-sm px-2 py-1 font-ui font-semibold text-[11px] text-ink-700 tracking-wide-xs">
            {distanceKm} km away
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div>
          <h3 className="font-d text-[22px] font-semibold text-ink-900 leading-tight tracking-tight mb-0.5">
            {shopName}
          </h3>
          <p className="font-ui text-[11px] uppercase tracking-wide-sm text-ink-400">
            {city}{state ? `, ${state}` : ''}
          </p>
        </div>

        <RatingStars rating={rating} count={reviewCount} />

        {specialties.length > 0 && (
          <p className="font-t italic text-[14px] text-ink-500 leading-snug">
            {specialties.slice(0, 3).join(' · ')}
          </p>
        )}

        {/* Actions */}
        <div className="mt-auto pt-3.5 cut-line flex gap-2">
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button size="sm" variant="solid" className="w-full gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.104.549 4.08 1.505 5.796L0 24l6.386-1.676A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.303-1.554l-.38-.226-3.793.995 1.012-3.694-.249-.398A9.817 9.817 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
                </svg>
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
