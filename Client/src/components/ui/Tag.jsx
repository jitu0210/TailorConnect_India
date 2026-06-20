export default function Tag({ label, subLabel, selected = false, negative = false, className = '' }) {
  const base = 'inline-flex items-baseline gap-[7px] px-[13px] py-[7px] border rounded-sm font-ui font-semibold text-[12px] tracking-wide-xs uppercase transition-colors duration-base'

  let style = 'border-ink-200 text-ink-900 bg-paper-0'
  if (selected) style = 'bg-ink-900 text-paper-50 border-ink-900'
  else if (negative) style = 'border-dashed border-ink-500 text-ink-700'

  return (
    <span className={[base, style, className].join(' ')}>
      {label}
      {subLabel && (
        <span className="font-t text-[13px] opacity-85 normal-case tracking-normal font-normal">
          {subLabel}
        </span>
      )}
    </span>
  )
}
