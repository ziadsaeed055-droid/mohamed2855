"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { useLanguage } from "@/contexts/language-context"
import type { Product } from "@/lib/types"
import { Loader2, Sun, Snowflake, ArrowRight, ArrowLeft, Package, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChatWidget } from "@/components/chat-widget"
import { cn } from "@/lib/utils"

export default function SeasonalPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSeason, setActiveSeason] = useState<"summer" | "winter">("summer")
  const { t, language } = useLanguage()
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight

  // Determine current season based on month
  const currentMonth = new Date().getMonth()
  const isWinterSeason = currentMonth >= 10 || currentMonth <= 2 // Nov-Mar

  useEffect(() => {
    // Set initial season based on current date
    setActiveSeason(isWinterSeason ? "winter" : "summer")
  }, [isWinterSeason])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const fetchSeasonalProducts = async () => {
      try {
        console.log("[v0] Fetching seasonal products...")
        const q = query(collection(db, "products"), where("isActive", "==", true))
        const snapshot = await getDocs(q)
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]

        console.log("[v0] All products fetched:", productsData.length)
        setAllProducts(productsData)
      } catch (error) {
        console.error("[v0] Error fetching seasonal products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSeasonalProducts()
  }, [])

  // Filter products by season
  const summerProducts = allProducts.filter((p) => p.season === "summer" || !p.season)
  const winterProducts = allProducts.filter((p) => p.season === "winter" || !p.season)
  const currentProducts = activeSeason === "summer" ? summerProducts : winterProducts

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 transition-all duration-700",
            activeSeason === "summer"
              ? "bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500"
              : "bg-gradient-to-br from-slate-700 via-slate-600 to-blue-900",
          )}
        />
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                activeSeason === "summer"
                  ? "url(\"data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                  : "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30 30 0zm0 10L10 30l20 20 20-20-20-20z' fill='%23ffffff' fillOpacity='0.2' fillRule='evenodd'/%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/30">
              <Calendar className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">{t("تشكيلة الموسم", "Season Collection")}</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              {activeSeason === "summer" ? (
                <Sun className="w-10 h-10 text-yellow-300" />
              ) : (
                <Snowflake className="w-10 h-10 text-blue-200" />
              )}
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white">{t("موسمي", "Seasonal")}</h1>
              {activeSeason === "summer" ? (
                <Sun className="w-10 h-10 text-yellow-300" />
              ) : (
                <Snowflake className="w-10 h-10 text-blue-200" />
              )}
            </div>

            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              {activeSeason === "summer"
                ? t(
                    "تشكيلة صيفية منعشة تناسب أجواء الصيف الدافئة",
                    "Refreshing summer collection perfect for warm weather",
                  )
                : t("تشكيلة شتوية دافئة وأنيقة للأجواء الباردة", "Warm and stylish winter collection for cold weather")}
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-white/90 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                <Package className="w-5 h-5" />
                <span className="font-semibold">
                  {currentProducts.length} {t("منتج", "Products")}
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

      {/* Season Toggle & Products Section */}
      <section className="py-12 md:py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Season Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-lg border">
              <button
                onClick={() => setActiveSeason("summer")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                  activeSeason === "summer"
                    ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Sun className="w-5 h-5" />
                {t("صيف", "Summer")}
              </button>
              <button
                onClick={() => setActiveSeason("winter")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                  activeSeason === "winter"
                    ? "bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Snowflake className="w-5 h-5" />
                {t("شتاء", "Winter")}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2
                className={cn("h-12 w-12 animate-spin", activeSeason === "summer" ? "text-sky-500" : "text-slate-500")}
              />
              <p className="text-muted-foreground">{t("جاري تحميل المنتجات...", "Loading products...")}</p>
            </div>
          ) : currentProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {currentProducts.map((product, index) => (
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
              <div
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
                  activeSeason === "summer" ? "bg-sky-100" : "bg-slate-100",
                )}
              >
                {activeSeason === "summer" ? (
                  <Sun className="w-10 h-10 text-sky-500" />
                ) : (
                  <Snowflake className="w-10 h-10 text-slate-500" />
                )}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {t("لا توجد منتجات لهذا الموسم", "No products for this season")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("تصفح تشكيلة الموسم الآخر", "Browse the other season's collection")}
              </p>
              <Link href="/shop">
                <Button
                  className={cn(
                    "gap-2",
                    activeSeason === "summer" ? "bg-sky-500 hover:bg-sky-600" : "bg-slate-600 hover:bg-slate-700",
                  )}
                >
                  {t("تصفح المتجر", "Browse Store")}
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
