"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, BarChart, PieChart } from "recharts"
import { TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalyticsDashboardProps {
  totalSales?: number
  totalRevenue?: number
  newCustomers?: number
  conversionRate?: number
  topProducts?: Array<{ name: string; sales: number; revenue: number }>
  salesTrend?: Array<{ date: string; sales: number; revenue: number }>
}

export function AnalyticsDashboard({
  totalSales = 0,
  totalRevenue = 0,
  newCustomers = 0,
  conversionRate = 0,
  topProducts = [],
  salesTrend = [],
}: AnalyticsDashboardProps) {
  const stats = [
    {
      label: "إجمالي المبيعات",
      value: totalSales.toLocaleString("ar-SA"),
      change: "+12.5%",
      icon: ShoppingBag,
    },
    {
      label: "إجمالي الإيرادات",
      value: `${totalRevenue.toLocaleString("ar-SA")} ريال`,
      change: "+8.2%",
      icon: DollarSign,
    },
    {
      label: "عملاء جدد",
      value: newCustomers.toLocaleString("ar-SA"),
      change: "+5.1%",
      icon: Users,
    },
    {
      label: "معدل التحويل",
      value: `${conversionRate.toFixed(1)}%`,
      change: "+2.3%",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="mt-1 text-xs text-green-600">{stat.change}</p>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>اتجاه المبيعات</CardTitle>
            <CardDescription>آخر 30 يوم</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {/* Chart placeholder - implement with recharts */}
              <p className="text-muted-foreground">رسم بياني المبيعات (يتطلب recharts integration)</p>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>أعلى المنتجات</CardTitle>
            <CardDescription>الأكثر مبيعاً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((product, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} مبيعة</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{product.revenue.toLocaleString("ar-SA")} ريال</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>تحليلات العملاء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-600">معدل العودة</p>
              <p className="text-2xl font-bold text-blue-900">45%</p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-600">متوسط الطلب</p>
              <p className="text-2xl font-bold text-green-900">450 ريال</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-sm text-purple-600">رضا العملاء</p>
              <p className="text-2xl font-bold text-purple-900">4.5⭐</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
