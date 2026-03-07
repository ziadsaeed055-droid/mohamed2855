"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Check, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types"
import { getStockStatus, getStockMessage, getStockPercentage, getAvailableQuantity } from "@/lib/stock-utils"

interface StockStatusDisplayProps {
  product: Product
  shadeId: string
  size: string
  className?: string
  compact?: boolean
}

export function StockStatusDisplay({ product, shadeId, size, className, compact = false }: StockStatusDisplayProps) {
  const status = getStockStatus(product, shadeId, size)
  const message = getStockMessage(status)
  const percentage = getStockPercentage(product, shadeId, size)
  const available = getAvailableQuantity(product, shadeId, size)

  if (compact) {
    return (
      <Badge
        className={cn(
          "gap-1",
          status === "available" && "bg-green-100 text-green-800",
          status === "low" && "bg-yellow-100 text-yellow-800",
          status === "out-of-stock" && "bg-red-100 text-red-800",
          className,
        )}
      >
        {status === "available" && <Check className="h-3 w-3" />}
        {status === "low" && <AlertCircle className="h-3 w-3" />}
        {status === "out-of-stock" && <AlertCircle className="h-3 w-3" />}
        {message.ar}
      </Badge>
    )
  }

  return (
    <div className={cn("space-y-2 rounded-lg border p-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">توفر المنتج</span>
        <Badge
          className={cn(
            "gap-1",
            status === "available" && "bg-green-100 text-green-800",
            status === "low" && "bg-yellow-100 text-yellow-800",
            status === "out-of-stock" && "bg-red-100 text-red-800",
          )}
        >
          {status === "available" && <Check className="h-3 w-3" />}
          {status === "low" && <AlertCircle className="h-3 w-3" />}
          {status === "out-of-stock" && <AlertCircle className="h-3 w-3" />}
          {message.ar}
        </Badge>
      </div>

      {status !== "out-of-stock" && (
        <>
          <Progress value={percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {available} من {product.colorSizeStock?.find((s) => s.shadeId === shadeId && s.size === size)?.quantity} وحدة متاحة
          </p>
        </>
      )}

      {status === "out-of-stock" && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-xs text-red-700">هذا المنتج غير متوفر حالياً</span>
        </div>
      )}

      {status === "low" && (
        <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-2">
          <Truck className="h-4 w-4 text-yellow-600" />
          <span className="text-xs text-yellow-700">المخزون محدود، تسرع في الطلب</span>
        </div>
      )}
    </div>
  )
}
