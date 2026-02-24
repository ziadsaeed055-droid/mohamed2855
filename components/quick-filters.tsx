"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import { CATEGORIES } from "@/lib/types"

interface QuickFiltersProps {
  selectedCategory?: string
  onCategoryChange?: (categoryId: string) => void
}

export function QuickFilters({ selectedCategory, onCategoryChange }: QuickFiltersProps) {
  const { t, language } = useLanguage()

  if (!CATEGORIES || CATEGORIES.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8 pb-6 border-b border-border/50"
    >
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
        {t("الأقسام السريعة", "Quick Categories")}
      </p>
      <div className="flex flex-wrap gap-3">
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange?.("all")}
          className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          {t("الكل", "All")}
        </motion.button>
        
        {CATEGORIES.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (index + 1) * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange?.(category.id)}
            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-slate-100 dark:bg-slate-800 text-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {t(category.nameAr, category.nameEn)}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
