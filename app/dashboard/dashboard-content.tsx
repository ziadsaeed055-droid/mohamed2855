"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { Product, Order } from "@/lib/types"
import { CATEGORIES, PRODUCT_TYPES } from "@/lib/types"
import {
  Plus,
  Edit,
  Trash2,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Search,
  Loader2,
  LayoutDashboard,
  MessageSquare,
  Clock,
  PackageCheck,
  Truck,
  Eye,
  Send,
  ArrowUpRight,
  List,
  Star,
  Users,
  BarChart3,
  X,
  LayoutGrid,
  CheckCircle2,
  Sparkles,
  Home,
  Layers,
  Gift,
  CreditCard,
  Wand2,
  RefreshCw,
  Award,
  Zap,
  Palette,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useChat } from "@/contexts/chat-context"
import { sendOrderStatusNotification } from "@/lib/notification-service"
import { AdminRewardsTab } from "@/components/admin-rewards-tab" // Import AdminRewardsTab
import { AdminUsersTab } from "@/components/admin-users-tab" // Import AdminUsersTab
import { AdminFeaturedTab } from "@/components/admin-featured-tab" // Import AdminFeaturedTab
import { AdminFlashSaleTab } from "@/components/admin-flashsale-tab" // Import AdminFlashSaleTab
import { AdminFloatingProductsTab } from "@/components/admin-floating-products-tab" // Import AdminFloatingProductsTab
import { AdminMoodBoardTab } from "@/components/admin-mood-board-tab" // Import AdminMoodBoardTab
import { AdminAnalyticsTab } from "@/components/admin-analytics-tab"
import { AdminPerformanceTab } from "@/components/admin-performance-tab"
import { AdminAdvancedSearch } from "@/components/admin-advanced-search"

const productTypeIcons = {
  single: Package,
  outfit: Layers,
  bundle: Gift,
  gift: CreditCard,
  custom: Wand2,
  subscription: RefreshCw,
}

const productTypeColors = {
  single: "bg-blue-100 text-blue-700 border-blue-200",
  outfit: "bg-purple-100 text-purple-700 border-purple-200",
  bundle: "bg-amber-100 text-amber-700 border-amber-200",
  gift: "bg-pink-100 text-pink-700 border-pink-200",
  custom: "bg-emerald-100 text-emerald-700 border-emerald-200",
  subscription: "bg-cyan-100 text-cyan-700 border-cyan-200",
}

const statusColors = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
}

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: PackageCheck,
}

const statusLabels = {
  pending: { ar: "قيد الانتظار", en: "Pending" },
  processing: { ar: "جاري التنفيذ", en: "Processing" },
  shipped: { ar: "تم الشحن", en: "Shipped" },
  delivered: { ar: "تم التسليم", en: "Delivered" },
}

export default function DashboardContent() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const { t, language } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedProductType, setSelectedProductType] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [currentConversation, setCurrentConversation] = useState<any>(null)
  const [messageInput, setMessageInput] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("overview")

  const { conversations, messages, fetchMessages, sendMessage } = useChat()
  const { toast } = useToast()

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
  const pendingOrders = orders.filter((order) => order.status === "pending").length
  const lowStockProducts = products.filter((product) => product.quantity <= product.alertQuantity)

  const outfitProducts = products.filter((p) => p.productType === "outfit")
  const bundleProducts = products.filter((p) => p.productType === "bundle")
  const giftProducts = products.filter((p) => p.productType === "gift")

  const totalOrders = orders.length
  const deliveredOrders = orders.filter((order) => order.status === "delivered").length
  const processingOrders = orders.filter((order) => order.status === "processing").length
  const shippedOrders = orders.filter((order) => order.status === "shipped").length
  const completionRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Find the order to get userId
      const order = orders.find((o) => o.id === orderId)

      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
      })

      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

      // Send notification to user about order status change
      if (order?.userId) {
        try {
          await sendOrderStatusNotification(order.userId, orderId, newStatus)
          console.log("[v0] Order status notification sent successfully")
        } catch (notifError) {
          console.error("[v0] Failed to send order status notification:", notifError)
        }
      }

      toast({
        title: t("تم التحديث", "Updated"),
        description: t(
          "تم تحديث حالة الطلب وإرسال إشعار للعميل",
          "Order status updated and notification sent to customer",
        ),
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل تحديث حالة الطلب", "Failed to update order status"),
        variant: "destructive",
      })
    }
  }

  const handleSendAdminMessage = async () => {
    if (!messageInput.trim() || !currentConversation) return

    try {
      setIsSending(true)
      await sendMessage(currentConversation.id, messageInput, "admin")
      setMessageInput("")
      await new Promise((resolve) => setTimeout(resolve, 300))
      await fetchMessages(currentConversation.id)
      toast({
        title: t("تم الإرسال", "Sent"),
        description: t("تم إرسال رسالتك", "Your message has been sent"),
      })
    } catch (error) {
      console.error("[v0] Error sending admin message:", error)
      const errorMsg = error instanceof Error ? error.message : "خطأ في الإرسال"
      toast({
        title: t("خطأ", "Error"),
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation.id)
    }
  }, [currentConversation])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin-login")
      return
    }

    if (!loading && user && user.role !== "admin") {
      router.push("/")
      return
    }

    const fetchProducts = async () => {
      try {
        const productsSnap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")))
        setProducts(productsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[])
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    const fetchOrders = async () => {
      try {
        const ordersSnap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")))
        setOrders(ordersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Order[])
      } catch (error: any) {
        console.error("[v0] Error fetching orders:", error.code, error.message)
        if (error.code === "permission-denied") {
          toast({
            title: t("خطأ في الصلاحيات", "Permission Error"),
            description: t(
              "تأكد من أن قواعد الأمان تسمح للمسؤولين بقراءة جميع الطلبات",
              "Ensure Firebase Security Rules allow admins to read all orders",
            ),
            variant: "destructive",
          })
        }
      }
    }

    fetchProducts()
    fetchOrders()
  }, [user, loading, router, t, toast])

  useEffect(() => {
    let filtered = products

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.nameAr.toLowerCase().includes(query) ||
          p.nameEn.toLowerCase().includes(query) ||
          p.descriptionAr.toLowerCase().includes(query) ||
          p.descriptionEn.toLowerCase().includes(query),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    if (selectedProductType !== "all") {
      filtered = filtered.filter((p) => p.productType === selectedProductType)
    }

    if (selectedStatus === "active") {
      filtered = filtered.filter((p) => p.isActive)
    } else if (selectedStatus === "inactive") {
      filtered = filtered.filter((p) => !p.isActive)
    } else if (selectedStatus === "featured") {
      filtered = filtered.filter((p) => p.isFeatured)
    } else if (selectedStatus === "low-stock") {
      filtered = filtered.filter((p) => p.quantity <= p.alertQuantity)
    }

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.discountedPrice || a.salePrice) - (b.discountedPrice || b.salePrice))
        break
      case "price-high":
        filtered.sort((a, b) => (b.discountedPrice || b.salePrice) - (a.discountedPrice || a.salePrice))
        break
      case "name":
        filtered.sort((a, b) =>
          language === "ar" ? a.nameAr.localeCompare(b.nameAr) : a.nameEn.localeCompare(b.nameEn),
        )
        break
      case "oldest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt as any)
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt as any)
          return dateA.getTime() - dateB.getTime()
        })
        break
      default:
        filtered.sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt as any)
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt as any)
          return dateB.getTime() - dateA.getTime()
        })
    }

    setFilteredProducts(filtered)
  }, [searchQuery, selectedCategory, selectedStatus, selectedProductType, products, sortBy, language])

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(t("هل أنت متأكد من حذف هذا المنتج؟", "Are you sure you want to delete this product?"))) return

    try {
      await deleteDoc(doc(db, "products", productId))
      setProducts(products.filter((p) => p.id !== productId))
      toast({
        title: t("تم الحذف", "Deleted"),
        description: t("تم حذف المنتج بنجاح", "Product deleted successfully"),
      })
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل حذف المنتج", "Failed to delete product"),
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (product: Product) => {
    try {
      await updateDoc(doc(db, "products", product.id), {
        isActive: !product.isActive,
      })
      setProducts(products.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p)))
      toast({
        title: t("تم التحديث", "Updated"),
        description: t("تم تحديث حالة المنتج", "Product status updated"),
      })
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل تحديث المنتج", "Failed to update product"),
        variant: "destructive",
      })
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedStatus("all")
    setSelectedProductType("all")
    setSortBy("newest")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-muted animate-pulse" />
            <Loader2 className="w-8 h-8 absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground font-medium">{t("جاري التحميل...", "Loading...")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t("لوحة التحكم", "Dashboard")}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Seven Blue Admin</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="gap-2 bg-transparent hover:bg-secondary">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">{t("العودة للمتجر", "Back to Store")}</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Navigation - Updated Tabs Navigation - Added featured and flashsale tabs */}
          <div className="bg-background rounded-2xl p-2 mb-6 shadow-sm border">
            <TabsList className="grid grid-cols-12 gap-1 bg-transparent overflow-x-auto">
              {[
                { value: "overview", icon: LayoutDashboard, label: t("نظرة عامة", "Overview") },
                { value: "products", icon: Package, label: t("المنتجات", "Products") },
                { value: "orders", icon: ShoppingCart, label: t("الطلبات", "Orders") },
                { value: "featured", icon: Sparkles, label: t("المميز", "Featured") },
                { value: "flashsale", icon: Zap, label: t("العروض", "Flash Sale") },
                { value: "floating", icon: Sparkles, label: t("العائمة", "Floating") },
                { value: "moodboard", icon: Palette, label: t("المزاج", "Mood") },
                { value: "rewards", icon: Award, label: t("المكافآت", "Rewards") },
                { value: "users", icon: Users, label: t("المستخدمون", "Users") },
                { value: "messages", icon: MessageSquare, label: t("الرسائل", "Messages") },
                { value: "analytics", icon: BarChart3, label: t("التحليلات", "Analytics") },
                { value: "performance", icon: TrendingUp, label: t("الأداء", "Performance") },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "flex items-center gap-2 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md",
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden lg:inline font-medium">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-slide-up">
            {/* Welcome Section */}
            <div className="bg-primary rounded-2xl p-6 md:p-8 text-primary-foreground relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 end-0 w-64 h-64 bg-accent rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 start-0 w-48 h-48 bg-white rounded-full blur-2xl -translate-x-1/2 translate-y-1/2" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span className="text-sm text-primary-foreground/80 font-medium">
                    {t("مرحباً بك في لوحة التحكم", "Welcome to Dashboard")}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2">
                  {t("إدارة متجر Seven Blue", "Manage Seven Blue Store")}
                </h2>
                <p className="text-primary-foreground/70 max-w-xl">
                  {t(
                    "تابع أداء متجرك، إدارة المنتجات، ومعالجة الطلبات من مكان واحد",
                    "Track your store performance, manage products, and process orders from one place",
                  )}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Revenue Card */}
              <div className="bg-background rounded-2xl border p-5 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>12%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{t("إجمالي الإيرادات", "Total Revenue")}</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalRevenue.toLocaleString()} <span className="text-sm font-normal">{t("ج.م", "EGP")}</span>
                </p>
              </div>

              {/* Orders Card */}
              <div className="bg-background rounded-2xl border p-5 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {pendingOrders} {t("معلق", "pending")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{t("إجمالي الطلبات", "Total Orders")}</p>
                <p className="text-2xl font-bold text-foreground">{orders.length}</p>
              </div>

              {/* Products Card */}
              <div className="bg-background rounded-2xl border p-5 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  {lowStockProducts.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {lowStockProducts.length} {t("منخفض", "low")}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{t("إجمالي المنتجات", "Total Products")}</p>
                <p className="text-2xl font-bold text-foreground">{products.length}</p>
              </div>

              {/* Customers Card */}
              <div className="bg-background rounded-2xl border p-5 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{t("العملاء", "Customers")}</p>
                <p className="text-2xl font-bold text-foreground">{new Set(orders.map((o) => o.userId)).size}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab("featured")}
                className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white text-start hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
                <h3 className="text-lg font-bold mb-1">{t("إدارة المنتج المميز", "Manage Featured Product")}</h3>
                <p className="text-white/80 text-sm">
                  {t("اختر المنتج الذي يظهر في الصفحة الرئيسية", "Choose the product displayed on homepage")}
                </p>
              </button>

              <button
                onClick={() => setActiveTab("flashsale")}
                className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl p-6 text-white text-start hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
                <h3 className="text-lg font-bold mb-1">{t("إدارة العروض السريعة", "Manage Flash Sales")}</h3>
                <p className="text-white/80 text-sm">
                  {t("إنشاء عروض محدودة الوقت مع عداد تنازلي", "Create time-limited offers with countdown")}
                </p>
              </button>
            </div>

            {/* Recent Orders */}
            <div className="bg-background rounded-2xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{t("أحدث الطلبات", "Recent Orders")}</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")}>
                  {t("عرض الكل", "View All")}
                </Button>
              </div>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => {
                  const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Clock
                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            statusColors[order.status as keyof typeof statusColors],
                          )}
                        >
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">#{order.id.slice(-6)}</p>
                          <p className="text-xs text-muted-foreground">{order.customerName}</p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="font-bold text-sm">
                          {order.total} {t("ج.م", "EGP")}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {statusLabels[order.status as keyof typeof statusLabels]?.[language] || order.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          {/* Featured Products Tab */}
          <TabsContent value="featured" className="animate-slide-up">
            <AdminFeaturedTab />
          </TabsContent>

          {/* Flash Sale Tab */}
          <TabsContent value="flashsale" className="animate-slide-up">
            <AdminFlashSaleTab />
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6 animate-slide-up">
            <AdminRewardsTab />
          </TabsContent>

  {/* Users Tab */}
  <TabsContent value="users" className="space-y-6 animate-slide-up">
  <AdminUsersTab />
  </TabsContent>

  {/* Floating Products Tab */}
  <TabsContent value="floating" className="space-y-6 animate-slide-up">
  <AdminFloatingProductsTab />
  </TabsContent>

  {/* Mood Board Tab */}
  <TabsContent value="moodboard" className="space-y-6 animate-slide-up">
  <AdminMoodBoardTab />
  </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6 animate-slide-up">
            {/* Header */}
            <div className="bg-background rounded-2xl border p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{t("إدارة المنتجات", "Manage Products")}</h2>
                    <p className="text-sm text-muted-foreground">
                      {filteredProducts.length} {t("من", "of")} {products.length} {t("منتج", "products")}
                    </p>
                  </div>
                </div>
                <Link href="/dashboard/add-product">
                  <Button className="gap-2 h-11 px-6">
                    <Plus className="w-4 h-4" />
                    {t("إضافة منتج", "Add Product")}
                  </Button>
                </Link>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search */}
                <div className="relative lg:col-span-2">
                  <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("بحث...", "Search...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps-11 h-11 bg-muted/50"
                  />
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t("الفئة", "Category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("كل الفئات", "All Categories")}</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {language === "ar" ? cat.nameAr : cat.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Product Type Filter */}
                <Select value={selectedProductType} onValueChange={setSelectedProductType}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t("نوع المنتج", "Product Type")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("كل الأنواع", "All Types")}</SelectItem>
                    {PRODUCT_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {t(type.nameAr, type.nameEn)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t("الحالة", "Status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("كل الحالات", "All Status")}</SelectItem>
                    <SelectItem value="active">{t("نشط", "Active")}</SelectItem>
                    <SelectItem value="inactive">{t("غير نشط", "Inactive")}</SelectItem>
                    <SelectItem value="featured">{t("مميز", "Featured")}</SelectItem>
                    <SelectItem value="low-stock">{t("مخزون منخفض", "Low Stock")}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t("ترتيب", "Sort")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t("الأحدث", "Newest")}</SelectItem>
                    <SelectItem value="oldest">{t("الأقدم", "Oldest")}</SelectItem>
                    <SelectItem value="price-low">{t("السعر: منخفض", "Price: Low")}</SelectItem>
                    <SelectItem value="price-high">{t("السعر: مرتفع", "Price: High")}</SelectItem>
                    <SelectItem value="name">{t("الاسم", "Name")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode & Clear Filters */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                {(searchQuery ||
                  selectedCategory !== "all" ||
                  selectedStatus !== "all" ||
                  selectedProductType !== "all" || // Added selectedProductType to clearFilters condition
                  sortBy !== "newest") && (
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                    {t("مسح الفلاتر", "Clear Filters")}
                  </Button>
                )}
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <div className="bg-background rounded-2xl border p-16 text-center">
                <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-6">
                  <Package className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t("لا توجد منتجات", "No products found")}</h3>
                <p className="text-muted-foreground mb-6">
                  {t("حاول تغيير الفلاتر أو البحث", "Try adjusting your filters")}
                </p>
                <Button onClick={clearFilters} variant="outline" className="gap-2 bg-transparent">
                  <X className="w-4 h-4" />
                  {t("مسح الفلاتر", "Clear Filters")}
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-background rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-muted overflow-hidden">
                      {product.mainImage && (
                        <Image
                          src={product.mainImage || "/placeholder.svg"}
                          alt={language === "ar" ? product.nameAr : product.nameEn}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      {/* Badges */}
                      <div className="absolute top-3 start-3 flex flex-col gap-2">
                        {product.isFeatured && (
                          <Badge className="badge-gold text-xs gap-1">
                            <Star className="w-3 h-3" />
                            {t("مميز", "Featured")}
                          </Badge>
                        )}
                        {product.quantity <= product.alertQuantity && (
                          <Badge variant="destructive" className="text-xs">
                            {t("مخزون منخفض", "Low Stock")}
                          </Badge>
                        )}
                      </div>
                      {/* Status Badge */}
                      <div className="absolute top-3 end-3">
                        <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                          {product.isActive ? t("مفعل", "Active") : t("معطل", "Inactive")}
                        </Badge>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-4">
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                          {language === "ar" ? product.nameAr : product.nameEn}
                        </h3>
                        {product.productType &&
                          (() => {
                            const IconComponent = productTypeIcons[product.productType as keyof typeof productTypeIcons]
                            return (
                              <Badge
                                className={cn(
                                  "mb-2 text-xs",
                                  productTypeColors[product.productType as keyof typeof productTypeColors],
                                )}
                              >
                                {IconComponent && <IconComponent className="w-3 h-3 me-1" />}
                                {t(
                                  PRODUCT_TYPES.find((pt) => pt.id === product.productType)?.nameAr || "",
                                  PRODUCT_TYPES.find((pt) => pt.id === product.productType)?.nameEn || "",
                                )}
                              </Badge>
                            )
                          })()}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t("السعر", "Price")}</span>
                          <span className="font-bold text-primary">
                            {product.salePrice} {t("ج.م", "EGP")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{t("المخزون", "Stock")}</span>
                          <span
                            className={cn(
                              "font-semibold",
                              product.quantity <= product.alertQuantity ? "text-destructive" : "text-foreground",
                            )}
                          >
                            {product.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <Link href={`/product/${product.id}`}>
                          <Button variant="outline" size="sm" className="w-full gap-1 h-9 text-xs bg-transparent">
                            <Eye className="w-3 h-3" />
                            {t("عرض", "View")}
                          </Button>
                        </Link>
                        <Link href={`/dashboard/edit-product/${product.id}`}>
                          <Button variant="outline" size="sm" className="w-full gap-1 h-9 text-xs bg-transparent">
                            <Edit className="w-3 h-3" />
                            {t("تعديل", "Edit")}
                          </Button>
                        </Link>
                        <Link href={`/dashboard/product-stats/${product.id}`}>
                          <Button variant="outline" size="sm" className="w-full gap-1 h-9 text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/30">
                            <TrendingUp className="w-3 h-3" />
                            {t("إحصائيات", "Stats")}
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="w-full gap-1 h-9 text-xs text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent"
                        >
                          <Trash2 className="w-3 h-3" />
                          {t("حذف", "Delete")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-background rounded-2xl border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="p-4 text-start font-medium">{t("المنتج", "Product")}</th>
                        <th className="p-4 text-start font-medium">{t("النوع", "Type")}</th>
                        <th className="p-4 text-start font-medium">{t("السعر", "Price")}</th>
                        <th className="p-4 text-start font-medium">{t("المخزون", "Stock")}</th>
                        <th className="p-4 text-start font-medium">{t("الحالة", "Status")}</th>
                        <th className="p-4 text-start font-medium">{t("إجراءات", "Actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const TypeIcon =
                          productTypeIcons[product.productType as keyof typeof productTypeIcons] || Package
                        return (
                          <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                  <Image
                                    src={product.mainImage || "/placeholder.svg?height=48&width=48&query=product"}
                                    alt=""
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium truncate max-w-[200px]">
                                    {language === "ar" ? product.nameAr : product.nameEn}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {
                                      CATEGORIES.find((c) => c.id === product.category)?.[
                                        language === "ar" ? "nameAr" : "nameEn"
                                      ]
                                    }
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge
                                className={cn(
                                  "gap-1",
                                  productTypeColors[product.productType as keyof typeof productTypeColors],
                                )}
                              >
                                <TypeIcon className="w-3 h-3" />
                                {PRODUCT_TYPES.find((pt) => pt.id === product.productType)?.[
                                  language === "ar" ? "nameAr" : "nameEn"
                                ] || product.productType}
                              </Badge>
                            </td>
                            <td className="p-4">
                              {product.discount > 0 ? (
                                <div>
                                  <span className="font-bold text-primary">{product.discountedPrice}</span>
                                  <span className="text-xs text-muted-foreground line-through ms-2">
                                    {product.salePrice}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-bold">{product.salePrice}</span>
                              )}
                              <span className="text-xs text-muted-foreground ms-1">{t("ج.م", "EGP")}</span>
                            </td>
                            <td className="p-4">
                              <Badge variant={product.quantity <= product.alertQuantity ? "destructive" : "secondary"}>
                                {product.quantity}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleActive(product)}
                                  className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                    product.isActive
                                      ? "bg-emerald-100 text-emerald-600"
                                      : "bg-muted text-muted-foreground",
                                  )}
                                >
                                  {product.isActive ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                </button>
                                {product.isFeatured && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1">
                                <Link href={`/product/${product.id}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Link href={`/dashboard/edit-product/${product.id}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Link href={`/dashboard/product-stats/${product.id}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <BarChart3 className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6 animate-slide-up">
            <div className="bg-background rounded-2xl border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t("إدارة الطلبات", "Manage Orders")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {orders.length} {t("طلب", "orders")}
                  </p>
                </div>
              </div>

              {/* Order Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: t("قيد الانتظار", "Pending"), value: pendingOrders, color: "amber" },
                  { label: t("جاري التنفيذ", "Processing"), value: processingOrders, color: "blue" },
                  { label: t("تم الشحن", "Shipped"), value: shippedOrders, color: "purple" },
                  { label: t("تم التسليم", "Delivered"), value: deliveredOrders, color: "emerald" },
                ].map((stat, index) => (
                  <div key={index} className={`bg-${stat.color}-50 rounded-xl p-4 border border-${stat.color}-100`}>
                    <p className={`text-sm text-${stat.color}-700 mb-1`}>{stat.label}</p>
                    <p className={`text-2xl font-bold text-${stat.color}-900`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 rounded-lg">
                    <tr>
                      <th className="p-4 text-start font-medium rounded-s-lg">{t("رقم الطلب", "Order ID")}</th>
                      <th className="p-4 text-start font-medium">{t("العميل", "Customer")}</th>
                      <th className="p-4 text-start font-medium">{t("المنتجات", "Products")}</th>
                      <th className="p-4 text-start font-medium">{t("الإجمالي", "Total")}</th>
                      <th className="p-4 text-start font-medium">{t("الحالة", "Status")}</th>
                      <th className="p-4 text-start font-medium rounded-e-lg">{t("تحديث الحالة", "Update Status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Clock
                      return (
                        <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <span className="font-mono font-medium">#{order.id.slice(-6)}</span>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{order.customerName}</p>
                              <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary">
                              {order.items?.length || 0} {t("منتج", "items")}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="font-bold">
                              {order.total} {t("ج.م", "EGP")}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge className={cn("gap-1", statusColors[order.status as keyof typeof statusColors])}>
                              <StatusIcon className="w-3 h-3" />
                              {statusLabels[order.status as keyof typeof statusLabels]?.[language] || order.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-36 h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">{t("قيد الانتظار", "Pending")}</SelectItem>
                                <SelectItem value="processing">{t("جاري التنفيذ", "Processing")}</SelectItem>
                                <SelectItem value="shipped">{t("تم الشحن", "Shipped")}</SelectItem>
                                <SelectItem value="delivered">{t("تم التسليم", "Delivered")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="animate-slide-up">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Conversations List */}
              <div className="bg-background rounded-2xl border overflow-hidden">
                <div className="p-4 border-b bg-muted/30">
                  <h3 className="font-bold">{t("المحادثات", "Conversations")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {conversations.length} {t("محادثة", "conversations")}
                  </p>
                </div>
                <div className="divide-y max-h-[500px] overflow-y-auto">
                  {conversations.map((conv: any) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setCurrentConversation(conv)
                        fetchMessages(conv.id) // Fetch messages when conversation is selected
                      }}
                      className={cn(
                        "w-full p-4 text-start hover:bg-muted/50 transition-colors",
                        currentConversation?.id === conv.id && "bg-primary/10",
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">{conv.userName || conv.userEmail}</span>
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-primary text-primary-foreground">{conv.unreadCount}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </button>
                  ))}
                  {conversations.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t("لا توجد محادثات", "No conversations")}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Window */}
              <div className="lg:col-span-2 bg-background rounded-2xl border overflow-hidden flex flex-col h-[600px]">
                {currentConversation ? (
                  <>
                    {/* Header */}
                    <div className="p-4 border-b bg-muted/30">
                      <h3 className="font-bold">{currentConversation.userName || currentConversation.userEmail}</h3>
                      <p className="text-xs text-muted-foreground">{currentConversation.subject}</p>{" "}
                      {/* Added subject */}
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((msg: any) => (
                        <div
                          key={msg.id}
                          className={cn("flex", msg.senderType === "admin" ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-2xl px-4 py-2",
                              msg.senderType === "admin"
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted rounded-bl-sm",
                            )}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p
                              className={cn(
                                "text-xs mt-1",
                                msg.senderType === "admin" ? "text-primary-foreground/70" : "text-muted-foreground",
                              )}
                            >
                              {msg.createdAt?.toDate?.()?.toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t bg-muted/30">
                      <div className="flex gap-3">
                        <Input
                          placeholder={t("اكتب رسالتك...", "Type your message...")}
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendAdminMessage()}
                          className="flex-1 h-11 bg-background"
                        />
                        <Button
                          onClick={handleSendAdminMessage}
                          disabled={isSending || !messageInput.trim()}
                          className="h-11 px-6"
                        >
                          {isSending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-4 h-4 me-2" />
                              {t("إرسال", "Send")}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>{t("اختر محادثة للبدء", "Select a conversation to start")}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6 animate-slide-up">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: t("إجمالي الإيرادات", "Total Revenue"),
                  value: `${totalRevenue.toLocaleString()} ${t("ج.م", "EGP")}`,
                  icon: DollarSign,
                  color: "emerald",
                },
                {
                  label: t("متوسط قيمة الطلب", "Avg Order Value"),
                  value: `${avgOrderValue} ${t("ج.م", "EGP")}`,
                  icon: TrendingUp,
                  color: "blue",
                },
                {
                  label: t("نسبة الإكمال", "Completion Rate"),
                  value: `${completionRate}%`,
                  icon: CheckCircle2,
                  color: "purple",
                },
                {
                  label: t("إجمالي العملاء", "Total Customers"),
                  value: new Set(orders.map((o) => o.userId)).size.toString(),
                  icon: Users,
                  color: "amber",
                },
              ].map((stat, index) => (
                <div key={index} className="bg-background rounded-2xl border p-6 hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-4`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Order Distribution */}
            <div className="bg-background rounded-2xl border p-6">
              <h3 className="text-lg font-bold text-foreground mb-6">
                {t("توزيع حالات الطلبات", "Order Status Distribution")}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { status: "pending", label: t("قيد الانتظار", "Pending"), count: pendingOrders },
                  { status: "processing", label: t("جاري التنفيذ", "Processing"), count: processingOrders },
                  { status: "shipped", label: t("تم الشحن", "Shipped"), count: shippedOrders },
                  { status: "delivered", label: t("تم التسليم", "Delivered"), count: deliveredOrders },
                ].map((item) => {
                  const StatusIcon = statusIcons[item.status as keyof typeof statusIcons]
                  const percentage = totalOrders > 0 ? ((item.count / totalOrders) * 100).toFixed(0) : 0
                  return (
                    <div
                      key={item.status}
                      className={cn("rounded-xl p-4 border", statusColors[item.status as keyof typeof statusColors])}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <StatusIcon className="w-5 h-5" />
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      <p className="text-3xl font-bold">{item.count}</p>
                      <p className="text-sm opacity-70">
                        {percentage}% {t("من الإجمالي", "of total")}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 animate-slide-up">
            <AdminAnalyticsTab products={products} orders={orders} />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6 animate-slide-up">
            <AdminPerformanceTab products={products} orders={orders} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
