"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ProductCardPremium } from "@/components/product-card-premium"
import { useLanguage } from "@/contexts/language-context"
import type { Product } from "@/lib/types"
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimilarProductsSectionProps {
  currentProduct: Product
}

export function SimilarProductsSection({ currentProduct }: SimilarProductsSectionProps) {
  const { t, language } = useLanguage()
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollContainerRef = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        console.log("[v0] Fetching similar products for:", currentProduct.id)

        // Strategy 1: Get manually selected related products
        let products: Product[] = []

        if (currentProduct.relatedProductIds && currentProduct.relatedProductIds.length > 0) {
          console.log("[v0] Found", currentProduct.relatedProductIds.length, "manually selected related products")

          // Fetch each related product
          for (const productId of currentProduct.relatedProductIds) {
            try {
              const docRef = doc(db, "products", productId)
              const docSnap = await getDoc(docRef)
              if (docSnap.exists()) {
                products.push({ id: docSnap.id, ...docSnap.data() } as Product)
              }
            } catch (error) {
              console.error("[v0] Error fetching related product:", productId, error)
            }
          }
        }

        // Strategy 2: Find products with matching tags
        if (currentProduct.tags && currentProduct.tags.length > 0 && products.length < 8) {
          console.log("[v0] Searching by tags:", currentProduct.tags)

          const productsRef = collection(db, "products")
          const q = query(productsRef, where("isActive", "==", true))
          const snapshot = await getDocs(q)

          const tagMatchedProducts = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }) as Product)
            .filter((product) => {
              // Exclude current product and already selected products
              if (product.id === currentProduct.id) return false
              if (products.some((p) => p.id === product.id)) return false

              // Check if product has any matching tags
              if (!product.tags || product.tags.length === 0) return false

              const matchingTags = product.tags.filter((tag) => currentProduct.tags?.includes(tag))

              return matchingTags.length > 0
            })
            .sort((a, b) => {
              // Sort by number of matching tags (descending)
              const aMatches = a.tags?.filter((tag) => currentProduct.tags?.includes(tag)).length || 0
              const bMatches = b.tags?.filter((tag) => currentProduct.tags?.includes(tag)).length || 0
              return bMatches - aMatches
            })

          console.log("[v0] Found", tagMatchedProducts.length, "products by tags")
          products = [...products, ...tagMatchedProducts.slice(0, 8 - products.length)]
        }

        // Strategy 3: Fallback to same category products
        if (products.length < 4) {
          console.log("[v0] Fallback: Searching by category:", currentProduct.category)

          const productsRef = collection(db, "products")
          const q = query(productsRef, where("category", "==", currentProduct.category), where("isActive", "==", true))
          const snapshot = await getDocs(q)

          const categoryProducts = snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }) as Product)
            .filter((product) => {
              if (product.id === currentProduct.id) return false
              if (products.some((p) => p.id === product.id)) return false
              return true
            })
            .slice(0, 8 - products.length)

          console.log("[v0] Found", categoryProducts.length, "products by category")
          products = [...products, ...categoryProducts]
        }

        console.log("[v0] Total similar products found:", products.length)
        setSimilarProducts(products)
      } catch (error) {
        console.error("[v0] Error fetching similar products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarProducts()
  }, [currentProduct])

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef[0]
    if (!container) return

    const scrollAmount = direction === "left" ? -300 : 300
    container.scrollBy({ left: scrollAmount, behavior: "smooth" })
  }

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    )
  }

  if (similarProducts.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                {t("منتجات مشابهة ومكملة", "Similar & Complementary Products")}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {t("قد تعجبك هذه المنتجات أيضاً", "You might also like these products")}
              </p>
            </div>
          </div>

          {/* Navigation Buttons - Desktop */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all"
              aria-label={t("السابق", "Previous")}
            >
              {language === "ar" ? (
                <ChevronRight className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              )}
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all"
              aria-label={t("التالي", "Next")}
            >
              {language === "ar" ? (
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Products Carousel */}
        <div
          ref={(el) => {
            scrollContainerRef[0] = el
          }}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {similarProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-64">
              <ProductCardPremium product={product} />
            </div>
          ))}
        </div>

        {/* Mobile Navigation Dots */}
        <div className="flex md:hidden justify-center gap-2 mt-4">
          {Array.from({ length: Math.ceil(similarProducts.length / 2) }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === Math.floor(scrollPosition / 2) ? "bg-primary w-6" : "bg-slate-300",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
