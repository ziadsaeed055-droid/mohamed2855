"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

const slides = [
  {
    id: 1,
    image: "/images/hero-banner.png",
    titleAr: "Seven Blue",
    titleEn: "Seven Blue",
    subtitleAr: "wearing for you - أناقة تليق بك",
    subtitleEn: "Wearing for you - Elegance that suits you",
    ctaAr: "تسوق الآن",
    ctaEn: "Shop Now",
  },
  {
    id: 2,
    image: "/luxury-fashion-store-elegant-blue-theme-with-cloth.jpg",
    titleAr: "مجموعة الصيف الجديدة",
    titleEn: "New Summer Collection",
    subtitleAr: "اكتشف أحدث صيحات الموضة لهذا الموسم",
    subtitleEn: "Discover the Latest Fashion Trends This Season",
    ctaAr: "اكتشف المجموعة",
    ctaEn: "Explore Collection",
  },
  {
    id: 3,
    image: "/premium-clothing-brand-showcase-navy-blue-elegant.jpg",
    titleAr: "جودة استثنائية",
    titleEn: "Exceptional Quality",
    subtitleAr: "أقمشة فاخرة وخياطة دقيقة لإطلالة مميزة",
    subtitleEn: "Luxurious Fabrics and Precise Tailoring",
    ctaAr: "تصفح المنتجات",
    ctaEn: "Browse Products",
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const { t, language } = useLanguage()

  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 150])
  const y2 = useTransform(scrollY, [0, 500], [0, -50])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSlide()
    }, 7000)
    return () => clearInterval(timer)
  }, [currentSlide])

  const handleNextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setTimeout(() => setIsAnimating(false), 1000)
  }

  const handlePrevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setTimeout(() => setIsAnimating(false), 1000)
  }

  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Slides with Parallax */}
      {slides.map((slide, index) => (
        <motion.div
          key={slide.id}
          style={{ y: index === currentSlide ? y1 : 0 }}
          className={cn(
            "absolute inset-0 transition-all duration-1000 ease-out",
            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105",
          )}
        >
          <Image
            src={slide.image || "/placeholder.svg"}
            alt={t(slide.titleAr, slide.titleEn)}
            fill
            className="object-cover"
            priority={index === 0}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/40 to-primary/80" />
        </motion.div>
      ))}

      {/* Content with Parallax */}
      <motion.div style={{ y: y2, opacity }} className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            {/* Logo Animation */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <Image src="/images/logo.png" alt="Seven Blue Logo" width={200} height={100} className="h-24 w-auto" />
            </motion.div>

            {/* Title with Animated Gradient */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 font-serif bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent animate-gradient-x"
              style={{
                backgroundSize: "200% 100%",
              }}
            >
              {t(slides[currentSlide].titleAr, slides[currentSlide].titleEn)}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-primary-foreground/90 mb-10 leading-relaxed"
            >
              {t(slides[currentSlide].subtitleAr, slides[currentSlide].subtitleEn)}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/shop">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-7 rounded-full group shadow-xl"
                >
                  {t(slides[currentSlide].ctaAr, slides[currentSlide].ctaEn)}
                  <ArrowIcon className="ms-2 h-5 w-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/shop?featured=true">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-10 py-7 rounded-full"
                >
                  {t("المنتجات المميزة", "Featured Products")}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrevSlide}
        className="absolute top-1/2 start-6 -translate-y-1/2 z-20 bg-primary-foreground/20 hover:bg-primary-foreground/40 backdrop-blur-sm text-primary-foreground p-4 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        {language === "ar" ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
      </button>
      <button
        onClick={handleNextSlide}
        className="absolute top-1/2 end-6 -translate-y-1/2 z-20 bg-primary-foreground/20 hover:bg-primary-foreground/40 backdrop-blur-sm text-primary-foreground p-4 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        {language === "ar" ? <ChevronLeft className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => !isAnimating && setCurrentSlide(index)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              index === currentSlide ? "bg-accent w-12" : "bg-primary-foreground/50 hover:bg-primary-foreground/80 w-6",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-10 start-10 z-20 hidden lg:flex flex-col items-center gap-3 text-primary-foreground/60">
        <span className="text-xs tracking-[0.3em] uppercase" style={{ writingMode: "vertical-rl" }}>
          {t("اسحب لأسفل", "Scroll Down")}
        </span>
        <div className="w-px h-20 bg-gradient-to-b from-primary-foreground/60 to-transparent animate-pulse" />
      </div>

      {/* Brand Tagline */}
      <div className="absolute bottom-10 end-10 z-20 hidden lg:block text-primary-foreground/60 text-sm tracking-wider">
        <span className="font-serif italic">Wearing for you</span>
      </div>
    </section>
  )
}
