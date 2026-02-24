"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, Home } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { CATEGORIES } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ShopBreadcrumbsProps {
  category?: string
  subCategory?: string
}

export function ShopBreadcrumbs({ category, subCategory }: ShopBreadcrumbsProps) {
  const { t, language } = useLanguage()

  const items: Array<{ label: string; href?: string }> = [
    { label: t("الرئيسية", "Home"), href: "/" },
    { label: t("المتجر", "Shop"), href: "/shop" },
  ]

  if (category && category !== "all") {
    const catData = CATEGORIES.find(c => c.id === category)
    if (catData) {
      items.push({ 
        label: t(catData.nameAr, catData.nameEn), 
        href: `/shop?category=${category}` 
      })

      if (subCategory) {
        const subData = catData.subCategories.find(s => s.id === subCategory)
        if (subData) {
          items.push({ 
            label: t(subData.nameAr, subData.nameEn) 
          })
        }
      }
    }
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 md:px-6 mb-6 flex items-center gap-2 overflow-x-auto pb-2"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {index === 0 ? (
              <Home className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight
                className={cn(
                  "w-4 h-4 text-muted-foreground",
                  language === "ar" ? "rotate-180" : ""
                )}
              />
            )}

            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-sm text-primary hover:underline transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "text-sm",
                  isLast
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            )}
          </motion.div>
        )
      })}
    </motion.nav>
  )
}
