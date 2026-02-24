"use client"

import { getColorVariantById, type ColorSelection } from "@/lib/types"
import React from "react"

interface ColorPreviewOverlayProps {
  selectedColor: ColorSelection | null
  mainImage: string
  imageClass?: string
}

/**
 * Component that shows intelligent color overlay preview on product image
 * Creates a subtle color tint based on selected shade without distorting the image
 */
export function ColorPreviewOverlay({
  selectedColor,
  mainImage,
  imageClass = "",
}: ColorPreviewOverlayProps) {
  const variant = selectedColor ? getColorVariantById(selectedColor.shadeId) : null
  const hexColor = variant?.hex || "#ffffff"

  // Calculate opacity based on shade darkness for subtle effect
  const isDarkShade = parseInt(hexColor.slice(1, 3), 16) < 128
  const opacity = isDarkShade ? 0.08 : 0.06

  return (
    <div className="relative w-full h-full">
      {/* Main product image */}
      <img
        src={mainImage}
        alt="Product"
        className={imageClass}
      />

      {/* Intelligent color overlay */}
      {selectedColor && (
        <div
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{
            backgroundColor: hexColor,
            opacity: opacity,
            mixBlendMode: "multiply",
          }}
        />
      )}

      {/* Color indicator badge */}
      {selectedColor && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
          <div
            className="w-3 h-3 rounded-full border border-white"
            style={{ backgroundColor: hexColor }}
          />
          <span className="text-xs font-medium text-slate-700">
            {selectedColor.label}
          </span>
        </div>
      )}
    </div>
  )
}
