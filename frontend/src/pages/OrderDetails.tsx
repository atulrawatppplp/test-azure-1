import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { PaymentBadge, StatusBadge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Select'
import { ErrorState, Loading } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { useToast } from '../hooks/useToast'
import { formatCurrency, formatDateTime } from '../lib/format'
import { orderService } from '../services/orderService'
import type { OrderItem, OrderStatus } from '../types'

const statuses: OrderStatus[] = ['Pending', 'Processing', 'Completed', 'Cancelled']

export default function OrderDetails() {
  const { orderId = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  const { data: order, isLoading, error, reload, setData } = useAsync(
    () => orderService.getOrderById(orderId),
    [orderId],
  )

  if (isLoading) return <Loading label="Loading order…" />
  if (error || !order) return <ErrorState title="Order unavailable" message={error ?? undefined} onRetry={reload} />

  const changeStatus = async (status: OrderStatus) => {
    setIsBusy(true)
    try {
      setData(await orderService.updateOrderStatus(order.orderId, status))
      toast.success('Status updated', `${order.orderId} is now ${status}.`)
    } catch (cause) {
      toast.error('Update failed', cause instanceof Error ? cause.message : undefined)
    } finally {
      setIsBusy(false)
    }
  }

  const cancelOrder = async () => {
    setIsBusy(true)
    try {
      setData(await orderService.cancelOrder(order.orderId))
      setIsCancelOpen(false)
      toast.success('Order cancelled', `${order.orderId} was cancelled and stock restored.`)
    } catch (cause) {
      toast.error('Cancel failed', cause instanceof Error ? cause.message : undefined)
    } finally {
      setIsBusy(false)
    }
  }

  const columns: Column<OrderItem>[] = [
    { key: 'productName', header: 'Product', render: (item) => <span className="font-medium">{item.productName}</span> },
    { key: 'productId', header: 'Product Id', render: (item) => item.productId },
    { key: 'quantity', header: 'Qty', render: (item) => item.quantity },
    { key: 'price', header: 'Unit price', render: (item) => formatCurrency(item.price) },
    { key: 'lineTotal', header: 'Line total', render: (item) => formatCurrency(item.price * item.quantity) },
  ]

  return (
    <>
      <PageHeader
        title={`Order ${order.orderId}`}
        description={`Placed ${formatDateTime(order.orderDate)} by ${order.customerName}`}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/orders')}>
              Back to orders
            </Button>
            <Button
              variant="danger"
              disabled={order.status === 'Cancelled' || order.status === 'Completed'}
              onClick={() => setIsCancelOpen(true)}
            >
              Cancel order
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Line items" bodyClassName="p-0 sm:p-0">
          <DataTable
            columns={columns}
            rows={order.items}
            rowKey={(item) => item.orderItemId}
            emptyTitle="No line items"
            mobileTitleKey="productName"
          />
        </Card>

        <div className="space-y-4">
          <Card title="Summary">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <StatusBadge status={order.status} />
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Payment</dt>
                <dd>
                  <PaymentBadge status={order.paymentStatus} />
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Customer</dt>
                <dd className="font-medium text-slate-900">{order.customerName}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Customer Id</dt>
                <dd className="text-slate-700">{order.customerId}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base">
                <dt className="font-semibold text-slate-700">Total</dt>
                <dd className="font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Update status">
            <Select
              options={statuses.map((value) => ({ label: value, value }))}
              value={order.status}
              disabled={isBusy || order.status === 'Cancelled'}
              onChange={(event) => changeStatus(event.target.value as OrderStatus)}
            />
            <p className="mt-2 text-xs text-slate-500">
              Status changes raise a notification, mirroring the Service Bus message the Notification Service will
              consume.
            </p>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title="Cancel order"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCancelOpen(false)}>
              Keep order
            </Button>
            <Button variant="danger" isLoading={isBusy} onClick={cancelOrder}>
              Cancel order
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Cancelling {order.orderId} restores stock for {order.items.length} line item(s) and refunds any captured
          payment.
        </p>
      </Modal>
    </>
  )
}
