"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { cardHoverVariant, cardImageVariant } from "@/lib/animation-variants"

interface HoverCardAnimationProps {
  children: ReactNode
  imageChild?: ReactNode
  className?: string
}

export function HoverCardAnimation({
  children,
  imageChild,
  className = "",
}: HoverCardAnimationProps) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      variants={cardHoverVariant}
      className={className}
    >
      {imageChild && (
        <motion.div variants={cardImageVariant}>
          {imageChild}
        </motion.div>
      )}
      {children}
    </motion.div>
  )
}
