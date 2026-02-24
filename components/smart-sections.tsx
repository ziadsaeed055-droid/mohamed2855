"use client"

import { useState, useEffect, memo, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ProductCarousel } from "@/components/product-carousel"
import { ProductCardPremium } from "@/components/product-card-premium"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import type { Product } from "@/lib/types"
import { ArrowRight, ArrowLeft, Sparkles, TrendingUp, Percent, Sun, Snowflake } from "lucide-react"
import { SectionSkeleton } from "@/components/section-skeleton"
import { AnimatedHeading } from "@/components/animated-heading"

// إنشاء cache للمنتجات لتحسين الأداء
const productsCache: { [key: string]: { data: Product[]; timestamp: number } } = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 دقائق

async function getCachedProducts(cacheKey: string, fetchFn: () => Promise<Product[]>): Promise<Product[]> {
  const now = Date.now()
  const cached = productsCache[cacheKey]
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  const data = await fetchFn()
  productsCache[cacheKey] = { data, timestamp: now }
  return data
}

// New Arrivals Section
export const NewArrivalsSection = memo(function NewArrivalsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false) // تبدأ false حتى لا يظهر skeleton
  const [mounted, setMounted] = useState(false)
  const { t, language } = useLanguage()
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight

  useEffect(() => {
    setMounted(true)
    const fetchNewArrivals = async () => {
      try {
        const productsData = await getCachedProducts('newArrivals', async () => {
          const q = query(
            collection(db, "products"),
            where("isActive", "==", true),
            orderBy("createdAt", "desc"),
            limit(12),
          )
          const snapshot = await getDocs(q)
          return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[]
        })
        setProducts(productsData)
      } catch (error) {
        console.error("[v0] Error fetching new arrivals:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchNewArrivals()
  }, [])

  // عدم عرض أي شيء أثناء التحميل الأولي
  if (!mounted || products.length === 0) return null

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-transparent to-teal-50/80" />
      <div className="absolute top-0 start-0 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 end-0 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
        >
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-emerald-600 tracking-wider uppercase">
                {t("وصل حديثاً", "Just Arrived")}
              </span>
            </motion.div>
            <AnimatedHeading level="h2" variant="slideUp" delay={0.2} className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              {t("جديدنا", "New Arrivals")}
            </AnimatedHeading>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-muted-foreground max-w-md"
            >
              {t("اكتشف أحدث المنتجات المضافة إلى تشكيلتنا", "Discover the latest additions to our collection")}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link href="/new-arrivals">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  className="gap-2 group hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all bg-transparent"
                >
                  {t("عرض الكل", "View All")}
                  <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Products Carousel */}
        <ProductCarousel
          products={products}
          CardComponent={ProductCardPremium}
          showAddToCart
          autoPlay
          autoPlayInterval={6000}
        />
      </div>
    </section>
  )
})

// Best Sellers Section
export const BestSellersSection = memo(function BestSellersSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { t, language } = useLanguage()
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight

  useEffect(() => {
    setMounted(true)
    const fetchBestSellers = async () => {
      try {
        const productsData = await getCachedProducts('bestSellers', async () => {
          const q = query(
            collection(db, "products"),
            where("isActive", "==", true),
            where("isFeatured", "==", true),
            limit(12),
          )
          const snapshot = await getDocs(q)
          let data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[]

          if (data.length === 0) {
            const allQ = query(collection(db, "products"), where("isActive", "==", true), limit(12))
            const allSnapshot = await getDocs(allQ)
            data = allSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Product[]
          }
          return data
        })
        setProducts(productsData)
      } catch (error) {
        console.error("[v0] Error fetching best sellers:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBestSellers()
  }, [])

  if (!mounted || products.length === 0) return null

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-background via-amber-50/30 to-background">
      <div className="absolute top-1/2 start-0 w-96 h-96 bg-amber-100 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 end-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-amber-600 tracking-wider uppercase">
                {t("اختيار العملاء", "Customer's Choice")}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              {t("الأكثر مبيعًا", "Best Sellers")}
            </h2>
            <p className="text-muted-foreground max-w-md">
              {t("المنتجات الأعلى طلباً بين عملائنا", "The most popular products among our customers")}
            </p>
          </div>
          <Link href="/best-sellers">
            <Button
              variant="outline"
              className="gap-2 group hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all bg-transparent"
            >
              {t("عرض الكل", "View All")}
              <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <ProductCarousel products={products} CardComponent={ProductCardPremium} showAddToCart />
      </div>
    </section>
  )
})

// Offers Section - Grid on Mobile
export const OffersSection = memo(function OffersSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { t, language } = useLanguage()
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight

  useEffect(() => {
    setMounted(true)
    const fetchOffers = async () => {
      try {
        const productsData = await getCachedProducts('offers', async () => {
          const q = query(collection(db, "products"), where("isActive", "==", true), limit(50))
          const snapshot = await getDocs(q)
          const data = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((p: any) => p.discount > 0) as Product[]
          return data.slice(0, 12)
        })
        setProducts(productsData)
      } catch (error) {
        console.error("[v0] Error fetching offers:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchOffers()
  }, [])

  if (!mounted || products.length === 0) return null

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-transparent to-pink-50/80" />
      <div className="absolute top-0 end-0 w-72 h-72 bg-rose-100 rounded-full blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 start-0 w-72 h-72 bg-pink-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <Percent className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-rose-600 tracking-wider uppercase">
                {t("خصومات حصرية", "Exclusive Discounts")}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">{t("العروض", "Offers")}</h2>
            <p className="text-muted-foreground max-w-md">
              {t("استفد من أفضل العروض والخصومات", "Take advantage of the best deals and discounts")}
            </p>
          </div>
          <Link href="/offers">
            <Button
              variant="outline"
              className="gap-2 group hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all bg-transparent"
            >
              {t("عرض الكل", "View All")}
              <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="md:hidden grid grid-cols-2 gap-2 auto-rows-max">
          {products.map((product) => (
            <div key={product.id} className="h-fit">
              <ProductCardPremium product={product} />
            </div>
          ))}
        </div>
        <div className="hidden md:block">
          <ProductCarousel products={products} CardComponent={ProductCardPremium} showAddToCart />
        </div>
      </div>
    </section>
  )
})

// Seasonal Section - Grid on Mobile
export const SeasonalSection = memo(function SeasonalSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { t, language } = useLanguage()
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight

  const month = new Date().getMonth()
  const isSummer = month >= 4 && month <= 9
  const SeasonIcon = isSummer ? Sun : Snowflake
  const seasonName = isSummer ? { ar: "الصيف", en: "Summer" } : { ar: "الشتاء", en: "Winter" }

  useEffect(() => {
    setMounted(true)
    const fetchSeasonal = async () => {
      try {
        const productsData = await getCachedProducts('seasonal', async () => {
          const q = query(collection(db, "products"), where("isActive", "==", true), limit(12))
          const snapshot = await getDocs(q)
          return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[]
        })
        setProducts(productsData)
      } catch (error) {
        console.error("[v0] Error fetching seasonal:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSeasonal()
  }, [])

  if (!mounted || products.length === 0) return null

  return (
    <section
      className={`py-16 md:py-24 relative overflow-hidden ${
        isSummer
          ? "bg-gradient-to-br from-orange-50/80 via-transparent to-yellow-50/80"
          : "bg-gradient-to-br from-blue-50/80 via-transparent to-cyan-50/80"
      }`}
    >
      <div
        className={`absolute top-1/2 start-0 w-96 h-96 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2 ${
          isSummer ? "bg-orange-200" : "bg-blue-200"
        }`}
      />
      <div
        className={`absolute top-1/2 end-0 w-96 h-96 rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2 ${
          isSummer ? "bg-yellow-200" : "bg-cyan-200"
        }`}
      />

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isSummer
                    ? "bg-gradient-to-br from-orange-500 to-yellow-500"
                    : "bg-gradient-to-br from-blue-500 to-cyan-500"
                }`}
              >
                <SeasonIcon className="w-5 h-5 text-white" />
              </div>
              <span
                className={`text-sm font-medium tracking-wider uppercase ${
                  isSummer ? "text-orange-600" : "text-blue-600"
                }`}
              >
                {t("تشكيلة الموسم", "Seasonal Collection")}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              {t(`موسمي - ${seasonName.ar}`, `Seasonal - ${seasonName.en}`)}
            </h2>
            <p className="text-muted-foreground max-w-md">
              {t("منتجات مختارة خصيصاً لهذا الموسم", "Products specially selected for this season")}
            </p>
          </div>
          <Link href="/seasonal">
            <Button
              variant="outline"
              className={`gap-2 group transition-all bg-transparent ${
                isSummer
                  ? "hover:bg-orange-500 hover:text-white hover:border-orange-500"
                  : "hover:bg-blue-500 hover:text-white hover:border-blue-500"
              }`}
            >
              {t("عرض الكل", "View All")}
              <ArrowIcon className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="md:hidden grid grid-cols-2 gap-2 auto-rows-max">
          {products.map((product) => (
            <div key={product.id} className="h-fit">
              <ProductCardPremium product={product} />
            </div>
          ))}
        </div>
        <div className="hidden md:block">
          <ProductCarousel products={products} CardComponent={ProductCardPremium} showAddToCart />
        </div>
      </div>
    </section>
  )
})
