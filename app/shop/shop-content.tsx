"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useLanguage } from "@/contexts/language-context"
import { CATEGORIES, COLORS, type Product, type ColorSelection } from "@/lib/types"
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  Loader2,
  Search,
  X,
  Sparkles,
  ArrowUpDown,
  Tag,
  Palette,
  Package,
  Crown,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatWidget } from "@/components/chat-widget"
import Image from "next/image"
import { InlineLoader, FullPageLoader } from "@/components/premium-loader"
import { ProductSkeleton } from "@/components/product-skeleton"
import { EmptyProductsState } from "@/components/empty-products-state"
import { ActiveFiltersDisplay } from "@/components/active-filters-display"
import { ProductCountBadge } from "@/components/product-count-badge"
import { ShopBreadcrumbs } from "@/components/shop-breadcrumbs"
import { QuickFilters } from "@/components/quick-filters"
import { ViewModeToggle } from "@/components/view-mode-toggle"
import { MobileFilterButton } from "@/components/mobile-filter-button"
import { PriceDisplay } from "@/components/price-display"
import { ColorSearchSelector } from "@/components/color-search-selector"

export default function ShopPageContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const subCategoryParam = searchParams.get("subCategory") || searchParams.get("sub")
  const featuredParam = searchParams.get("featured")

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedCategory, setSelectedCategory] = useState<string>(() => categoryParam || "all")
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(() => (subCategoryParam ? [subCategoryParam] : []))
  const [selectedColors, setSelectedColors] = useState<ColorSelection[]>([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [showFilters, setShowFilters] = useState(true)

  const { t, language } = useLanguage()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      // Simple query: fetch all active products, then filter client-side
      // This avoids requiring composite Firestore indexes
      let q;
      if (selectedCategory && selectedCategory !== "all") {
        q = query(
          collection(db, "products"),
          where("isActive", "==", true),
          where("category", "==", selectedCategory)
        )
      } else {
        q = query(
          collection(db, "products"),
          where("isActive", "==", true)
        )
      }

      const snapshot = await getDocs(q)

      let productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[]

      // Client-side filtering for subcategories
      if (selectedSubCategories.length > 0) {
        productsData = productsData.filter((p) => selectedSubCategories.includes(p.subCategory))
      }

      // Featured filter
      if (featuredParam === "true") {
        productsData = productsData.filter((p) => p.isFeatured === true)
      }

      // Color filter - support new ColorSelection format
      if (selectedColors.length > 0) {
        productsData = productsData.filter((p) => {
          return p.colors?.some((color) => {
            // Support both new ColorSelection format and legacy string format
            if (typeof color === 'string') {
              return selectedColors.some(sc => sc.shadeId === color || sc.colorId === color)
            }
            return selectedColors.some(sc => sc.shadeId === color.shadeId || sc.colorId === color.colorId)
          }) || false
        })
      }

      // Price range filter
      productsData = productsData.filter((p) => {
        const price = p.discount && p.discount > 0 ? (p.discountedPrice || p.salePrice) : p.salePrice
        return price >= priceRange[0] && price <= priceRange[1]
      })

      // Search filter
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase()
        productsData = productsData.filter(
          (p) =>
            p.nameAr?.toLowerCase().includes(queryLower) ||
            p.nameEn?.toLowerCase().includes(queryLower) ||
            p.descriptionAr?.toLowerCase().includes(queryLower) ||
            p.descriptionEn?.toLowerCase().includes(queryLower) ||
            p.productCode?.toLowerCase().includes(queryLower),
        )
      }

      // Client-side sorting
      switch (sortBy) {
        case "price-low":
          productsData.sort((a, b) => (a.discountedPrice || a.salePrice) - (b.discountedPrice || b.salePrice))
          break
        case "price-high":
          productsData.sort((a, b) => (b.discountedPrice || b.salePrice) - (a.discountedPrice || a.salePrice))
          break
        case "name":
          productsData.sort((a, b) =>
            language === "ar" ? (a.nameAr || "").localeCompare(b.nameAr || "") : (a.nameEn || "").localeCompare(b.nameEn || ""),
          )
          break
        default:
          productsData.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt as any)
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt as any)
            return dateB.getTime() - dateA.getTime()
          })
      }

      setProducts(productsData)
      setFilteredProducts(productsData)
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedSubCategories, selectedColors, priceRange, sortBy, featuredParam, language, searchQuery])

  useEffect(() => {
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam)
    }
  }, [categoryParam, selectedCategory])

  useEffect(() => {
    if (subCategoryParam && !selectedSubCategories.includes(subCategoryParam)) {
      setSelectedSubCategories([subCategoryParam])
    }
  }, [subCategoryParam, selectedSubCategories])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedSubCategories([])
    setSelectedColors([])
    setPriceRange([0, 10000])
    setSortBy("newest")
  }

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    selectedSubCategories.length +
    selectedColors.length +
    (priceRange[0] !== 0 || priceRange[1] !== 10000 ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Search className="w-3.5 h-3.5" />
          {t("البحث", "Search")}
        </h3>
        <div className="relative">
          <Input
            placeholder={t("ابحث عن منتج...", "Search products...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 ps-4 pe-10 bg-muted/50 border-0 rounded-xl focus:bg-background focus:ring-2 focus:ring-[#1a365d]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Tag className="w-3.5 h-3.5" />
          {t("الأقسام", "Categories")}
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => {
              setSelectedCategory("all")
              setSelectedSubCategories([]) // Clear subcategories when selecting all
            }}
            className={cn(
              "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              selectedCategory === "all" ? "bg-[#1a365d] text-white shadow-md" : "hover:bg-muted text-foreground",
            )}
          >
            <span>{t("جميع المنتجات", "All Products")}</span>
            {selectedCategory === "all" && <Crown className="w-4 h-4" />}
          </button>
          {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id)
              setSelectedSubCategories([]) // Clear subcategories when category changes
            }}
            className={cn(
              "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              selectedCategory === cat.id ? "bg-[#1a365d] text-white shadow-md" : "hover:bg-muted text-foreground",
            )}
          >
            <span>{t(cat.nameAr, cat.nameEn)}</span>
            {selectedCategory === cat.id && <Crown className="w-4 h-4" />}
          </button>
        ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Package className="w-3.5 h-3.5" />
          {t("الفئات الفرعية", "Sub Categories")}
        </h3>
        <div className="space-y-1.5 max-h-44 overflow-y-auto pe-2 scrollbar-thin">
          {selectedCategory && selectedCategory !== "all"
            ? CATEGORIES.find((c) => c.id === selectedCategory)?.subCategories.map((sub) => (
                <label
                  key={sub.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                    selectedSubCategories.includes(sub.id) ? "bg-[#1a365d]/10 ring-1 ring-[#1a365d]/30" : "hover:bg-muted",
                  )}
                >
                  <Checkbox
                    checked={selectedSubCategories.includes(sub.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSubCategories([...selectedSubCategories, sub.id])
                      } else {
                        setSelectedSubCategories(selectedSubCategories.filter((s) => s !== sub.id))
                      }
                    }}
                    className="data-[state=checked]:bg-[#1a365d] data-[state=checked]:border-[#1a365d]"
                  />
                  <span className="text-sm">{t(sub.nameAr, sub.nameEn)}</span>
                </label>
              ))
            : null}
          {selectedCategory === "all" && (
            <p className="text-xs text-muted-foreground px-3 py-2">
              {t("اختر قسماً لعرض الفئات", "Select a category to see subcategories")}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <ColorSearchSelector
          value={null}
          onChange={() => {}} // Not used in filter mode
          multiSelect={true}
          selectedColors={selectedColors}
          onMultipleChange={setSelectedColors}
          showLabel={true}
          label={`${t("الألوان والدرجات", "Colors & Shades")}`}
          compact={true}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5" />
          {t("نطاق السعر", "Price Range")}
        </h3>
        <div className="px-1">
          <Slider min={0} max={10000} step={100} value={priceRange} onValueChange={setPriceRange} className="my-4" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2.5 text-center">
            <span className="text-xs text-muted-foreground">{t("من", "From")}</span>
            <p className="font-bold text-sm text-[#1a365d]">
              {priceRange[0]} {t("ج.م", "EGP")}
            </p>
          </div>
          <div className="w-4 h-px bg-border" />
          <div className="flex-1 bg-muted/50 rounded-xl px-3 py-2.5 text-center">
            <span className="text-xs text-muted-foreground">{t("إلى", "To")}</span>
            <p className="font-bold text-sm text-[#1a365d]">
              {priceRange[1]} {t("ج.م", "EGP")}
            </p>
          </div>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button
          onClick={clearFilters}
          variant="outline"
          className="w-full h-11 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all bg-transparent rounded-xl"
        >
          <X className="w-4 h-4" />
          {t("مسح الفلاتر", "Clear Filters")}
          <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
            {activeFiltersCount}
          </span>
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/images/image.png" alt="Seven Blue Banner" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a365d]/60 via-[#1a365d]/40 to-[#1a365d]/80" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-medium text-white/95">
                  {t("اكتشف أحدث التشكيلات", "Discover Latest Collections")}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white tracking-tight">
                {t("المتجر", "Shop")}
              </h1>

              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                {t(
                  "اكتشف مجموعتنا الفاخرة من الأزياء الراقية المصممة بعناية لتناسب ذوقك المميز",
                  "Discover our premium collection of high-end fashion designed to match your distinguished taste",
                )}
              </p>

              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Package className="w-5 h-5" />
                  <span className="font-semibold">
                    {filteredProducts.length} {t("منتج", "Products")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Crown className="w-5 h-5 text-amber-300" />
                  <span className="font-semibold">{t("جودة عالية", "Premium Quality")}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0">
            <svg viewBox="0 0 1440 100" className="w-full h-auto fill-slate-50">
              <path d="M0,100 L0,60 Q360,0 720,60 T1440,60 L1440,100 Z" />
            </svg>
          </div>
        </section>

        <ShopBreadcrumbs 
          category={selectedCategory} 
          subCategory={selectedSubCategories[0]} 
        />

        <section className="py-8 md:py-12 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-4 bg-white rounded-2xl shadow-sm border">
              <div className="flex items-center gap-3">
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button
                      variant="outline"
                      className={cn(
                        "gap-2 h-11 px-4 rounded-xl transition-all",
                        activeFiltersCount > 0 ? "border-[#1a365d] bg-[#1a365d]/5 text-[#1a365d]" : "",
                      )}
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      {t("الفلاتر", "Filters")}
                      {activeFiltersCount > 0 && (
                        <span className="bg-[#1a365d] text-white px-2 py-0.5 rounded-full text-xs font-bold">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side={language === "ar" ? "right" : "left"}
                    className="w-full sm:max-w-md overflow-y-auto"
                  >
                    <SheetHeader className="pb-6 border-b mb-6">
                      <SheetTitle className="text-xl font-bold">{t("تصفية المنتجات", "Filter Products")}</SheetTitle>
                    </SheetHeader>
                    <FilterContent />
                  </SheetContent>
                </Sheet>

                <Button
                  variant="ghost"
                  onClick={() => setShowFilters(!showFilters)}
                  className="hidden lg:flex gap-2 h-11 px-4 rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {showFilters ? t("إخفاء الفلاتر", "Hide Filters") : t("إظهار الفلاتر", "Show Filters")}
                  <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
                </Button>

                <div className="text-sm text-muted-foreground hidden sm:block">
                  {t(`عرض ${filteredProducts.length} منتج`, `Showing ${filteredProducts.length} products`)}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44 h-11 bg-muted/50 border-0 rounded-xl focus:ring-2 focus:ring-[#1a365d]/20">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder={t("ترتيب حسب", "Sort by")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t("الأحدث", "Newest")}</SelectItem>
                    <SelectItem value="price-low">{t("السعر: من الأقل للأعلى", "Price: Low to High")}</SelectItem>
                    <SelectItem value="price-high">{t("السعر: من الأعلى للأقل", "Price: High to Low")}</SelectItem>
                    <SelectItem value="name">{t("الاسم", "Name")}</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={cn("h-11 w-11 rounded-xl", viewMode === "grid" && "bg-[#1a365d] text-white border-[#1a365d]")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={cn("h-11 w-11 rounded-xl", viewMode === "list" && "bg-[#1a365d] text-white border-[#1a365d]")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <ActiveFiltersDisplay
                category={selectedCategory}
                subCategories={selectedSubCategories}
                colors={selectedColors}
                priceRange={priceRange}
                onRemove={(type, value) => {
                  if (type === "category") setSelectedCategory("all")
                  if (type === "subCategory") setSelectedSubCategories(selectedSubCategories.filter(s => s !== value))
                  if (type === "color") setSelectedColors(selectedColors.filter(c => c !== value))
                  if (type === "price") setPriceRange([0, 10000])
                }}
                onClearAll={clearFilters}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {showFilters && (
                <aside className="hidden lg:block lg:col-span-1">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border sticky top-8">
                    <FilterContent />
                  </div>
                </aside>
              )}

              <div className={cn("col-span-1", showFilters ? "lg:col-span-3" : "lg:col-span-4")}>
                {loading ? (
                  <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" : "space-y-4"}>
                    {[...Array(6)].map((_, i) => (
                      <ProductSkeleton key={i} viewMode={viewMode} />
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <EmptyProductsState
                    hasFilters={activeFiltersCount > 0}
                    onClearFilters={clearFilters}
                  />
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow"
                      >
                        <Image
                          src={product.mainImage || "/images/placeholder.png"}
                          alt={product.nameEn}
                          width={120}
                          height={120}
                          className="rounded-xl object-cover w-32 h-32"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{language === "ar" ? product.nameAr : product.nameEn}</h3>
                          <p className="text-muted-foreground text-sm mb-4">{language === "ar" ? product.descriptionAr : product.descriptionEn}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-[#1a365d]">
                                {product.discount > 0 ? product.discountedPrice : product.salePrice} EGP
                              </span>
                              {product.discount > 0 && (
                                <span className="text-sm text-muted-foreground line-through">{product.salePrice} EGP</span>
                              )}
                            </div>
                            <Button className="bg-[#1a365d] hover:bg-[#1a365d]/90 rounded-xl">
                              {t("اضف للسلة", "Add to Cart")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>  {/* End of grid */}
          </div>
        </section>
      </main>

      <ChatWidget />
      <Footer />
    </div>
  )
}
