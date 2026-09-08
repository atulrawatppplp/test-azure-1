import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../ui/Button'
import { Checkbox, Form, FormActions, FormRow } from '../ui/Form'
import { Input, Textarea } from '../ui/Input'
import { Select } from '../ui/Select'
import type { CreateProductRequest, Product } from '../../types'

const categories = ['Peripherals', 'Displays', 'Accessories', 'Audio', 'Video', 'Storage', 'Furniture', 'Office']

interface ProductFormProps {
  product: Product | null
  isSaving: boolean
  onSubmit: (payload: CreateProductRequest) => void
  onCancel: () => void
}

export function ProductForm({ product, isSaving, onSubmit, onCancel }: ProductFormProps) {
  const [values, setValues] = useState<CreateProductRequest>({
    productName: product?.productName ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    stock: product?.stock ?? 0,
    category: product?.category ?? categories[0],
    isActive: product?.isActive ?? true,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CreateProductRequest, string>>>({})

  const update = <K extends keyof CreateProductRequest>(key: K, value: CreateProductRequest[K]) =>
    setValues((current) => ({ ...current, [key]: value }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const next: typeof errors = {}
    if (values.productName.trim().length < 3) next.productName = 'Name must be at least 3 characters.'
    if (values.description.trim().length < 10) next.description = 'Description must be at least 10 characters.'
    if (!(values.price > 0)) next.price = 'Price must be greater than zero.'
    if (values.stock < 0) next.stock = 'Stock cannot be negative.'
    setErrors(next)
    if (Object.keys(next).length > 0) return
    onSubmit({ ...values, productName: values.productName.trim(), description: values.description.trim() })
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        label="Product name"
        value={values.productName}
        error={errors.productName}
        onChange={(event) => update('productName', event.target.value)}
      />
      <Textarea
        label="Description"
        value={values.description}
        error={errors.description}
        onChange={(event) => update('description', event.target.value)}
      />
      <FormRow>
        <Input
          label="Price"
          type="number"
          min="0"
          step="0.01"
          value={values.price}
          error={errors.price}
          onChange={(event) => update('price', Number(event.target.value))}
        />
        <Input
          label="Stock"
          type="number"
          min="0"
          value={values.stock}
          error={errors.stock}
          onChange={(event) => update('stock', Number(event.target.value))}
        />
      </FormRow>
      <FormRow>
        <Select
          label="Category"
          options={categories.map((value) => ({ label: value, value }))}
          value={values.category}
          onChange={(event) => update('category', event.target.value)}
        />
        <div className="flex items-end pb-2">
          <Checkbox label="Active" checked={values.isActive} onChange={(checked) => update('isActive', checked)} />
        </div>
      </FormRow>
      <FormActions>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving}>
          {product ? 'Save changes' : 'Create product'}
        </Button>
      </FormActions>
    </Form>
  )
}
