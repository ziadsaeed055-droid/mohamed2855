"use client"

import { useLanguage } from "@/contexts/language-context"
import { AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ColorSizeStock } from "@/lib/types"

interface StockAvailabilityProps {
  stock?: ColorSizeStock | null
  size?: string
  showLabel?: boolean
  compact?: boolean
}

export function StockAvailability({
  stock,
  size,
  showLabel = true,
  compact = false,
}: StockAvailabilityProps) {
  const { t, language } = useLanguage()

  if (!stock) {
    return null
  }

  const { quantity, reservedQuantity = 0, isLowStock = false } = stock
  const availableQty = quantity - reservedQuantity

  // Determine status
  const isOutOfStock = availableQty <= 0
  const isLow = availableQty > 0 && availableQty <= 3

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <>
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-xs font-medium text-destructive">
              {t("غير متوفر", "Out of Stock")}
            </span>
          </>
        ) : isLow ? (
          <>
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-amber-600">
              {t(`${availableQty} متبقي`, `${availableQty} left`)}
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-600">
              {t("متوفر", "In Stock")}
            </span>
          </>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all",
        isOutOfStock
          ? "bg-destructive/10 border-destructive/30"
          : isLow
            ? "bg-amber-50 border-amber-200"
            : "bg-green-50 border-green-200"
      )}
    >
      <div className="flex items-start gap-3">
        {isOutOfStock ? (
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        ) : isLow ? (
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        )}

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            {isOutOfStock
              ? t("غير متوفر حالياً", "Currently Out of Stock")
              : isLow
                ? t(`${availableQty} فقط متبقي`, `Only ${availableQty} left`)
                : t("متوفر في المخزون", "In Stock")}
          </p>

          {showLabel && (
            <p className="text-xs text-muted-foreground mt-1">
              {isOutOfStock
                ? t("سيتم التنبيه عند التوفر", "We'll notify you when available")
                : size
                  ? t(`حجم ${size}`, `Size ${size}`)
                  : t("تحقق من التوفر", "Check availability")}
            </p>
          )}

          {isOutOfStock && (
            <button className="text-xs text-primary hover:underline mt-2 font-medium">
              {t("أخبرني عند التوفر", "Notify me")}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
