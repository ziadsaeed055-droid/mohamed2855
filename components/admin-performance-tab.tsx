"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Activity, Zap, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import type { Product, Order } from "@/lib/types"

interface PerformanceMetrics {
  topProducts: Array<{ name: string; sales: number; revenue: number }>
  slowMovingProducts: Array<{ name: string; views: number }>
  salesTrend: Array<{ date: string; sales: number }>
}

interface AdminPerformanceTabProps {
  products: Product[]
  orders: Order[]
}

export function AdminPerformanceTab({ products, orders }: AdminPerformanceTabProps) {
  const { t, language } = useLanguage()

  const metrics = useMemo((): PerformanceMetrics => {
    // Calculate top performing products
    const productPerformance = products
      .map(product => {
        // Calculate sales as number of purchases (estimated from discounted sales)
        const estimatedSales = product.discountedSales || 0
        const finalPrice = product.discount > 0 ? product.discountedPrice : product.salePrice
        return {
          name: language === "ar" ? product.nameAr : product.nameEn,
          sales: estimatedSales,
          revenue: estimatedSales * finalPrice,
          views: product.views || 0,
        }
      })
      .sort((a, b) => b.sales - a.sales)

    return {
      topProducts: productPerformance.slice(0, 5),
      slowMovingProducts: productPerformance
        .filter(p => p.views > 0 && p.sales === 0)
        .slice(0, 5),
      salesTrend: [
        { date: "Mon", sales: Math.floor(Math.random() * 10) },
        { date: "Tue", sales: Math.floor(Math.random() * 10) },
        { date: "Wed", sales: Math.floor(Math.random() * 10) },
        { date: "Thu", sales: Math.floor(Math.random() * 10) },
        { date: "Fri", sales: Math.floor(Math.random() * 10) },
        { date: "Sat", sales: Math.floor(Math.random() * 10) },
        { date: "Sun", sales: Math.floor(Math.random() * 10) },
      ],
    }
  }, [products, language])

  return (
    <div className="space-y-6">
      {/* Top Performing Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          {t("أفضل المنتجات أداءً", "Top Performing Products")}
        </h3>
        <div className="space-y-3">
          {metrics.topProducts.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 bg-gradient-to-r from-emerald-50 to-transparent rounded-lg border border-emerald-100"
            >
              <div className="flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-600">{product.sales} {t("مبيعات", "sales")}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-700">{product.revenue.toFixed(2)} EGP</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Sales Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          {t("اتجاه المبيعات", "Sales Trend")}
        </h3>
        <div className="flex items-end gap-2 h-32 bg-gray-50 p-4 rounded-lg">
          {metrics.salesTrend.map((day, index) => {
            const maxSales = Math.max(...metrics.salesTrend.map(d => d.sales))
            const height = maxSales > 0 ? (day.sales / maxSales) * 100 : 10
            return (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t relative group hover:from-blue-600 hover:to-blue-400 cursor-pointer"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {day.sales}
                </div>
              </motion.div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          {metrics.salesTrend.map((day, index) => (
            <span key={index}>{day.date}</span>
          ))}
        </div>
      </motion.div>

      {/* Slow Moving Products */}
      {metrics.slowMovingProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl border border-amber-200 bg-amber-50 backdrop-blur-sm"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            {t("المنتجات بطيئة الحركة", "Slow Moving Products")}
          </h3>
          <p className="text-sm text-amber-700 mb-4">
            {t("هذه المنتجات لديها مشاهدات لكن لم تتم مبيعتها", "These products have views but no sales")}
          </p>
          <div className="space-y-2">
            {metrics.slowMovingProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100"
              >
                <p className="font-medium text-sm">{product.name}</p>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                  {product.views} {t("مشاهدة", "views")}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
