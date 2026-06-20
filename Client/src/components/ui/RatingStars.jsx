export default function RatingStars({ rating = 0, count, size = 'sm' }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={['flex gap-px', size === 'sm' ? 'text-[13px]' : 'text-[16px]'].join(' ')}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={i < full ? 'text-ink-900' : i === full && half ? 'text-ink-400' : 'text-ink-200'}
          >
            ★
          </span>
        ))}
      </span>
      {count !== undefined && (
        <span className="font-ui text-[11px] text-ink-500 tracking-wide-xs">({count})</span>
      )}
    </span>
  )
}
