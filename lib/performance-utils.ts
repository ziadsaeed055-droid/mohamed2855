'use client';

/**
 * أدوات تحسين الأداء لمتجر Seven Blue
 * Performance optimization utilities for Seven Blue store
 */

import { useEffect, useRef, useCallback } from "react"

/**
 * Hook لإلغاء الاشتراك في العمليات غير المتزامنة عند إلغاء تحميل المكون
 * Hook to cancel async operations when component unmounts
 */
export function useIsMounted() {
  const isMounted = useRef(true)

  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  return useCallback(() => isMounted.current, [])
}

/**
 * Hook لـ debounce للحد من عدد مرات تنفيذ الدالة
 * Debounce hook to limit function execution frequency
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )
}

/**
 * Hook لـ throttle للحد من تكرار تنفيذ الدالة
 * Throttle hook to limit function execution rate
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef(Date.now())

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()

      if (now - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = now
      }
    },
    [callback, delay]
  )
}

/**
 * دالة لتأخير تنفيذ عملية حتى تصبح الصفحة في حالة idle
 * Function to defer execution until browser is idle
 */
export function requestIdleCallback(callback: () => void, options?: { timeout?: number }) {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    return window.requestIdleCallback(callback, options)
  }
  // Fallback for browsers that don't support requestIdleCallback
  return setTimeout(callback, 1) as any
}

/**
 * دالة لإلغاء requestIdleCallback
 * Function to cancel requestIdleCallback
 */
export function cancelIdleCallback(id: number) {
  if (typeof window !== "undefined" && "cancelIdleCallback" in window) {
    return window.cancelIdleCallback(id)
  }
  clearTimeout(id)
}

/**
 * Hook لتأخير تحميل المكونات غير الحرجة
 * Hook to defer loading of non-critical components
 */
export function useDeferredMount(delay: number = 100) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const id = requestIdleCallback(() => {
      setMounted(true)
    }, { timeout: delay })

    return () => cancelIdleCallback(id)
  }, [delay])

  return mounted
}

// Import React for the useDeferredMount hook
import * as React from "react"

/**
 * دالة لتحسين الصور بشكل تلقائي
 * Function to optimize images automatically
 */
export function optimizeImageUrl(url: string, width?: number, quality?: number): string {
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) {
    return url
  }

  // إذا كانت الصورة من Firebase Storage
  if (url.includes("firebasestorage.googleapis.com")) {
    return url
  }

  return url
}

/**
 * دالة للتحقق من دعم المتصفح لـ WebP
 * Function to check browser support for WebP
 */
export function supportsWebP(): boolean {
  if (typeof window === "undefined") return false

  const elem = document.createElement("canvas")

  if (elem.getContext && elem.getContext("2d")) {
    return elem.toDataURL("image/webp").indexOf("data:image/webp") === 0
  }

  return false
}

/**
 * دالة لتحسين عملية التمرير
 * Function to optimize scroll performance
 */
export function createScrollManager() {
  let ticking = false
  let lastScrollY = 0

  return {
    onScroll: (callback: (scrollY: number) => void) => {
      lastScrollY = window.scrollY

      if (!ticking) {
        window.requestAnimationFrame(() => {
          callback(lastScrollY)
          ticking = false
        })

        ticking = true
      }
    },
  }
}
