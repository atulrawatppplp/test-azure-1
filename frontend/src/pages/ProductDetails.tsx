import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { ErrorState, Loading } from '../components/ui/States'
import { useAsync } from '../hooks/useAsync'
import { useCart } from '../hooks/useCart'
import { useToast } from '../hooks/useToast'
import { formatCurrency, formatDate } from '../lib/format'
import { productService } from '../services/productService'

export default function ProductDetails() {
  const { productId = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)

  const { data: product, isLoading, error, reload } = useAsync(
    () => productService.getProductById(productId),
    [productId],
  )

  if (isLoading) return <Loading label="Loading product…" />
  if (error || !product) return <ErrorState title="Product unavailable" message={error ?? undefined} onRetry={reload} />

  const maxQuantity = Math.max(1, product.stock)

  return (
    <>
      <PageHeader
        title={product.productName}
        description={`${product.productId} · ${product.category}`}
        actions={
          <Button variant="outline" onClick={() => navigate('/products')}>
            Back to products
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Description">
          <p className="text-sm leading-relaxed text-slate-600">{product.description}</p>
          <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Price</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(product.price)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Stock</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">{product.stock}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Status</dt>
              <dd className="mt-1">
                <Badge tone={product.isActive ? 'success' : 'neutral'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Created</dt>
              <dd className="mt-1 text-sm text-slate-700">{formatDate(product.createdDate)}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Add to cart">
          <div className="space-y-4">
            <Input
              label="Quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Math.min(Number(event.target.value), maxQuantity)))}
              hint={product.stock === 0 ? 'Out of stock' : `${product.stock} units available`}
            />
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="text-slate-500">Line total</span>
              <span className="font-semibold text-slate-900">{formatCurrency(product.price * quantity)}</span>
            </div>
            <Button
              fullWidth
              disabled={product.stock === 0 || !product.isActive}
              onClick={() => {
                addItem(product, quantity)
                toast.success('Added to cart', `${quantity} × ${product.productName}`)
              }}
            >
              Add to cart
            </Button>
            <Link to="/cart" className="block text-center text-sm text-sky-600 hover:underline">
              Go to cart
            </Link>
          </div>
        </Card>
      </div>
    </>
  )
}
