"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronRight, ChevronDown, Sparkles, Shirt, Baby, Gem, Droplets, Glasses, Watch, ShoppingBag, Minus } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { CATEGORIES } from "@/lib/types"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, React.ElementType> = {
  Shirt, Baby, Gem, Droplets, Glasses, Watch, ShoppingBag, Minus, Sparkles,
}

interface CategoriesDropdownProps {
  trigger?: React.ReactNode
  isScrolled?: boolean
}

export function CategoriesDropdown({ trigger, isScrolled = false }: CategoriesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { language, t } = useLanguage()

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const startCloseTimeout = useCallback(() => {
    clearCloseTimeout()
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 300)
  }, [clearCloseTimeout])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => clearCloseTimeout()
  }, [clearCloseTimeout])

  // Reset active states when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setActiveCategory(null)
      setActiveSubCategory(null)
    }
  }, [isOpen])

  const handleCategoryHover = (categoryId: string) => {
    setActiveCategory(categoryId)
    setActiveSubCategory(null)
  }

  const handleSubCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(false)
  }

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={() => { clearCloseTimeout(); setIsOpen(true) }}
      onMouseLeave={startCloseTimeout}
    >
      {/* Trigger Button - opens on hover (desktop), click (mobile) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 text-sm font-medium tracking-wide transition-all duration-200 relative group hover:text-accent",
          isScrolled ? "text-foreground" : "text-primary-foreground"
        )}
        aria-expanded={isOpen}
      >
        {trigger || (
          <>
            <span>{t("الأقسام", "Categories")}</span>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-300",
                isOpen ? "rotate-180" : ""
              )}
            />
          </>
        )}
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown Content */}
          <div
            className={cn(
              "fixed z-50 w-[95vw] md:w-[90vw] lg:w-[900px] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200",
              "hidden lg:block"
            )}
            style={{
              top: "4.5rem",
              left: "50%",
              transform: "translateX(-50%)"
            }}
          >
            <div className="grid grid-cols-4 gap-0 min-h-[500px]">
              {/* Categories Column */}
              <div className="border-r border-slate-100 dark:border-slate-800 bg-gradient-to-b from-[#f8f9fa] via-white to-white dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-900">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    {t("جميع الأقسام", "All Categories")}
                  </p>
                </div>
                <nav className="space-y-1.5 p-3 overflow-y-auto max-h-[400px]">
                  {CATEGORIES.map((category, idx) => {
                    const IconComp = ICON_MAP[category.icon || ""] || Sparkles
                    return (
                    <button
                      key={category.id}
                      onMouseEnter={() => handleCategoryHover(category.id)}
                      onClick={() => handleCategoryHover(category.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-sm group/cat",
                        activeCategory === category.id
                          ? "bg-gradient-to-r from-[#0d3b66] to-[#0d5a99] text-white shadow-lg scale-100"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:scale-102"
                      )}
                      style={{
                        animationDelay: `${idx * 30}ms`
                      }}
                    >
                      <IconComp className="w-4 h-4" />
                      <span className="flex-1 text-start">
                        {language === "ar" ? category.nameAr : category.nameEn}
                      </span>
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 transition-transform duration-200 opacity-50",
                          activeCategory === category.id ? "opacity-100 translate-x-1" : "",
                          language === "ar" ? "rotate-180" : ""
                        )}
                      />
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* SubCategories Column */}
              {activeCategory && (
                <div className="col-span-1 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-left-2 duration-200">
                  {(() => {
                    const category = CATEGORIES.find((c) => c.id === activeCategory)
                    if (!category?.subCategories.length) return null

                    return (
                      <>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {t("الفئات", "Subcategories")}
                          </p>
                        </div>
                        <nav className="space-y-1 p-2 max-h-[400px] overflow-y-auto">
                          {category.subCategories.map((subCat, index) => (
                            <Link
                              key={subCat.id}
                              href={`/shop?category=${category.id}&subCategory=${subCat.id}`}
                              onClick={handleSubCategoryClick}
                              onMouseEnter={() => setActiveSubCategory(subCat.id)}
                              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-[#0d3b66]/10 hover:text-[#0d3b66] hover:translate-x-0.5 transition-all duration-150 group"
                              style={{
                                animationDelay: `${index * 25}ms`,
                              }}
                            >
                              <span className="flex-1">
                                {language === "ar" ? subCat.nameAr : subCat.nameEn}
                              </span>
                              {subCat.subCategories && subCat.subCategories.length > 0 && (
                                <ChevronRight
                                  className={cn(
                                    "w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity",
                                    language === "ar" ? "rotate-180" : ""
                                  )}
                                />
                              )}
                            </Link>
                          ))}
                        </nav>
                      </>
                    )
                  })()}
                </div>
              )}

              {/* Sub-SubCategories Column */}
              {activeSubCategory && (
                <div className="col-span-1 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-left-2 duration-200">
                  {(() => {
                    const category = CATEGORIES.find((c) => c.id === activeCategory)
                    const subCategory = category?.subCategories.find((s) => s.id === activeSubCategory)

                    if (!subCategory?.subCategories?.length) return null

                    return (
                      <>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
                          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {t("تفاصيل", "Details")}
                          </p>
                        </div>
                        <nav className="space-y-1 p-2 max-h-[400px] overflow-y-auto">
                          {subCategory.subCategories.map((subSubCat) => (
                            <Link
                              key={subSubCat.id}
                              href={`/shop?category=${category?.id}&subCategory=${subSubCat.id}`}
                              onClick={handleSubCategoryClick}
                              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-[#0d3b66]/10 hover:text-[#0d3b66] transition-all duration-150 group"
                            >
                              <span className="w-2 h-2 rounded-full bg-[#0d3b66]/40 group-hover:bg-[#0d3b66] transition-colors" />
                              <span className="flex-1">
                                {language === "ar" ? subSubCat.nameAr : subSubCat.nameEn}
                              </span>
                            </Link>
                          ))}
                        </nav>
                      </>
                    )
                  })()}
                </div>
              )}

              {/* Featured/Info Column */}
              <div className="col-span-1 bg-gradient-to-b from-[#0d3b66]/8 to-[#0d3b66]/3 dark:from-[#0d3b66]/25 dark:to-[#0d3b66]/15 p-6 flex flex-col justify-between overflow-hidden relative">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0d3b66]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                {activeCategory ? (
                  <div className="relative z-10 group">
                    <div>
                      <div className="inline-block p-4 rounded-xl bg-gradient-to-br from-[#0d3b66]/20 to-[#0d3b66]/10 mb-4 backdrop-blur-sm border border-[#0d3b66]/10 transition-all duration-300 group-hover:scale-110">
                        {(() => {
                          const cat = CATEGORIES.find((c) => c.id === activeCategory)
                          const Icon = ICON_MAP[cat?.icon || ""] || Sparkles
                          return <Icon className="w-8 h-8 text-[#0d3b66]" />
                        })()}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">
                        {language === "ar"
                          ? CATEGORIES.find((c) => c.id === activeCategory)?.nameAr
                          : CATEGORIES.find((c) => c.id === activeCategory)?.nameEn}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {language === "ar"
                          ? CATEGORIES.find((c) => c.id === activeCategory)?.description
                          : CATEGORIES.find((c) => c.id === activeCategory)?.description}
                      </p>
                    </div>
                    <Link
                      href={`/shop?category=${activeCategory}`}
                      onClick={handleSubCategoryClick}
                      className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 rounded-lg bg-[#0d3b66] text-white font-medium text-sm hover:bg-[#0d3b66]/90 hover:shadow-lg transition-all duration-200 group"
                    >
                      <span>{t("استكشف الكل", "Explore All")}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center relative z-10">
                    <div className="p-4 rounded-full bg-[#0d3b66]/10 backdrop-blur-sm">
                      <Sparkles className="w-6 h-6 text-[#0d3b66]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                        {t("مرحباً!", "Welcome!")}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t("اختر قسماً لاستكشاف الفئات الرائعة", "Select a category to explore")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
