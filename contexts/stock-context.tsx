"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { ColorSizeStock } from "@/lib/types"
import { stockService } from "@/lib/services/stock-service"

interface StockContextType {
  // Check stock availability
  isStockAvailable: (productId: string, shadeId: string, size: string, quantity: number) => Promise<boolean>
  getAvailableQuantity: (productId: string, shadeId: string, size: string) => Promise<number>
  isLowStock: (productId: string, shadeId: string, size: string, threshold?: number) => Promise<boolean>
  
  // Reserve and release stock
  reserveStock: (productId: string, shadeId: string, size: string, quantity: number) => Promise<boolean>
  releaseStock: (productId: string, shadeId: string, size: string, quantity: number) => Promise<void>
  
  // Update stock
  updateStock: (productId: string, stock: ColorSizeStock[]) => Promise<void>
  getProductStock: (productId: string) => Promise<ColorSizeStock[]>
  getLowStockItems: (threshold?: number) => Promise<any[]>
}

const StockContext = createContext<StockContextType | undefined>(undefined)

export function StockProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const isStockAvailable = useCallback(async (
    productId: string,
    shadeId: string,
    size: string,
    quantity: number
  ): Promise<boolean> => {
    try {
      return await stockService.checkStockAvailability(productId, shadeId, size, quantity)
    } catch (error) {
      console.error("[StockProvider] Error checking availability:", error)
      return false
    }
  }, [])

  const getAvailableQuantity = useCallback(async (
    productId: string,
    shadeId: string,
    size: string
  ): Promise<number> => {
    try {
      const stock = await stockService.getProductStock(productId)
      const item = stock.find(s => s.shadeId === shadeId && s.size === size)
      return item?.quantity || 0
    } catch (error) {
      console.error("[StockProvider] Error getting quantity:", error)
      return 0
    }
  }, [])

  const isLowStock = useCallback(async (
    productId: string,
    shadeId: string,
    size: string,
    threshold = 5
  ): Promise<boolean> => {
    try {
      const quantity = await getAvailableQuantity(productId, shadeId, size)
      return quantity <= threshold
    } catch (error) {
      console.error("[StockProvider] Error checking low stock:", error)
      return false
    }
  }, [getAvailableQuantity])

  const reserveStock = useCallback(async (
    productId: string,
    shadeId: string,
    size: string,
    quantity: number
  ): Promise<boolean> => {
    try {
      return await stockService.reserveStock(productId, shadeId, size, quantity)
    } catch (error) {
      console.error("[StockProvider] Error reserving stock:", error)
      return false
    }
  }, [])

  const releaseStock = useCallback(async (
    productId: string,
    shadeId: string,
    size: string,
    quantity: number
  ): Promise<void> => {
    try {
      await stockService.releaseStock(productId, shadeId, size, quantity)
    } catch (error) {
      console.error("[StockProvider] Error releasing stock:", error)
    }
  }, [])

  const updateStock = useCallback(async (productId: string, stock: ColorSizeStock[]): Promise<void> => {
    try {
      await stockService.updateProductStock(productId, stock)
    } catch (error) {
      console.error("[StockProvider] Error updating stock:", error)
    }
  }, [])

  const getProductStock = useCallback(async (productId: string): Promise<ColorSizeStock[]> => {
    try {
      return await stockService.getProductStock(productId)
    } catch (error) {
      console.error("[StockProvider] Error fetching product stock:", error)
      return []
    }
  }, [])

  const getLowStockItems = useCallback(async (threshold?: number): Promise<any[]> => {
    try {
      return await stockService.getLowStockItems(threshold)
    } catch (error) {
      console.error("[StockProvider] Error fetching low stock items:", error)
      return []
    }
  }, [])

  const value: StockContextType = {
    isStockAvailable,
    getAvailableQuantity,
    isLowStock,
    reserveStock,
    releaseStock,
    updateStock,
    getProductStock,
    getLowStockItems,
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
