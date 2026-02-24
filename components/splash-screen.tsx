"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Image from "next/image"

interface SplashScreenProps {
  onComplete?: () => void
  duration?: number
}

export function SplashScreen({ onComplete, duration = 3000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onComplete])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: duration - 500 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#0d3b66] via-[#1a5a99] to-[#0a2847]"
    >
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-10 left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8">
        {/* Horse Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-40 h-40 flex items-center justify-center"
        >
          {/* Horse SVG with premium animation */}
          <motion.div
            animate={{
              y: [0, -25, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              type: "spring",
              stiffness: 100,
              damping: 10,
            }}
          >
            <svg
              viewBox="0 0 256 320"
              className="w-48 h-48 text-white drop-shadow-2xl"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Premium Horse from Seven Blue Logo */}
              {/* Horse Head */}
              <path d="M 128 60 Q 140 50 150 55" strokeWidth="3" />
              {/* Mane */}
              <path d="M 130 65 Q 125 50 128 40" strokeWidth="2.5" />
              <path d="M 135 68 Q 133 52 136 42" strokeWidth="2.5" />
              <path d="M 140 70 Q 142 54 145 44" strokeWidth="2.5" />
              {/* Head Shape */}
              <ellipse cx="135" cy="90" rx="20" ry="25" />
              {/* Snout */}
              <path d="M 150 95 Q 160 95 165 100" strokeWidth="2.5" />
              {/* Eye */}
              <circle cx="145" cy="80" r="2.5" fill="currentColor" />
              {/* Nostril */}
              <circle cx="163" cy="100" r="1.5" fill="currentColor" />
              {/* Neck */}
              <path d="M 135 115 Q 130 140 128 160" strokeWidth="3" />
              {/* Body */}
              <ellipse cx="125" cy="180" rx="25" ry="40" />
              {/* Tail */}
              <path d="M 100 190 Q 80 200 70 220" strokeWidth="2.5" />
              <path d="M 98 195 Q 75 210 65 235" strokeWidth="2.5" />
              <path d="M 102 185 Q 85 205 75 240" strokeWidth="2.5" />
              {/* Front Left Leg */}
              <path d="M 110 220 L 105 270 L 103 300" strokeWidth="3" />
              {/* Front Right Leg */}
              <path d="M 125 220 L 130 270 L 132 300" strokeWidth="3" />
              {/* Back Left Leg */}
              <path d="M 135 200 L 138 260 L 140 300" strokeWidth="3" />
              {/* Back Right Leg */}
              <path d="M 150 205 L 155 265 L 157 300" strokeWidth="3" />
              {/* Hooves */}
              <ellipse cx="103" cy="305" rx="3" ry="4" fill="currentColor" />
              <ellipse cx="132" cy="305" rx="3" ry="4" fill="currentColor" />
              <ellipse cx="140" cy="305" rx="3" ry="4" fill="currentColor" />
              <ellipse cx="157" cy="305" rx="3" ry="4" fill="currentColor" />
              <ellipse cx="100" cy="110" rx="35" ry="30" />
              {/* Horse Neck */}
              <path d="M 100 80 Q 95 95 100 110" />
              {/* Front Left Leg */}
              <path d="M 80 135 L 75 165" strokeLinecap="round" />
              {/* Front Right Leg */}
              <path d="M 95 135 L 95 165" strokeLinecap="round" />
              {/* Back Left Leg */}
              <path d="M 110 135 L 110 165" strokeLinecap="round" />
              {/* Back Right Leg */}
              <path d="M 125 135 L 130 165" strokeLinecap="round" />
              {/* Tail */}
              <path
                d="M 130 105 Q 150 100 160 120"
                strokeLinecap="round"
              />
              {/* Hooves */}
              <circle cx="75" cy="165" r="3" fill="currentColor" />
              <circle cx="95" cy="165" r="3" fill="currentColor" />
              <circle cx="110" cy="165" r="3" fill="currentColor" />
              <circle cx="130" cy="165" r="3" fill="currentColor" />
            </svg>
          </motion.div>
        </motion.div>

        {/* Logo Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-white mb-2">Seven Blue</h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 rounded-full origin-left"
          />
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex items-center gap-2 text-white/70"
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            جاري التحميل
          </motion.span>
          <motion.div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-amber-400 rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
