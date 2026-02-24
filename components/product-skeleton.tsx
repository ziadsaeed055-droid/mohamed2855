"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function ProductSkeleton({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        viewMode === "grid" ? "space-y-4" : "flex gap-4 p-4"
      )}
    >
      {/* Image skeleton */}
      <div className={cn(
        "bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-2xl animate-pulse",
        viewMode === "grid" ? "w-full h-64" : "w-32 h-32 flex-shrink-0"
      )} />
      
      {/* Content skeleton */}
      <div className={cn("space-y-3", viewMode === "list" ? "flex-1" : "w-full")}>
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded animate-pulse w-1/2" />
        </div>

        {/* Price skeleton */}
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded animate-pulse w-24" />
          <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded animate-pulse w-16" />
        </div>

        {/* Button skeleton */}
        <div className="h-10 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-lg animate-pulse mt-4" />
      </div>
    </motion.div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <ProductSkeleton />
        </motion.div>
      ))}
    </div>
  )
}
