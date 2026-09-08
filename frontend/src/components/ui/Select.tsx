import type { SelectHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from '../../lib/format'

export interface SelectOption {
  label: string
  value: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export function Select({ label, error, options, placeholder, className, id, ...props }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900',
          'focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30',
          error && 'border-rose-400',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  )
}
