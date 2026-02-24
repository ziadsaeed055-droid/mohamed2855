"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

interface StaggeredListProps {
  items: ReactNode[]
  staggerDelay?: number
  direction?: "horizontal" | "vertical"
  className?: string
  itemClassName?: string
}

export function StaggeredList({
  items,
  staggerDelay = 0.1,
  direction = "vertical",
  className = "",
  itemClassName = "",
}: StaggeredListProps) {
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
    hidden:
      direction === "horizontal"
        ? { opacity: 0, x: -30 }
        : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className={`${direction === "horizontal" ? "flex gap-4" : "space-y-3"} ${className}`}
    >
      {items.map((item, index) => (
        <motion.div key={index} variants={itemVariants} className={itemClassName}>
          {item}
        </motion.div>
      ))}
    </motion.div>
  )
}
