export function Input({ label, hint, error = false, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-[7px]">
      {label && (
        <label className="font-ui font-semibold text-[11px] uppercase tracking-wide-lg text-ink-700">
          {label}
        </label>
      )}
      <input
        className={[
          'w-full border rounded-sm px-3 py-2.5',
          'font-t text-[16px] text-ink-900 bg-paper-0',
          'placeholder:text-ink-400',
          'outline-none transition-colors duration-base',
          error
            ? 'border-ink-900'
            : 'border-ink-200 focus:border-ink-900',
          className,
        ].join(' ')}
        {...props}
      />
      {hint && (
        <span className={['font-t italic text-[14px]', error ? 'text-ink-900' : 'text-ink-500'].join(' ')}>
          {hint}
        </span>
      )}
    </div>
  )
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-[7px]">
      {label && (
        <label className="font-ui font-semibold text-[11px] uppercase tracking-wide-lg text-ink-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={[
            'w-full appearance-none border border-ink-200 rounded-sm px-3 py-2.5 pr-8',
            'font-t text-[16px] text-ink-900 bg-paper-0',
            'outline-none transition-colors duration-base focus:border-ink-900',
            'cursor-pointer',
            className,
          ].join(' ')}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 text-[10px]">▼</span>
      </div>
    </div>
  )
}
