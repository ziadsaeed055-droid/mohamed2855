"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { findSubCategoryById, type Product } from "@/lib/types"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SubCategoryPage({ params }: PageProps) {
  const { language } = useLanguage()
  const [id, setId] = useState<string | null>(null)
  const [subCategory, setSubCategory] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    window.scrollTo(0, 0)
    params.then((p) => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return

    const found = findSubCategoryById(id)
    if (found) {
      setSubCategory({ ...found.subCategory, parentCategoryId: found.category.id })
    }

    const fetchProducts = async () => {
      try {
        setLoading(true)
        const q = query(collection(db, "products"), where("subCategory", "==", id), where("isActive", "==", true))
        const snapshot = await getDocs(q)

        let items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]

        // Sort
        if (sortBy === "price-low") items.sort((a, b) => (a.salePrice || a.costPrice) - (b.salePrice || b.costPrice))
        else if (sortBy === "price-high") items.sort((a, b) => (b.salePrice || b.costPrice) - (a.salePrice || a.costPrice))
        else if (sortBy === "popular") items.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))

        setProducts(items)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [id, sortBy])

  if (!id || !subCategory) {
    return null
  }

  const breadcrumbLabel = language === "ar" ? subCategory.nameAr : subCategory.nameEn

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-sm">
          <Link href="/" className="text-blue-600 hover:underline">
            {language === "ar" ? "الرئيسية" : "Home"}
          </Link>
          {language === "ar" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          <span className="text-gray-600">{breadcrumbLabel}</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 py-8 md:py-12 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{breadcrumbLabel}</h1>
          <p className="text-gray-600">
            {language === "ar" ? `عرض ${products.length} منتج` : `Showing ${products.length} products`}
          </p>
        </div>
      </div>

      {/* Filters & Content */}
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Sort */}
        <div className="mb-8 flex justify-between items-center">
          <p className="text-gray-600 font-semibold">{language === "ar" ? "الترتيب" : "Sort By"}</p>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{language === "ar" ? "الأحدث" : "Newest"}</SelectItem>
              <SelectItem value="price-low">{language === "ar" ? "السعر: الأقل أولاً" : "Price: Low to High"}</SelectItem>
              <SelectItem value="price-high">{language === "ar" ? "السعر: الأعلى أولاً" : "Price: High to Low"}</SelectItem>
              <SelectItem value="popular">{language === "ar" ? "الأكثر شهرة" : "Most Popular"}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full h-64 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {language === "ar" ? "لا توجد منتجات في هذه الفئة حالياً" : "No products in this category yet"}
            </p>
            <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
              {language === "ar" ? "العودة إلى الرئيسية" : "Back to Home"}
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
