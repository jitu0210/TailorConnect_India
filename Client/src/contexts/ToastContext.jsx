import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }, [])

  function dismiss(id) {
    setToasts(t => t.filter(x => x.id !== id))
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-16 right-4 z-40 flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 'min(320px, calc(100vw - 2rem))' }}>
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            className={[
              'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-md shadow-md max-w-xs',
              'border font-ui text-[13px] leading-snug animate-fade-in',
              type === 'error'
                ? 'bg-ink-900 border-ink-700 text-paper-50'
                : 'bg-paper-0 border-ink-200 text-ink-900',
            ].join(' ')}
          >
            <span className="flex-1">{message}</span>
            <button
              type="button"
              onClick={() => dismiss(id)}
              className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer leading-none mt-px"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
