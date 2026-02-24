"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { useLanguage } from "@/contexts/language-context"
import type { Product } from "@/lib/types"
import { Percent, Tag, ArrowRight, ArrowLeft, Package, Flame, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { InlineLoader } from "@/components/premium-loader"
import { ChatWidget } from "@/components/chat-widget"

export default function OffersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage()
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        console.log("[v0] Fetching products with offers...")
        const q = query(collection(db, "products"), where("isActive", "==", true))
        const snapshot = await getDocs(q)
        const allProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]

        // Filter products with active discounts
        const productsWithOffers = allProducts.filter((p) => p.discount > 0)

        // Sort by discount percentage (highest first)
        productsWithOffers.sort((a, b) => b.discount - a.discount)

        console.log("[v0] Products with offers:", productsWithOffers.length)
        setProducts(productsWithOffers)
      } catch (error) {
        console.error("[v0] Error fetching offers:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchOffers()
  }, [])

  // Calculate total savings
  const totalSavings = products.reduce((acc, p) => {
    return acc + (p.salePrice - p.discountedPrice)
  }, 0)

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-rose-500 to-pink-500" />
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fillOpacity='0.4' fillRule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/30 animate-pulse">
              <Flame className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">{t("عروض لفترة محدودة", "Limited Time Offers")}</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <Percent className="w-10 h-10 text-white/80" />
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white">{t("العروض", "Offers")}</h1>
              <Tag className="w-10 h-10 text-white/80" />
            </div>

            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              {t(
                "اغتنم الفرصة واستفد من أقوى العروض والخصومات الحصرية",
                "Seize the opportunity and benefit from the best exclusive offers and discounts",
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-white/90 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                <Package className="w-5 h-5" />
                <span className="font-semibold">
                  {products.length} {t("عرض متاح", "Active Offers")}
                </span>
              </div>
              {totalSavings > 0 && (
                <div className="flex items-center gap-2 text-white bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Tag className="w-5 h-5" />
                  <span className="font-bold">
                    {t("وفر حتى", "Save up to")} {Math.max(...products.map((p) => p.discount))}%
                  </span>
                </div>
              )}
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
            <InlineLoader text={t("جاري تحميل العروض...", "Loading offers...")} />
          ) : products.length > 0 ? (
            <div className="space-y-8">
              {/* Discount categories */}
              <div className="flex flex-wrap gap-3 justify-center mb-8">
                {[10, 20, 30, 50].map((discount) => {
                  const count = products.filter((p) => p.discount >= discount).length
                  if (count === 0) return null
                  return (
                    <Badge
                      key={discount}
                      variant="outline"
                      className="text-sm px-4 py-2 bg-red-50 border-red-200 text-red-600"
                    >
                      {discount}%+ {t("خصم", "off")} ({count})
                    </Badge>
                  )
                })}
              </div>

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
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Percent className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {t("لا توجد عروض حالياً", "No offers at the moment")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("تابعنا للحصول على أحدث العروض والخصومات", "Follow us for the latest offers and discounts")}
              </p>
              <Link href="/shop">
                <Button className="gap-2 bg-red-500 hover:bg-red-600">
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
