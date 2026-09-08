import { cn } from '../../lib/format'

export type ToastTone = 'info' | 'success' | 'warning' | 'error'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  tone: ToastTone
}

const tones: Record<ToastTone, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
}

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col gap-2 sm:inset-x-auto sm:right-6 sm:top-6 sm:w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg',
            tones[toast.tone],
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.description && <p className="mt-0.5 text-xs opacity-80">{toast.description}</p>}
          </div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => onDismiss(toast.id)}
            className="rounded p-0.5 text-current opacity-60 transition-opacity hover:opacity-100"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
