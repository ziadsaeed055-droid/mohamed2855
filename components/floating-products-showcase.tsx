"use client"

import { Badge } from "@/components/ui/badge"
import { useInView } from "framer-motion" // Import useInView from framer-motion

import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import Link from "next/link"
import { ShoppingBag, Heart, Eye, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { doc, getDoc, collection, getDocs, query, where, limit, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/types"

const rotations = [15, -10, 20]
const positions = [
  { x: -100, y: 50 },
  { x: 100, y: -30 },
  { x: 0, y: 0 }
]

export function FloatingProductsShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [featuredProducts, setFeaturedProducts] = useState<(Product & { rotation: number; position: { x: number; y: number } })[]>([])
  const [isLoading, setIsLoading] = useState(true) // Declare isLoading variable
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const { t, language } = useLanguage() // Declare useInView variable
  const isInView = useInView(containerRef) // Declare isInView variable

  // Fetch products from Firebase
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        let productIds: string[] = []
        
        // Try to get selected product IDs from settings
        const settingsDoc = await getDoc(doc(db, "settings", "floating_products"))
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          if (data?.productIds && Array.isArray(data.productIds) && data.productIds.length > 0) {
            productIds = data.productIds
          }
        }
        
        // If no IDs in settings, fetch first 3 best-selling/featured products
        if (productIds.length === 0) {
          try {
            const productsRef = collection(db, "products")
            const q = query(
              productsRef,
              where("isActive", "==", true),
              orderBy("salesCount", "desc"),
              limit(3)
            )
            const snapshot = await getDocs(q)
            productIds = snapshot.docs.map(doc => doc.id)
          } catch (queryError) {
            try {
              // Fallback: get first 3 products without isActive filter
              const productsRef = collection(db, "products")
              const q = query(
                productsRef,
                limit(3)
              )
              const snapshot = await getDocs(q)
              productIds = snapshot.docs.map(doc => doc.id)
            } catch (fallbackError) {
              // Continue without products
            }
          }
        }

        // Fetch the actual products
        const products: Product[] = []
        for (const productId of productIds) {
          try {
            const productDoc = await getDoc(doc(db, "products", productId))
            if (productDoc.exists()) {
              const productData = productDoc.data()
              if (productData && productData.nameEn && productData.mainImage) {
                products.push({
                  id: productDoc.id,
                  ...productData
                } as Product)
              }
            }
          } catch (err) {
            // Continue with other products
          }
        }

        // Add rotation/position to products
        if (products.length > 0) {
          const displayProducts = products.slice(0, 3).map((product, index) => ({
            ...product,
            rotation: rotations[index % rotations.length],
            position: positions[index % positions.length]
          }))
          setFeaturedProducts(displayProducts)
        }
      } catch (error) {
        // Handle error silently
      }
    }

    fetchFeaturedProducts()
  }, [])

  // Smooth spring animation for mouse follow
  const springConfig = { damping: 25, stiffness: 150 }
  const smoothMouseX = useSpring(mouseX, springConfig)
  const smoothMouseY = useSpring(mouseY, springConfig)

  const parallaxXValues = [useTransform(smoothMouseX, (value) => value * 1), useTransform(smoothMouseX, (value) => value * -1), useTransform(smoothMouseX, (value) => value * 1)]
  const parallaxYValues = [useTransform(smoothMouseY, (value) => value * 1), useTransform(smoothMouseY, (value) => value * -1), useTransform(smoothMouseY, (value) => value * 1)]

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        // Normalize mouse position relative to container center
        mouseX.set((e.clientX - centerX) / 20)
        mouseY.set((e.clientY - centerY) / 20)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  // Don't render if no products
  if (featuredProducts.length === 0) {
    return null
  }

  return (
    <div className="relative py-24 md:py-32 overflow-hidden" ref={containerRef}>
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(251, 191, 36, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-6"
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-serif">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {t("المنتجات المميزة", "Featured Products")}
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t(
              "اكتشف مجموعتنا الحصرية من المنتجات الفاخرة",
              "Discover our exclusive collection of luxury products"
            )}
          </p>
        </motion.div>

        {/* Floating Products Grid */}
        <div className="relative">
          {/* Desktop Layout - Floating Style */}
          <div className="hidden md:block relative min-h-[700px] pt-12">
            <div className="relative w-full max-w-6xl mx-auto">
              {featuredProducts.map((product, index) => {
                const isHovered = hoveredIndex === index

                // Calculate parallax movement based on mouse position
                const parallaxX = parallaxXValues[index]
                const parallaxY = parallaxYValues[index]

                return (
                  <motion.div
                    key={product.id}
                    initial={{ 
                      opacity: 0, 
                      scale: 0.5,
                      rotateY: -180
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotateY: 0
                    }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.2,
                      type: "spring"
                    }}
                    style={{
                      x: parallaxX,
                      y: parallaxY
                    }}
                    className={cn(
                      "absolute",
                      index === 0 && "top-0 left-[10%]",
                      index === 1 && "top-[30%] right-[10%]",
                      index === 2 && "bottom-0 left-1/2 -translate-x-1/2"
                    )}
                    onHoverStart={() => setHoveredIndex(index)}
                    onHoverEnd={() => setHoveredIndex(null)}
                  >
                    <motion.div
                      animate={{
                        y: isHovered ? -20 : [0, -15, 0],
                        rotateZ: isHovered ? 0 : product.rotation
                      }}
                      transition={{
                        y: isHovered ? { duration: 0.3 } : {
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        },
                        rotateZ: { duration: 0.5 }
                      }}
                      className="relative group"
                    >
                      {/* Product Card */}
                      <div className={cn(
                        "relative w-56 md:w-72 rounded-2xl overflow-hidden transition-all duration-500",
                        "bg-card border-2 border-border",
                        isHovered && "border-accent shadow-2xl shadow-accent/20"
                      )}>
                        {/* Product Image */}
                        <div className="relative h-72 md:h-96 overflow-hidden">
                          <motion.img
                            src={product.mainImage || "/placeholder.svg"}
                            alt={language === "ar" ? product.nameAr : product.nameEn}
                            className="w-full h-full object-cover"
                            animate={{
                              scale: isHovered ? 1.15 : 1
                            }}
                            transition={{ duration: 0.6 }}
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Floating Action Buttons */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                              opacity: isHovered ? 1 : 0,
                              y: isHovered ? 0 : 20
                            }}
                            transition={{ duration: 0.3 }}
                            className="absolute top-4 right-4 flex flex-col gap-2"
                          >
                            <Button
                              size="icon"
                              variant="secondary"
                              className="rounded-full bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="rounded-full bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </motion.div>

                          {/* Glow Effect */}
                          <motion.div
                            animate={{
                              opacity: isHovered ? 0.6 : 0
                            }}
                            className="absolute inset-0 bg-gradient-to-br from-primary/50 to-accent/50 mix-blend-overlay"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2 font-serif">
                            {language === "ar" ? product.nameAr : product.nameEn}
                          </h3>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold text-accent">
                              {product.discountedPrice || product.salePrice} {t("ج.م", "EGP")}
                            </span>
                          </div>

                          {/* Add to Cart Button */}
                          <Link href={`/product/${product.id}`}>
                            <Button className="w-full group bg-primary hover:bg-primary/90 rounded-full">
                              <ShoppingBag className="h-4 w-4 me-2 group-hover:scale-110 transition-transform" />
                              {t("أضف إلى السلة", "Add to Cart")}
                            </Button>
                          </Link>
                        </div>

                        {/* 3D Shadow Effect */}
                        <motion.div
                          animate={{
                            opacity: isHovered ? 0.4 : 0.2,
                            scale: isHovered ? 1.1 : 1
                          }}
                          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/30 blur-2xl rounded-full -z-10"
                        />
                      </div>

                      {/* Reflection Effect */}
                      <motion.div
                        animate={{
                          opacity: isHovered ? 0.15 : 0.08
                        }}
                        className="absolute -bottom-full left-0 w-full h-full rounded-2xl overflow-hidden"
                        style={{
                          transform: "scaleY(-1)",
                          filter: "blur(8px)"
                        }}
                      >
                        <img
                          src={product.mainImage || "/placeholder.svg"}
                          alt=""
                          className="w-full h-full object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-transparent" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Mobile Layout - Grid Style */}
          <div className="md:hidden grid grid-cols-1 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <div className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-card border-2 border-border shadow-lg">
                  {/* Product Image */}
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={product.mainImage || "/placeholder.svg"}
                      alt={language === "ar" ? product.nameAr : product.nameEn}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Discount Badge */}
                    {product.discount > 0 && (
                      <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                        {t(`خصم ${product.discount}%`, `${product.discount}% OFF`)}
                      </Badge>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 font-serif">
                      {language === "ar" ? product.nameAr : product.nameEn}
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-accent">
                        {product.discountedPrice || product.salePrice} {t("ج.م", "EGP")}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <Link href={`/product/${product.id}`}>
                      <Button className="w-full bg-primary hover:bg-primary/90 rounded-full">
                        <ShoppingBag className="h-4 w-4 me-2" />
                        {t("أضف إلى السلة", "Add to Cart")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <Link href="/shop">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-full px-12 py-6 text-lg shadow-xl"
            >
              {t("تصفح جميع المنتجات", "Browse All Products")}
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
