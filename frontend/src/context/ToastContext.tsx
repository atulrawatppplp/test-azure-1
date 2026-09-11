import { createContext, useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ToastViewport } from '../components/ui/Toast'
import type { ToastMessage, ToastTone } from '../components/ui/Toast'

interface ToastContextValue {
  push: (title: string, options?: { description?: string; tone?: ToastTone }) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback<ToastContextValue['push']>(
    (title, options) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      setToasts((current) => [...current, { id, title, description: options?.description, tone: options?.tone ?? 'info' }])
      setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (title, description) => push(title, { description, tone: 'success' }),
      error: (title, description) => push(title, { description, tone: 'error' }),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}
