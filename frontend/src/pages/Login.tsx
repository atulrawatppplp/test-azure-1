import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Form, FormError } from '../components/ui/Form'
import { Input } from '../components/ui/Input'
import { config } from '../lib/config'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { authService } from '../services/authService'

export default function Login() {
  const { user, isLoading: isSessionLoading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }
  const toast = useToast()

  const [email, setEmail] = useState(authService.demoCredentials.email)
  const [password, setPassword] = useState(authService.demoCredentials.password)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isSessionLoading && user) return <Navigate to="/dashboard" replace />

  const validate = () => {
    const next: typeof errors = {}
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = 'Enter a valid email address.'
    if (password.length < 4) next.password = 'Password must be at least 4 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await login(email, password)
      toast.success('Signed in', 'Welcome back to Mini OMS.')
      navigate(location.state?.from ?? '/dashboard', { replace: true })
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Sign in failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="hidden flex-1 flex-col justify-between bg-slate-900 p-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 font-bold">M</span>
          <span className="font-semibold">{config.appName}</span>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-semibold leading-tight">Orders, products and notifications in one console.</h2>
          <p className="text-sm text-slate-300">
            Frontend runs on mock services today and switches to the .NET 8 microservices behind the API Gateway by
            flipping a single environment flag.
          </p>
        </div>
        <p className="text-xs text-slate-400">Secured by Microsoft Entra ID in production.</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Use the demo credentials below to explore the app.</p>

          <Form className="mt-6" onSubmit={handleSubmit}>
            <FormError message={formError} />
            <Input
              label="Email"
              type="email"
              autoComplete="username"
              value={email}
              error={errors.email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              error={errors.password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Sign in
            </Button>
          </Form>

          <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <p className="font-medium text-slate-600">Demo account</p>
            <p>{authService.demoCredentials.email} / {authService.demoCredentials.password}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
