"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { COLORS, type ColorSelection, getColorVariantById } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ColorQuickSelectProps {
  value: ColorSelection | null
  onChange: (selection: ColorSelection) => void
  maxColorsToShow?: number
  showLabel?: boolean
  label?: string
}

export function ColorQuickSelect({
  value,
  onChange,
  maxColorsToShow = 8,
  showLabel = true,
  label = "اختر اللون",
}: ColorQuickSelectProps) {
  const { language } = useLanguage()

  // Get unique parent colors from all variants for quick selection
  const quickColors = useMemo(() => {
    const uniqueParents = new Map<string, any>()
    
    COLORS.forEach((color) => {
      if (!uniqueParents.has(color.id)) {
        // Get the middle shade (usually 500) as the default for quick selection
        const defaultVariant = color.variants.find(v => v.shade === 500) || color.variants[Math.floor(color.variants.length / 2)]
        uniqueParents.set(color.id, {
          colorId: color.id,
          nameAr: color.nameAr,
          nameEn: color.nameEn,
          defaultVariant: defaultVariant,
          displayColor: color.displayColor || defaultVariant?.hex,
        })
      }
    })
    
    return Array.from(uniqueParents.values()).slice(0, maxColorsToShow)
  }, [maxColorsToShow])

  const handleColorClick = (colorData: any) => {
    const newSelection: ColorSelection = {
      colorId: colorData.colorId,
      shadeId: colorData.defaultVariant.id,
      label: language === "ar" ? colorData.nameAr : colorData.nameEn,
    }
    onChange(newSelection)
  }

  const isSelected = (colorData: any) => {
    return value?.colorId === colorData.colorId
  }

  return (
    <div className="w-full space-y-2">
      {showLabel && (
        <label className="text-sm font-semibold text-foreground block">
          {label}
        </label>
      )}
      
      <div className="flex gap-2 flex-wrap">
        {quickColors.map((colorData) => (
          <motion.button
            key={colorData.colorId}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleColorClick(colorData)}
            className={cn(
              "relative w-12 h-12 rounded-full border-3 transition-all shadow-sm hover:shadow-md",
              isSelected(colorData)
                ? "border-primary ring-4 ring-primary/30 scale-105"
                : "border-border hover:border-primary/50"
            )}
            style={{ backgroundColor: colorData.displayColor }}
            title={language === "ar" ? colorData.nameAr : colorData.nameEn}
          >
            {isSelected(colorData) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check className="w-5 h-5 text-white drop-shadow-lg" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {language === "ar" ? "اختر لوناً سريعاً أو ابحث عن درجات أخرى" : "Choose a quick color or search for more shades"}
      </p>
    </div>
  )
}
