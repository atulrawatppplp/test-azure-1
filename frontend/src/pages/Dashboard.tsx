import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, StatCard } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { ErrorState, Skeleton } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { formatCurrency, formatDate } from '../lib/format'
import { orderService } from '../services/orderService'
import type { Order } from '../types'

export default function Dashboard() {
  const navigate = useNavigate()
  const stats = useAsync(() => orderService.getDashboardStats(), [])
  const recent = useAsync(() => orderService.getRecentOrders(5), [])

  const columns: Column<Order>[] = [
    { key: 'orderId', header: 'Order', render: (order) => <span className="font-medium">{order.orderId}</span> },
    { key: 'customerName', header: 'Customer', render: (order) => order.customerName },
    { key: 'orderDate', header: 'Date', render: (order) => formatDate(order.orderDate) },
    { key: 'totalAmount', header: 'Total', render: (order) => formatCurrency(order.totalAmount) },
    { key: 'status', header: 'Status', render: (order) => <StatusBadge status={order.status} /> },
  ]

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Live snapshot of catalogue and order activity."
        actions={
          <Button variant="outline" onClick={() => { stats.reload(); recent.reload() }}>
            Refresh
          </Button>
        }
      />

      {stats.error ? (
        <ErrorState message={stats.error} onRetry={stats.reload} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.isLoading || !stats.data
            ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-24" />)
            : [
                { label: 'Total Products', value: stats.data.totalProducts, tone: 'slate' as const },
                { label: 'Total Orders', value: stats.data.totalOrders, tone: 'sky' as const },
                { label: 'Pending Orders', value: stats.data.pendingOrders, tone: 'amber' as const },
                { label: 'Processing Orders', value: stats.data.processingOrders, tone: 'violet' as const },
                { label: 'Completed Orders', value: stats.data.completedOrders, tone: 'emerald' as const },
                { label: 'Cancelled Orders', value: stats.data.cancelledOrders, tone: 'rose' as const },
              ].map((stat) => <StatCard key={stat.label} {...stat} />)}
        </div>
      )}

      {stats.data && (
        <Card className="mt-4" title="Revenue (excluding cancelled)">
          <p className="text-3xl font-semibold text-slate-900">{formatCurrency(stats.data.revenue)}</p>
          <p className="mt-1 text-sm text-slate-500">
            Across {stats.data.totalOrders - stats.data.cancelledOrders} billable orders.
          </p>
        </Card>
      )}

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Recent Orders</h2>
          <Button size="sm" variant="ghost" onClick={() => navigate('/orders')}>
            View all
          </Button>
        </div>
        <DataTable
          columns={columns}
          rows={recent.data ?? []}
          rowKey={(order) => order.orderId}
          isLoading={recent.isLoading}
          error={recent.error}
          onRetry={recent.reload}
          onRowClick={(order) => navigate(`/orders/${order.orderId}`)}
          emptyTitle="No orders yet"
          emptyDescription="Orders placed from the cart will appear here."
          mobileTitleKey="orderId"
        />
      </div>
    </>
  )
}
