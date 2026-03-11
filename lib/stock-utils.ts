import type { Product, ColorSizeStock } from "@/lib/types"

export function getColorSizeStock(product: Product, shadeId: string, size: string): ColorSizeStock | undefined {
  if (!product.colorSizeStock) return undefined
  return product.colorSizeStock.find((stock) => stock.shadeId === shadeId && stock.size === size)
}

export function getAvailableQuantity(product: Product, shadeId: string, size: string): number {
  const stock = getColorSizeStock(product, shadeId, size)
  if (!stock) return 0
  const reserved = stock.reservedQuantity || 0
  return Math.max(0, stock.quantity - reserved)
}

export function isStockAvailable(product: Product, shadeId: string, size: string, requestedQuantity: number): boolean {
  const available = getAvailableQuantity(product, shadeId, size)
  return available >= requestedQuantity
}

export function isLowStock(product: Product, shadeId: string, size: string, threshold = 5): boolean {
  const available = getAvailableQuantity(product, shadeId, size)
  return available > 0 && available <= threshold
}

export function isSoldOut(product: Product, shadeId: string, size: string): boolean {
  const available = getAvailableQuantity(product, shadeId, size)
  return available === 0
}

export function getStockStatus(product: Product, shadeId: string, size: string): "available" | "low" | "out-of-stock" {
  if (isSoldOut(product, shadeId, size)) return "out-of-stock"
  if (isLowStock(product, shadeId, size)) return "low"
  return "available"
}

export function getStockMessage(status: "available" | "low" | "out-of-stock"): { ar: string; en: string } {
  switch (status) {
    case "available":
      return { ar: "متوفر", en: "Available" }
    case "low":
      return { ar: "المخزون محدود", en: "Limited Stock" }
    case "out-of-stock":
      return { ar: "غير متوفر الآن", en: "Out of Stock" }
  }
}

export function getStockPercentage(product: Product, shadeId: string, size: string): number {
  const stock = getColorSizeStock(product, shadeId, size)
  if (!stock || stock.quantity === 0) return 0
  const available = getAvailableQuantity(product, shadeId, size)
  return Math.round((available / stock.quantity) * 100)
}

export function getAllSizesForShade(product: Product, shadeId: string): string[] {
  if (!product.colorSizeStock) return []
  return [...new Set(product.colorSizeStock.filter((s) => s.shadeId === shadeId).map((s) => s.size))]
}

export function getAvailableSizesForShade(product: Product, shadeId: string): string[] {
  if (!product.colorSizeStock) return []
  return product.colorSizeStock
    .filter((s) => s.shadeId === shadeId && getAvailableQuantity(product, shadeId, s.size) > 0)
    .map((s) => s.size)
}

export function getAvailableShadesForSize(product: Product, size: string): string[] {
  if (!product.colorSizeStock) return []
  return product.colorSizeStock
    .filter((s) => s.size === size && getAvailableQuantity(product, s.shadeId, size) > 0)
    .map((s) => s.shadeId)
    .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
}

export function getTotalStockForProduct(product: Product): number {
  if (!product.colorSizeStock) return 0
  return product.colorSizeStock.reduce((sum, stock) => sum + stock.quantity, 0)
}

export function getTotalAvailableStock(product: Product): number {
  if (!product.colorSizeStock) return 0
  return product.colorSizeStock.reduce((sum, stock) => {
    const reserved = stock.reservedQuantity || 0
    return sum + Math.max(0, stock.quantity - reserved)
  }, 0)
}
