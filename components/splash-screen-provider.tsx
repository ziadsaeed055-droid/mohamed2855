"use client"

import { useState, useEffect } from "react"
import { SplashScreen } from "@/components/splash-screen"

export function SplashScreenProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Always show splash screen for 4.5 seconds minimum
    // Only skip if explicitly disabled in session
    const sessionKey = "splash-screen-shown-" + new Date().toDateString()
    const hasShownToday = sessionStorage?.getItem(sessionKey)
    
    if (hasShownToday) {
      setShowSplash(false)
    }
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
    if (typeof sessionStorage !== "undefined") {
      const sessionKey = "splash-screen-shown-" + new Date().toDateString()
      sessionStorage.setItem(sessionKey, "true")
    }
  }

  // Ensure splash shows even if localStorage check is fast
  if (!isClient) {
    return <>{children}</>
  }

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} duration={4500} />}
      {children}
    </>
  )
}
