"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { CATEGORIES } from "@/lib/types"

// Generate flat subcategory list with parent info
const ALL_SUBCATEGORIES = CATEGORIES.flatMap((cat) =>
  cat.subCategories.map((sub) => ({
    ...sub,
    parentId: cat.id,
    parentNameAr: cat.nameAr,
    parentNameEn: cat.nameEn,
  }))
)

const subCategoryImages: Record<string, string> = {
  men: "https://images.unsplash.com/photo-1552062407-291ce3f93e7d?w=500&h=500&fit=crop",
  women: "https://images.unsplash.com/photo-1595777707802-21b287910b75?w=500&h=500&fit=crop",
  kids: "https://images.unsplash.com/photo-1519457073556-16cab08d6038?w=500&h=500&fit=crop",
  default: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=500&fit=crop",
}

function getImageForSub(parentId: string): string {
  return subCategoryImages[parentId] || subCategoryImages.default
}

export function SubCategoriesCarousel() {
  const { language } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const itemsPerPage = 10
  const totalPages = Math.ceil(ALL_SUBCATEGORIES.length / itemsPerPage)

  useEffect(() => {
    if (!autoRotate) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % totalPages)
        setIsTransitioning(false)
      }, 400)
    }, 8000)

    return () => clearInterval(interval)
  }, [autoRotate, totalPages])

  const getVisibleItems = () => {
    const start = currentIndex * itemsPerPage
    return ALL_SUBCATEGORIES.slice(start, start + itemsPerPage)
  }

  return (
    <section className="py-20 md:py-28 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-slate-900 mb-4 tracking-tight">
            {language === "ar" ? "اكتشف الفئات" : "Discover Categories"}
          </h2>
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            {language === "ar"
              ? "استكشف مجموعتنا المنتقاة بعناية من الفئات الراقية والمتنوعة"
              : "Explore our carefully curated collections of premium fashion categories"}
          </p>
        </div>

        {/* Items Grid */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 transition-opacity duration-500 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          {getVisibleItems().map((subCategory, idx) => (
            <Link
              key={subCategory.id}
              href={`/shop?category=${subCategory.parentId}&sub=${subCategory.id}`}
              className="group h-56 md:h-64 lg:h-72"
            >
              <div
                className="relative w-full h-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer"
                style={{
                  animation: isTransitioning
                    ? "none"
                    : `slideInUp 0.6s ease-out ${idx * 50}ms backwards`,
                }}
              >
                <Image
                  src={getImageForSub(subCategory.parentId)}
                  alt={language === "ar" ? subCategory.nameAr : subCategory.nameEn}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-transparent group-hover:from-slate-900/90 transition-all duration-500" />

                <div className="absolute inset-0 flex flex-col items-center justify-end p-4 md:p-5">
                  <span className="text-white/60 text-xs font-light mb-1 tracking-wider uppercase">
                    {language === "ar" ? subCategory.parentNameAr : subCategory.parentNameEn}
                  </span>
                  <h3 className="text-white text-center font-light text-sm md:text-base leading-tight tracking-wide group-hover:tracking-widest transition-all duration-300">
                    {language === "ar" ? subCategory.nameAr : subCategory.nameEn}
                  </h3>
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-xs text-slate-200 font-light tracking-widest uppercase">
                      {language === "ar" ? "تصفح" : "Shop"}
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 rounded-lg transition-colors duration-500" />
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-14 md:mt-16">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsTransitioning(true)
                  setTimeout(() => {
                    setCurrentIndex(idx)
                    setIsTransitioning(false)
                  }, 400)
                  setAutoRotate(false)
                  setTimeout(() => setAutoRotate(true), 5000)
                }}
                className={`transition-all duration-500 rounded-full ${
                  idx === currentIndex
                    ? "w-8 h-2 bg-slate-900"
                    : "w-2 h-2 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {autoRotate && totalPages > 1 && (
          <p className="text-center text-xs md:text-sm text-slate-400 mt-6 font-light tracking-wide">
            {language === "ar" ? "تبديل تلقائي..." : "Auto-rotating..."}
          </p>
        )}
      </div>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
