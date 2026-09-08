import { config } from '../../lib/config'
import type { Notification, Order, Product } from '../../types'

const STORAGE_KEY = 'moms.mockdb.v1'

interface MockDb {
  products: Product[]
  orders: Order[]
  notifications: Notification[]
}

export const delay = (ms = config.mockLatencyMs) => new Promise((resolve) => setTimeout(resolve, ms))

const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString()

const seedProducts: Product[] = [
  ['Wireless Keyboard K380', 'Compact multi-device Bluetooth keyboard with quiet keys.', 49.99, 120, 'Peripherals'],
  ['27" 4K Monitor', 'IPS panel, USB-C 90W power delivery, height adjustable stand.', 379.0, 34, 'Displays'],
  ['USB-C Docking Station', '11-in-1 dock with dual HDMI, ethernet and SD card reader.', 149.5, 58, 'Accessories'],
  ['Noise Cancelling Headset', 'Certified for Teams, 30 hour battery, dual mic array.', 219.0, 0, 'Audio'],
  ['Ergonomic Mouse MX', 'Vertical grip mouse with 4000 DPI sensor.', 89.99, 76, 'Peripherals'],
  ['Laptop Stand Alu', 'Aluminium riser with adjustable tilt for 13-16" laptops.', 39.0, 210, 'Accessories'],
  ['1080p Conference Camera', 'Auto-framing webcam with privacy shutter.', 129.0, 12, 'Video'],
  ['Portable SSD 1TB', 'NVMe drive, 1050 MB/s read, hardware encryption.', 109.99, 95, 'Storage'],
  ['Standing Desk Converter', 'Gas-spring sit-stand riser, 35" wide work surface.', 259.0, 8, 'Furniture'],
  ['Cable Management Kit', 'Under-desk tray, sleeves and reusable ties.', 24.99, 340, 'Accessories'],
  ['Smart Power Strip', '6 outlets with individual scheduling and energy metering.', 59.0, 44, 'Accessories'],
  ['Label Printer Pro', 'Thermal label printer, 300 dpi, USB and Wi-Fi.', 179.0, 21, 'Office'],
].map(([productName, description, price, stock, category], index) => ({
  productId: `P-${String(1001 + index)}`,
  productName: productName as string,
  description: description as string,
  price: price as number,
  stock: stock as number,
  category: category as string,
  isActive: (stock as number) > 0,
  createdDate: daysAgo(90 - index * 3),
}))

const orderSeed: [string, string, number, Order['status'], Order['paymentStatus'], [string, number][]][] = [
  ['Contoso Ltd', daysAgo(1), 0, 'Pending', 'Unpaid', [['P-1001', 4], ['P-1006', 2]]],
  ['Fabrikam Inc', daysAgo(2), 0, 'Processing', 'Paid', [['P-1002', 2]]],
  ['Northwind Traders', daysAgo(4), 0, 'Completed', 'Paid', [['P-1008', 6], ['P-1010', 10]]],
  ['Adventure Works', daysAgo(6), 0, 'Cancelled', 'Refunded', [['P-1004', 3]]],
  ['Tailspin Toys', daysAgo(8), 0, 'Completed', 'Paid', [['P-1003', 1], ['P-1005', 2]]],
  ['Wide World Importers', daysAgo(11), 0, 'Pending', 'Unpaid', [['P-1012', 2]]],
  ['Litware Inc', daysAgo(14), 0, 'Processing', 'Paid', [['P-1007', 5]]],
  ['Proseware Inc', daysAgo(18), 0, 'Completed', 'Paid', [['P-1009', 1], ['P-1011', 3]]],
  ['Fourth Coffee', daysAgo(23), 0, 'Cancelled', 'Refunded', [['P-1010', 20]]],
  ['Alpine Ski House', daysAgo(29), 0, 'Completed', 'Paid', [['P-1005', 4], ['P-1001', 4]]],
]

const seedOrders: Order[] = orderSeed.map(([customerName, orderDate, , status, paymentStatus, lines], index) => {
  const orderId = `ORD-${2001 + index}`
  const items = lines.map(([productId, quantity], lineIndex) => {
    const product = seedProducts.find((candidate) => candidate.productId === productId)!
    return {
      orderItemId: `${orderId}-${lineIndex + 1}`,
      orderId,
      productId,
      productName: product.productName,
      quantity,
      price: product.price,
    }
  })
  return {
    orderId,
    customerId: `CUST-${100 + index}`,
    customerName,
    orderDate,
    totalAmount: Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)),
    status,
    paymentStatus,
    createdDate: orderDate,
    items,
  }
})

const seedNotifications: Notification[] = [
  {
    notificationId: 'N-1',
    title: 'Order ORD-2001 received',
    message: 'Contoso Ltd placed an order for 6 items totalling $278.',
    type: 'info',
    isRead: false,
    createdDate: daysAgo(1),
  },
  {
    notificationId: 'N-2',
    title: 'Payment captured',
    message: 'Payment for ORD-2002 was captured successfully.',
    type: 'success',
    isRead: false,
    createdDate: daysAgo(2),
  },
  {
    notificationId: 'N-3',
    title: 'Low stock warning',
    message: 'Standing Desk Converter is down to 8 units.',
    type: 'warning',
    isRead: false,
    createdDate: daysAgo(3),
  },
  {
    notificationId: 'N-4',
    title: 'Order cancelled',
    message: 'ORD-2004 was cancelled by Adventure Works and refunded.',
    type: 'error',
    isRead: true,
    createdDate: daysAgo(6),
  },
  {
    notificationId: 'N-5',
    title: 'Shipment delivered',
    message: 'ORD-2003 was delivered to Northwind Traders.',
    type: 'success',
    isRead: true,
    createdDate: daysAgo(4),
  },
]

const seed = (): MockDb => ({
  products: structuredClone(seedProducts),
  orders: structuredClone(seedOrders),
  notifications: structuredClone(seedNotifications),
})

let cache: MockDb | null = null

/** localStorage-backed store so mock mutations survive a page refresh. */
export function getDb(): MockDb {
  if (cache) return cache
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      cache = JSON.parse(raw) as MockDb
      return cache
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
  cache = seed()
  saveDb()
  return cache
}

export function saveDb() {
  if (cache) localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
}

export function resetDb() {
  cache = seed()
  saveDb()
}

export function nextId(prefix: string, existing: string[]) {
  const max = existing.reduce((highest, id) => {
    const numeric = Number(id.split('-')[1])
    return Number.isFinite(numeric) && numeric > highest ? numeric : highest
  }, 0)
  return `${prefix}-${max + 1}`
}

export function paginate<T>(items: T[], page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize
  return { items: items.slice(start, start + pageSize), page, pageSize, totalCount: items.length }
}
