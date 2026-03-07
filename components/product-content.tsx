"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { doc, getDoc, updateDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useRecentlyViewed } from "@/contexts/recently-viewed-context"
import { useToast } from "@/hooks/use-toast"
import type { Product, ColorSelection } from "@/lib/types"
import { COLORS, getColorVariantById } from "@/lib/types"
import {
  Minus, Plus, Heart, Share2, Truck, Shield, RotateCcw,
  ShoppingBag, ChevronLeft, ChevronRight, Star, Check,
  Package, Eye, ThumbsUp, AlertCircle, CheckCircle2,
  MessageCircle, Facebook, Copy
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SimilarProductsSection } from "@/components/similar-products-section"
import { FullPageLoader } from "@/components/premium-loader"
import { ColorSearchSelector } from "@/components/color-search-selector"
import { ColorQuickSelect } from "@/components/color-quick-select"
import { ColorPreviewImage } from "@/components/color-preview-image"
import { StockAvailability } from "@/components/stock-availability"

const productCache = new Map<string, { product: Product; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000

function getColorDisplayName(color: ColorSelection | null, lang: string = "ar"): string {
  if (!color) return ""
  return color.label || color.colorId
}

function getImageForColor(product: Product, selectedColor: ColorSelection | null): string {
  if (!selectedColor) return product.mainImage
  
  // If product has specific image for this shade, use it
  if (product.colorImages?.[selectedColor.shadeId]) {
    return product.colorImages[selectedColor.shadeId]
  }
  
  // Otherwise use main image with smart color filter
  return product.mainImage
}

function getColorFilterStyle(selectedColor: ColorSelection | null): React.CSSProperties {
  if (!selectedColor) return {}
  
  // Find the variant to get hex value
  const variant = getColorVariantById(selectedColor.shadeId)
  const hexColor = variant?.hex.toUpperCase() || "#CCCCCC"
  
  // Map color hex to hue rotation degrees for intelligent color shifting
  const colorToHueMap: { [key: string]: number } = {
    "#000000": 0,      // Black (no shift)
    "#FFFFFF": 0,      // White (no shift)
    "#1E3A8A": 0,      // Navy
    "#3B82F6": 240,    // Blue
    "#0EA5E9": 180,    // Sky Blue
    "#EF4444": 0,      // Red
    "#991B1B": 0,      // Dark Red
    "#22C55E": 120,    // Green
    "#15803D": 120,    // Dark Green
    "#14B8A6": 180,    // Teal
    "#6B7280": 0,      // Gray (no shift)
    "#D1D5DB": 0,      // Light Gray (no shift)
    "#D4A574": 40,     // Beige
    "#D2B48C": 35,     // Tan
    "#92400E": 30,     // Brown
    "#5A3A1A": 30,     // Dark Brown
    "#EC4899": 310,    // Pink
    "#D946EF": 300,    // Magenta
    "#EAB308": 50,     // Gold
    "#C0C0C0": 0,      // Silver (no shift)
    "#F97316": 30,     // Orange
    "#800000": 0,      // Maroon
    "#FFFDD0": 0,      // Cream (no shift)
    "#36454F": 0,      // Charcoal
  }
  
  const hueRotation = colorToHueMap[hexColor] ?? 0
  
  // Intelligent filter based on darkness/lightness of color
  let saturation = 100
  let brightness = 100
  
  // Darker colors - reduce brightness slightly
  if (["#000000", "#1E3A8A", "#15803D", "#5A3A1A", "#800000", "#36454F", "#991B1B"].includes(hexColor)) {
    brightness = 98
    saturation = 98
  }
  
  // Very light colors - slight brightness boost
  if (["#FFFFFF", "#C0C0C0", "#D1D5DB", "#FFFDD0"].includes(hexColor)) {
    brightness = 100
    saturation = 100
  }
  
  return {
    filter: `hue-rotate(${hueRotation}deg) saturate(${saturation}%) brightness(${brightness}%)`,
  }
}

export function ProductContent({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<ColorSelection | null>(null)
  const [selectedColorId, setSelectedColorId] = useState<string>("") // For backward compatibility
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [viewRecorded, setViewRecorded] = useState(false)

  const { t, language } = useLanguage()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { addToRecentlyViewed } = useRecentlyViewed()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchProduct = async () => {
      console.log("[v0] 🔍 Fetching product with ID:", productId)
      const startTime = Date.now()
      
      try {
        const cached = productCache.get(productId)
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          console.log("[v0] ⚡ Using cached product data")
          setProduct(cached.product)
          if (cached.product.colors?.length > 0) {
            setSelectedColor(cached.product.colors[0])
            setSelectedColorId(cached.product.colors[0].shadeId)
          }
          if (cached.product.sizes?.length > 0) setSelectedSize(cached.product.sizes[0])
          return
        }

        setLoading(true)
        console.log("[v0] 📡 Fetching from Firebase...")
        const docRef = doc(db, "products", productId)
        const docSnap = await getDoc(docRef)
        const fetchTime = Date.now() - startTime

        if (docSnap.exists()) {
          console.log(`[v0] ✅ Product found in ${fetchTime}ms`)
          const productData = { id: docSnap.id, ...docSnap.data() } as Product
          console.log("[v0] Product data:", {
            id: productData.id,
            name: productData.nameAr || productData.nameEn,
            colors: productData.colors,
            sizes: productData.sizes
          })
          setProduct(productData)
          productCache.set(productId, { product: productData, timestamp: Date.now() })
          
          // Add to recently viewed
          addToRecentlyViewed(productData)
          
          if (productData.colors?.length > 0) {
            setSelectedColor(productData.colors[0])
            setSelectedColorId(productData.colors[0].shadeId)
          }
          if (productData.sizes?.length > 0) setSelectedSize(productData.sizes[0])

          // Try to update view count, but don't fail if permissions are insufficient
          if (!viewRecorded) {
            updateDoc(docRef, { views: increment(1) })
              .then(() => {
                console.log("[v0] ✅ View count updated")
                setViewRecorded(true)
              })
              .catch((error) => {
                console.warn("[v0] ⚠️ Could not update view count (permissions):", error.message)
                // Still mark as recorded to avoid repeated attempts
                setViewRecorded(true)
              })
          }
        } else {
          console.error(`[v0] ❌ Product not found (${fetchTime}ms) - Document does not exist`)
          setError(t("المنتج غير موجود", "Product not found"))
        }
      } catch (err) {
        const fetchTime = Date.now() - startTime
        console.error(`[v0] ❌ Error fetching product (${fetchTime}ms):`, err)
        console.error("[v0] Error details:", {
          message: err instanceof Error ? err.message : "Unknown error",
          code: (err as any)?.code,
          name: (err as any)?.name,
          productId
        })
        setError(t("حدث خطأ", "Error loading"))
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId, t, viewRecorded])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
  }

  const shareProduct = (platform: string) => {
    if (typeof window === "undefined" || !product) return
    const url = window.location.href
    const name = language === "ar" ? product.nameAr : product.nameEn
    const priceValue = product.discount > 0 ? product.discountedPrice : product.salePrice
    const priceText = `${priceValue.toFixed(2)} ${language === "ar" ? "ج.م" : "EGP"}`
    
    // Rich share text with product details
    const shareText = language === "ar" 
      ? `${name}\n\nالسعر: ${priceText}${product.discount > 0 ? ` (خصم ${product.discount}%)` : ""}\n\nتسوق الآن:\n${url}`
      : `${name}\n\nPrice: ${priceText}${product.discount > 0 ? ` (${product.discount}% OFF)` : ""}\n\nShop now:\n${url}`

    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank")
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(name)}`, "_blank")
        break
      case "copy":
        navigator.clipboard.writeText(url)
        toast({ 
          title: t("تم النسخ بنجاح", "Copied Successfully"), 
          description: t("تم نسخ رابط المنتج إلى الحافظة", "Product link copied to clipboard") 
        })
        break
    }
    setShowShareMenu(false)
  }

  const handleAddToCart = () => {
    if (!product) return
    if (product.colors?.length > 0 && !selectedColor) {
      toast({ title: t("اختر اللون والدرجة", "Select Color & Shade"), variant: "destructive" })
      return
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      toast({ title: t("اختر المقاس", "Select Size"), variant: "destructive" })
      return
    }
    // Pass ColorSelection object directly to cart
    addToCart(product, selectedColor || selectedColorId, selectedSize, quantity)
    toast({ title: t("تمت الإضافة", "Added"), description: t("تمت إضافة المنتج بنجاح", "Product added successfully") })
  }

  if (loading) return <FullPageLoader text={t("جاري التحميل...", "Loading...")} />

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Header />
        <section className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6 px-4">
            <Package className="w-20 h-20 text-slate-300 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-800">{t("المنتج غير موجود", "Product Not Found")}</h2>
            <Button onClick={() => router.push("/shop")}>{t("العودة للمتجر", "Back to Shop")}</Button>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  const name = language === "ar" ? product.nameAr : product.nameEn
  const description = language === "ar" ? product.descriptionAr : product.descriptionEn
  
  // Handle features - support both array (current) and string (legacy) formats
  const rawFeatures = language === "ar" ? product.featuresAr : product.featuresEn
  const features = Array.isArray(rawFeatures) 
    ? rawFeatures.filter(f => f?.trim()) 
    : typeof rawFeatures === "string" 
      ? rawFeatures.split("\n").filter(f => f.trim()) 
      : []
  
  const notes = language === "ar" ? product.notesAr : product.notesEn
  const price = product.discount > 0 ? product.discountedPrice : product.salePrice
  const allImages = [product.mainImage, ...(product.additionalImages || [])].filter(Boolean)
  
  // Get the image for currently selected color
  const displayImage = getImageForColor(product, selectedColor)
  const hasSpecificColorImage = selectedColor ? !!product.colorImages?.[selectedColor.shadeId] : false

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[45%_55%] gap-8 lg:gap-12">
            
            {/* Images with Zoom */}
            <div className="space-y-4">
              <div 
                className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white shadow-lg border border-slate-200 cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <ColorPreviewImage
                  src={displayImage}
                  alt={product.nameAr}
                  colorSelection={selectedColor}
                  hasSpecificColorImage={hasSpecificColorImage}
                  className="w-full h-full"
                  objectFit="cover"
                  priority
                />
                
                {product.discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-red-600 text-white">
                    {product.discount}% {t("خصم", "OFF")}
                  </Badge>
                )}

                {product.quantity < 10 && product.quantity > 0 && (
                  <Badge className="absolute top-4 right-4 bg-amber-50 text-amber-700 border-amber-200">
                    {t(`متبقي ${product.quantity}`, `${product.quantity} left`)}
                  </Badge>
                )}

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(p => p > 0 ? p - 1 : allImages.length - 1)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImage(p => p < allImages.length - 1 ? p + 1 : 0)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={cn(
                        "relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                        selectedImage === idx ? "border-[#0d3b66] ring-2 ring-[#0d3b66]/20" : "border-slate-200"
                      )}
                    >
                      <Image src={img || "/placeholder.svg"} alt={`${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-5">
              <div className="flex justify-between items-start gap-4">
                <h1 className={cn("text-3xl font-bold text-slate-900", language === "ar" && "text-right")}>{name}</h1>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setIsWishlisted(!isWishlisted)}>
                    <Heart className={cn("w-5 h-5", isWishlisted && "fill-red-500 text-red-500")} />
                  </Button>
                  <div className="relative">
                    <Button variant="outline" size="icon" onClick={() => setShowShareMenu(!showShareMenu)} className="bg-transparent">
                      <Share2 className="w-5 h-5" />
                    </Button>
                    {showShareMenu && (
                      <>
                        {/* Backdrop to close menu */}
                        <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />
                        <div className={cn(
                          "absolute top-12 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 space-y-1.5 z-20 w-52 animate-in fade-in slide-in-from-top-2 duration-200",
                          language === "ar" ? "left-0" : "right-0"
                        )}>
                          <p className="text-xs font-semibold text-slate-400 px-2 pb-1 border-b border-slate-100 mb-2">
                            {t("مشاركة المنتج", "Share Product")}
                          </p>
                          <button 
                            onClick={() => shareProduct("whatsapp")} 
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                              <svg className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-slate-700">WhatsApp</span>
                          </button>
                          <button 
                            onClick={() => shareProduct("facebook")} 
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                              <Facebook className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">Facebook</span>
                          </button>
                          <button 
                            onClick={() => shareProduct("copy")} 
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors group"
                          >
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                              <Copy className="w-5 h-5 text-slate-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{t("نسخ الرابط", "Copy Link")}</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold text-[#0d3b66]">{price.toFixed(2)} {t("ج.م", "EGP")}</span>
                {product.discount > 0 && (
                  <>
                    <span className="text-xl text-slate-400 line-through">{product.salePrice.toFixed(2)}</span>
                    <Badge className="bg-red-50 text-red-700 border-red-200">
                      {t(`وفر ${(product.salePrice - product.discountedPrice).toFixed(2)} ج.م`, `Save ${(product.salePrice - product.discountedPrice).toFixed(2)} EGP`)}
                    </Badge>
                  </>
                )}
              </div>

              {/* Stats - Professional Design */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Views */}
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">{(product.views || 0).toLocaleString()}</span>
                    <span className="text-slate-500">{t("مشاهدة", "views")}</span>
                  </div>
                </div>
                
                {/* Likes */}
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">{(product.likes || 0).toLocaleString()}</span>
                    <span className="text-slate-500">{t("إعجاب", "likes")}</span>
                  </div>
                </div>
                
                {/* Stock Status */}
                {product.quantity > 0 ? (
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border",
                    product.quantity <= 5 
                      ? "bg-amber-50 border-amber-200" 
                      : "bg-emerald-50 border-emerald-200"
                  )}>
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center",
                      product.quantity <= 5 ? "bg-amber-100" : "bg-emerald-100"
                    )}>
                      <Package className={cn(
                        "w-3.5 h-3.5",
                        product.quantity <= 5 ? "text-amber-600" : "text-emerald-600"
                      )} />
                    </div>
                    <div className="text-xs">
                      <span className={cn(
                        "font-bold block",
                        product.quantity <= 5 ? "text-amber-700" : "text-emerald-700"
                      )}>
                        {product.quantity}
                      </span>
                      <span className={product.quantity <= 5 ? "text-amber-600" : "text-emerald-600"}>
                        {product.quantity <= 5 ? t("متبقي فقط", "left only") : t("متوفر", "in stock")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                    </div>
                    <span className="text-xs font-bold text-red-700">{t("نفد المخزون", "Out of stock")}</span>
                  </div>
                )}
              </div>

              {description && (
                <p className={cn("text-slate-700 leading-relaxed", language === "ar" && "text-right")} dir={language === "ar" ? "rtl" : "ltr"}>
                  {description}
                </p>
              )}

              {/* Colors & Shades - New System */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-4">
                  {/* Quick Color Selection Bar */}
                  <ColorQuickSelect
                    value={selectedColor}
                    onChange={(selection) => {
                      setSelectedColor(selection)
                      if (selection) setSelectedColorId(selection.shadeId)
                      setSelectedImage(0)
                    }}
                    label={t("اختر لوناً سريعاً", "Quick Color Selection")}
                    showLabel={true}
                  />

                  {/* Full Color & Shade Selector */}
                  <ColorSearchSelector
                    value={selectedColor}
                    onChange={(selection) => {
                      setSelectedColor(selection)
                      if (selection) setSelectedColorId(selection.shadeId)
                      setSelectedImage(0)
                    }}
                    showLabel={true}
                    label={`${t("اختر درجة اللون", "Select Color Shade")}: ${selectedColor ? getColorDisplayName(selectedColor, language) : ""}`}
                    compact={false}
                  />

                  {/* Stock Availability for Selected Color */}
                  {selectedColor && product.colorSizeStock && (
                    <StockAvailability
                      stock={product.colorSizeStock.find(
                        s => s.shadeId === selectedColor.shadeId && s.size === selectedSize
                      )}
                      size={selectedSize}
                      showLabel={true}
                    />
                  )}
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className={cn("space-y-3", language === "ar" && "text-right")}>
                  <label className="text-sm font-semibold text-slate-700">{t("المقاس", "Size")}: <span className="text-[#0d3b66]">{selectedSize}</span></label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "px-4 py-2 rounded-lg font-medium transition-all",
                          selectedSize === size ? "bg-[#0d3b66] text-white" : "bg-white border border-slate-300 hover:border-[#0d3b66]"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-slate-700">{t("الكمية", "Quantity")}:</label>
                <div className="flex items-center border border-slate-300 rounded-lg">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={handleAddToCart} disabled={product.quantity === 0} className="w-full bg-[#0d3b66] hover:bg-[#1a5490] h-12 text-base">
                <ShoppingBag className="w-5 h-5 mr-2" />
                {product.quantity === 0 ? t("غير متوفر", "Out of Stock") : t("أضف للسلة", "Add to Cart")}
              </Button>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-slate-600" />
                  </div>
                  <span>{t("شحن مجاني", "Free Shipping")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-slate-600" />
                  </div>
                  <span>{t("ضمان جودة", "Quality Guarantee")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-slate-600" />
                  </div>
                  <span>{t("إرجاع سهل", "Easy Returns")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-slate-600" />
                  </div>
                  <span>{t("تغليف آمن", "Safe Packaging")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features & Notes */}
          <div className="mt-12 space-y-4 max-w-4xl mx-auto">
            {features && features.length > 0 && (
              <div className={cn("bg-slate-50 rounded-xl p-4 border border-slate-200", language === "ar" && "text-right")}>
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-slate-600" />
                  {t("المميزات", "Features")}
                </h3>
                <ul className="space-y-2" dir={language === "ar" ? "rtl" : "ltr"}>
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {notes && notes.trim() && (
              <div className={cn("bg-slate-50 rounded-xl p-4 border border-slate-200", language === "ar" && "text-right")}>
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-slate-600" />
                  {t("ملاحظات", "Notes")}
                </h3>
                <div className="text-sm text-slate-700 whitespace-pre-wrap" dir={language === "ar" ? "rtl" : "ltr"}>
                  {notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <SimilarProductsSection currentProduct={product} />
      <Footer />
    </main>
  )
}
