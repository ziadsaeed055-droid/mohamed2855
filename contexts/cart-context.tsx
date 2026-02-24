"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { CartItem, Product } from "@/lib/types"

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, color: string, size: string, quantity?: number) => void
  removeFromCart: (productId: string, color: string, size: string) => void
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void
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

  const addToCart = (product: Product, color: string, size: string, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.selectedColor === color && item.selectedSize === size,
      )

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
          selectedColor: color,
          selectedSize: size,
        },
      ]
    })
  }

  const removeFromCart = (productId: string, color: string, size: string) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.selectedColor === color && item.selectedSize === size),
      ),
    )
  }

  const updateQuantity = (productId: string, color: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, size)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.selectedColor === color && item.selectedSize === size
          ? { ...item, quantity }
          : item,
      ),
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
