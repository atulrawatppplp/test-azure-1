import { config } from './config'

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

function buildUrl(path: string, query?: Record<string, unknown>): string {
  const url = new URL(path.replace(/^\//, ''), config.apiBaseUrl.replace(/\/?$/, '/'))
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

async function request<T>(
  method: Method,
  path: string,
  options: { body?: unknown; query?: Record<string, unknown> } = {},
): Promise<T> {
  const token = localStorage.getItem(config.tokenStorageKey)
  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const problem = (await response.json()) as { title?: string; detail?: string }
      message = problem.detail ?? problem.title ?? message
    } catch {
      // response had no JSON body
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const apiClient = {
  get: <T>(path: string, query?: Record<string, unknown>) => request<T>('GET', path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
