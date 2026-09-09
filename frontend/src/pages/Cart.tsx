import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/States'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../lib/format'
import { orderService } from '../services/orderService'

export default function Cart() {
  const { lines, itemCount, subtotal, setQuantity, removeItem, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [customerName, setCustomerName] = useState(user?.name ?? '')
  const [isPlacing, setIsPlacing] = useState(false)

  const placeOrder = async () => {
    if (customerName.trim().length < 3) {
      toast.error('Customer name is required')
      return
    }
    setIsPlacing(true)
    try {
      const order = await orderService.createOrder({
        customerName: customerName.trim(),
        items: lines.map((line) => ({ productId: line.product.productId, quantity: line.quantity })),
      })
      clear()
      setIsCheckoutOpen(false)
      toast.success('Order placed', `${order.orderId} is now pending.`)
      navigate(`/orders/${order.orderId}`)
    } catch (cause) {
      toast.error('Checkout failed', cause instanceof Error ? cause.message : undefined)
    } finally {
      setIsPlacing(false)
    }
  }

  return (
    <>
      <PageHeader title="Cart" description="Review items before creating an order." />

      {lines.length === 0 ? (
        <Card>
          <EmptyState
            title="Your cart is empty"
            description="Browse the catalogue and add products to create an order."
            action={<Button onClick={() => navigate('/products')}>Browse products</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {lines.map((line) => (
              <Card key={line.product.productId} bodyClassName="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{line.product.productName}</p>
                    <p className="text-xs text-slate-500">
                      {line.product.productId} · {formatCurrency(line.product.price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-slate-300">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        className="h-9 w-9 text-slate-600 hover:bg-slate-50"
                        onClick={() => setQuantity(line.product.productId, line.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        className="h-9 w-9 text-slate-600 hover:bg-slate-50"
                        onClick={() => setQuantity(line.product.productId, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="w-24 text-right font-semibold text-slate-900">
                      {formatCurrency(line.quantity * line.product.price)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-rose-600"
                      onClick={() => removeItem(line.product.productId)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card title="Summary" className="h-fit">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Line items</dt>
                <dd className="font-medium text-slate-900">{lines.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Units</dt>
                <dd className="font-medium text-slate-900">{itemCount}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
                <dt className="font-semibold text-slate-700">Order total</dt>
                <dd className="font-semibold text-slate-900">{formatCurrency(subtotal)}</dd>
              </div>
            </dl>
            <div className="mt-4 space-y-2">
              <Button fullWidth onClick={() => setIsCheckoutOpen(true)}>
                Checkout
              </Button>
              <Button fullWidth variant="outline" onClick={clear}>
                Clear cart
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Confirm order"
        description="The Order Service will publish an event to Service Bus once this is live."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button isLoading={isPlacing} onClick={placeOrder}>
              Place order
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Customer name"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
          />
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>{lines.length} line item(s)</span>
              <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
