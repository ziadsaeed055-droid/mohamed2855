"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"

interface PremiumLoaderProps {
  text?: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PremiumLoader({ text, size = "md", className }: PremiumLoaderProps) {
  const containerSizes = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-44 h-44",
  }

  const logoSizes = {
    sm: "w-14 h-14",
    md: "w-20 h-20",
    lg: "w-28 h-28",
  }

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-5 animate-in fade-in duration-500", className)}>
      {/* Elegant Loader Container */}
      <div className={cn("relative flex items-center justify-center", containerSizes[size])}>
        
        {/* Ultra Soft Background Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100/20 via-indigo-50/15 to-slate-100/20 blur-3xl animate-pulse" 
          style={{ animationDuration: "4s" }} 
        />
        
        {/* Logo Container with Gentle Float Animation */}
        <div className={cn(
          "relative z-10 animate-in zoom-in duration-700",
          logoSizes[size]
        )}>
          <div className="relative w-full h-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm p-2 ring-1 ring-slate-100/50">
            <div className="relative w-full h-full rounded-xl overflow-hidden">
              <Image
                src="/logo1.jpg"
                alt="Seven Blue"
                fill
                className="object-contain p-1 animate-[pulse_5s_ease-in-out_infinite]"
                priority
              />
            </div>
          </div>
        </div>

        {/* Soft Orbiting Dots - Ultra Slow & Smooth */}
        <div className="absolute inset-0">
          {[0, 90, 180, 270].map((rotation, index) => (
            <div
              key={index}
              className="absolute inset-0"
              style={{
                animation: `spin ${12 + index * 3}s linear infinite`,
                animationDirection: index % 2 === 0 ? 'normal' : 'reverse',
              }}
            >
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-br from-blue-300/40 to-indigo-300/40"
                style={{
                  filter: 'blur(1px)',
                }}
              />
            </div>
          ))}
        </div>

        {/* Gentle Rotating Ring */}
        <svg
          className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]"
          style={{ animationDirection: 'reverse' }}
        >
          <circle
            cx="50%"
            cy="50%"
            r="47%"
            fill="none"
            stroke="url(#softGradient)"
            strokeWidth="1"
            strokeDasharray="8 16"
            strokeLinecap="round"
            opacity="0.25"
          />
          <defs>
            <linearGradient id="softGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Elegant Text with Soft Animation */}
      {text && (
        <div className="text-center space-y-2 animate-in slide-in-from-bottom duration-700">
          <p className={cn(
            "font-light text-slate-500",
            textSizes[size]
          )}>
            {text}
          </p>
          <div className="flex items-center gap-1.5 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-1 rounded-full bg-gradient-to-br from-blue-300 to-indigo-300"
                style={{
                  animation: `bounce 1.8s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Full page loader variant with elegant fade
export function FullPageLoader({ text }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/20 flex items-center justify-center animate-in fade-in duration-300">
      <div className="relative">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-radial from-[#1a365d]/10 via-transparent to-transparent blur-3xl" />
        <PremiumLoader text={text} size="lg" />
      </div>
    </div>
  )
}

// Inline loader variant for content areas
export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-300">
      <PremiumLoader text={text} size="md" />
    </div>
  )
}
