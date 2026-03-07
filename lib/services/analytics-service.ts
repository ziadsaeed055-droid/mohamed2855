import { db } from "@/lib/firebase"
import { collection, doc, setDoc, getDoc, increment, Timestamp, query, where, getDocs } from "firebase/firestore"

const ANALYTICS_COLLECTION = "analytics"

export const analyticsService = {
  // Track page view
  async trackPageView(pagePath: string, userId?: string): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0]
      const key = `pageview_${today}`

      const docRef = doc(db, ANALYTICS_COLLECTION, key)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        await setDoc(docRef, {
          [pagePath]: increment(1),
          pages: increment(1),
          updatedAt: Timestamp.now(),
        }, { merge: true })
      } else {
        await setDoc(docRef, {
          type: "pageviews",
          date: today,
          pages: 1,
          [pagePath]: 1,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
      }
    } catch (error) {
      console.error("[Analytics Service] Error tracking page view:", error)
    }
  },

  // Track product view
  async trackProductView(productId: string, userId?: string): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0]
      const key = `product_view_${today}`

      await setDoc(doc(db, ANALYTICS_COLLECTION, key), {
        type: "product_views",
        date: today,
        [productId]: increment(1),
        updatedAt: Timestamp.now(),
      }, { merge: true })
    } catch (error) {
      console.error("[Analytics Service] Error tracking product view:", error)
    }
  },

  // Track purchase
  async trackPurchase(orderId: string, amount: number, productIds: string[]): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0]
      const key = `purchase_${today}`

      await setDoc(doc(db, ANALYTICS_COLLECTION, key), {
        type: "purchases",
        date: today,
        totalAmount: increment(amount),
        totalOrders: increment(1),
        orderId,
        productIds,
        updatedAt: Timestamp.now(),
      }, { merge: true })
    } catch (error) {
      console.error("[Analytics Service] Error tracking purchase:", error)
    }
  },

  // Get analytics summary
  async getAnalyticsSummary(startDate: string, endDate: string): Promise<any> {
    try {
      const q = query(
        collection(db, ANALYTICS_COLLECTION),
        where("date", ">=", startDate),
        where("date", "<=", endDate)
      )

      const snapshot = await getDocs(q)
      const summary = {
        pageviews: 0,
        productViews: 0,
        purchases: 0,
        totalRevenue: 0,
        topPages: {} as Record<string, number>,
        topProducts: {} as Record<string, number>,
      }

      snapshot.forEach(doc => {
        const data = doc.data()
        if (data.type === "pageviews") {
          summary.pageviews += data.pages || 0
          Object.keys(data).forEach(key => {
            if (key !== "type" && key !== "date" && key !== "updatedAt" && key !== "createdAt") {
              summary.topPages[key] = (summary.topPages[key] || 0) + (data[key] || 0)
            }
          })
        } else if (data.type === "product_views") {
          summary.productViews += Object.values(data).reduce((sum, val) => sum + (typeof val === "number" ? val : 0), 0) as number
        } else if (data.type === "purchases") {
          summary.purchases += data.totalOrders || 0
          summary.totalRevenue += data.totalAmount || 0
        }
      })

      return summary
    } catch (error) {
      console.error("[Analytics Service] Error getting analytics summary:", error)
      return null
    }
  },

  // Track user action
  async trackUserAction(userId: string, action: string, metadata?: any): Promise<void> {
    try {
      const today = new Date().toISOString().split("T")[0]
      const actionId = `${userId}_${action}_${Date.now()}`

      await setDoc(doc(db, ANALYTICS_COLLECTION, actionId), {
        type: "user_action",
        userId,
        action,
        date: today,
        metadata,
        timestamp: Timestamp.now(),
      })
    } catch (error) {
      console.error("[Analytics Service] Error tracking user action:", error)
    }
  },

  // Get top products
  async getTopProducts(days: number = 30): Promise<Array<{ productId: string; views: number }>> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const endDate = new Date()

      const start = startDate.toISOString().split("T")[0]
      const end = endDate.toISOString().split("T")[0]

      const q = query(
        collection(db, ANALYTICS_COLLECTION),
        where("type", "==", "product_views"),
        where("date", ">=", start),
        where("date", "<=", end)
      )

      const snapshot = await getDocs(q)
      const productViews: Record<string, number> = {}

      snapshot.forEach(doc => {
        const data = doc.data()
        Object.keys(data).forEach(key => {
          if (key !== "type" && key !== "date" && key !== "updatedAt") {
            productViews[key] = (productViews[key] || 0) + (data[key] || 0)
          }
        })
      })

      return Object.entries(productViews)
        .map(([productId, views]) => ({ productId, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10)
    } catch (error) {
      console.error("[Analytics Service] Error getting top products:", error)
      return []
    }
  },
}
