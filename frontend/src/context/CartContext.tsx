import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { CartLine, Product } from '../types'

const STORAGE_KEY = 'moms.cart'

interface CartContextValue {
  lines: CartLine[]
  itemCount: number
  subtotal: number
  addItem: (product: Product, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clear: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

function readStoredLines(): CartLine[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as CartLine[]
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readStoredLines)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  }, [lines])

  const addItem = useCallback((product: Product, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((line) => line.product.productId === product.productId)
      if (!existing) return [...current, { product, quantity }]
      return current.map((line) =>
        line.product.productId === product.productId
          ? { ...line, quantity: Math.min(line.quantity + quantity, product.stock) }
          : line,
      )
    })
  }, [])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((current) =>
      current.map((line) =>
        line.product.productId === productId
          ? { ...line, quantity: Math.max(1, Math.min(quantity, line.product.stock)) }
          : line,
      ),
    )
  }, [])

  const removeItem = useCallback((productId: string) => {
    setLines((current) => current.filter((line) => line.product.productId !== productId))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: Number(lines.reduce((sum, line) => sum + line.quantity * line.product.price, 0).toFixed(2)),
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [lines, addItem, setQuantity, removeItem, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
