"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  categories: string[]
  brands: string[]
  colors: string[]
}

export interface FilterState {
  priceRange: [number, number]
  categories: string[]
  brands: string[]
  colors: string[]
  rating: number
  inStock: boolean
}

export function AdvancedFilters({ onFiltersChange, categories, brands, colors }: AdvancedFiltersProps) {
  const { t } = useLanguage()
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 10000],
    categories: [],
    brands: [],
    colors: [],
    rating: 0,
    inStock: false
  })

  const updateFilters = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    updateFilters("categories", newCategories)
  }

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand]
    updateFilters("brands", newBrands)
  }

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color]
    updateFilters("colors", newColors)
  }

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      priceRange: [0, 10000],
      categories: [],
      brands: [],
      colors: [],
      rating: 0,
      inStock: false
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  return (
    <Card className="p-6 space-y-6 sticky top-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{t("فلترة المنتجات", "Filter Products")}</h3>
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <X className="w-4 h-4 mr-2" />
          {t("إعادة تعيين", "Reset")}
        </Button>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">
          {t("نطاق السعر", "Price Range")}
        </Label>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => updateFilters("priceRange", value as [number, number])}
          max={10000}
          step={100}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{filters.priceRange[0]} {t("ج.م", "EGP")}</span>
          <span>{filters.priceRange[1]} {t("ج.م", "EGP")}</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">
          {t("التقييم", "Rating")}
        </Label>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => updateFilters("rating", rating === filters.rating ? 0 : rating)}
              className={`flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted transition-colors ${
                filters.rating === rating ? "bg-primary/10 border border-primary" : ""
              }`}
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm">
                {t("وأكثر", "& Up")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold">
            {t("الفئات", "Categories")}
          </Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map((category) => (
              <div key={category} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <Label
                  htmlFor={`cat-${category}`}
                  className="text-sm cursor-pointer"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold">
            {t("العلامات التجارية", "Brands")}
          </Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center gap-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={() => handleBrandToggle(brand)}
                />
                <Label
                  htmlFor={`brand-${brand}`}
                  className="text-sm cursor-pointer"
                >
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold">
            {t("الألوان", "Colors")}
          </Label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorToggle(color)}
                className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                  filters.colors.includes(color)
                    ? "border-primary ring-2 ring-primary/30 scale-110"
                    : "border-border hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              >
                {filters.colors.includes(color) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full border border-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* In Stock */}
      <div className="flex items-center gap-2 pt-3 border-t">
        <Checkbox
          id="inStock"
          checked={filters.inStock}
          onCheckedChange={(checked) => updateFilters("inStock", checked)}
        />
        <Label htmlFor="inStock" className="cursor-pointer">
          {t("المنتجات المتوفرة فقط", "In Stock Only")}
        </Label>
      </div>
    </Card>
  )
}
