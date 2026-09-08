import type { FormHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/format'

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode
}

export function Form({ children, className, ...props }: FormProps) {
  return (
    <form className={cn('space-y-4', className)} noValidate {...props}>
      {children}
    </form>
  )
}

export function FormRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid gap-4 sm:grid-cols-2', className)}>{children}</div>
}

export function FormActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-wrap justify-end gap-2 pt-2', className)}>{children}</div>
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null
  return (
    <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">{message}</p>
  )
}

export function Checkbox({
  label,
  checked,
  onChange,
  name,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  name?: string
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
      />
      {label}
    </label>
  )
}
