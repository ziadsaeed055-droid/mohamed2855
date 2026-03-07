import type { Product } from "@/lib/types"

export interface SearchFilters {
  query?: string
  minPrice?: number
  maxPrice?: number
  category?: string
  subCategory?: string
  sizes?: string[]
  colors?: string[]
  rating?: number // 3+ stars for example
  inStock?: boolean
  tags?: string[]
  sortBy?: "price-asc" | "price-desc" | "newest" | "popular" | "rating"
}

export function searchAndFilterProducts(products: Product[], filters: SearchFilters): Product[] {
  let filtered = [...products]

  // Search by name
  if (filters.query) {
    const query = filters.query.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.nameAr.toLowerCase().includes(query) ||
        p.nameEn.toLowerCase().includes(query) ||
        p.descriptionAr.toLowerCase().includes(query) ||
        p.descriptionEn.toLowerCase().includes(query),
    )
  }

  // Filter by price
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.discountedPrice >= filters.minPrice!)
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.discountedPrice <= filters.maxPrice!)
  }

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter((p) => p.category === filters.category)
  }
  if (filters.subCategory) {
    filtered = filtered.filter((p) => p.subCategory === filters.subCategory)
  }

  // Filter by sizes
  if (filters.sizes && filters.sizes.length > 0) {
    filtered = filtered.filter((p) => filters.sizes!.some((size) => p.sizes.includes(size)))
  }

  // Filter by colors
  if (filters.colors && filters.colors.length > 0) {
    filtered = filtered.filter((p) =>
      filters.colors!.some((color) => p.colors.some((c) => c.shadeId === color || c.colorId === color)),
    )
  }

  // Filter by stock
  if (filters.inStock) {
    filtered = filtered.filter((p) => {
      if (!p.colorSizeStock) return false
      return p.colorSizeStock.some((s) => (s.quantity - (s.reservedQuantity || 0)) > 0)
    })
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter((p) => filters.tags!.some((tag) => p.tags?.includes(tag)))
  }

  // Sort
  switch (filters.sortBy) {
    case "price-asc":
      filtered.sort((a, b) => a.discountedPrice - b.discountedPrice)
      break
    case "price-desc":
      filtered.sort((a, b) => b.discountedPrice - a.discountedPrice)
      break
    case "newest":
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case "popular":
      filtered.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      break
  }

  return filtered
}

// Fuzzy search for better results
export function fuzzySearch(query: string, items: string[]): string[] {
  const q = query.toLowerCase()
  return items
    .map((item) => ({
      item,
      score: calculateFuzzyScore(q, item.toLowerCase()),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
}

function calculateFuzzyScore(query: string, text: string): number {
  let score = 0
  let queryIdx = 0

  for (let i = 0; i < text.length && queryIdx < query.length; i++) {
    if (text[i] === query[queryIdx]) {
      score += 1
      queryIdx++
    }
  }

  if (queryIdx !== query.length) return 0

  // Bonus for consecutive matches
  if (text.includes(query)) score += 10

  // Bonus for match at start
  if (text.startsWith(query)) score += 5

  return score
}

// Get price range for products
export function getPriceRange(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 0 }

  const prices = products.map((p) => p.discountedPrice)
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  }
}

// Get available filters for current products
export function getAvailableFilters(products: Product[]) {
  const sizes = new Set<string>()
  const colors = new Set<string>()
  const categories = new Set<string>()
  const subCategories = new Set<string>()

  products.forEach((p) => {
    p.sizes.forEach((s) => sizes.add(s))
    p.colors.forEach((c) => {
      colors.add(c.shadeId)
      colors.add(c.colorId)
    })
    categories.add(p.category)
    subCategories.add(p.subCategory)
  })

  return {
    sizes: Array.from(sizes),
    colors: Array.from(colors),
    categories: Array.from(categories),
    subCategories: Array.from(subCategories),
    priceRange: getPriceRange(products),
  }
}
