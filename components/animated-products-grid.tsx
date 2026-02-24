"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

interface AnimatedProductsGridProps {
  children: ReactNode[]
  columns?: number
  gap?: number
  staggerDelay?: number
}

export function AnimatedProductsGrid({
  children,
  columns = 3,
  gap = 6,
  staggerDelay = 0.08,
}: AnimatedProductsGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-${gap}`}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
