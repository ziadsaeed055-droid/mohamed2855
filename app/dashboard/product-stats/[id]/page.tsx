"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  Heart,
  TrendingUp,
  Home,
  Loader2,
  DollarSign,
  ShoppingCart,
  Package,
  Percent,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"

interface ProductStats {
  views: number
  likes: number
  likedBy: string[]
  totalSales: number
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  conversionRate: number
  profitMargin: number
}

interface OrderItem {
  id: string
  orderId: string
  userName: string
  userEmail: string
  quantity: number
  price: number
  total: number
  status: string
  createdAt: Date
}

export default function ProductStatsPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { t, language } = useLanguage()
  const { toast } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [stats, setStats] = useState<ProductStats>({
    views: 0,
    likes: 0,
    likedBy: [],
    totalSales: 0,
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    profitMargin: 0,
  })
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)

  const BackArrow = language === "ar" ? ArrowRight : ArrowLeft

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const fetchProductAndStats = async () => {
      try {
        // Fetch product
        const docRef = doc(db, "products", productId)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          toast({
            title: t("خطأ", "Error"),
            description: t("المنتج غير موجود", "Product not found"),
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        const productData = { id: docSnap.id, ...docSnap.data() } as Product
        setProduct(productData)

        // Calculate stats from product data
        const views = productData.views || 0
        const likes = productData.likes || 0
        const likedBy = productData.likedBy || []
        const salesCount = productData.salesCount || 0

        // Fetch orders containing this product
        const ordersSnap = await getDocs(collection(db, "orders"))
        let totalRevenue = 0
        let totalOrders = 0
        let totalQuantity = 0
        const orderItems: OrderItem[] = []

        ordersSnap.docs.forEach((orderDoc) => {
          const orderData = orderDoc.data()
          const items = orderData.items || []

          items.forEach((item: any) => {
            if (item.productId === productId) {
              totalOrders++
              const itemTotal = item.product.salePrice * item.quantity
              totalRevenue += itemTotal
              totalQuantity += item.quantity

              orderItems.push({
                id: orderDoc.id,
                orderId: orderDoc.id,
                userName: orderData.userName || "",
                userEmail: orderData.userEmail || "",
                quantity: item.quantity,
                price: item.product.salePrice,
                total: itemTotal,
                status: orderData.status || "pending",
                createdAt: orderData.createdAt?.toDate() || new Date(),
              })
            }
          })
        })

        // Sort orders by date (most recent first)
        orderItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        setRecentOrders(orderItems.slice(0, 10)) // Show last 10 orders

        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
        const conversionRate = views > 0 ? (totalOrders / views) * 100 : 0

        // Calculate profit margin
        const costPrice = productData.costPrice || 0
        const salePrice = productData.discountedPrice || productData.salePrice
        const profitMargin = salePrice > 0 ? ((salePrice - costPrice) / salePrice) * 100 : 0

        setStats({
          views,
          likes,
          likedBy,
          totalSales: totalQuantity,
          totalRevenue,
          totalOrders,
          averageOrderValue,
          conversionRate,
          profitMargin,
        })
      } catch (error) {
        console.error("[v0] Error fetching product stats:", error)
        toast({
          title: t("خطأ", "Error"),
          description: t("فشل في تحميل البيانات", "Failed to load data"),
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProductAndStats()
  }, [productId, router, toast, t])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t("جاري التحميل...", "Loading...")}</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  const productName = language === "ar" ? product.nameAr : product.nameEn
  const engagementRate = stats.views > 0 ? ((stats.likes / stats.views) * 100).toFixed(1) : "0"

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="secondary" size="sm">
                <BackArrow className="h-4 w-4 me-2" />
                {t("الرجوع", "Back")}
              </Button>
            </Link>
            <h1 className="text-xl font-bold">{t("إحصائيات المنتج", "Product Statistics")}</h1>
          </div>
          <Link href="/">
            <Button variant="secondary" size="sm">
              <Home className="h-4 w-4 me-2" />
              {t("الرئيسية", "Home")}
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Product Info */}
        <div className="bg-card rounded-xl border p-6 flex gap-6 hover:shadow-lg transition-shadow">
          <div className="relative w-32 h-32 flex-shrink-0">
            <Image
              src={product.mainImage || "/placeholder.svg?height=128&width=128&query=product"}
              alt={productName}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold">{productName}</h2>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {language === "ar" ? product.descriptionAr : product.descriptionEn}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {product.isActive && <Badge className="bg-green-100 text-green-800">{t("نشط", "Active")}</Badge>}
              {product.isFeatured && (
                <Badge className="bg-accent text-accent-foreground">{t("مميز", "Featured")}</Badge>
              )}
              {product.discount > 0 && (
                <Badge variant="destructive">{t(`خصم ${product.discount}%`, `${product.discount}% Off`)}</Badge>
              )}
              <Badge variant="outline">
                {t("المخزون", "Stock")}: {product.quantity}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Views */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 p-6 space-y-3 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">{t("المشاهدات", "Views")}</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.views.toLocaleString()}</p>
            </div>
          </div>

          {/* Likes */}
          <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950 dark:to-rose-900/30 rounded-xl border border-rose-200 dark:border-rose-800 p-6 space-y-3 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center">
                <Heart className="h-6 w-6 text-rose-600 dark:text-rose-400 fill-current" />
              </div>
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400">{engagementRate}%</span>
            </div>
            <div>
              <p className="text-sm text-rose-700 dark:text-rose-300">{t("الإعجابات", "Likes")}</p>
              <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{stats.likes.toLocaleString()}</p>
            </div>
          </div>

          {/* Sales */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950 dark:to-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800 p-6 space-y-3 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <Badge variant="outline" className="text-xs">
                {stats.totalOrders} {t("طلب", "orders")}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">{t("المبيعات", "Sales")}</p>
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                {stats.totalSales.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950 dark:to-amber-900/30 rounded-xl border border-amber-200 dark:border-amber-800 p-6 space-y-3 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                {stats.profitMargin.toFixed(1)}%
              </span>
            </div>
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-300">{t("الإيرادات", "Revenue")}</p>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                {stats.totalRevenue.toLocaleString()} <span className="text-sm">{t("ج.م", "EGP")}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-purple-600" />
              <Percent className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t("متوسط قيمة الطلب", "Avg Order Value")}</p>
            <p className="text-2xl font-bold mt-1">
              {stats.averageOrderValue.toLocaleString()} <span className="text-sm font-normal">{t("ج.م", "EGP")}</span>
            </p>
          </div>

          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">{stats.conversionRate.toFixed(2)}%</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("معدل التحويل", "Conversion Rate")}</p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-600">{stats.profitMargin.toFixed(1)}%</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("هامش الربح", "Profit Margin")}</p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(stats.profitMargin, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-primary" />
            {t("الطلبات الأخيرة", "Recent Orders")}
          </h3>

          {recentOrders.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{order.userName}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            order.status === "delivered" && "bg-emerald-100 text-emerald-700 border-emerald-300",
                            order.status === "shipped" && "bg-blue-100 text-blue-700 border-blue-300",
                            order.status === "processing" && "bg-amber-100 text-amber-700 border-amber-300",
                            order.status === "pending" && "bg-slate-100 text-slate-700 border-slate-300",
                          )}
                        >
                          {t(order.status, order.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(order.createdAt, "dd/MM/yyyy HH:mm", { locale: language === "ar" ? ar : enUS })}
                        </span>
                        <span>
                          {t("الكمية", "Qty")}: {order.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-lg font-bold text-primary">
                        {order.total.toLocaleString()} <span className="text-xs font-normal">{t("ج.م", "EGP")}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{t("لا توجد طلبات بعد", "No orders yet")}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-between flex-wrap">
          <Link href={`/product/${productId}`}>
            <Button variant="outline" size="lg" className="gap-2 bg-transparent">
              <Eye className="h-5 w-5" />
              {t("عرض المنتج", "View Product")}
            </Button>
          </Link>

          <Link href={`/dashboard/edit-product/${productId}`}>
            <Button variant="default" size="lg">
              {t("تعديل المنتج", "Edit Product")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
