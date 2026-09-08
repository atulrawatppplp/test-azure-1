import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { PaymentBadge, StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { useAsync } from '../hooks/useAsync'
import { formatCurrency, formatDate } from '../lib/format'
import { orderService } from '../services/orderService'
import type { Order, OrderStatus } from '../types'

const PAGE_SIZE = 8
const statuses: OrderStatus[] = ['Pending', 'Processing', 'Completed', 'Cancelled']

export default function Orders() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const orders = useAsync(
    () =>
      orderService.getOrders({
        search,
        status: (status || undefined) as OrderStatus | undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
    [search, status, page],
  )

  const columns: Column<Order>[] = [
    { key: 'orderId', header: 'Order', render: (order) => <span className="font-medium">{order.orderId}</span> },
    { key: 'customerName', header: 'Customer', render: (order) => order.customerName },
    { key: 'orderDate', header: 'Date', render: (order) => formatDate(order.orderDate) },
    { key: 'items', header: 'Items', render: (order) => order.items.length },
    { key: 'totalAmount', header: 'Total', render: (order) => formatCurrency(order.totalAmount) },
    { key: 'status', header: 'Status', render: (order) => <StatusBadge status={order.status} /> },
    { key: 'paymentStatus', header: 'Payment', render: (order) => <PaymentBadge status={order.paymentStatus} /> },
  ]

  return (
    <>
      <PageHeader
        title="Orders"
        description="Every order handled by the Order Service."
        actions={<Button variant="outline" onClick={orders.reload}>Refresh</Button>}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Search by order id or customer…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
        <Select
          placeholder="All statuses"
          options={statuses.map((value) => ({ label: value, value }))}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
        />
        <Button
          variant="outline"
          onClick={() => {
            setSearch('')
            setStatus('')
            setPage(1)
          }}
        >
          Clear filters
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={orders.data?.items ?? []}
        rowKey={(order) => order.orderId}
        isLoading={orders.isLoading}
        error={orders.error}
        onRetry={orders.reload}
        onRowClick={(order) => navigate(`/orders/${order.orderId}`)}
        emptyTitle="No orders found"
        emptyDescription="Adjust the filters or place an order from the cart."
        mobileTitleKey="orderId"
        pagination={{
          page: orders.data?.page ?? 1,
          pageSize: PAGE_SIZE,
          totalCount: orders.data?.totalCount ?? 0,
          onPageChange: setPage,
        }}
      />
    </>
  )
}
