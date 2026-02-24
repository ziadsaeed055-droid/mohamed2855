"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCardPremium } from "@/components/product-card-premium"
import { useLanguage } from "@/contexts/language-context"
import type { Product } from "@/lib/types"
import { TrendingUp, Crown, ArrowRight, ArrowLeft, Package, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ChatWidget } from "@/components/chat-widget"
import { InlineLoader } from "@/components/premium-loader"

export default function BestSellersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage()
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        console.log("[v0] Fetching best sellers...")
        // First try to get products ordered by salesCount
        let productsData: Product[] = []

        try {
          const q = query(
            collection(db, "products"),
            where("isActive", "==", true),
            orderBy("salesCount", "desc"),
            limit(24),
          )
          const snapshot = await getDocs(q)
          productsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[]
        } catch {
          // If salesCount index doesn't exist, fall back to featured products
          console.log("[v0] Falling back to featured products")
          const q = query(
            collection(db, "products"),
            where("isActive", "==", true),
            where("isFeatured", "==", true),
            limit(24),
          )
          const snapshot = await getDocs(q)
          productsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[]
        }

        // If still no products, get all active products
        if (productsData.length === 0) {
          const q = query(collection(db, "products"), where("isActive", "==", true), limit(24))
          const snapshot = await getDocs(q)
          productsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[]
        }

        console.log("[v0] Best sellers fetched:", productsData.length)
        setProducts(productsData)
      } catch (error) {
        console.error("[v0] Error fetching best sellers:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBestSellers()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600" />
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/30">
              <Crown className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">{t("اختيار العملاء", "Customer's Choice")}</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <TrendingUp className="w-10 h-10 text-white/80" />
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white">
                {t("الأكثر مبيعًا", "Best Sellers")}
              </h1>
              <Star className="w-10 h-10 text-white/80 fill-white/80" />
            </div>

            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              {t(
                "المنتجات الأعلى طلباً والأكثر شعبية بين عملائنا",
                "The most popular and highest-selling products among our customers",
              )}
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-white/90 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                <Package className="w-5 h-5" />
                <span className="font-semibold">
                  {products.length} {products.length === 1 ? t("منتج رائج", "Trending Product") : t("منتجات رائجة", "Trending Products")}
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
            <InlineLoader text={t("جاري تحميل المنتجات الأكثر مبيعاً...", "Loading best sellers...")} />
          ) : products.length > 0 ? (
            <div className="space-y-8">
              {/* Top 3 Products - Featured Display */}
              {products.length >= 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {products.slice(0, 3).map((product, index) => (
                    <div key={product.id} className="relative">
                      <Badge
                        className={`absolute -top-3 start-4 z-10 text-white font-bold px-3 py-1 ${
                          index === 0 ? "bg-amber-500" : index === 1 ? "bg-gray-400" : "bg-amber-700"
                        }`}
                      >
                        #{index + 1} {t("الأكثر مبيعاً", "Best Seller")}
                      </Badge>
                      <ProductCardPremium
                        product={product}
                        className="animate-fade-in ring-2 ring-amber-200/50"
                        style={{ animationDelay: `${index * 100}ms` }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Rest of products */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.slice(3).map((product, index) => (
                  <ProductCardPremium
                    key={product.id}
                    product={product}
                    className="animate-fade-in"
                    style={{ animationDelay: `${(index + 3) * 50}ms` }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {t("لا توجد منتجات حالياً", "No products at the moment")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("تصفح متجرنا لاكتشاف منتجاتنا", "Browse our store to discover our products")}
              </p>
              <Link href="/shop">
                <Button className="gap-2 bg-amber-500 hover:bg-amber-600">
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
