"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { CATEGORIES } from "@/lib/types"
import { cn } from "@/lib/utils"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export function CategoriesShowcase() {
  const { t, language } = useLanguage()
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [productCounts, setProductCounts] = useState<{ [key: string]: number }>({})

  // Category images mapping (keys match CATEGORIES ids)
  const categoryImages: { [key: string]: string } = {
    men: "https://images.unsplash.com/photo-1552062407-291ce3f93e7d?w=600&h=400&fit=crop&q=80",
    women: "https://images.unsplash.com/photo-1595777707802-21b287910b75?w=600&h=400&fit=crop&q=80",
    kids: "https://images.unsplash.com/photo-1519457073556-16cab08d6038?w=600&h=400&fit=crop&q=80",
  }

  // Fetch product counts from Firebase
  useEffect(() => {
    const fetchProductCounts = async () => {
      try {
        const counts: { [key: string]: number } = {}
        
        for (const category of CATEGORIES) {
          const q = query(
            collection(db, "products"),
            where("category", "==", category.id),
            where("isActive", "==", true)
          )
          const snapshot = await getDocs(q)
          counts[category.id] = snapshot.docs.length
        }
        
        setProductCounts(counts)
      } catch (error) {
        console.error("[v0] Error fetching product counts:", error)
      }
    }

    fetchProductCounts()
  }, [])

  const getProductCount = useCallback((categoryId: string): number => {
    return productCounts[categoryId] || 0
  }, [productCounts])

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            {t("اكتشف مجموعاتنا", "Discover Our Collections")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t(
              "تسوق من مجموعتنا المتنوعة من الملابس والإكسسوارات الراقية",
              "Shop from our diverse range of premium fashion items"
            )}
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {CATEGORIES.map((category, index) => {
            const productCount = getProductCount(category.id)
            const categoryImage = categoryImages[category.id] || categoryImages.men

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="group relative h-96 cursor-pointer"
              >
                {/* Main Card */}
                <Link
                  href={`/shop?category=${category.id}`}
                  className="relative w-full h-full rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 block"
                >
                  {/* Image Background */}
                  <Image
                    src={categoryImage}
                    alt={t(category.nameAr, category.nameEn)}
                    fill
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />

                  {/* Dark Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                    {/* Top - Category Badge */}
                    <div className="self-end">
                      <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-xs font-semibold">
                        {productCount} {t("منتج", "items")}
                      </div>
                    </div>

                    {/* Bottom - Title and CTA */}
                    <div>
                      <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                        {t(category.nameAr, category.nameEn)}
                      </h3>
                      <motion.div
                        whileHover={{ gap: "1rem" }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-full font-semibold hover:bg-slate-50 transition-all duration-300 shadow-lg group/btn"
                      >
                        <span>{t("تصفح", "Browse")}</span>
                        {language === "ar" ? (
                          <ChevronLeft className="w-5 h-5 group-hover/btn:-translate-x-1 transition-transform" />
                        ) : (
                          <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        )}
                      </motion.div>
                    </div>
                  </div>
                </Link>

                {/* Hover Panel - Subcategories Dropdown */}
                <AnimatePresence>
                  {hoveredCategory === category.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -12, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.94 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute top-full mt-3 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                      {/* Subcategories List */}
                      <div className="p-6 space-y-2 max-h-80 overflow-y-auto">
                        {category.subCategories.map((subCat, subIdx) => (
                          <motion.div
                            key={subCat.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: subIdx * 0.04 }}
                          >
                            <Link
                              href={`/shop?category=${category.id}&subCategory=${subCat.id}`}
                              className="block px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200 group/sub"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover/sub:text-primary transition-colors">
                                  {t(subCat.nameAr, subCat.nameEn)}
                                </span>
                                <ChevronRight className={cn(
                                  "w-4 h-4 text-slate-400 group-hover/sub:text-primary transition-all group-hover/sub:translate-x-1",
                                  language === "ar" ? "rotate-180" : ""
                                )} />
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-slate-100 dark:bg-slate-800" />

                      {/* View All Button */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
                        <Link
                          href={`/shop?category=${category.id}`}
                          className="block text-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                          {t("عرض جميع المنتجات", "View All Products")}
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
