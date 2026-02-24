"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Rotate3D, Maximize2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface Product360ViewerProps {
  images: string[]
  productName: string
  className?: string
}

export function Product360Viewer({ images, productName, className }: Product360ViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [rotation, setRotation] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const diff = e.clientX - startX
    const newRotation = rotation + diff
    setRotation(newRotation)
    
    // Calculate index based on rotation
    const sensitivity = 15 // pixels per image change
    const imageChange = Math.floor(Math.abs(newRotation) / sensitivity)
    const direction = newRotation > 0 ? 1 : -1
    const newIndex = (currentIndex + imageChange * direction) % images.length
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex < 0 ? images.length + newIndex : newIndex)
      setRotation(0)
      setStartX(e.clientX)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setRotation(0)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const diff = e.touches[0].clientX - startX
    const newRotation = rotation + diff
    setRotation(newRotation)
    
    const sensitivity = 15
    const imageChange = Math.floor(Math.abs(newRotation) / sensitivity)
    const direction = newRotation > 0 ? 1 : -1
    const newIndex = (currentIndex + imageChange * direction) % images.length
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex < 0 ? images.length + newIndex : newIndex)
      setRotation(0)
      setStartX(e.touches[0].clientX)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setRotation(0)
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (images.length < 2) {
    return (
      <div className={cn("relative w-full h-full bg-muted rounded-xl overflow-hidden", className)}>
        <Image
          src={images[0] || "/placeholder.svg"}
          alt={productName}
          fill
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div className={cn("relative w-full h-full", className)}>
      {/* Main Viewer */}
      <div
        ref={containerRef}
        className={cn(
          "relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden select-none touch-none",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`${productName} - View ${currentIndex + 1}`}
          fill
          className={cn(
            "object-contain p-4 transition-transform duration-150",
            !isDragging && "cursor-grab"
          )}
          draggable={false}
        />

        {/* 360 Badge */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
          <Rotate3D className="w-4 h-4 text-white" />
          <span className="text-xs font-medium text-white">360°</span>
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg h-10 w-10 rounded-full"
          onClick={prevImage}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg h-10 w-10 rounded-full"
          onClick={nextImage}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        {/* Progress Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
          <span className="text-xs font-medium text-white">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        {/* Fullscreen Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white shadow-lg h-9 w-9 rounded-full"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-screen-xl w-full h-[90vh] p-0">
            <div className="relative w-full h-full">
              <Product360Viewer images={images} productName={productName} className="h-full" />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-thin pb-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
              currentIndex === idx
                ? "border-[#1a365d] ring-2 ring-[#1a365d]/20 scale-105"
                : "border-transparent hover:border-slate-300"
            )}
          >
            <Image src={img || "/placeholder.svg"} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {/* Instructions */}
      <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-2">
        <Rotate3D className="w-3.5 h-3.5" />
        <span>اسحب لليمين أو لليسار للدوران</span>
      </p>
    </div>
  )
}
