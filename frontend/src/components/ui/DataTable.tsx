import type { ReactNode } from 'react'
import { cn } from '../../lib/format'
import { Pagination } from './Pagination'
import { EmptyState, ErrorState, Loading } from './States'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
  headerClassName?: string
  /** Hidden below the sm breakpoint; the mobile card view still shows it. */
  hideOnMobile?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  pagination?: { page: number; pageSize: number; totalCount: number; onPageChange: (page: number) => void }
  /** Column keys rendered as the title / subtitle of the mobile card. */
  mobileTitleKey?: string
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  error,
  onRetry,
  onRowClick,
  emptyTitle = 'Nothing to show',
  emptyDescription,
  emptyAction,
  pagination,
  mobileTitleKey,
}: DataTableProps<T>) {
  const body = () => {
    if (isLoading) return <Loading />
    if (error) return <ErrorState message={error} onRetry={onRetry} />
    if (rows.length === 0) {
      return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
    }
    return null
  }

  const state = body()

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {state ?? (
        <>
          <div className="hidden overflow-x-auto sm:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={cn(
                        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
                        column.headerClassName,
                      )}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-slate-50')}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className={cn('px-4 py-3 align-middle text-slate-700', column.className)}>
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-slate-100 sm:hidden">
            {rows.map((row) => {
              const titleColumn = columns.find((column) => column.key === mobileTitleKey) ?? columns[0]
              const restColumns = columns.filter((column) => column.key !== titleColumn.key)
              return (
                <li
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn('space-y-2 px-4 py-3', onRowClick && 'cursor-pointer active:bg-slate-50')}
                >
                  <div className="text-sm font-semibold text-slate-900">{titleColumn.render(row)}</div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {restColumns.map((column) => (
                      <div key={column.key} className="min-w-0">
                        <dt className="text-[11px] uppercase tracking-wide text-slate-400">{column.header}</dt>
                        <dd className="truncate text-sm text-slate-700">{column.render(row)}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              )
            })}
          </ul>
        </>
      )}
      {pagination && !state && <Pagination {...pagination} />}
    </div>
  )
}
