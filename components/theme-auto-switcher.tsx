"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

export function ThemeAutoSwitcher() {
  const { setTheme } = useTheme()

  useEffect(() => {
    // Check system preference first
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches

    // Check time of day (optional enhancement)
    const hour = new Date().getHours()
    const isNightTime = hour >= 19 || hour < 6

    // Auto-switch based on time or system preference
    if (isDarkMode || isNightTime) {
      setTheme("dark")
    } else {
      setTheme("light")
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [setTheme])

  return null
}
