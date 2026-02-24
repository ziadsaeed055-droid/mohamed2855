"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Custom hook to scroll to top when route changes
 * Ensures all page navigations start from the top of the page
 */
export function useScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Scroll to top smoothly when pathname changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    })
  }, [pathname])
}
