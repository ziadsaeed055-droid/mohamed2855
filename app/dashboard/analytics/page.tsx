"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download } from "lucide-react"
import type { Order, Review, Product } from "@/lib/types"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d")
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalRevenue: 0,
    newCustomers: 0,
    conversionRate: 0,
    topProducts: [] as Array<{ name: string; sales: number; revenue: number }>,
    salesTrend: [] as Array<{ date: string; sales: number; revenue: number }>,
  })

  useEffect(() => {
    // Fetch analytics data from Firebase based on dateRange
    // This will calculate metrics from orders and products
    calculateAnalytics()
  }, [dateRange])

  const calculateAnalytics = async () => {
    try {
      // TODO: Implement Firebase queries to fetch:
      // 1. Orders for date range
      // 2. Calculate metrics
      // 3. Get top products
      // 4. Build sales trend

      // For now, use placeholder data
      setAnalytics({
        totalSales: 1250,
        totalRevenue: 58750,
        newCustomers: 142,
        conversionRate: 3.45,
        topProducts: [
          { name: "منتج 1", sales: 125, revenue: 12500 },
          { name: "منتج 2", sales: 98, revenue: 9800 },
          { name: "منتج 3", sales: 87, revenue: 8700 },
          { name: "منتج 4", sales: 76, revenue: 7600 },
          { name: "منتج 5", sales: 64, revenue: 6400 },
        ],
        salesTrend: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("ar-SA"),
          sales: Math.floor(Math.random() * 100 + 20),
          revenue: Math.floor(Math.random() * 5000 + 1000),
        })),
      })
    } catch (error) {
      console.error("Error calculating analytics:", error)
    }
  }

  const handleExport = () => {
    // Export analytics data as CSV
    const csv = generateCSV()
    downloadCSV(csv, `analytics-${dateRange}.csv`)
  }

  const generateCSV = () => {
    // Generate CSV from analytics data
    let csv = "المقياس,القيمة\n"
    csv += `إجمالي المبيعات,${analytics.totalSales}\n`
    csv += `إجمالي الإيرادات,${analytics.totalRevenue}\n`
    csv += `عملاء جدد,${analytics.newCustomers}\n`
    csv += `معدل التحويل,${analytics.conversionRate}\n`
    return csv
  }

  const downloadCSV = (csv: string, filename: string) => {
    const element = document.createElement("a")
    element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`)
    element.setAttribute("download", filename)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">لوحة التحليلات والإحصائيات</h1>
          <p className="text-muted-foreground">متابعة أداء متجرك وتحليل البيانات</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">آخر 7 أيام</SelectItem>
                <SelectItem value="30d">آخر 30 يوم</SelectItem>
                <SelectItem value="90d">آخر 3 أشهر</SelectItem>
                <SelectItem value="1y">آخر سنة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            تحميل التقرير
          </Button>
        </div>

        {/* Analytics Dashboard */}
        <AnalyticsDashboard {...analytics} />

        {/* Detailed Metrics */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">المقاييس التفصيلية</h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Orders by Status */}
            <Card>
              <CardHeader>
                <CardTitle>الطلبات حسب الحالة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>قيد المعالجة</span>
                    <span className="font-semibold">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مشحون</span>
                    <span className="font-semibold">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مسلم</span>
                    <span className="font-semibold">1078</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>أداء الفئات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>رجالي</span>
                    <span className="font-semibold">42%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>نسائي</span>
                    <span className="font-semibold">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>أطفال</span>
                    <span className="font-semibold">23%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* GA4 Integration Note */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              📊 <strong>ملاحظة:</strong> يمكن تحسين هذه التقارير بإضافة Google Analytics 4 للحصول على بيانات أكثر تفصيلاً عن سلوك المستخدمين والتحويلات.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
