"use client"

import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { useCart } from "@/contexts/cart-context"
import { COLORS, PRODUCT_TYPES, OUTFIT_ITEM_TYPES } from "@/lib/types"
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Layers,
  Gift,
  CreditCard,
  Wand2,
  RefreshCw,
  Package,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { ProductCard } from "@/components/product-card"

const productTypeIcons = {
  single: Package,
  outfit: Layers,
  bundle: Gift,
  gift: CreditCard,
  custom: Wand2,
  subscription: RefreshCw,
}

const productTypeColors = {
  single: "bg-blue-100 text-blue-700",
  outfit: "bg-purple-100 text-purple-700",
  bundle: "bg-amber-100 text-amber-700",
  gift: "bg-pink-100 text-pink-700",
  custom: "bg-emerald-100 text-emerald-700",
  subscription: "bg-cyan-100 text-cyan-700",
}

export default function CartPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart()
  const { t, language } = useLanguage()

  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight
  const BackArrow = language === "ar" ? ArrowRight : ArrowLeft

  if (items.length === 0) {
    return (
      <main className="min-h-screen">
        <Header />
        <section className="pt-16 md:pt-20 pb-16 min-h-[60vh] flex items-center">
          <div className="container mx-auto px-4 text-center">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground/50 mb-6" />
            <h1 className="text-3xl font-bold mb-4">{t("سلة التسوق فارغة", "Your Cart is Empty")}</h1>
            <p className="text-muted-foreground mb-8">
              {t("لم تقم بإضافة أي منتجات بعد", "You haven't added any products yet")}
            </p>
            <Link href="/shop">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <BackArrow className="h-5 w-5 me-2" />
                {t("تصفح المتجر", "Browse Shop")}
              </Button>
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 animate-slide-up">{t("سلة التسوق", "Shopping Cart")}</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => {
                const name = language === "ar" ? item.product.nameAr : item.product.nameEn
                const price = item.product.discount > 0 ? item.product.discountedPrice : item.product.salePrice
                const colorName = COLORS.find((c) => c.hex === item.selectedColor)?.[
                  language === "ar" ? "nameAr" : "nameEn"
                ]
                const productType = item.product.productType || "single"
                const TypeIcon = productTypeIcons[productType as keyof typeof productTypeIcons] || Package
                const isOutfit = productType === "outfit"

                return (
                  <div
                    key={`${item.productId}-${item.selectedColor}-${item.selectedSize}`}
                    className={cn(
                      "p-4 bg-card rounded-xl border animate-scale-in",
                      isOutfit && "border-purple-200 bg-purple-50/30",
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <Link
                        href={`/product/${item.productId}`}
                        className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0"
                      >
                        <Image
                          src={item.product.mainImage || "/placeholder.svg?height=128&width=128&query=clothing"}
                          alt={name}
                          fill
                          className="object-cover rounded-lg"
                        />
                        {productType !== "single" && (
                          <div
                            className={cn(
                              "absolute -top-2 -start-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md",
                              productTypeColors[productType as keyof typeof productTypeColors],
                            )}
                          >
                            <TypeIcon className="w-4 h-4" />
                          </div>
                        )}
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link href={`/product/${item.productId}`}>
                              <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
                                {name}
                              </h3>
                            </Link>
                            {productType !== "single" && (
                              <Badge
                                className={cn(
                                  "mt-1 text-xs",
                                  productTypeColors[productType as keyof typeof productTypeColors],
                                )}
                              >
                                <TypeIcon className="w-3 h-3 me-1" />
                                {t(
                                  PRODUCT_TYPES.find((pt) => pt.id === productType)?.nameAr || "",
                                  PRODUCT_TYPES.find((pt) => pt.id === productType)?.nameEn || "",
                                )}
                              </Badge>
                            )}
                          </div>
                          {/* Remove */}
                          <button
                            onClick={() => removeFromCart(item.productId, item.selectedColor, item.selectedSize)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: item.selectedColor }}
                            />
                            {colorName}
                          </span>
                          <span>•</span>
                          <span>
                            {t("المقاس:", "Size:")} {item.selectedSize}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity */}
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.selectedColor, item.selectedSize, item.quantity - 1)
                              }
                              className="p-2 hover:bg-muted transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.selectedColor, item.selectedSize, item.quantity + 1)
                              }
                              className="p-2 hover:bg-muted transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-end">
                            <p className="font-bold text-primary">
                              {(price * item.quantity).toFixed(2)} {t("ج.م", "EGP")}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground">
                                {price.toFixed(2)} × {item.quantity}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Outfit Items Display */}
                    {isOutfit && item.product.outfitItems && item.product.outfitItems.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-purple-200">
                        <p className="text-xs font-medium text-purple-700 mb-2 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {t("مكونات الطقم", "Outfit Components")} ({item.product.outfitItems.length}{" "}
                          {t("قطع", "pieces")})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.product.outfitItems.map((outfitItem, idx) => {
                            const itemType = OUTFIT_ITEM_TYPES.find((t) => t.id === outfitItem.type)
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg text-xs border border-purple-100"
                              >
                                {outfitItem.image ? (
                                  <div className="relative w-6 h-6 rounded overflow-hidden">
                                    <Image
                                      src={outfitItem.image || "/placeholder.svg"}
                                      alt={outfitItem.nameAr}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <Package className="w-4 h-4 text-purple-400" />
                                )}
                                <span className="text-slate-700">
                                  {language === "ar" ? outfitItem.nameAr : outfitItem.nameEn}
                                </span>
                                {item.product.outfitSizeType === "individual" && item.outfitSizes?.[idx] && (
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                    {item.outfitSizes[idx]}
                                  </Badge>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Clear Cart */}
              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive bg-transparent"
                >
                  <Trash2 className="h-4 w-4 me-2" />
                  {t("مسح السلة", "Clear Cart")}
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-card rounded-xl border p-6 space-y-6 animate-slide-in-right">
                <h2 className="text-xl font-bold">{t("ملخص الطلب", "Order Summary")}</h2>

                {/* Items breakdown by type */}
                <div className="space-y-2">
                  {(() => {
                    const outfitCount = items.filter((i) => i.product.productType === "outfit").length
                    const singleCount = items.filter(
                      (i) => !i.product.productType || i.product.productType === "single",
                    ).length
                    const bundleCount = items.filter((i) => i.product.productType === "bundle").length

                    return (
                      <>
                        {singleCount > 0 && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Package className="w-4 h-4" />
                            <span>
                              {singleCount} {t("منتج فردي", "single product")}
                              {singleCount > 1 && t("ات", "s")}
                            </span>
                          </div>
                        )}
                        {outfitCount > 0 && (
                          <div className="flex items-center gap-2 text-sm text-purple-600">
                            <Layers className="w-4 h-4" />
                            <span>
                              {outfitCount} {t("طقم", "outfit")}
                              {outfitCount > 1 && t("ات", "s")}
                            </span>
                          </div>
                        )}
                        {bundleCount > 0 && (
                          <div className="flex items-center gap-2 text-sm text-amber-600">
                            <Gift className="w-4 h-4" />
                            <span>
                              {bundleCount} {t("باقة", "bundle")}
                              {bundleCount > 1 && t("ات", "s")}
                            </span>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>

                <div className="space-y-3 text-sm border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("المجموع الفرعي", "Subtotal")}</span>
                    <span>
                      {getTotal().toFixed(2)} {t("ج.م", "EGP")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("الشحن", "Shipping")}</span>
                    <span className="text-green-600">{t("مجاني", "Free")}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t("الإجمالي", "Total")}</span>
                    <span className="text-primary">
                      {getTotal().toFixed(2)} {t("ج.م", "EGP")}
                    </span>
                  </div>
                </div>

                <Link href="/checkout" className="block">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                    {t("إتمام الشراء", "Checkout")}
                    <ArrowIcon className="h-5 w-5 ms-2" />
                  </Button>
                </Link>

                <Link href="/shop" className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    <BackArrow className="h-5 w-5 me-2" />
                    {t("متابعة التسوق", "Continue Shopping")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Recommended Products */}
          <div className="mt-16 pt-12 border-t">
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">{t("قد تعجبك", "You Might Like")}</h2>
                </div>
                <p className="text-muted-foreground">
                  {t("اكتشف منتجات أخرى قد تهتم بها", "Discover other products that might interest you")}
                </p>
              </div>

              {/* Recommended Products - Show 4 products */}
              <RecommendedProducts />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

// Recommended Products Component
function RecommendedProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("isActive", "==", true),
          orderBy("createdAt", "desc"),
          limit(4),
        )
        const snapshot = await getDocs(q)
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setProducts(productsData)
      } catch (error) {
        console.error("[v0] Error fetching recommended products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecommended()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        />
      ))}
    </div>
  )
}
