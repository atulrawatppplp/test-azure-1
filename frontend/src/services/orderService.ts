import { apiClient } from '../lib/apiClient'
import { config } from '../lib/config'
import type {
  CreateOrderRequest,
  DashboardStats,
  Order,
  OrderQuery,
  OrderStatus,
  PagedResult,
} from '../types'
import { delay, getDb, nextId, paginate, saveDb } from './mock/mockDb'

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  Pending: ['Processing', 'Completed', 'Cancelled'],
  Processing: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
}

export function nextStatuses(status: OrderStatus): OrderStatus[] {
  return allowedTransitions[status]
}

function filter(orders: Order[], query: OrderQuery) {
  const search = query.search?.trim().toLowerCase()
  return orders.filter((order) => {
    if (search && !`${order.orderId} ${order.customerName}`.toLowerCase().includes(search)) return false
    if (query.status && order.status !== query.status) return false
    return true
  })
}

export const orderService = {
  async getOrders(query: OrderQuery = {}): Promise<PagedResult<Order>> {
    if (!config.useMockApi) return apiClient.get<PagedResult<Order>>('/api/orders', { ...query })
    await delay()
    const orders = [...getDb().orders].sort(
      (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
    )
    return paginate(filter(orders, query), query.page ?? 1, query.pageSize ?? 10)
  },

  async getOrderById(orderId: string): Promise<Order> {
    if (!config.useMockApi) return apiClient.get<Order>(`/api/orders/${orderId}`)
    await delay()
    const order = getDb().orders.find((candidate) => candidate.orderId === orderId)
    if (!order) throw new Error(`Order ${orderId} was not found.`)
    return order
  },

  async createOrder(payload: CreateOrderRequest): Promise<Order> {
    if (!config.useMockApi) return apiClient.post<Order>('/api/orders', payload)
    await delay()
    const db = getDb()
    const orderId = nextId('ORD', db.orders.map((candidate) => candidate.orderId))
    const items = payload.items.map((line, index) => {
      const product = db.products.find((candidate) => candidate.productId === line.productId)
      if (!product) throw new Error(`Product ${line.productId} was not found.`)
      if (product.stock < line.quantity) throw new Error(`Only ${product.stock} units of ${product.productName} left.`)
      product.stock -= line.quantity
      product.isActive = product.stock > 0 && product.isActive
      return {
        orderItemId: `${orderId}-${index + 1}`,
        orderId,
        productId: product.productId,
        productName: product.productName,
        quantity: line.quantity,
        price: product.price,
      }
    })
    const order: Order = {
      orderId,
      customerId: 'CUST-SELF',
      customerName: payload.customerName,
      orderDate: new Date().toISOString(),
      totalAmount: Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)),
      status: 'Pending',
      paymentStatus: 'Unpaid',
      createdDate: new Date().toISOString(),
      items,
    }
    db.orders.unshift(order)
    db.notifications.unshift({
      notificationId: nextId('N', db.notifications.map((candidate) => candidate.notificationId)),
      title: `Order ${orderId} received`,
      message: `${order.customerName} placed an order worth $${order.totalAmount.toFixed(2)}.`,
      type: 'info',
      isRead: false,
      createdDate: new Date().toISOString(),
    })
    saveDb()
    return order
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    if (!config.useMockApi) return apiClient.put<Order>(`/api/orders/${orderId}`, { status })
    await delay()
    const db = getDb()
    const order = db.orders.find((candidate) => candidate.orderId === orderId)
    if (!order) throw new Error(`Order ${orderId} was not found.`)
    if (status === order.status) return order
    if (!allowedTransitions[order.status].includes(status)) {
      throw new Error(`An order in status ${order.status} cannot move to ${status}.`)
    }
    if (status === 'Cancelled') return orderService.cancelOrder(orderId)
    order.status = status
    if (status === 'Completed') order.paymentStatus = 'Paid'
    db.notifications.unshift({
      notificationId: nextId('N', db.notifications.map((candidate) => candidate.notificationId)),
      title: `Order ${orderId} is ${status.toLowerCase()}`,
      message: `Status for ${order.customerName}'s order changed to ${status}.`,
      type: status === 'Completed' ? 'success' : 'info',
      isRead: false,
      createdDate: new Date().toISOString(),
    })
    saveDb()
    return order
  },

  async cancelOrder(orderId: string): Promise<Order> {
    if (!config.useMockApi) return apiClient.post<Order>(`/api/orders/${orderId}/cancel`)
    await delay()
    const db = getDb()
    const order = db.orders.find((candidate) => candidate.orderId === orderId)
    if (!order) throw new Error(`Order ${orderId} was not found.`)
    if (order.status === 'Completed') throw new Error('A completed order cannot be cancelled.')
    order.status = 'Cancelled'
    order.paymentStatus = order.paymentStatus === 'Paid' ? 'Refunded' : 'Unpaid'
    for (const item of order.items) {
      const product = db.products.find((candidate) => candidate.productId === item.productId)
      if (product) product.stock += item.quantity
    }
    db.notifications.unshift({
      notificationId: nextId('N', db.notifications.map((candidate) => candidate.notificationId)),
      title: `Order ${orderId} cancelled`,
      message: `${order.customerName}'s order was cancelled and stock was restored.`,
      type: 'error',
      isRead: false,
      createdDate: new Date().toISOString(),
    })
    saveDb()
    return order
  },

  async getDashboardStats(): Promise<DashboardStats> {
    if (!config.useMockApi) return apiClient.get<DashboardStats>('/api/orders/stats')
    await delay()
    const db = getDb()
    const countBy = (status: OrderStatus) => db.orders.filter((order) => order.status === status).length
    return {
      totalProducts: db.products.length,
      totalOrders: db.orders.length,
      pendingOrders: countBy('Pending'),
      processingOrders: countBy('Processing'),
      completedOrders: countBy('Completed'),
      cancelledOrders: countBy('Cancelled'),
      revenue: Number(
        db.orders
          .filter((order) => order.status !== 'Cancelled')
          .reduce((sum, order) => sum + order.totalAmount, 0)
          .toFixed(2),
      ),
    }
  },

  async getRecentOrders(count = 5): Promise<Order[]> {
    const result = await orderService.getOrders({ page: 1, pageSize: count })
    return result.items
  },
}
