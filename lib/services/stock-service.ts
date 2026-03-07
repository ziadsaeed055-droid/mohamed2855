import { db } from "@/lib/firebase"
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, Timestamp } from "firebase/firestore"
import type { Product, ColorSizeStock } from "@/lib/types"

// Collection names
const STOCK_COLLECTION = "inventory"
const PRODUCTS_COLLECTION = "products"

export const stockService = {
  // Add or update stock for a product
  async updateProductStock(productId: string, stock: ColorSizeStock[]): Promise<void> {
    try {
      const stockDocRef = doc(db, STOCK_COLLECTION, productId)
      await setDoc(stockDocRef, {
        productId,
        stock,
        updatedAt: Timestamp.now(),
      }, { merge: true })
    } catch (error) {
      console.error("[Stock Service] Error updating stock:", error)
      throw error
    }
  },

  // Get stock for a specific product
  async getProductStock(productId: string): Promise<ColorSizeStock[]> {
    try {
      const stockDocRef = doc(db, STOCK_COLLECTION, productId)
      const stockDoc = await getDoc(stockDocRef)
      return stockDoc.exists() ? (stockDoc.data().stock || []) : []
    } catch (error) {
      console.error("[Stock Service] Error fetching stock:", error)
      return []
    }
  },

  // Check if stock is available
  async checkStockAvailability(
    productId: string,
    shadeId: string,
    size: string,
    quantity: number
  ): Promise<boolean> {
    try {
      const stock = await this.getProductStock(productId)
      const item = stock.find(s => s.shadeId === shadeId && s.size === size)
      return item ? item.quantity >= quantity : false
    } catch (error) {
      console.error("[Stock Service] Error checking availability:", error)
      return false
    }
  },

  // Reserve stock (decrease quantity)
  async reserveStock(
    productId: string,
    shadeId: string,
    size: string,
    quantity: number
  ): Promise<boolean> {
    try {
      const stock = await this.getProductStock(productId)
      const itemIndex = stock.findIndex(s => s.shadeId === shadeId && s.size === size)

      if (itemIndex === -1 || stock[itemIndex].quantity < quantity) {
        return false
      }

      stock[itemIndex].quantity -= quantity
      stock[itemIndex].reservedQuantity = (stock[itemIndex].reservedQuantity || 0) + quantity
      await this.updateProductStock(productId, stock)
      return true
    } catch (error) {
      console.error("[Stock Service] Error reserving stock:", error)
      return false
    }
  },

  // Release reserved stock
  async releaseStock(
    productId: string,
    shadeId: string,
    size: string,
    quantity: number
  ): Promise<void> {
    try {
      const stock = await this.getProductStock(productId)
      const item = stock.find(s => s.shadeId === shadeId && s.size === size)

      if (item) {
        item.quantity += quantity
        item.reservedQuantity = Math.max((item.reservedQuantity || 0) - quantity, 0)
        await this.updateProductStock(productId, stock)
      }
    } catch (error) {
      console.error("[Stock Service] Error releasing stock:", error)
    }
  },

  // Get all low stock items
  async getLowStockItems(threshold: number = 5): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(db, STOCK_COLLECTION))
      const lowStockItems: any[] = []

      snapshot.forEach(doc => {
        const data = doc.data()
        data.stock?.forEach((item: ColorSizeStock) => {
          if (item.quantity <= threshold) {
            lowStockItems.push({ productId: doc.id, ...item })
          }
        })
      })

      return lowStockItems
    } catch (error) {
      console.error("[Stock Service] Error fetching low stock items:", error)
      return []
    }
  },
}
