const variants = {
  solid: 'bg-ink-900 text-paper-50',
  outline: 'border border-ink-900 text-ink-900',
  ghost: 'border border-dashed border-ink-400 text-ink-600',
  muted: 'bg-ink-100 text-ink-700',
}

export default function Badge({ variant = 'solid', className = '', children }) {
  return (
    <span
      className={[
        'inline-flex items-center',
        'font-ui font-semibold text-[11px] tracking-wide-sm uppercase',
        'px-2 py-0.5 rounded-sm',
        variants[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
