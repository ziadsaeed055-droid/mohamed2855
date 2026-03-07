"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"

interface ProductCountBadgeProps {
  count: number
  isLoading?: boolean
}

export function ProductCountBadge({ count, isLoading = false }: ProductCountBadgeProps) {
  const { t, language } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-full"
    >
      <motion.div
        animate={isLoading ? { scale: [1, 1.2] } : {}}
        transition={{ duration: 0.6, repeat: isLoading ? Infinity : 0, repeatType: "reverse" }}
        className="w-2 h-2 rounded-full bg-primary"
      />
      <span className="text-sm font-semibold text-foreground">
        {isLoading ? (
          <span className="text-muted-foreground">{t("جاري التحميل", "Loading...")}</span>
        ) : (
          <>
            <span className="text-primary font-bold">{count}</span>
            <span className="text-muted-foreground ms-1">
              {count === 1 
                ? t("منتج", "product") 
                : t("منتجات", "products")}
            </span>
          </>
        )}
      </span>
    </motion.div>
  )
}
