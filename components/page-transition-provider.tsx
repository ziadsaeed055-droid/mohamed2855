"use client"

import { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { pageTransitionVariant } from "@/lib/animation-variants"

interface PageTransitionProviderProps {
  children: ReactNode
}

export function PageTransitionProvider({ children }: PageTransitionProviderProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="page-transition"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransitionVariant}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
