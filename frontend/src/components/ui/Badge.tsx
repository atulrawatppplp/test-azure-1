import type { ReactNode } from 'react'
import { cn } from '../../lib/format'
import type { OrderStatus, PaymentStatus } from '../../types'

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

const orderStatusTone: Record<OrderStatus, BadgeTone> = {
  Pending: 'warning',
  Processing: 'info',
  Completed: 'success',
  Cancelled: 'danger',
}

export const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <Badge tone={orderStatusTone[status]}>{status}</Badge>
)

const paymentTone: Record<PaymentStatus, BadgeTone> = {
  Unpaid: 'warning',
  Paid: 'success',
  Refunded: 'neutral',
}

export const PaymentBadge = ({ status }: { status: PaymentStatus }) => (
  <Badge tone={paymentTone[status]}>{status}</Badge>
)
