"use client"

import { useScrollToTop } from "@/hooks/use-scroll-to-top"

/**
 * Component that automatically scrolls to top on route changes
 * Must be placed inside router context (app directory)
 */
export function ScrollToTop() {
  useScrollToTop()
  return null
}
