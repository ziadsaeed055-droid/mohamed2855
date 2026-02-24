"use client"

import { useRecentlyViewed } from "@/contexts/recently-viewed-context"
import { useLanguage } from "@/contexts/language-context"
import { ProductCard } from "@/components/product-card"
import { Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function RecentlyViewedSection() {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed()
  const { t } = useLanguage()

  if (recentlyViewed.length === 0) return null

  return (
    <section id="recently-viewed" className="py-12 bg-gradient-to-b from-stone-50 to-white scroll-mt-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {t("شاهدتها مؤخراً", "Recently Viewed")}
              </h2>
              <p className="text-sm text-slate-500 font-light">
                {t(`${recentlyViewed.length} منتج`, `${recentlyViewed.length} products`)}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearRecentlyViewed}
            className="text-slate-500 hover:text-red-500 hover:bg-red-50"
          >
            <X className="w-4 h-4 me-1" />
            {t("مسح الكل", "Clear All")}
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {recentlyViewed.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
