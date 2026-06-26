import { useState } from 'react'
import Button from '../../components/ui/Button'

export default function SearchBar({ onSearch, initialKeyword = '', initialLocation = '' }) {
  const [keyword, setKeyword] = useState(initialKeyword)
  const [location, setLocation] = useState(initialLocation)

  function handleSubmit(e) {
    e.preventDefault()
    onSearch?.({ keyword: keyword.trim(), location: location.trim() })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-stretch bg-paper-0 border border-ink-200 rounded-md shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-2.5 flex-[2] px-3.5">
        <span className="text-ink-500 text-base select-none">⌕</span>
        <input
          type="text"
          placeholder="Search tailors, services, shops…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 border-none outline-none bg-transparent font-t text-[16px] text-ink-900 placeholder:text-ink-400 py-3.5"
        />
      </div>

      <div className="self-stretch my-1.5" style={{ borderLeft: 'var(--cut)', opacity: 0.5 }} />

      <div className="flex items-center gap-2.5 flex-1 px-3.5">
        <span className="text-ink-500 text-[13px] select-none">📍</span>
        <input
          type="text"
          placeholder="City"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1 border-none outline-none bg-transparent font-t text-[16px] text-ink-900 placeholder:text-ink-400 py-3.5"
        />
      </div>

      <Button type="submit" size="md" className="rounded-none rounded-r-md m-0 self-stretch">
        Search
      </Button>
    </form>
  )
}
