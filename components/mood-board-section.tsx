"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shirt, Briefcase, PartyPopper, Dumbbell, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Product } from "@/lib/types"

type Mood = "casual" | "formal" | "party" | "sport"

const moods = [
  {
    id: "casual",
    nameAr: "كاجوال",
    nameEn: "Casual",
    descAr: "إطلالة عصرية ومريحة للأوقات اليومية",
    descEn: "Modern and comfortable look for everyday",
    icon: Shirt,
    color: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20"
  },
  {
    id: "formal",
    nameAr: "رسمي",
    nameEn: "Formal",
    descAr: "أناقة احترافية للمناسبات الرسمية",
    descEn: "Professional elegance for formal occasions",
    icon: Briefcase,
    color: "from-gray-700 to-gray-900",
    bgGradient: "from-gray-50 to-slate-100 dark:from-gray-950/20 dark:to-slate-950/20"
  },
  {
    id: "party",
    nameAr: "حفلات",
    nameEn: "Party",
    descAr: "إطلالة جريئة ومميزة للحفلات",
    descEn: "Bold and distinctive look for parties",
    icon: PartyPopper,
    color: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
  },
  {
    id: "sport",
    nameAr: "رياضي",
    nameEn: "Sport",
    descAr: "ملابس نشطة ومرنة للرياضة",
    descEn: "Active and flexible sportswear",
    icon: Dumbbell,
    color: "from-emerald-500 to-green-500",
    bgGradient: "from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20"
  }
]

export function MoodBoardSection() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>("casual")
  const [savedBoard, setSavedBoard] = useState(false)
  const [moodProducts, setMoodProducts] = useState<Record<Mood, Product[]>>({
    casual: [],
    formal: [],
    party: [],
    sport: [],
  })
  const { t, language } = useLanguage()

  // Fetch mood board products from Firebase
  useEffect(() => {
    const fetchMoodProducts = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "mood_board"))
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data()
          
          // Fetch products for all moods
          const allProductIds = [
            ...(data?.casual || []),
            ...(data?.formal || []),
            ...(data?.party || []),
            ...(data?.sport || []),
          ]

          if (allProductIds.length > 0) {
            // Fetch all products individually
            const products: Product[] = []
            for (const productId of allProductIds) {
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
                console.warn(`Could not fetch product ${productId}`)
              }
            }

            // Organize products by mood
            const organized: Record<Mood, Product[]> = {
              casual: (data.casual || []).map((id: string) => products.find((p) => p.id === id)).filter(Boolean) as Product[],
              formal: (data.formal || []).map((id: string) => products.find((p) => p.id === id)).filter(Boolean) as Product[],
              party: (data.party || []).map((id: string) => products.find((p) => p.id === id)).filter(Boolean) as Product[],
              sport: (data.sport || []).map((id: string) => products.find((p) => p.id === id)).filter(Boolean) as Product[],
            }

            setMoodProducts(organized)
          }
        }
      } catch (error) {
        console.error("Error fetching mood products:", error)
      }
    }

    fetchMoodProducts()
  }, [])

  const handleSaveBoard = () => {
    setSavedBoard(true)
    toast.success(t("تم حفظ المجموعة!", "Board saved!"))
  }

  const handleMoodSelect = (moodId: Mood) => {
    setSelectedMood(moodId)
    setSavedBoard(false)
  }

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-block mb-4"
          >
            <div className="h-1 w-20 bg-gradient-to-r from-primary via-accent to-primary mx-auto rounded-full" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-serif bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {t("لوحة المزاج", "Mood Board")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t(
              "اختر مزاجك واكتشف المجموعة المثالية لك",
              "Choose your mood and discover the perfect collection"
            )}
          </p>
        </motion.div>

        {/* Mood Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16 max-w-5xl mx-auto">
          {moods.map((mood, index) => {
            const Icon = mood.icon
            const isSelected = selectedMood === mood.id

            return (
              <motion.div
                key={mood.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  onClick={() => handleMoodSelect(mood.id as Mood)}
                  className={cn(
                    "relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl",
                    isSelected ? "ring-4 ring-accent shadow-xl" : ""
                  )}
                >
                  <div className={cn("p-4 md:p-8 bg-gradient-to-br", mood.bgGradient)}>
                    {/* Icon */}
                    <motion.div
                      animate={{
                        rotate: isSelected ? [0, 360] : 0
                      }}
                      transition={{ duration: 0.6 }}
                      className={cn(
                        "w-14 h-14 md:w-20 md:h-20 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center bg-gradient-to-br",
                        mood.color,
                        "text-white shadow-lg"
                      )}
                    >
                      <Icon className="h-7 w-7 md:h-10 md:w-10" />
                    </motion.div>

                    {/* Name */}
                    <h3 className="text-base md:text-xl font-bold text-center mb-1 md:mb-2 font-serif">
                      {t(mood.nameAr, mood.nameEn)}
                    </h3>

                    {/* Description */}
                    <p className="text-xs md:text-sm text-muted-foreground text-center line-clamp-2">
                      {t(mood.descAr, mood.descEn)}
                    </p>

                    {/* Selected Indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-accent flex items-center justify-center"
                        >
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {selectedMood && (
            <motion.div
              key={selectedMood}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.6 }}
              className="max-w-6xl mx-auto"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold font-serif">
                  {t("مجموعتك المتناسقة", "Your Coordinated Collection")}
                </h3>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    onClick={handleSaveBoard}
                    disabled={savedBoard}
                    size="sm"
                    className={cn(
                      "rounded-full flex-1 md:flex-initial",
                      savedBoard ? "bg-green-500 hover:bg-green-600" : ""
                    )}
                  >
                    <Save className="h-4 w-4 me-2" />
                    <span className="hidden sm:inline">
                      {savedBoard
                        ? t("تم الحفظ", "Saved")
                        : t("حفظ المجموعة", "Save Board")}
                    </span>
                    <span className="sm:hidden">
                      {savedBoard ? t("تم", "Saved") : t("حفظ", "Save")}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMood(null)}
                    className="rounded-full flex-1 md:flex-initial"
                  >
                    <X className="h-4 w-4 me-2" />
                    <span className="hidden sm:inline">{t("إغلاق", "Close")}</span>
                    <span className="sm:hidden">{t("X", "X")}</span>
                  </Button>
                </div>
              </div>

              {/* Products */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {moodProducts[selectedMood].map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.15,
                      type: "spring"
                    }}
                  >
                    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 group">
                      {/* Image */}
                      <div className="relative h-64 md:h-72 overflow-hidden">
                        <motion.img
                          src={product.mainImage || "/placeholder.svg"}
                          alt={language === "ar" ? product.nameAr : product.nameEn}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {/* Discount Badge */}
                        {product.discount > 0 && (
                          <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                            {t(`خصم ${product.discount}%`, `${product.discount}% OFF`)}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 md:p-6">
                        <h4 className="text-base md:text-lg font-bold mb-2 line-clamp-2">
                          {language === "ar" ? product.nameAr : product.nameEn}
                        </h4>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xl md:text-2xl font-bold text-accent">
                            {product.discountedPrice || product.salePrice} {t("ج.م", "EGP")}
                          </span>
                          <Link href={`/product/${product.id}`}>
                            <Button size="sm" className="rounded-full">
                              {t("عرض", "View")}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!selectedMood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">👆</div>
            <p className="text-xl text-muted-foreground">
              {t("اختر مزاجك أعلاه لرؤية المجموعة المناسبة", "Select your mood above to see matching products")}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  )
}
