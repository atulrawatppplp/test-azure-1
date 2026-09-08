export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled'
export type PaymentStatus = 'Unpaid' | 'Paid' | 'Refunded'

export interface Product {
  productId: string
  productName: string
  description: string
  price: number
  stock: number
  category: string
  isActive: boolean
  createdDate: string
}

export interface OrderItem {
  orderItemId: string
  orderId: string
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface Order {
  orderId: string
  customerId: string
  customerName: string
  orderDate: string
  totalAmount: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  createdDate: string
  items: OrderItem[]
}

export interface Notification {
  notificationId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdDate: string
}

export interface User {
  userId: string
  name: string
  email: string
  role: 'Admin' | 'Customer'
  phone?: string
  company?: string
}

export interface AuthResult {
  token: string
  user: User
}

export interface CartLine {
  product: Product
  quantity: number
}

/** Mirrors the paged envelope the .NET services will return. */
export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
}

export interface ProductQuery {
  search?: string
  category?: string
  isActive?: boolean
  page?: number
  pageSize?: number
}

export interface OrderQuery {
  search?: string
  status?: OrderStatus
  page?: number
  pageSize?: number
}

export interface CreateProductRequest {
  productName: string
  description: string
  price: number
  stock: number
  category: string
  isActive: boolean
}

export interface CreateOrderRequest {
  customerName: string
  items: { productId: string; quantity: number }[]
}

export interface DashboardStats {
  totalProducts: number
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  completedOrders: number
  cancelledOrders: number
  revenue: number
}
