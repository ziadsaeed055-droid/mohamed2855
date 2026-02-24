"use client"

import { useState, useEffect, memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useLanguage } from "@/contexts/language-context"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import { Star, ShoppingBag, ArrowRight, ArrowLeft, Sparkles, Award } from "lucide-react"

interface FeaturedProductData {
  productId: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  badges: string[]
  isActive: boolean
}

export const FeaturedProductSection = memo(function FeaturedProductSection() {
  const [featuredData, setFeaturedData] = useState<FeaturedProductData | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false) // تبدأ false
  const [mounted, setMounted] = useState(false)
  const { t, language } = useLanguage()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight

  useEffect(() => {
    setMounted(true)
    let isMounted = true
    
    const fetchFeaturedProduct = async () => {
      try {
        const settingsRef = doc(db, "settings", "featuredProduct")
        const settingsSnap = await getDoc(settingsRef)

        if (!isMounted) return

        if (settingsSnap.exists()) {
          const data = settingsSnap.data() as FeaturedProductData

          if (data.isActive && data.productId) {
            setFeaturedData(data)

            const productRef = doc(db, "products", data.productId)
            const productSnap = await getDoc(productRef)

            if (productSnap.exists() && isMounted) {
              setProduct({ id: productSnap.id, ...productSnap.data() } as Product)
            }
          }
        }
      } catch (error: any) {
        console.error("[v0] Error fetching featured product:", error.code, error.message)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchFeaturedProduct()
    
    return () => {
      isMounted = false
    }
  }, [])

  const handleAddToCart = () => {
    if (!product) return

    if (product.colors?.length > 0 || product.sizes?.length > 0) {
      if (typeof window !== "undefined") {
        window.location.href = `/product/${product.id}`
      }
      return
    }

    addToCart(product, "", "", 1)
    toast({
      title: t("تمت الإضافة", "Added"),
      description: t("تمت إضافة المنتج للسلة", "Product added to cart"),
    })
  }

  // عدم عرض أي شيء أثناء التحميل الأولي
  if (!mounted || !featuredData || !product) {
    return null
  }

  const name = language === "ar" ? product.nameAr : product.nameEn
  const customTitle = language === "ar" ? featuredData.titleAr : featuredData.titleEn
  const customDescription = language === "ar" ? featuredData.descriptionAr : featuredData.descriptionEn
  const price = product.discount > 0 ? product.discountedPrice : product.salePrice

  return (
    <section className="py-8 md:py-16 lg:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d3b66] via-[#1a4a7a] to-[#0d3b66]" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 start-20 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 end-20 w-96 h-96 bg-amber-300 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-2 md:px-3 relative">
        <div className="grid lg:grid-cols-2 gap-4 md:gap-8 lg:gap-16 items-center">
          {/* Image Side */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-square max-w-xs md:max-w-sm lg:max-w-lg mx-auto">
                {/* Decorative ring */}
                <div className="absolute inset-0 border-2 border-white/20 rounded-full animate-pulse" />
                <div className="absolute inset-4 border border-amber-400/30 rounded-full" />

                {/* Updated code to remove the white background and display the image without scale */}
                <div className="absolute inset-8 rounded-full overflow-hidden shadow-2xl">
                  <div className="relative w-full h-full">
                    <Image
                      src={product.mainImage || "/placeholder.svg?height=600&width=600&query=featured product"}
                      alt={name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 90vw, 50vw"
                      priority
                    />
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute top-12 end-0 flex flex-col gap-2">
                  {featuredData.badges
                    ?.filter((b) => b)
                    .map((badge, index) => (
                      <Badge
                        key={index}
                        className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 font-bold shadow-lg animate-bounce"
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        {badge}
                      </Badge>
                    ))}
                </div>

                {/* Award icon */}
                <div className="absolute bottom-12 start-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <Award className="w-8 h-8 text-amber-400" />
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="order-1 lg:order-2 text-white space-y-6">
              {/* Label */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <p className="text-amber-400 font-medium tracking-wider uppercase text-sm">
                    {t("اختيارنا المميز", "Our Featured Pick")}
                  </p>
                  <p className="text-white/60 text-sm">{t("منتج الأسبوع", "Product of the Week")}</p>
                </div>
              </div>

            {/* Title */}
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold font-serif leading-tight">
              {customTitle || name}
            </h2>

            {/* Description */}
            <p className="text-sm md:text-base text-white/80 leading-relaxed max-w-xl">
              {customDescription || (language === "ar" ? product.descriptionAr : product.descriptionEn)}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-amber-400">
                {price.toFixed(0)}
                <span className="text-lg md:text-xl ms-1">{t("ج.م", "EGP")}</span>
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-lg md:text-xl text-white/50 line-through">
                    {product.salePrice.toFixed(0)} {t("ج.م", "EGP")}
                  </span>
                  <Badge className="bg-red-500 text-white text-xs md:text-sm">-{product.discount}%</Badge>
                </>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 flex-wrap">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs md:text-sm text-white/60 ms-2">
                {t("تقييم ممتاز من عملائنا", "Excellent rating from our customers")}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-2 md:gap-4 pt-2 md:pt-4">
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-bold px-4 md:px-8 py-2 md:py-3 rounded-full shadow-xl group text-sm md:text-base"
              >
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 me-2" />
                {t("أضف للسلة", "Add to Cart")}
              </Button>
              <Link href={`/product/${product.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-4 md:px-8 py-2 md:py-3 rounded-full group bg-transparent text-sm md:text-base"
                >
                  {t("التفاصيل", "Details")}
                  <ArrowIcon className="w-4 h-4 md:w-5 md:h-5 ms-2 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})
