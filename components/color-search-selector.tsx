"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Check, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { COLORS, getColorVariants, searchColorsByName, type ColorSelection, type ColorVariant } from "@/lib/types"

interface ColorSearchSelectorProps {
  value: ColorSelection | null
  onChange: (selection: ColorSelection | null) => void
  placeholder?: string
  showLabel?: boolean
  label?: string
  compact?: boolean // للاستخدام في الفلترة
  multiSelect?: boolean
  selectedColors?: ColorSelection[]
  onMultipleChange?: (selections: ColorSelection[]) => void
}

export function ColorSearchSelector({
  value,
  onChange,
  placeholder,
  showLabel = true,
  label,
  compact = false,
  multiSelect = false,
  selectedColors = [],
  onMultipleChange,
}: ColorSearchSelectorProps) {
  const { t, language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedColorGroup, setSelectedColorGroup] = useState<string | null>(null)
  const [selectedShade, setSelectedShade] = useState<string | null>(null)
  const [tempShadeSelection, setTempShadeSelection] = useState<ColorVariant | null>(null) // For better UX

  // Filter colors based on search query
  const filteredColors = useMemo(() => {
    if (!searchQuery.trim()) return COLORS
    return searchColorsByName(searchQuery)
  }, [searchQuery])

  // Get variants for selected color
  const colorVariants = useMemo(() => {
    if (!selectedColorGroup) return []
    return getColorVariants(selectedColorGroup)
  }, [selectedColorGroup])

  const handleColorGroupSelect = (colorId: string) => {
    setSelectedColorGroup(colorId)
    setSelectedShade(null)
  }

  const handleShadeSelect = (variant: ColorVariant, confirm = false) => {
    if (multiSelect && onMultipleChange) {
      const newLabel = language === "ar" ? variant.nameAr : variant.nameEn
      const newSelection: ColorSelection = {
        colorId: variant.parentColorId,
        shadeId: variant.id,
        label: newLabel,
      }

      const isAlreadySelected = selectedColors.some(c => c.shadeId === variant.id)
      if (isAlreadySelected) {
        onMultipleChange(selectedColors.filter(c => c.shadeId !== variant.id))
      } else {
        onMultipleChange([...selectedColors, newSelection])
        // Auto-reset for better UX in multi-select
        setTempShadeSelection(null)
      }
    } else {
      // Single select mode
      setTempShadeSelection(variant) // Highlight temporary selection
    }
  }

  const handleConfirmShadeSelection = () => {
    if (tempShadeSelection) {
      const newLabel = language === "ar" ? tempShadeSelection.nameAr : tempShadeSelection.nameEn
      const newSelection: ColorSelection = {
        colorId: tempShadeSelection.parentColorId,
        shadeId: tempShadeSelection.id,
        label: newLabel,
      }
      onChange(newSelection)
      setShowDropdown(false)
      setSearchQuery("")
      setSelectedColorGroup(null)
      setSelectedShade(null)
      setTempShadeSelection(null)
    }
  }

  const handleCancelShadeSelection = () => {
    setSelectedColorGroup(null)
    setTempShadeSelection(null)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (multiSelect && onMultipleChange) {
      onMultipleChange([])
    } else {
      onChange(null)
      setSelectedColorGroup(null)
      setSelectedShade(null)
    }
  }

  const isShadeSelected = (variant: ColorVariant) => {
    if (multiSelect) {
      return selectedColors.some(c => c.shadeId === variant.id)
    }
    // In single-select, check both confirmed value and temporary selection
    return value?.shadeId === variant.id || tempShadeSelection?.id === variant.id
  }

  const displayValue = multiSelect ? selectedColors : (value ? [value] : [])

  return (
    <div className="w-full relative">
      {showLabel && (
        <label className="block text-sm font-semibold mb-2">
          {label || t("الألوان والدرجات", "Colors & Shades")}
        </label>
      )}

      <div className="relative">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder={placeholder || t("ابحث عن لون...", "Search for a color...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            className="pr-10 bg-background"
          />
          {(value || selectedColors.length > 0) && (
            <button
              onClick={handleClear}
              className="absolute left-3 top-1/2 -translate-y-1/2 hover:text-foreground text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />

              {/* Dropdown Panel */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 z-50 mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden"
              >
                <div className="max-h-96 overflow-y-auto">
                  {/* Color Groups */}
                  {!selectedColorGroup ? (
                    <div className="p-3">
                      {filteredColors.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          {t("لم يتم العثور على ألوان", "No colors found")}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredColors.map((color) => (
                            <motion.button
                              key={color.id}
                              whileHover={{ x: 4 }}
                              onClick={() => handleColorGroupSelect(color.id)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/10 transition-colors text-left"
                            >
                              {/* Color Circle */}
                              <div
                                className="w-8 h-8 rounded-full border-2 border-border shadow-sm flex-shrink-0"
                                style={{ backgroundColor: color.displayColor }}
                              />
                              {/* Color Name */}
                              <span className="flex-grow font-medium">
                                {language === "ar" ? color.nameAr : color.nameEn}
                              </span>
                              {/* Chevron */}
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Shades Grid */
                    <div className="p-4">
                      {/* Back Button */}
                      <motion.button
                        whileHover={{ x: -4 }}
                        onClick={() => {
                          setSelectedColorGroup(null)
                          setSearchQuery("")
                        }}
                        className="mb-4 flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        <ChevronDown className="w-4 h-4 rotate-90" />
                        {t("العودة", "Back")}
                      </motion.button>

                      {/* Color Name Header */}
                      <div className="mb-4 pb-3 border-b border-border">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
                            style={{
                              backgroundColor:
                                COLORS.find(c => c.id === selectedColorGroup)?.displayColor,
                            }}
                          />
                          <span className="font-semibold text-lg">
                            {language === "ar"
                              ? COLORS.find(c => c.id === selectedColorGroup)?.nameAr
                              : COLORS.find(c => c.id === selectedColorGroup)?.nameEn}
                          </span>
                        </div>
                      </div>

                      {/* Shades Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {colorVariants.map((variant) => (
                          <motion.button
                            key={variant.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleShadeSelect(variant)}
                            className={cn(
                              "relative p-3 rounded-lg border-2 transition-all overflow-hidden",
                              isShadeSelected(variant)
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            {/* Color Preview */}
                            <div
                              className="w-full h-12 rounded-md mb-2 shadow-sm border border-border/50"
                              style={{ backgroundColor: variant.hex }}
                            />
                            {/* Shade Name */}
                            <div className="text-xs font-medium leading-tight">
                              {language === "ar" ? variant.shadeNameAr : variant.shadeNameEn}
                            </div>
                            {/* Check Mark */}
                            {isShadeSelected(variant) && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                              >
                                <Check className="w-3 h-3 text-white" />
                              </motion.div>
                            )}
                          </motion.button>
                        ))}
                      </div>

                      {/* Action Buttons (Only in single-select mode) */}
                      {!multiSelect && (
                        <div className="pt-4 border-t border-border flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCancelShadeSelection}
                            className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors font-medium text-sm"
                          >
                            {t("إلغاء", "Cancel")}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleConfirmShadeSelection}
                            disabled={!tempShadeSelection}
                            className={cn(
                              "flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                              tempShadeSelection
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-muted text-muted-foreground cursor-not-allowed"
                            )}
                          >
                            {t("تأكيد", "Confirm")}
                          </motion.button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Colors Display */}
      {(value || selectedColors.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex flex-wrap gap-2"
        >
          {displayValue.map((selection) => (
            <Badge
              key={selection.shadeId}
              variant="secondary"
              className="gap-2 pl-3 pr-1 py-1.5 flex items-center"
            >
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{
                  backgroundColor:
                    COLORS.find(c => c.id === selection.colorId)?.variants.find(
                      v => v.id === selection.shadeId
                    )?.hex,
                }}
              />
              <span className="text-xs font-medium">{selection.label}</span>
              {multiSelect && (
                <button
                  onClick={() => {
                    if (onMultipleChange) {
                      onMultipleChange(
                        selectedColors.filter(c => c.shadeId !== selection.shadeId)
                      )
                    }
                  }}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
        </motion.div>
      )}
    </div>
  )
}
