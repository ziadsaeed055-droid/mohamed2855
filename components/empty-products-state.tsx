"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Search, ChevronRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"

export function EmptyProductsState({ 
  onClearFilters,
  hasFilters = false
}: { 
  onClearFilters?: () => void
  hasFilters?: boolean
}) {
  const { t, language } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      {/* Icon */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="mb-6"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <Search className="w-12 h-12 text-primary/60" />
        </div>
      </motion.div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-foreground mb-2 text-center">
        {t("لم يتم العثور على منتجات", "No Products Found")}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-center max-w-md mb-8">
        {t(
          "عذراً، لم نتمكن من العثور على منتجات تطابق معاييرك. جرب تعديل الفلاتر أو البحث عن شيء آخر.",
          "Sorry, we couldn't find any products matching your criteria. Try adjusting your filters or search for something else."
        )}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {hasFilters && onClearFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearFilters}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            {t("مسح الفلاتر", "Clear Filters")}
          </motion.button>
        )}

        <Link
          href="/shop"
          className="px-8 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
        >
          <span>{t("العودة للمتجر", "Back to Shop")}</span>
          <ChevronRight className={cn("w-4 h-4", language === "ar" ? "rotate-180" : "")} />
        </Link>
      </div>

      {/* Suggestion */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-muted-foreground text-center mt-8"
      >
        {t(
          "اقتراح: جرب البحث عن منتج محدد أو قم بإزالة بعض الفلاتر",
          "Tip: Try searching for a specific product or remove some filters"
        )}
      </motion.p>
    </motion.div>
  )
}
