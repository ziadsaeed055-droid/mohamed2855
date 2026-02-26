"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"
import { CATEGORIES } from "@/lib/types"
import { ArrowRight, ArrowLeft } from "lucide-react"

const categoryImages: Record<string, string> = {
  men: "https://images.unsplash.com/photo-1552062407-291ce3f93e7d?w=400&h=533&fit=crop&q=80",
  women: "https://images.unsplash.com/photo-1595777707802-21b287910b75?w=400&h=533&fit=crop&q=80",
  kids: "https://images.unsplash.com/photo-1519457073556-16cab08d6038?w=400&h=533&fit=crop&q=80",
  youth: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=533&fit=crop&q=80",
}

export function CategoriesSection() {
  const { t, language } = useLanguage()
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-accent text-sm tracking-widest uppercase mb-4 block font-medium">
            {t("تسوق حسب القسم", "Shop By Category")}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground font-serif">{t("الأقسام", "Categories")}</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            {t(
              "اكتشف مجموعتنا المتنوعة من الأزياء الراقية لجميع أفراد العائلة",
              "Discover our diverse collection of premium fashion for the whole family",
            )}
          </p>
        </motion.div>

        {/* Categories Grid with Staggered Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {CATEGORIES.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Link href={`/shop?category=${category.id}`} className="group block" prefetch={true}>
                <motion.div
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-lg"
                  style={{ transformStyle: "preserve-3d" }}
                  whileHover={{
                    rotateY: 5,
                    scale: 1.05,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Image */}
                  <Image
                    src={
                      categoryImages[category.id] ||
                      `/placeholder.svg?height=400&width=300&query=${category.nameEn || "/placeholder.svg"} fashion clothing`
                    }
                    alt={t(category.nameAr, category.nameEn)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-primary-foreground font-semibold text-lg mb-2 group-hover:text-accent transition-colors">
                      {t(category.nameAr, category.nameEn)}
                    </h3>
                    <div className="flex items-center justify-center gap-1 text-primary-foreground/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>{t("تسوق الآن", "Shop Now")}</span>
                      <ArrowIcon className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent rounded-2xl transition-colors duration-300" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
