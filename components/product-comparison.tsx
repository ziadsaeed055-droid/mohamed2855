"use client"

import { useState, useEffect } from "react"
import { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Check, Minus, Star } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import Image from "next/image"
import Link from "next/link"

interface ProductComparisonProps {
  productIds: string[]
  onClose: () => void
}

export function ProductComparison({ productIds, onClose }: ProductComparisonProps) {
  const { t, language } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { doc, getDoc } = await import("firebase/firestore")
        const { db } = await import("@/lib/firebase")
        
        const fetchedProducts: Product[] = []
        for (const productId of productIds) {
          try {
            const productDoc = await getDoc(doc(db, "products", productId))
            if (productDoc.exists()) {
              const productData = productDoc.data()
              if (productData && productData.nameEn && productData.mainImage) {
                fetchedProducts.push({
                  id: productDoc.id,
                  ...productData
                } as Product)
              }
            }
          } catch (err) {
            console.warn(`Could not fetch product ${productId}`)
          }
        }
        
        setProducts(fetchedProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    if (productIds.length > 0) {
      fetchProducts()
    }
  }, [productIds])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-background rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        </div>
      </div>
    )
  }

  const features = [
    { key: "price", label: { ar: "السعر", en: "Price" } },
    { key: "category", label: { ar: "الفئة", en: "Category" } },
    { key: "colors", label: { ar: "الألوان المتاحة", en: "Available Colors" } },
    { key: "sizes", label: { ar: "المقاسات المتاحة", en: "Available Sizes" } },
    { key: "stock", label: { ar: "المخزون", en: "Stock" } },
    { key: "rating", label: { ar: "التقييم", en: "Rating" } },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-auto">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto bg-background rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold">
              {t("مقارنة المنتجات", "Product Comparison")}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-right sticky left-0 bg-background z-10">
                    {t("المواصفة", "Feature")}
                  </th>
                  {products.map(product => (
                    <th key={product.id} className="p-4 min-w-[250px]">
                      <Link href={`/product/${product.id}`}>
                        <div className="space-y-3 hover:opacity-80 transition-opacity">
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={product.images?.[0] || "/placeholder.png"}
                              alt={language === "ar" ? product.name_ar : product.name_en}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="text-sm font-semibold line-clamp-2">
                            {language === "ar" ? product.name_ar : product.name_en}
                          </div>
                        </div>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr key={feature.key} className={idx % 2 === 0 ? "bg-muted/30" : ""}>
                    <td className="p-4 font-semibold sticky left-0 bg-background z-10">
                      {language === "ar" ? feature.label.ar : feature.label.en}
                    </td>
                    {products.map(product => (
                      <td key={product.id} className="p-4 text-center">
                        {feature.key === "price" && (
                          <div className="font-bold text-primary text-lg">
                            {product.price} {t("ج.م", "EGP")}
                          </div>
                        )}
                        {feature.key === "category" && (
                          <div>{language === "ar" ? product.category_ar : product.category_en}</div>
                        )}
                        {feature.key === "colors" && (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {product.colors?.slice(0, 5).map((color, i) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full border-2 border-border"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                            {(product.colors?.length || 0) > 5 && (
                              <div className="text-xs text-muted-foreground">
                                +{(product.colors?.length || 0) - 5}
                              </div>
                            )}
                          </div>
                        )}
                        {feature.key === "sizes" && (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {product.sizes?.slice(0, 4).map((size, i) => (
                              <div key={i} className="px-2 py-1 text-xs rounded bg-muted">
                                {size}
                              </div>
                            ))}
                            {(product.sizes?.length || 0) > 4 && (
                              <div className="text-xs text-muted-foreground">
                                +{(product.sizes?.length || 0) - 4}
                              </div>
                            )}
                          </div>
                        )}
                        {feature.key === "stock" && (
                          <div className="flex items-center justify-center gap-2">
                            {product.inStock ? (
                              <>
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-green-600">
                                  {t("متوفر", "In Stock")}
                                </span>
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 text-red-500" />
                                <span className="text-red-600">
                                  {t("غير متوفر", "Out of Stock")}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                        {feature.key === "rating" && (
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">
                              {product.rating || 0}
                            </span>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-6 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              {t("إغلاق", "Close")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
