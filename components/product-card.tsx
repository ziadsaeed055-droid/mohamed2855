"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Heart,
  ShoppingBag,
  Eye,
  Star,
  Sparkles,
  Layers,
  Gift,
  CreditCard,
  Wand2,
  RefreshCw,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import { PRODUCT_TYPES } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  className?: string
  style?: React.CSSProperties
  viewMode?: "grid" | "list"
}

const productTypeIcons = {
  single: Package,
  outfit: Layers,
  bundle: Gift,
  gift: CreditCard,
  custom: Wand2,
  subscription: RefreshCw,
}

const productTypeColors = {
  single: "bg-blue-500",
  outfit: "bg-purple-500",
  bundle: "bg-amber-500",
  gift: "bg-pink-500",
  custom: "bg-emerald-500",
  subscription: "bg-cyan-500",
}

export function ProductCard({ product, className, style, viewMode = "grid" }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const { t, language } = useLanguage()
  const { addToCart } = useCart()
  const { toast } = useToast()

  const price = product.discount > 0 ? product.discountedPrice : product.salePrice
  const name = language === "ar" ? product.nameAr : product.nameEn
  const productType = product.productType || "single"
  const TypeIcon = productTypeIcons[productType as keyof typeof productTypeIcons] || Package

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // For gift cards, redirect to product page
    if (productType === "gift") {
      toast({
        title: t("تنبيه", "Notice"),
        description: t("يرجى اختيار قيمة البطاقة من صفحة المنتج", "Please select card value from product page"),
      })
      return
    }

    if (product.colors?.length > 0 && product.sizes?.length > 0) {
      addToCart(product, product.colors[0], product.sizes[0])
      toast({
        title: t("تمت الإضافة", "Added to Cart"),
        description:
          productType === "outfit"
            ? t("تمت إضافة الطقم للسلة بنجاح", "Outfit added to cart successfully")
            : t("تمت إضافة المنتج للسلة بنجاح", "Product added to cart successfully"),
      })
    } else {
      toast({
        title: t("تنبيه", "Notice"),
        description: t("يرجى اختيار اللون والمقاس من صفحة المنتج", "Please select color and size from product page"),
      })
    }
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
    toast({
      title: isWishlisted ? t("تمت الإزالة", "Removed") : t("تمت الإضافة", "Added"),
      description: isWishlisted
        ? t("تمت إزالة المنتج من المفضلة", "Removed from wishlist")
        : t("تمت إضافة المنتج للمفضلة", "Added to wishlist"),
    })
  }

  // Get product type label
  const getProductTypeLabel = () => {
    const typeInfo = PRODUCT_TYPES.find((pt) => pt.id === productType)
    if (!typeInfo || productType === "single") return null
    return t(typeInfo.nameAr, typeInfo.nameEn)
  }

  if (viewMode === "list") {
    return (
      <Link href={`/product/${product.id}`}>
        <div
          className={cn(
            "group relative bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#1a365d]/30",
            className,
          )}
          style={style}
        >
          <div className="flex gap-5 p-4">
            {/* Image */}
            <div className="relative w-32 h-32 md:w-44 md:h-44 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
              <Image
                src={product.mainImage || "/placeholder.svg?height=200&width=200&query=fashion clothing"}
                alt={name}
                fill
                className={cn(
                  "object-cover transition-all duration-500 group-hover:scale-105",
                  imageLoaded ? "opacity-100" : "opacity-0",
                )}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-slate-200" />}

              {/* Badges */}
              <div className="absolute top-2 start-2 flex flex-col gap-1.5">
                {product.discount > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 font-bold">-{product.discount}%</Badge>
                )}
                {product.isFeatured && (
                  <Badge className="bg-amber-500 text-white text-xs px-2 py-0.5 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    {t("مميز", "Featured")}
                  </Badge>
                )}
                {productType && productType !== "single" && (
                  <Badge
                    className={cn(
                      "text-white text-xs px-2 py-0.5 flex items-center gap-1",
                      productTypeColors[productType as keyof typeof productTypeColors],
                    )}
                  >
                    <TypeIcon className="w-3 h-3" />
                    {getProductTypeLabel()}
                  </Badge>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div className="space-y-2">
                <h3 className="font-bold text-foreground group-hover:text-[#1a365d] transition-colors line-clamp-2 text-lg">
                  {name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {language === "ar" ? product.descriptionAr : product.descriptionEn}
                </p>

                {/* Outfit items count */}
                {productType === "outfit" && product.outfitItems && (
                  <p className="text-xs text-purple-600 font-medium flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {product.outfitItems.length} {t("قطع", "pieces")}
                  </p>
                )}

                {/* Colors */}
                {product.colors?.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {product.colors.slice(0, 5).map((color) => (
                      <span
                        key={color}
                        className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    {product.colors.length > 5 && (
                      <span className="text-xs text-muted-foreground font-medium">+{product.colors.length - 5}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-[#1a365d]">
                    {price?.toFixed(0)} {t("ج.م", "EGP")}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-sm text-muted-foreground line-through">{product.salePrice?.toFixed(0)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleWishlist}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:bg-red-50"
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5 transition-colors",
                        isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground",
                      )}
                    />
                  </Button>
                  <Button
                    onClick={handleQuickAdd}
                    className="h-10 gap-2 px-5 bg-[#1a365d] hover:bg-[#1a365d]/90 rounded-xl"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {t("إضافة", "Add")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/product/${product.id}`}>
      <div
        className={cn("group relative cursor-pointer", className)}
        style={style}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 h-80 md:h-96">
          <Image
            src={product.mainImage || "/placeholder.svg?height=600&width=400&query=fashion clothing product"}
            alt={name}
            fill
            className={cn(
              "object-cover transition-all duration-500 md:duration-700 group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-slate-200" />}

          {/* Badges */}
          <div className="absolute top-3 start-3 flex flex-col gap-2 z-10">
            {product.discount > 0 && (
              <Badge className="bg-red-500 text-white shadow-lg font-bold px-2.5 py-1">-{product.discount}%</Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-amber-500 text-white shadow-lg flex items-center gap-1 px-2.5 py-1">
                <Sparkles className="w-3 h-3" />
                {t("مميز", "Featured")}
              </Badge>
            )}
            {productType && productType !== "single" && (
              <Badge
                className={cn(
                  "text-white shadow-lg flex items-center gap-1 px-2.5 py-1",
                  productTypeColors[productType as keyof typeof productTypeColors],
                )}
              >
                <TypeIcon className="w-3 h-3" />
                {getProductTypeLabel()}
              </Badge>
            )}
            {product.quantity <= product.alertQuantity && product.quantity > 0 && (
              <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm shadow-lg text-orange-600 font-medium">
                {t("كمية محدودة", "Limited")}
              </Badge>
            )}
            {product.quantity === 0 && (
              <Badge className="bg-slate-800 text-white shadow-lg">{t("نفذ المخزون", "Sold Out")}</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className={cn(
              "absolute top-3 end-3 p-2.5 rounded-full shadow-lg transition-all duration-300 z-20",
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white/95 backdrop-blur-sm hover:bg-white text-slate-600 hover:text-red-500",
            )}
          >
            <Heart className={cn("w-5 h-5 transition-all", isWishlisted && "fill-current")} />
          </button>

          {/* Hover Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-[#1a365d]/90 via-[#1a365d]/30 to-transparent flex flex-col justify-end p-4 transition-all duration-300 md:duration-500 z-10",
              isHovered ? "opacity-100" : "opacity-0",
            )}
          >
            <div
              className="flex gap-2 transform transition-all duration-300 md:duration-500"
              style={{
                transform: isHovered ? "translateY(0)" : "translateY(20px)",
              }}
            >
              <Button
                onClick={handleQuickAdd}
                className="flex-1 gap-2 bg-white text-[#1a365d] hover:bg-white/90 h-11 font-semibold rounded-xl"
              >
                <ShoppingBag className="w-4 h-4" />
                {productType === "outfit" ? t("أضف الطقم", "Add Outfit") : t("أضف للسلة", "Add to Cart")}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-11 w-11 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 rounded-xl"
              >
                <Eye className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-2 md:mt-3 space-y-1.5 px-1 w-full overflow-hidden">
          <h3 className="font-semibold text-foreground group-hover:text-[#1a365d] transition-colors line-clamp-1 text-xs md:text-sm">
            {name}
          </h3>

          {/* Outfit items preview */}
          {productType === "outfit" && product.outfitItems && product.outfitItems.length > 0 && (
            <p className="text-xs text-purple-600 font-medium flex items-center gap-1 truncate">
              <Layers className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{product.outfitItems.length} {t("قطع في الطقم", "pieces in set")}</span>
            </p>
          )}

          {/* Colors Preview */}
          {product.colors?.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {product.colors.slice(0, 3).map((color) => (
                <span
                  key={color}
                  className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200 flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-xs text-muted-foreground font-medium">+{product.colors.length - 3}</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-sm md:text-base font-bold text-[#1a365d] whitespace-nowrap">
              {price?.toFixed(0)} {t("ج.م", "EGP")}
            </span>
            {product.discount > 0 && (
              <span className="text-xs text-muted-foreground line-through truncate">
                {product.salePrice?.toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
