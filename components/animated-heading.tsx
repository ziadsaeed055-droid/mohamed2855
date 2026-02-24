"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface AnimatedHeadingProps {
  children: ReactNode
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  className?: string
  variant?: "slideUp" | "fadeUp" | "slideDown" | "slideLeft" | "slideRight"
  delay?: number
}

export function AnimatedHeading({
  children,
  level = "h2",
  className = "",
  variant = "slideUp",
  delay = 0,
}: AnimatedHeadingProps) {
  const { ref, isInView } = useScrollAnimation({
    threshold: 0.3,
    once: true,
  })

  const variants = {
    slideUp: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 },
    },
    fadeUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    slideDown: {
      hidden: { opacity: 0, y: -30 },
      visible: { opacity: 1, y: 0 },
    },
    slideLeft: {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 },
    },
    slideRight: {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0 },
    },
  }

  const Component = motion[level as keyof typeof motion]

  return (
    <Component
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[variant]}
      transition={{
        duration: 0.6,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </Component>
  )
}
