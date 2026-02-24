"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { FlashSaleSkeleton } from "@/components/flash-sale-skeleton" // Added import for FlashSaleSkeleton

import { useState, useEffect, useCallback, memo, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import type { Product } from "@/lib/types"
import { Zap, Clock, ShoppingBag, ArrowRight, ArrowLeft, Flame, ChevronLeft, ChevronRight } from "lucide-react"

interface FlashSaleData {
  titleAr: string
  titleEn: string
  discountPercent: number
  startDate: any
  endDate: any
  productIds: string[]
  isActive: boolean
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export const FlashSaleSection = memo(function FlashSaleSection() {
  const [flashSaleData, setFlashSaleData] = useState<FlashSaleData | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false) // تبدأ false
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { t, language } = useLanguage()
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight

  const calculateTimeLeft = useCallback((endDate: Date): TimeLeft => {
    const difference = endDate.getTime() - new Date().getTime()

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    let isMounted = true
    
    const fetchFlashSale = async () => {
      try {
        const settingsRef = doc(db, "settings", "flashSale")
        const settingsSnap = await getDoc(settingsRef)

        if (!isMounted) return

        if (settingsSnap.exists()) {
          const data = settingsSnap.data() as FlashSaleData

          const now = new Date()
          const startDate = data.startDate?.toDate?.() || new Date(data.startDate)
          const endDate = data.endDate?.toDate?.() || new Date(data.endDate)

          const isDateValid = endDate > startDate
          const isCurrentlyRunning = now >= startDate && now <= endDate

          if (data.isActive && isDateValid && isCurrentlyRunning && data.productIds?.length > 0) {
            setFlashSaleData(data)
            setTimeLeft(calculateTimeLeft(endDate))

            // جلب المنتجات بالتوازي بدلاً من loop
            const productPromises = data.productIds.slice(0, 8).map(async (productId) => {
              const productRef = doc(db, "products", productId)
              const productSnap = await getDoc(productRef)
              if (productSnap.exists()) {
                return { id: productSnap.id, ...productSnap.data() } as Product
              }
              return null
            })
            
            const productsData = (await Promise.all(productPromises)).filter(Boolean) as Product[]
            if (isMounted) {
              setProducts(productsData)
            }
          }
        }
      } catch (error: any) {
        console.error("[v0] Error fetching flash sale:", error.code, error.message)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchFlashSale()
    
    return () => {
      isMounted = false
    }
  }, [calculateTimeLeft])

  // Timer effect - محسّن لتقليل إعادة الرسم
  useEffect(() => {
    if (!flashSaleData?.endDate || !mounted) return

    const endDate = flashSaleData.endDate?.toDate?.() || new Date(flashSaleData.endDate)
    
    // استخدام requestAnimationFrame بدلاً من setInterval لأداء أفضل
    let lastUpdate = Date.now()
    let animationFrameId: number | null = null
    
    const updateTimer = () => {
      const now = Date.now()
      
      // تحديث كل ثانية فقط
      if (now - lastUpdate >= 1000) {
        const newTimeLeft = calculateTimeLeft(endDate)
        setTimeLeft(prev => {
          // تحديث فقط إذا تغيرت القيمة
          if (
            prev.days !== newTimeLeft.days ||
            prev.hours !== newTimeLeft.hours ||
            prev.minutes !== newTimeLeft.minutes ||
            prev.seconds !== newTimeLeft.seconds
          ) {
            return newTimeLeft
          }
          return prev
        })
        lastUpdate = now
        
        // إيقاف إذا انتهى الوقت
        if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
          return
        }
      }
      
      animationFrameId = requestAnimationFrame(updateTimer)
    }
    
    animationFrameId = requestAnimationFrame(updateTimer)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [flashSaleData, calculateTimeLeft, mounted])

  const handleScroll = useCallback((direction: "left" | "right") => {
    const container = containerRef.current
    if (!container) return

    const scrollAmount = 300
    const currentScroll = container.scrollLeft
    const newPosition = direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount

    // استخدام smooth scrolling مع debounce
    container.scrollTo({ left: newPosition, behavior: "smooth" })
  }, [])

  // عدم عرض أي شيء أثناء التحميل الأولي
  if (!mounted || !flashSaleData || products.length === 0) {
    return null
  }

  const title = language === "ar" ? flashSaleData.titleAr : flashSaleData.titleEn
  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

  if (isExpired) return null

  return (
    <section className="py-12 md:py-16 relative overflow-hidden will-change-auto">
      {/* Background - مبسط بدون تأثيرات ثقيلة */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-yellow-300" />
                <span className="text-yellow-300 font-bold tracking-wider uppercase text-sm">
                  {t("عرض محدود", "Limited Offer")}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">{title || t("عروض سريعة", "Flash Sale")}</h2>
            </div>
          </div>

          {/* Timer - محسّن */}
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-white/80" />
            <div className="flex items-center gap-2">
              {[
                { value: timeLeft.days, label: t("يوم", "D") },
                { value: timeLeft.hours, label: t("س", "H") },
                { value: timeLeft.minutes, label: t("د", "M") },
                { value: timeLeft.seconds, label: t("ث", "S") },
              ].map((item, index) => (
                <div key={item.label} className="flex items-center gap-1">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px] text-center">
                    <span className="text-2xl font-bold text-white font-mono tabular-nums">
                      {String(item.value).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-white/60 text-sm">{item.label}</span>
                  {index < 3 && <span className="text-white/40 text-xl mx-1">:</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Discount Badge */}
        <div className="mb-6">
          <Badge className="bg-yellow-400 text-slate-900 font-bold text-lg px-4 py-2 shadow-lg">
            {t(`خصم حتى ${flashSaleData.discountPercent}%`, `Up to ${flashSaleData.discountPercent}% OFF`)}
          </Badge>
        </div>

        {/* Products Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => handleScroll("left")}
            className="absolute top-1/2 -start-4 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl transition-all hover:scale-110 hidden md:flex items-center justify-center"
            aria-label="Scroll left"
          >
            {language === "ar" ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="absolute top-1/2 -end-4 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-3 rounded-full shadow-xl transition-all hover:scale-110 hidden md:flex items-center justify-center"
            aria-label="Scroll right"
          >
            {language === "ar" ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>

          {/* Products Container - محسّن للأداء */}
          <div
            ref={containerRef}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ 
              scrollBehavior: "smooth", 
              WebkitOverflowScrolling: "touch",
              willChange: "scroll-position"
            }}
          >
            {products.map((product) => {
              const name = language === "ar" ? product.nameAr : product.nameEn
              const originalPrice = product.salePrice
              const salePrice = originalPrice * (1 - flashSaleData.discountPercent / 100)

              return (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[200px] md:w-[220px] bg-white rounded-2xl overflow-hidden shadow-xl snap-start group will-change-auto"
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.mainImage || "/placeholder.svg?height=300&width=300&query=product"}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        sizes="(max-width: 768px) 200px, 220px"
                        quality={75}
                      />
                      <div className="absolute top-2 start-2">
                        <Badge className="bg-red-500 text-white font-bold">
                          -{flashSaleData.discountPercent}%
                        </Badge>
                      </div>
                    </div>
                  </Link>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-slate-800 truncate">{name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-600">
                        {salePrice.toFixed(0)} {t("ج.م", "EGP")}
                      </span>
                      <span className="text-sm text-slate-400 line-through">{originalPrice.toFixed(0)}</span>
                    </div>
                    <Link href={`/product/${product.id}`}>
                      <Button size="sm" className="w-full bg-red-500 hover:bg-red-600 text-white">
                        <ShoppingBag className="w-4 h-4 me-1" />
                        {t("تسوق الآن", "Shop Now")}
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-8">
          <Link href="/offers">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-red-600 rounded-full px-8 group bg-transparent"
            >
              {t("عرض جميع العروض", "View All Offers")}
              <ArrowIcon className="w-5 h-5 ms-2 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
})
