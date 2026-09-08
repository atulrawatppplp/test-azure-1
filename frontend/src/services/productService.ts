import { apiClient } from '../lib/apiClient'
import { config } from '../lib/config'
import type { CreateProductRequest, PagedResult, Product, ProductQuery } from '../types'
import { delay, getDb, nextId, paginate, saveDb } from './mock/mockDb'

function filter(products: Product[], query: ProductQuery) {
  const search = query.search?.trim().toLowerCase()
  return products.filter((product) => {
    if (search && !`${product.productName} ${product.category} ${product.productId}`.toLowerCase().includes(search)) {
      return false
    }
    if (query.category && product.category !== query.category) return false
    if (query.isActive !== undefined && product.isActive !== query.isActive) return false
    return true
  })
}

export const productService = {
  async getProducts(query: ProductQuery = {}): Promise<PagedResult<Product>> {
    if (!config.useMockApi) return apiClient.get<PagedResult<Product>>('/api/products', { ...query })
    await delay()
    const db = getDb()
    return paginate(filter(db.products, query), query.page ?? 1, query.pageSize ?? 10)
  },

  async getProductById(productId: string): Promise<Product> {
    if (!config.useMockApi) return apiClient.get<Product>(`/api/products/${productId}`)
    await delay()
    const product = getDb().products.find((candidate) => candidate.productId === productId)
    if (!product) throw new Error(`Product ${productId} was not found.`)
    return product
  },

  async getCategories(): Promise<string[]> {
    if (!config.useMockApi) return apiClient.get<string[]>('/api/products/categories')
    await delay(120)
    return [...new Set(getDb().products.map((product) => product.category))].sort()
  },

  async createProduct(payload: CreateProductRequest): Promise<Product> {
    if (!config.useMockApi) return apiClient.post<Product>('/api/products', payload)
    await delay()
    const db = getDb()
    const product: Product = {
      ...payload,
      productId: nextId('P', db.products.map((candidate) => candidate.productId)),
      createdDate: new Date().toISOString(),
    }
    db.products.unshift(product)
    saveDb()
    return product
  },

  async updateProduct(productId: string, payload: CreateProductRequest): Promise<Product> {
    if (!config.useMockApi) return apiClient.put<Product>(`/api/products/${productId}`, payload)
    await delay()
    const db = getDb()
    const index = db.products.findIndex((candidate) => candidate.productId === productId)
    if (index < 0) throw new Error(`Product ${productId} was not found.`)
    db.products[index] = { ...db.products[index], ...payload }
    saveDb()
    return db.products[index]
  },

  async deleteProduct(productId: string): Promise<void> {
    if (!config.useMockApi) return apiClient.delete<void>(`/api/products/${productId}`)
    await delay()
    const db = getDb()
    db.products = db.products.filter((candidate) => candidate.productId !== productId)
    saveDb()
  },
}
