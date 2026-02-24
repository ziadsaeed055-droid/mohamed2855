"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { useLanguage } from "@/contexts/language-context"
import type { Product } from "@/lib/types"
import { Sparkles, Clock, ArrowRight, ArrowLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChatWidget } from "@/components/chat-widget"
import { InlineLoader } from "@/components/premium-loader"

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage()
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight

  // Calculate date for "new" products (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        console.log("[v0] Fetching new arrivals...")
        const q = query(
          collection(db, "products"),
          where("isActive", "==", true),
          orderBy("createdAt", "desc"),
          limit(24),
        )
        const snapshot = await getDocs(q)
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]

        // Filter products created in the last 30 days
        const newProducts = productsData.filter((p) => {
          const createdAt = p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt as any)
          return createdAt >= thirtyDaysAgo
        })

        console.log("[v0] New arrivals fetched:", newProducts.length)
        setProducts(newProducts.length > 0 ? newProducts : productsData.slice(0, 12))
      } catch (error) {
        console.error("[v0] Error fetching new arrivals:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchNewArrivals()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500" />
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/30">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">{t("وصل حديثاً", "Just Arrived")}</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-10 h-10 text-white/80" />
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white">{t("جديدنا", "New Arrivals")}</h1>
              <Sparkles className="w-10 h-10 text-white/80" />
            </div>

            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              {t(
                "اكتشف أحدث التشكيلات والمنتجات المضافة حديثاً إلى متجرنا",
                "Discover the latest collections and newly added products to our store",
              )}
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-white/90 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                <Package className="w-5 h-5" />
                <span className="font-semibold">
                  {products.length} {t("منتج جديد", "New Products")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 100" className="w-full h-auto fill-slate-50">
            <path d="M0,100 L0,60 Q360,0 720,60 T1440,60 L1440,100 Z" />
          </svg>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <InlineLoader text={t("جاري تحميل المنتجات الجديدة...", "Loading new arrivals...")} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {t("لا توجد منتجات جديدة حالياً", "No new products at the moment")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("تابعنا لمعرفة أحدث الإضافات", "Stay tuned for the latest additions")}
              </p>
              <Link href="/shop">
                <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                  {t("تصفح جميع المنتجات", "Browse All Products")}
                  <ArrowIcon className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </main>
  )
}
