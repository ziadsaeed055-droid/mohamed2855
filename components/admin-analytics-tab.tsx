"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import type { Product, Order } from "@/lib/types"
import { BarChart3, TrendingUp, Users, Package, DollarSign, Calendar, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AdminAnalyticsTabProps {
  products: Product[]
  orders: Order[]
}

export function AdminAnalyticsTab({ products, orders }: AdminAnalyticsTabProps) {
  const { t, language } = useLanguage()
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("month")

  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
    const totalOrders = orders.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const totalProducts = products.length
    const activeProducts = products.filter(p => p.isActive).length
    const lowStockProducts = products.filter(p => p.quantity <= p.alertQuantity).length
    const categoryBreakdown = products.reduce((acc: Record<string, number>, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1
      return acc
    }, {})

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue: avgOrderValue.toFixed(2),
      totalProducts,
      activeProducts,
      lowStockProducts,
      categoryBreakdown,
    }
  }, [products, orders])

  const statCards = [
    {
      icon: DollarSign,
      label: t("إجمالي الإيرادات", "Total Revenue"),
      value: `${metrics.totalRevenue.toFixed(2)} EGP`,
      color: "emerald",
    },
    {
      icon: ShoppingCart,
      label: t("عدد الطلبات", "Total Orders"),
      value: metrics.totalOrders.toString(),
      color: "blue",
    },
    {
      icon: TrendingUp,
      label: t("متوسط قيمة الطلب", "Avg Order Value"),
      value: `${metrics.avgOrderValue} EGP`,
      color: "purple",
    },
    {
      icon: Package,
      label: t("إجمالي المنتجات", "Total Products"),
      value: `${metrics.totalProducts}/${metrics.activeProducts}`,
      color: "amber",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2"
      >
        {(["day", "week", "month", "year"] as const).map((range) => (
          <Button
            key={range}
            onClick={() => setTimeRange(range)}
            variant={timeRange === range ? "default" : "outline"}
            className="capitalize"
          >
            {range === "day" && t("اليوم", "Today")}
            {range === "week" && t("الأسبوع", "Week")}
            {range === "month" && t("الشهر", "Month")}
            {range === "year" && t("السنة", "Year")}
          </Button>
        ))}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-6 rounded-xl border backdrop-blur-sm bg-gradient-to-br transition-all hover:shadow-lg",
                card.color === "emerald" && "from-emerald-50 to-emerald-100/50 border-emerald-200 text-emerald-900",
                card.color === "blue" && "from-blue-50 to-blue-100/50 border-blue-200 text-blue-900",
                card.color === "purple" && "from-purple-50 to-purple-100/50 border-purple-200 text-purple-900",
                card.color === "amber" && "from-amber-50 to-amber-100/50 border-amber-200 text-amber-900"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium opacity-70">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
                <Icon className="w-6 h-6 opacity-50" />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          {t("توزيع الفئات", "Category Distribution")}
        </h3>
        <div className="space-y-3">
          {Object.entries(metrics.categoryBreakdown).map(([category, count]) => (
            <div key={category} className="flex items-center gap-4">
              <span className="text-sm font-medium w-24">{category}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / metrics.totalProducts) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
              <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Low Stock Alert */}
      {metrics.lowStockProducts > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <p className="text-sm text-amber-800">
            {metrics.lowStockProducts} {t("منتج منخفض المخزون", "products have low stock")}
          </p>
        </motion.div>
      )}
    </div>
  )
}

// Import ShoppingCart and AlertTriangle
import { ShoppingCart, AlertTriangle } from "lucide-react"
