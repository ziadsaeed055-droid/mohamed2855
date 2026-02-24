"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { ColorSelection } from "@/lib/types"
import { getColorVariantById } from "@/lib/types"

interface ColorPreviewImageProps {
  src: string
  alt: string
  colorSelection: ColorSelection | null
  hasSpecificColorImage?: boolean
  className?: string
  objectFit?: "cover" | "contain" | "fill"
  priority?: boolean
}

export function ColorPreviewImage({
  src,
  alt,
  colorSelection,
  hasSpecificColorImage = false,
  className = "w-full h-auto",
  objectFit = "cover",
  priority = false,
}: ColorPreviewImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  // Get the hex color for overlay
  const hexColor = colorSelection ? getColorVariantById(colorSelection.shadeId)?.hex : null

  // Calculate intelligent overlay opacity based on color darkness
  const getOverlayOpacity = (): number => {
    if (!hexColor) return 0
    if (hasSpecificColorImage) return 0 // Don't apply overlay if there's a specific image

    // Extract RGB from hex
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    // Higher opacity for very dark or very light colors
    if (luminance < 0.3 || luminance > 0.7) return 0.15
    return 0.1
  }

  const overlayOpacity = getOverlayOpacity()

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Main Image */}
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          "object-cover transition-all duration-500",
          imageLoaded && colorSelection && !hasSpecificColorImage ? "opacity-95" : ""
        )}
        style={{
          objectFit: objectFit,
        }}
        onLoadingComplete={() => setImageLoaded(true)}
        priority={priority}
      />

      {/* Color Overlay - Only if no specific color image */}
      {colorSelection && !hasSpecificColorImage && imageLoaded && (
        <div
          className="absolute inset-0 transition-all duration-500 pointer-events-none"
          style={{
            backgroundColor: hexColor || "transparent",
            opacity: overlayOpacity,
            mixBlendMode: "multiply",
          }}
        />
      )}

      {/* Subtle gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
    </div>
  )
}
