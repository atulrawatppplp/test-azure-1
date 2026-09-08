const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const formatCurrency = (value: number) => currency.format(value)

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

export const relativeTime = (value: string) => {
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.round(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ')
