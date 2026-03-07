"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import type { ColorSizeStock } from "@/lib/types"

interface StockContextType {
  // Check stock availability
  isStockAvailable: (productId: string, shadeId: string, size: string, quantity: number) => boolean
  getAvailableQuantity: (productId: string, shadeId: string, size: string) => number
  isLowStock: (productId: string, shadeId: string, size: string, threshold?: number) => boolean
  
  // Reserve and release stock
  reserveStock: (productId: string, shadeId: string, size: string, quantity: number) => boolean
  releaseStock: (productId: string, shadeId: string, size: string, quantity: number) => void
  
  // Update stock after order
  confirmStockDeduction: (productId: string, shadeId: string, size: string, quantity: number) => boolean
  
  // Get stock details
  getProductStock: (productId: string) => ColorSizeStock[] | undefined
  getStockByShadeAndSize: (productId: string, shadeId: string, size: string) => ColorSizeStock | undefined
}

const StockContext = createContext<StockContextType | undefined>(undefined)

export function StockProvider({ children }: { children: React.ReactNode }) {
  // Stock data would normally come from Firebase, but here we use local state for context
  
  const isStockAvailable = useCallback((productId: string, shadeId: string, size: string, quantity: number) => {
    // This will be called from product-content when adding to cart
    // Firebase will be the source of truth
    return quantity > 0
  }, [])

  const getAvailableQuantity = useCallback((productId: string, shadeId: string, size: string) => {
    // Returns available quantity from Firebase
    return 0 // Will be overridden by actual Firebase data
  }, [])

  const isLowStock = useCallback((productId: string, shadeId: string, size: string, threshold = 5) => {
    // Check if stock is below threshold
    return false // Will be overridden by actual check
  }, [])

  const reserveStock = useCallback((productId: string, shadeId: string, size: string, quantity: number) => {
    // Reserve stock temporarily during checkout
    return true
  }, [])

  const releaseStock = useCallback((productId: string, shadeId: string, size: string, quantity: number) => {
    // Release reserved stock if checkout is cancelled
  }, [])

  const confirmStockDeduction = useCallback((productId: string, shadeId: string, size: string, quantity: number) => {
    // Confirm final stock deduction after order is placed
    return true
  }, [])

  const getProductStock = useCallback((productId: string) => {
    // Get all stock data for a product
    return undefined
  }, [])

  const getStockByShadeAndSize = useCallback((productId: string, shadeId: string, size: string) => {
    // Get specific stock entry
    return undefined
  }, [])

  const value: StockContextType = {
    isStockAvailable,
    getAvailableQuantity,
    isLowStock,
    reserveStock,
    releaseStock,
    confirmStockDeduction,
    getProductStock,
    getStockByShadeAndSize,
  }

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>
}

export function useStock() {
  const context = useContext(StockContext)
  if (!context) {
    throw new Error("useStock must be used within StockProvider")
  }
  return context
}
