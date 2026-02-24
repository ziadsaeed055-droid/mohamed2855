"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { collection, query, where, getDocs, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import type { Product } from "@/lib/types"
import { Loader2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react"

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t, language } = useLanguage()
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null)
        console.log("[v0] Fetching featured products...")
        const q = query(collection(db, "products"), where("isFeatured", "==", true), limit(8))
        const snapshot = await getDocs(q)
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]
        console.log("[v0] Featured products fetched:", productsData.length)
        setProducts(productsData)
      } catch (error) {
        console.error("[v0] Error fetching featured products:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error"

        if (errorMessage.includes("permission")) {
          setError("Permission denied. Check Firebase Rules.")
          console.error("[v0] Firebase Rules issue - check your security rules")
        } else {
          setError("Failed to load products")
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-24">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <span className="text-muted-foreground">{t("جاري التحميل...", "Loading...")}</span>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center p-8 bg-destructive/10 rounded-lg">
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-gradient-to-b from-background via-slate-50 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">{t("المنتجات المميزة", "Featured Products")}</h2>
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("تصفح أفضل منتجاتنا المختارة بعناية", "Browse our handpicked selection of premium products")}
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-28 mb-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} className="animate-scale-in" />
              ))}
            </div>

            {/* View All Button */}
            <div className="flex justify-center">
              <Link href="/shop">
                <Button size="lg" className="gap-2">
                  {t("عرض جميع المنتجات", "View All Products")}
                  <ArrowIcon className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("لا توجد منتجات مميزة الآن", "No featured products yet")}</p>
          </div>
        )}
      </div>
    </section>
  )
}
