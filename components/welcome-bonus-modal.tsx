"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Gift, Heart, Zap, Crown } from "lucide-react"
import Link from "next/link"

const bonusMessages = [
  {
    title: "🎁 هديتك الخاصة",
    subtitle: "احصل على 50 نقطة إضافية",
    description: "استخدم كود: WELCOME50 في الشراء الأول",
    color: "from-rose-500 to-pink-500",
    icon: Gift,
    bgColor: "bg-rose-50",
  },
  {
    title: "❤️ تخفيف خاص",
    subtitle: "20% على كل المشترياتك",
    description: "العرض حصري لأعضاء الولاء الجدد لمدة 7 أيام",
    color: "from-red-500 to-rose-500",
    icon: Heart,
    bgColor: "bg-red-50",
  },
  {
    title: "⚡ عرض فلاش",
    subtitle: "تصفح أحدث المجموعات",
    description: "منتجات جديدة كل يوم خميس مع خصومات",
    color: "from-amber-500 to-orange-500",
    icon: Zap,
    bgColor: "bg-amber-50",
  },
  {
    title: "👑 عضوية VIP",
    subtitle: "احصل على مزايا حصرية",
    description: "توصيل مجاني + ولوج أول للمنتجات الجديدة",
    color: "from-purple-500 to-indigo-500",
    icon: Crown,
    bgColor: "bg-purple-50",
  },
]

export function WelcomeBonusModal() {
  const { user, firebaseUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    // Only show for logged-in users
    if (!user || !firebaseUser || !hasStarted) return

    // Show after 2 minutes, then every 5 minutes
    const initialDelay = 120000 // 2 minutes
    const rotateInterval = 300000 // 5 minutes

    const initialTimer = setTimeout(() => {
      setIsOpen(true)
      setHasStarted(true)

      // Set up rotation interval
      const intervalId = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % bonusMessages.length)
        setIsOpen(true)
      }, rotateInterval)

      return () => clearInterval(intervalId)
    }, initialDelay)

    return () => {
      clearTimeout(initialTimer)
    }
  }, [user, firebaseUser])

  // Start the welcome bonus system on first load
  useEffect(() => {
    if (user && firebaseUser && !hasStarted) {
      setHasStarted(true)
    }
  }, [user, firebaseUser, hasStarted])

  const handleClose = () => {
    setIsOpen(false)
  }

  if (!user) return null

  const message = bonusMessages[currentIndex]
  const Icon = message.icon

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-0">
        {/* Animated gradient background */}
        <div className={`bg-gradient-to-br ${message.color} relative overflow-hidden`}>
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/20 backdrop-blur-sm p-2 hover:bg-white/30 transition-all"
          >
            <X className="h-4 w-4 text-white" />
          </button>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

          <div className="relative p-6 text-center text-white">
            {/* Icon with animation */}
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-bounce">
                <Icon className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold mb-1">{message.title}</h3>

            {/* Subtitle */}
            <p className="text-sm font-semibold mb-2 text-white/90">{message.subtitle}</p>

            {/* Description */}
            <p className="text-xs text-white/80 mb-4 leading-relaxed">{message.description}</p>

            {/* CTA Button */}
            <Link href="/shop" onClick={handleClose}>
              <Button
                size="sm"
                className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg transition-all hover:scale-105"
              >
                استكشف الآن
              </Button>
            </Link>

            {/* Dots indicator */}
            <div className="flex justify-center gap-1 mt-4">
              {bonusMessages.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentIndex ? "bg-white w-6" : "bg-white/50 w-1.5"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
