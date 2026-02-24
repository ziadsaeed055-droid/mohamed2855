"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { Product } from "@/lib/types"

interface RecentlyViewedContextType {
  recentlyViewed: Product[]
  addToRecentlyViewed: (product: Product) => void
  clearRecentlyViewed: () => void
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined)

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("recentlyViewed")
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored))
      } catch (error) {
        console.error("[v0] Error loading recently viewed:", error)
      }
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed))
    }
  }, [recentlyViewed, isHydrated])

  const addToRecentlyViewed = useCallback((product: Product) => {
    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== product.id)
      // Add to beginning, limit to 12 items
      return [product, ...filtered].slice(0, 12)
    })
  }, [])

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([])
    localStorage.removeItem("recentlyViewed")
  }, [])

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentlyViewed,
        addToRecentlyViewed,
        clearRecentlyViewed,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext)
  if (!context) {
    throw new Error("useRecentlyViewed must be used within RecentlyViewedProvider")
  }
  return context
}
