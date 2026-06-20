const sizes = {
  sm: 'w-8 h-8 text-[13px]',
  md: 'w-11 h-11 text-[17px]',
  lg: 'w-14 h-14 text-[22px]',
}

export default function Avatar({ src, alt, initials, size = 'md', className = '' }) {
  return (
    <div
      className={[
        'rounded-pill bg-ink-100 flex items-center justify-center overflow-hidden flex-shrink-0',
        'font-ui font-semibold text-ink-700',
        sizes[size],
        className,
      ].join(' ')}
    >
      {src ? (
        <img src={src} alt={alt || ''} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
