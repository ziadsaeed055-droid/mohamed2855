"use client"

import { motion } from "framer-motion"
import { getColorVariantById, type ColorSelection, type Product } from "@/lib/types"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ColorQuickBarProps {
  product: Product
  selectedColor: ColorSelection | null
  onColorSelect: (color: ColorSelection) => void
  className?: string
}

/**
 * Quick access color bar - shows all available colors as small swatches
 * Enables fast color switching without opening dropdown
 */
export function ColorQuickBar({
  product,
  selectedColor,
  onColorSelect,
  className = "",
}: ColorQuickBarProps) {
  if (!product.colors || product.colors.length === 0) return null

  // Group colors by base color ID to show visual variety
  const groupedColors = product.colors.reduce((acc, color) => {
    const baseColorId = color.colorId
    if (!acc[baseColorId]) acc[baseColorId] = []
    acc[baseColorId].push(color)
    return acc
  }, {} as Record<string, ColorSelection[]>)

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        السيريع:
      </span>

      {Object.entries(groupedColors).map(([baseColorId, colors]) => {
        // Show only the medium shade (500) for quick selection
        const mainShade = colors.find(c => c.shadeId.endsWith("-500")) || colors[0]
        const variant = getColorVariantById(mainShade.shadeId)

        if (!variant) return null

        const isSelected = selectedColor?.shadeId === mainShade.shadeId

        return (
          <motion.button
            key={mainShade.shadeId}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onColorSelect(mainShade)}
            className={cn(
              "relative w-8 h-8 rounded-full border-2 transition-all shadow-sm",
              isSelected
                ? "border-foreground ring-2 ring-foreground/30 scale-110"
                : "border-border hover:border-foreground/50"
            )}
            style={{ backgroundColor: variant.hex }}
            title={mainShade.label}
          >
            {isSelected && (
              <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
