"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { CATEGORIES, COLORS } from "@/lib/types"

interface ActiveFiltersDisplayProps {
  category?: string
  subCategories?: string[]
  colors?: string[]
  priceRange?: [number, number]
  onRemove?: (type: string, value: string) => void
  onClearAll?: () => void
}

export function ActiveFiltersDisplay({
  category,
  subCategories = [],
  colors = [],
  priceRange,
  onRemove,
  onClearAll,
}: ActiveFiltersDisplayProps) {
  const { t } = useLanguage()

  const filters: Array<{ label: string; category: string; value: string }> = []

  if (category && category !== "all") {
    const catData = CATEGORIES.find(c => c.id === category)
    if (catData) {
      filters.push({ label: t(catData.nameAr, catData.nameEn), category: "category", value: category })
    }
  }

  subCategories.forEach(subId => {
    const catData = CATEGORIES.find(c => c.id === category)
    const subData = catData?.subCategories.find(s => s.id === subId)
    if (subData) {
      filters.push({ label: t(subData.nameAr, subData.nameEn), category: "subCategory", value: subId })
    }
  })

  colors.forEach(colorId => {
    const colorData = COLORS.find(c => c.id === colorId)
    if (colorData) {
      filters.push({ label: t(colorData.nameAr, colorData.nameEn), category: "color", value: colorId })
    }
  })

  if (priceRange && (priceRange[0] !== 0 || priceRange[1] !== 10000)) {
    filters.push({ label: `${priceRange[0]} - ${priceRange[1]} EGP`, category: "price", value: "price" })
  }

  if (filters.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-6 pb-4 border-b border-border"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-foreground">
          {t("الفلاتر النشطة", "Active Filters")}
        </span>
        {onClearAll && (
          <button
            onClick={onClearAll}
            className="text-xs text-primary hover:underline transition-colors"
          >
            {t("مسح الكل", "Clear All")}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {filters.map((filter, index) => (
            <motion.div
              key={`${filter.category}-${filter.value}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors group"
            >
              <span>{filter.label}</span>
              {onRemove && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRemove(filter.category, filter.value)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
