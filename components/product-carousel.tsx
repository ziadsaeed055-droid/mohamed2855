"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import type { Product } from "@/lib/types"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductCarouselProps {
  products: Product[]
  title?: string
  subtitle?: string
  loading?: boolean
  showAddToCart?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
  className?: string
  CardComponent?: React.ComponentType<{ product: Product; className?: string; style?: React.CSSProperties }>
}

export function ProductCarousel({
  products,
  title,
  subtitle,
  loading = false,
  showAddToCart = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  className,
  CardComponent,
}: ProductCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const { t, language } = useLanguage()

  // Check scroll position
  const checkScrollPosition = useCallback(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    setCanScrollLeft(carousel.scrollLeft > 0)
    setCanScrollRight(carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth - 10)
  }, [])

  useEffect(() => {
    checkScrollPosition()
    const carousel = carouselRef.current
    if (carousel) {
      carousel.addEventListener("scroll", checkScrollPosition, { passive: true })
    }
    window.addEventListener("resize", checkScrollPosition)
    return () => {
      if (carousel) {
        carousel.removeEventListener("scroll", checkScrollPosition)
      }
      window.removeEventListener("resize", checkScrollPosition)
    }
  }, [checkScrollPosition, products])

  useEffect(() => {
    if (!autoPlay || products.length === 0) return

    const interval = setInterval(() => {
      const carousel = carouselRef.current
      if (!carousel) return

      if (canScrollRight) {
        carousel.scrollBy({ left: 280, behavior: "smooth" })
      } else {
        carousel.scrollTo({ left: 0, behavior: "smooth" })
      }
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, canScrollRight, products.length])

  const scroll = (direction: "left" | "right") => {
    const carousel = carouselRef.current
    if (!carousel) return

    const scrollAmount = carousel.clientWidth * 0.8
    carousel.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })

    // Update button states after scroll animation completes
    setTimeout(() => {
      checkScrollPosition()
    }, 600)
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0))
    setScrollLeft(carouselRef.current?.scrollLeft || 0)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - (carouselRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 1.5 // تقليل الحساسية قليلاً
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollLeft - walk
    }
  }, [isDragging, startX, scrollLeft])

  const handleMouseUp = useCallback(() => setIsDragging(false), [])
  const handleMouseLeave = useCallback(() => setIsDragging(false), [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0))
    setScrollLeft(carouselRef.current?.scrollLeft || 0)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    const x = e.touches[0].pageX - (carouselRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 1.5
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollLeft - walk
    }
  }, [isDragging, startX, scrollLeft])

  const handleTouchEnd = useCallback(() => setIsDragging(false), [])

  if (loading || products.length === 0) return null

  return (
    <div className={cn("relative", className)}>
      {(title || subtitle) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && <h3 className="text-xl md:text-2xl font-bold text-foreground">{title}</h3>}
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                scroll("left")
              }}
              disabled={!canScrollLeft}
              className={cn(
                "rounded-full w-10 h-10 bg-background border-2 transition-all",
                canScrollLeft ? "hover:bg-primary hover:text-primary-foreground cursor-pointer" : "opacity-50 cursor-not-allowed",
              )}
            >
              {language === "ar" ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                scroll("right")
              }}
              disabled={!canScrollRight}
              className={cn(
                "rounded-full w-10 h-10 bg-background border-2 transition-all",
                canScrollRight ? "hover:bg-primary hover:text-primary-foreground cursor-pointer" : "opacity-50 cursor-not-allowed",
              )}
            >
              {language === "ar" ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      )}

      <div
        ref={carouselRef}
        onScroll={checkScrollPosition}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory",
          "cursor-grab active:cursor-grabbing select-none",
          isDragging && "scroll-smooth",
        )}
        style={{ 
          scrollBehavior: isDragging ? "auto" : "smooth",
          WebkitOverflowScrolling: "touch",
          willChange: "scroll-position"
        }}
      >
        {products.map((product) => {
          if (CardComponent) {
            return (
              <div
                key={product.id}
                className="flex-shrink-0 w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] snap-start"
              >
                <CardComponent product={product} />
              </div>
            )
          }

          // Default simple card for backward compatibility
          return (
            <div key={product.id} className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] snap-start">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-sm">{language === "ar" ? product.nameAr : product.nameEn}</p>
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={(e) => {
          e.preventDefault()
          scroll("left")
        }}
        disabled={!canScrollLeft}
        className={cn(
          "absolute top-1/2 -start-4 -translate-y-1/2 z-10 hidden md:flex",
          "w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center",
          "border hover:bg-primary hover:text-white transition-all",
          canScrollLeft ? "cursor-pointer" : "opacity-50 cursor-not-allowed hover:bg-white hover:text-foreground",
        )}
      >
        {language === "ar" ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
      <button
        onClick={(e) => {
          e.preventDefault()
          scroll("right")
        }}
        disabled={!canScrollRight}
        className={cn(
          "absolute top-1/2 -end-4 -translate-y-1/2 z-10 hidden md:flex",
          "w-10 h-10 rounded-full bg-white shadow-lg items-center justify-center",
          "border hover:bg-primary hover:text-white transition-all",
          canScrollRight ? "cursor-pointer" : "opacity-50 cursor-not-allowed hover:bg-white hover:text-foreground",
        )}
      >
        {language === "ar" ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
    </div>
  )
}
