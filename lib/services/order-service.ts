import { db } from "@/lib/firebase"
import { collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs, Timestamp, orderBy } from "firebase/firestore"
import type { Order, ShippingUpdate } from "@/lib/types"

const ORDERS_COLLECTION = "orders"

export const orderService = {
  // Create a new order
  async createOrder(order: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
      const orderId = doc(collection(db, ORDERS_COLLECTION)).id
      const orderData = {
        ...order,
        id: orderId,
        shippingUpdates: [
          {
            status: "pending",
            timestamp: Timestamp.now(),
            notes: "تم تلقي الطلب",
          },
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }

      await setDoc(doc(db, ORDERS_COLLECTION, orderId), orderData)
      return orderId
    } catch (error) {
      console.error("[Order Service] Error creating order:", error)
      throw error
    }
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderDoc = await getDoc(doc(db, ORDERS_COLLECTION, orderId))
      return orderDoc.exists() ? (orderDoc.data() as Order) : null
    } catch (error) {
      console.error("[Order Service] Error fetching order:", error)
      return null
    }
  },

  // Get all orders for a user
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as Order)
    } catch (error) {
      console.error("[Order Service] Error fetching user orders:", error)
      return []
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: Order["status"], notes?: string): Promise<void> {
    try {
      const update: any = {
        status,
        updatedAt: Timestamp.now(),
      }

      // Add to shipping updates
      const order = await this.getOrderById(orderId)
      if (order) {
        const shippingUpdate: ShippingUpdate = {
          status,
          timestamp: Timestamp.now(),
          notes: notes || `تم تحديث الحالة إلى ${status}`,
        }
        update.shippingUpdates = [...(order.shippingUpdates || []), shippingUpdate]
      }

      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), update)
    } catch (error) {
      console.error("[Order Service] Error updating order status:", error)
      throw error
    }
  },

  // Add shipping update
  async addShippingUpdate(
    orderId: string,
    update: Omit<ShippingUpdate, "timestamp">
  ): Promise<void> {
    try {
      const order = await this.getOrderById(orderId)
      if (!order) throw new Error("Order not found")

      const shippingUpdate: ShippingUpdate = {
        ...update,
        timestamp: Timestamp.now(),
      }

      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
        shippingUpdates: [...(order.shippingUpdates || []), shippingUpdate],
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error("[Order Service] Error adding shipping update:", error)
      throw error
    }
  },

  // Get all orders (admin)
  async getAllOrders(limit: number = 50): Promise<Order[]> {
    try {
      const q = query(collection(db, ORDERS_COLLECTION), orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)
      return snapshot.docs.slice(0, limit).map(doc => doc.data() as Order)
    } catch (error) {
      console.error("[Order Service] Error fetching all orders:", error)
      return []
    }
  },

  // Get orders by status
  async getOrdersByStatus(status: Order["status"]): Promise<Order[]> {
    try {
      const q = query(collection(db, ORDERS_COLLECTION), where("status", "==", status))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as Order)
    } catch (error) {
      console.error("[Order Service] Error fetching orders by status:", error)
      return []
    }
  },
}
