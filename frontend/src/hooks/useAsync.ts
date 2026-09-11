import { useCallback, useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  reload: () => void
  setData: (data: T) => void
}

/** Minimal data-fetching hook; swap for React Query when the real APIs land. */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(loader, deps)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    callback()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Unexpected error')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [callback, reloadToken])

  return { data, isLoading, error, reload: () => setReloadToken((token) => token + 1), setData }
}
