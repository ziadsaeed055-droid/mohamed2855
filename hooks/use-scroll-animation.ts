"use client"

import { useRef, useEffect } from "react"
import { useInView } from "framer-motion"

interface UseScrollAnimationOptions {
  threshold?: number
  margin?: string
  once?: boolean
}

export function useScrollAnimation({
  threshold = 0.2,
  margin = "-100px",
  once = true,
}: UseScrollAnimationOptions = {}) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once,
    amount: threshold,
    margin,
  })

  return { ref, isInView }
}

// Alternative hook using Intersection Observer directly
export function useScrollIntoView(
  onIntersect?: () => void,
  { threshold = 0.2 } = {}
) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect?.()
        }
      },
      { threshold }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [onIntersect, threshold])

  return ref
}
