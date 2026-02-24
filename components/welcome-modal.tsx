"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ShoppingBag, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function WelcomeModal() {
  const { user, firebaseUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Only show for logged-in users who haven't seen it this session
    if (!user || !firebaseUser || hasShown) return

    // Check if user has seen the welcome modal before (in localStorage)
    const welcomeShownKey = `welcome_shown_${user.id}`
    const hasSeenBefore = localStorage.getItem(welcomeShownKey)

    // Show only once per session, or if they haven't seen it before
    if (hasSeenBefore) return

    const timer = setTimeout(() => {
      setIsOpen(true)
      setHasShown(true)
      // Mark as shown in localStorage
      localStorage.setItem(welcomeShownKey, "true")
    }, 40000) // 40 seconds

    return () => clearTimeout(timer)
  }, [user, firebaseUser, hasShown])

  const handleClose = () => {
    setIsOpen(false)
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute left-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white transition-all hover:scale-110"
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        <div className="relative">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a365d]/5 via-transparent to-[#2d4a7c]/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative p-8 text-center">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <div className="relative w-32 h-32 rounded-full bg-white shadow-xl ring-4 ring-blue-50 flex items-center justify-center">
                <Image
                  src="/images/605811209-122158818428830285-7412234705201285219-n-removebg-preview.png"
                  alt="Seven Blue"
                  width={96}
                  height={96}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Welcome icon with sparkles */}
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full animate-pulse" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-blue-300 rounded-full animate-pulse delay-150" />
              </div>
            </div>

            {/* Welcome message */}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              أهلاً وسهلاً{user.displayName ? ` ${user.displayName}` : ""}!
            </h2>

            <p className="text-lg text-gray-600 mb-2">
              مرحباً بك في <span className="font-bold text-[#1a365d]">Seven Blue</span>
            </p>

            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
              نحن سعداء بانضمامك إلى عائلتنا. استكشف مجموعتنا الفاخرة من الملابس الراقية واستمتع بتجربة تسوق استثنائية
            </p>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mb-8 text-xs">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-sm">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <p className="font-semibold text-gray-900">منتجات فاخرة</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-sm">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900">عروض حصرية</p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 shadow-sm">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900">نقاط ولاء</p>
              </div>
            </div>

            {/* CTA Button */}
            <Link href="/shop" onClick={handleClose}>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-[#1a365d] to-[#2d4a7c] hover:from-[#2d4a7c] hover:to-[#1a365d] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <ShoppingBag className="ml-2 h-5 w-5" />
                ابدأ التسوق الآن
              </Button>
            </Link>

            {/* Brand tagline */}
            <p className="mt-4 text-xs text-gray-400 italic">Wearing for Excellence</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
