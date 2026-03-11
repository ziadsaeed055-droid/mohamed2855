"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderTrackingDisplay } from "@/components/order-tracking-display"
import { FullPageLoader } from "@/components/premium-loader"
import { AlertCircle, Search, Package, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Order } from "@/lib/types"

export default function OrdersPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<"all" | Order["status"]>("all")

  useEffect(() => {
    if (!user) return

    // Fetch user's orders from Firebase
    const fetchOrders = async () => {
      try {
        // This will be implemented with Firebase
        setLoading(false)
      } catch (error) {
        console.error("Error fetching orders:", error)
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {t("الرجاء تسجيل الدخول", "Please sign in")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{t("يجب أن تكون مسجل دخول لعرض طلباتك", "You must be signed in to view your orders")}</p>
              <Button asChild>
                <a href="/auth/login">{t("تسجيل الدخول", "Sign In")}</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  if (loading) {
    return <FullPageLoader />
  }

  const filteredOrders = orders
    .filter((order) => selectedStatus === "all" || order.status === selectedStatus)
    .filter(
      (order) =>
        order.id.includes(searchQuery.toLowerCase()) ||
        order.trackingNumber?.includes(searchQuery.toLowerCase()) ||
        false,
    )

  const statusStats = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t("طلباتي", "My Orders")}</h1>
          <p className="text-muted-foreground">{t("متابعة وتتبع جميع طلباتك", "Track and manage all your orders")}</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("ابحث برقم الطلب أو رقم التتبع", "Search by order or tracking number")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mb-8">
          <Tabs value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as any)}>
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="all">
                {t("الكل", "All")} ({statusStats.all})
              </TabsTrigger>
              <TabsTrigger value="pending">
                {t("قيد الانتظار", "Pending")} ({statusStats.pending})
              </TabsTrigger>
              <TabsTrigger value="processing">
                {t("قيد المعالجة", "Processing")} ({statusStats.processing})
              </TabsTrigger>
              <TabsTrigger value="shipped">
                {t("مشحون", "Shipped")} ({statusStats.shipped})
              </TabsTrigger>
              <TabsTrigger value="delivered">
                {t("مسلم", "Delivered")} ({statusStats.delivered})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedStatus as any} className="space-y-4">
              {filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">{t("لا توجد طلبات", "No orders found")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("لم تقم بأي طلبات بعد", "You haven't placed any orders yet")}
                    </p>
                    <Button className="mt-4" asChild>
                      <a href="/shop">{t("ابدأ التسوق", "Start Shopping")}</a>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id}>
                    <OrderTrackingDisplay order={order} showFullDetails={true} />
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
