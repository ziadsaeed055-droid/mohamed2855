"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { CartItem, Product, ColorSelection } from "@/lib/types"

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, color: string | ColorSelection, size: string, quantity?: number) => void
  removeFromCart: (productId: string, color: string | ColorSelection, size: string) => void
  updateQuantity: (productId: string, color: string | ColorSelection, size: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem("sevenblue_cart")
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("sevenblue_cart", JSON.stringify(items))
  }, [items])

  const addToCart = (product: Product, color: string | ColorSelection, size: string, quantity = 1) => {
    const colorToStore = typeof color === 'string' ? color : color.shadeId
    
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => {
        const itemColor = typeof item.selectedColor === 'string' ? item.selectedColor : item.selectedColor?.shadeId
        return item.productId === product.id && itemColor === colorToStore && item.selectedSize === size
      })

      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex].quantity += quantity
        return updated
      }

      return [
        ...prev,
        {
          productId: product.id,
          product,
          quantity,
          selectedColor: colorToStore,
          selectedSize: size,
        },
      ]
    })
  }

  const removeFromCart = (productId: string, color: string | ColorSelection, size: string) => {
    const colorToCompare = typeof color === 'string' ? color : color.shadeId
    setItems((prev) =>
      prev.filter((item) => {
        const itemColor = typeof item.selectedColor === 'string' ? item.selectedColor : item.selectedColor?.shadeId
        return !(item.productId === productId && itemColor === colorToCompare && item.selectedSize === size)
      }),
    )
  }

  const updateQuantity = (productId: string, color: string | ColorSelection, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, size)
      return
    }
    const colorToCompare = typeof color === 'string' ? color : color.shadeId
    setItems((prev) =>
      prev.map((item) => {
        const itemColor = typeof item.selectedColor === 'string' ? item.selectedColor : item.selectedColor?.shadeId
        return item.productId === productId && itemColor === colorToCompare && item.selectedSize === size
          ? { ...item, quantity }
          : item
      }),
    )
  }

  const clearCart = () => setItems([])

  const getTotal = () =>
    items.reduce((total, item) => {
      const price = item.product.discount > 0 ? item.product.discountedPrice : item.product.salePrice
      return total + price * item.quantity
    }, 0)

  const getItemCount = () => items.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, getItemCount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}
