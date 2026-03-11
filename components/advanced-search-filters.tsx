"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SearchFilters } from "@/lib/search-utils"

interface AdvancedSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
  priceRange?: { min: number; max: number }
  availableSizes?: string[]
  availableColors?: string[]
  categories?: Array<{ id: string; nameAr: string; nameEn: string }>
}

export function AdvancedSearchFilters({
  onFiltersChange,
  priceRange = { min: 0, max: 1000 },
  availableSizes = ["XS", "S", "M", "L", "XL", "XXL"],
  availableColors = ["أسود", "أبيض", "أحمر", "أزرق", "أخضر"],
}: AdvancedSearchFiltersProps) {
  const [query, setQuery] = useState("")
  const [selectedPriceRange, setSelectedPriceRange] = useState([priceRange.min, priceRange.max])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SearchFilters["sortBy"]>("popular")
  const [inStock, setInStock] = useState(false)

  const handleApplyFilters = () => {
    onFiltersChange({
      query: query || undefined,
      minPrice: selectedPriceRange[0],
      maxPrice: selectedPriceRange[1],
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      colors: selectedColors.length > 0 ? selectedColors : undefined,
      sortBy,
      inStock: inStock || undefined,
    })
  }

  const handleReset = () => {
    setQuery("")
    setSelectedPriceRange([priceRange.min, priceRange.max])
    setSelectedSizes([])
    setSelectedColors([])
    setSortBy("popular")
    setInStock(false)
    onFiltersChange({})
  }

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))
  }

  const toggleColor = (color: string) => {
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]))
  }

  const hasActiveFilters =
    query ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedPriceRange[0] !== priceRange.min ||
    selectedPriceRange[1] !== priceRange.max ||
    inStock

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">البحث والفلترة</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
            <X className="h-4 w-4" />
            إعادة تعيين
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">البحث</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن منتج..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">نطاق السعر</label>
            <div className="space-y-3">
              <Slider
                value={selectedPriceRange}
                onValueChange={setSelectedPriceRange}
                min={priceRange.min}
                max={priceRange.max}
                step={10}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm">{selectedPriceRange[0]} ريال</span>
                <span className="text-sm">{selectedPriceRange[1]} ريال</span>
              </div>
            </div>
          </div>

          {/* Sizes */}
          {availableSizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">المقاسات</label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSizes.includes(size) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">الألوان</label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <Badge
                    key={color}
                    variant={selectedColors.includes(color) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleColor(color)}
                  >
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sort */}
          <div className="space-y-2">
            <label className="text-sm font-medium">ترتيب حسب</label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">الأكثر شهرة</SelectItem>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="price-asc">السعر: من الأقل للأعلى</SelectItem>
                <SelectItem value="price-desc">السعر: من الأعلى للأقل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* In Stock */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="in-stock"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="in-stock" className="text-sm cursor-pointer">
              المنتجات المتوفرة فقط
            </label>
          </div>

          {/* Apply Button */}
          <Button onClick={handleApplyFilters} className="w-full" size="lg">
            <Settings2 className="mr-2 h-4 w-4" />
            تطبيق الفلاتر
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
