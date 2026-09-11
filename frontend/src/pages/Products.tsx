import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { DataTable } from '../components/ui/DataTable'
import type { Column } from '../components/ui/DataTable'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Select'
import { ProductForm } from '../components/products/ProductForm'
import { useAsync } from '../hooks/useAsync'
import { useCart } from '../hooks/useCart'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../lib/format'
import { productService } from '../services/productService'
import type { CreateProductRequest, Product } from '../types'

const PAGE_SIZE = 8

export default function Products() {
  const navigate = useNavigate()
  const toast = useToast()
  const { addItem } = useCart()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Product | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const categories = useAsync(() => productService.getCategories(), [])
  const products = useAsync(
    () =>
      productService.getProducts({
        search,
        category: category || undefined,
        isActive: status === '' ? undefined : status === 'active',
        page,
        pageSize: PAGE_SIZE,
      }),
    [search, category, status, page],
  )

  const categoryOptions = useMemo(
    () => (categories.data ?? []).map((value) => ({ label: value, value })),
    [categories.data],
  )

  const handleSave = async (payload: CreateProductRequest) => {
    setIsSaving(true)
    try {
      if (editing) {
        await productService.updateProduct(editing.productId, payload)
        toast.success('Product updated', editing.productName)
      } else {
        await productService.createProduct(payload)
        toast.success('Product created', payload.productName)
      }
      setIsFormOpen(false)
      setEditing(null)
      products.reload()
      categories.reload()
    } catch (cause) {
      toast.error('Save failed', cause instanceof Error ? cause.message : undefined)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsSaving(true)
    try {
      await productService.deleteProduct(deleteTarget.productId)
      toast.success('Product deleted', deleteTarget.productName)
      setDeleteTarget(null)
      products.reload()
    } catch (cause) {
      toast.error('Delete failed', cause instanceof Error ? cause.message : undefined)
    } finally {
      setIsSaving(false)
    }
  }

  const columns: Column<Product>[] = [
    {
      key: 'productName',
      header: 'Product',
      render: (product) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{product.productName}</p>
          <p className="truncate text-xs text-slate-500">{product.productId}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (product) => product.category },
    { key: 'price', header: 'Price', render: (product) => formatCurrency(product.price) },
    {
      key: 'stock',
      header: 'Stock',
      render: (product) => (
        <span className={product.stock === 0 ? 'text-rose-600' : undefined}>{product.stock}</span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (product) => (
        <Badge tone={product.isActive ? 'success' : 'neutral'}>{product.isActive ? 'Active' : 'Inactive'}</Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product) => (
        <div className="flex flex-wrap gap-1.5" onClick={(event) => event.stopPropagation()}>
          <Button
            size="sm"
            variant="outline"
            disabled={product.stock === 0 || !product.isActive}
            onClick={() => {
              addItem(product)
              toast.success('Added to cart', product.productName)
            }}
          >
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditing(product)
              setIsFormOpen(true)
            }}
          >
            Edit
          </Button>
          <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => setDeleteTarget(product)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Products"
        description="Catalogue served by the Product Service."
        actions={
          <Button
            onClick={() => {
              setEditing(null)
              setIsFormOpen(true)
            }}
          >
            New product
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
        <Select
          placeholder="All categories"
          options={categoryOptions}
          value={category}
          onChange={(event) => {
            setCategory(event.target.value)
            setPage(1)
          }}
        />
        <Select
          placeholder="All statuses"
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]}
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
            setCategory('')
            setStatus('')
            setPage(1)
          }}
        >
          Clear filters
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={products.data?.items ?? []}
        rowKey={(product) => product.productId}
        isLoading={products.isLoading}
        error={products.error}
        onRetry={products.reload}
        onRowClick={(product) => navigate(`/products/${product.productId}`)}
        emptyTitle="No products found"
        emptyDescription="Try clearing the filters or add a new product."
        mobileTitleKey="productName"
        pagination={{
          page: products.data?.page ?? 1,
          pageSize: PAGE_SIZE,
          totalCount: products.data?.totalCount ?? 0,
          onPageChange: setPage,
        }}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editing ? 'Edit product' : 'New product'}
        description="Fields map 1:1 to the Products table in Azure SQL."
        size="lg"
      >
        <ProductForm
          product={editing}
          isSaving={isSaving}
          onCancel={() => setIsFormOpen(false)}
          onSubmit={handleSave}
        />
      </Modal>

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete product"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={isSaving} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Delete <span className="font-medium text-slate-900">{deleteTarget?.productName}</span>? This cannot be
          undone.
        </p>
      </Modal>
    </>
  )
}
