"use client"

import { useCallback } from "react"

import { useMemo } from "react"

import type React from "react"
import { useState, memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Eye, Sparkles, Clock, TrendingUp, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ProductCardPremiumProps {
  product: Product
  className?: string
  style?: React.CSSProperties
}

export const ProductCardPremium = memo(function ProductCardPremium({ product, className, style }: ProductCardPremiumProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const { t, language } = useLanguage()
  const { addToCart } = useCart()
  const { toast } = useToast()

  // استخدام useMemo للقيم المحسوبة
  const price = useMemo(() => 
    product.discount > 0 ? product.discountedPrice : product.salePrice, 
    [product.discount, product.discountedPrice, product.salePrice]
  )
  
  const name = useMemo(() => 
    language === "ar" ? product.nameAr : product.nameEn,
    [language, product.nameAr, product.nameEn]
  )

  const handleQuickAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.colors?.length > 0 && product.sizes?.length > 0) {
      addToCart(product, product.colors[0], product.sizes[0])
      toast({
        title: t("تمت الإضافة", "Added to Cart"),
        description: t("تمت إضافة المنتج للسلة بنجاح", "Product added successfully"),
      })
    } else {
      toast({
        title: t("تنبيه", "Notice"),
        description: t("يرجى اختيار اللون والمقاس من صفحة المنتج", "Please select options from product page"),
      })
    }
  }, [product, addToCart, toast, t])

  const handleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(prev => !prev)
    toast({
      title: !isWishlisted ? t("تمت الإضافة", "Added") : t("تمت الإزالة", "Removed"),
      description: !isWishlisted
        ? t("تمت إضافة المنتج للمفضلة", "Added to wishlist")
        : t("تمت إزالة المنتج من المفضلة", "Removed from wishlist"),
    })
  }, [isWishlisted, toast, t])

  return (
    <Link href={`/product/${product.id}`}>
      <div
        className={cn(
          "group relative bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100 transition-all duration-300",
          isHovered && "shadow-xl -translate-y-1",
          className,
        )}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="relative w-full h-full">
            <Image
              src={product.mainImage || "/placeholder.svg?height=600&width=480&query=premium fashion product"}
              alt={name}
              fill
              className={cn(
                "object-cover transition-transform duration-300",
                imageLoaded ? "opacity-100" : "opacity-0",
                isHovered && "scale-105"
              )}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              priority={false}
              loading="lazy"
              quality={75}
            />
          </div>

          <div className="absolute top-2 start-2 flex flex-col gap-1 z-20">
            {product.discount > 0 && (
              <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md font-bold px-2 py-0.5 text-xs">
                -{product.discount}%
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 shadow-md flex items-center gap-1 px-2 py-0.5 text-xs font-semibold">
                <Sparkles className="w-3 h-3" />
                {t("مميز", "Featured")}
              </Badge>
            )}
            {product.quantity <= product.alertQuantity && product.quantity > 0 && (
              <Badge className="bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md flex items-center gap-1 px-2 py-0.5 text-xs font-semibold">
                <Clock className="w-3 h-3" />
                {t("محدودة", "Limited")}
              </Badge>
            )}
          </div>

          <button
            onClick={handleWishlist}
            className={cn(
              "absolute top-2 end-2 w-8 h-8 rounded-full shadow-md transition-all duration-300 z-20 flex items-center justify-center",
              isWishlisted
                ? "bg-red-500 text-white scale-110"
                : "bg-white/90 backdrop-blur-sm hover:bg-white text-slate-600 hover:text-red-500 hover:scale-110",
            )}
          >
            <Heart className={cn("w-4 h-4 transition-all", isWishlisted && "fill-current")} />
          </button>

          <div
            className={cn(
              "absolute inset-x-2 bottom-2 flex gap-2 transition-all duration-300 z-20",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
            )}
          >
            <Button
              onClick={handleQuickAdd}
              className="flex-1 gap-1.5 bg-[#0d3b66] hover:bg-[#0d3b66]/90 text-white h-9 text-xs font-semibold rounded-lg shadow-lg"
            >
              <ShoppingCart className="w-4 h-4" />
              {t("أضف", "Add")}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 bg-white hover:bg-slate-50 text-slate-800 rounded-lg shadow-lg"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>

          {product.quantity === 0 && (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-10">
              <Badge className="bg-slate-800 text-white text-xs px-3 py-1">{t("نفذ المخزون", "Sold Out")}</Badge>
            </div>
          )}
        </div>

        <div className="p-3 space-y-2">
          <h3 className="font-bold text-slate-900 group-hover:text-[#0d3b66] transition-colors line-clamp-2 text-sm leading-tight min-h-[2.5rem]">
            {name}
          </h3>

          <div className="flex items-center justify-between gap-2">
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 font-medium">{t("الألوان:", "Colors:")}</span>
                <div className="flex items-center gap-1">
                  {product.colors.slice(0, 3).map((color, index) => (
                    <div
                      key={index}
                      className="relative w-4 h-4 rounded-full border border-white shadow-sm ring-1 ring-slate-200"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  {product.colors.length > 3 && (
                    <span className="text-[10px] text-slate-600 font-semibold bg-slate-100 px-1.5 py-0.5 rounded-full">
                      +{product.colors.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 font-medium">{t("المقاسات:", "Sizes:")}</span>
                <div className="flex items-center gap-1">
                  {product.sizes.slice(0, 2).map((size, index) => (
                    <span
                      key={index}
                      className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded"
                    >
                      {size}
                    </span>
                  ))}
                  {product.sizes.length > 2 && (
                    <span className="text-[10px] text-slate-600 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                      +{product.sizes.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-[#0d3b66]">{price?.toFixed(0)}</span>
                <span className="text-xs text-slate-600 font-medium">{t("ج.م", "EGP")}</span>
              </div>
              {product.discount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400 line-through">{product.salePrice?.toFixed(0)}</span>
                  <span className="text-xs text-red-500 font-semibold">
                    {t("وفر", "Save")} {(product.salePrice - price).toFixed(0)}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleQuickAdd}
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0d3b66] to-[#1a4a7a] hover:from-[#1a4a7a] hover:to-[#0d3b66] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>

          {(product.isFeatured || product.discount > 0) && (
            <div className="flex items-center gap-2 text-xs pt-1">
              {product.isFeatured && (
                <div className="flex items-center gap-1 text-amber-600">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-medium">{t("الأكثر مبيعاً", "Best Seller")}</span>
                </div>
              )}
              {product.discount > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <Package className="w-3 h-3" />
                  <span className="font-medium">{t("شحن مجاني", "Free Shipping")}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
})
