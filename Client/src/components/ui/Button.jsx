const variants = {
  solid: 'bg-ink-900 text-paper-50 border-transparent hover:bg-ink-700',
  outline: 'bg-transparent text-ink-900 border-ink-900 hover:bg-ink-900 hover:text-paper-50',
  ghost: 'bg-transparent text-ink-900 border-transparent hover:bg-ink-100',
}

const sizes = {
  sm: 'px-4 py-2 text-[11px]',
  md: 'px-6 py-3 text-[12px]',
  lg: 'px-[34px] py-4 text-[13px]',
}

export default function Button({
  variant = 'solid',
  size = 'md',
  disabled = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2',
        'font-ui font-semibold uppercase tracking-wide-md',
        'border rounded-md',
        'transition-colors duration-base ease-std',
        'cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
