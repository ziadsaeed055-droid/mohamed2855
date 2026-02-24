"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"

interface PriceDisplayProps {
  originalPrice: number
  salePrice: number
  discount?: number
  discountedPrice?: number
}

export function PriceDisplay({
  originalPrice,
  salePrice,
  discount = 0,
  discountedPrice,
}: PriceDisplayProps) {
  const { t } = useLanguage()
  
  const finalPrice = discount > 0 && discountedPrice ? discountedPrice : salePrice
  const hasDiscount = discount > 0
  const discountPercentage = Math.round(discount)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-end gap-2"
    >
      {/* Final Price */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="text-2xl font-bold text-foreground"
      >
        {finalPrice.toLocaleString()} {t("ريال", "SAR")}
      </motion.div>

      {/* Original Price */}
      {hasDiscount && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm font-medium text-muted-foreground line-through"
        >
          {salePrice.toLocaleString()} {t("ريال", "SAR")}
        </motion.div>
      )}

      {/* Discount Badge */}
      {hasDiscount && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="ml-auto px-3 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm font-bold"
        >
          -{discountPercentage}%
        </motion.div>
      )}
    </motion.div>
  )
}
