"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Palette, Save, RotateCcw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type SkinTone = "fair" | "medium" | "olive" | "dark"
type HairColor = "blonde" | "brown" | "black" | "red"
type EyeColor = "blue" | "green" | "brown" | "hazel"

const skinTones: Array<{ id: SkinTone; nameAr: string; nameEn: string; color: string }> = [
  { id: "fair", nameAr: "فاتحة", nameEn: "Fair", color: "#fde2cd" },
  { id: "medium", nameAr: "متوسطة", nameEn: "Medium", color: "#daa787" },
  { id: "olive", nameAr: "زيتونية", nameEn: "Olive", color: "#c89b74" },
  { id: "dark", nameAr: "داكنة", nameEn: "Dark", color: "#8d5524" }
]

const hairColors: Array<{ id: HairColor; nameAr: string; nameEn: string; color: string }> = [
  { id: "blonde", nameAr: "أشقر", nameEn: "Blonde", color: "#f4d03f" },
  { id: "brown", nameAr: "بني", nameEn: "Brown", color: "#8b4513" },
  { id: "black", nameAr: "أسود", nameEn: "Black", color: "#1a1a1a" },
  { id: "red", nameAr: "أحمر", nameEn: "Red", color: "#c1440e" }
]

const eyeColors: Array<{ id: EyeColor; nameAr: string; nameEn: string; color: string }> = [
  { id: "blue", nameAr: "أزرق", nameEn: "Blue", color: "#5dade2" },
  { id: "green", nameAr: "أخضر", nameEn: "Green", color: "#82e0aa" },
  { id: "brown", nameAr: "بني", nameEn: "Brown", color: "#8b4513" },
  { id: "hazel", nameAr: "عسلي", nameEn: "Hazel", color: "#a47449" }
]

const colorRecommendations: Record<string, Array<{
  nameAr: string
  nameEn: string
  color: string
  gradient: string
  products: number
}>> = {
  "fair-blonde-blue": [
    { nameAr: "أزرق سماوي", nameEn: "Sky Blue", color: "#87ceeb", gradient: "from-blue-300 to-blue-500", products: 45 },
    { nameAr: "وردي فاتح", nameEn: "Light Pink", color: "#ffb6c1", gradient: "from-pink-200 to-pink-400", products: 38 },
    { nameAr: "بنفسجي ناعم", nameEn: "Soft Purple", color: "#dda0dd", gradient: "from-purple-200 to-purple-400", products: 32 },
    { nameAr: "أخضر نعناع", nameEn: "Mint Green", color: "#98ff98", gradient: "from-green-200 to-green-400", products: 28 }
  ],
  "medium-brown-brown": [
    { nameAr: "كراميل", nameEn: "Caramel", color: "#d4a574", gradient: "from-amber-300 to-amber-600", products: 52 },
    { nameAr: "أخضر زيتوني", nameEn: "Olive Green", color: "#808000", gradient: "from-lime-600 to-green-700", products: 41 },
    { nameAr: "بني محروق", nameEn: "Burnt Sienna", color: "#e97451", gradient: "from-orange-400 to-red-600", products: 35 },
    { nameAr: "أزرق عميق", nameEn: "Deep Blue", color: "#191970", gradient: "from-blue-700 to-blue-900", products: 29 }
  ],
  default: [
    { nameAr: "أزرق كلاسيكي", nameEn: "Classic Blue", color: "#0066cc", gradient: "from-blue-500 to-blue-700", products: 67 },
    { nameAr: "أسود أنيق", nameEn: "Elegant Black", color: "#1a1a1a", gradient: "from-gray-800 to-black", products: 89 },
    { nameAr: "أبيض ناصع", nameEn: "Pure White", color: "#ffffff", gradient: "from-gray-50 to-white", products: 76 },
    { nameAr: "رمادي داكن", nameEn: "Dark Gray", color: "#4a4a4a", gradient: "from-gray-600 to-gray-800", products: 54 },
    { nameAr: "بيج محايد", nameEn: "Neutral Beige", color: "#d9b99b", gradient: "from-amber-100 to-amber-300", products: 43 },
    { nameAr: "كحلي ملكي", nameEn: "Royal Navy", color: "#000080", gradient: "from-blue-800 to-blue-950", products: 38 }
  ]
}

export function ColorPaletteFinder() {
  const [selectedSkin, setSelectedSkin] = useState<SkinTone | null>(null)
  const [selectedHair, setSelectedHair] = useState<HairColor | null>(null)
  const [selectedEyes, setSelectedEyes] = useState<EyeColor | null>(null)
  const [savedColors, setSavedColors] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const { t } = useLanguage()

  const getRecommendedColors = () => {
    if (!selectedSkin || !selectedHair || !selectedEyes) {
      return colorRecommendations.default
    }

    const key = `${selectedSkin}-${selectedHair}-${selectedEyes}`
    return colorRecommendations[key] || colorRecommendations.default
  }

  const handleSaveColors = () => {
    setSavedColors(true)
    toast.success(t("تم حفظ ألوانك!", "Your colors saved!"))
  }

  const handleReset = () => {
    setSelectedSkin(null)
    setSelectedHair(null)
    setSelectedEyes(null)
    setSelectedColor(null)
    setSavedColors(false)
  }

  const isComplete = selectedSkin && selectedHair && selectedEyes

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-background via-primary/5 to-background">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl"
        />
      </div>

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
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-6 shadow-xl"
          >
            <Palette className="h-10 w-10 text-white" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-serif bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {t("اكتشف لونك المثالي", "Discover Your Perfect Colors")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t(
              "دعنا نساعدك في اختيار الألوان المناسبة لك",
              "Let us help you choose the right colors for you"
            )}
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Selection Process */}
          <div className="grid gap-8 mb-12">
            {/* Skin Tone Selection */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                    1
                  </div>
                  <h3 className="text-2xl font-bold font-serif">
                    {t("اختر لون بشرتك", "Choose Your Skin Tone")}
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {skinTones.map((tone) => (
                    <motion.button
                      key={tone.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSkin(tone.id)}
                      className={cn(
                        "relative p-6 rounded-2xl border-2 transition-all duration-300",
                        selectedSkin === tone.id
                          ? "border-accent shadow-lg shadow-accent/20"
                          : "border-border hover:border-accent/50"
                      )}
                    >
                      <motion.div
                        animate={{
                          scale: selectedSkin === tone.id ? [1, 1.1, 1] : 1
                        }}
                        transition={{ duration: 0.5 }}
                        className="w-20 h-20 rounded-full mx-auto mb-4 shadow-lg"
                        style={{ backgroundColor: tone.color }}
                      />
                      <p className="font-semibold text-center">
                        {t(tone.nameAr, tone.nameEn)}
                      </p>

                      {selectedSkin === tone.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center"
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
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Hair Color Selection */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                    2
                  </div>
                  <h3 className="text-2xl font-bold font-serif">
                    {t("اختر لون شعرك", "Choose Your Hair Color")}
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {hairColors.map((hair) => (
                    <motion.button
                      key={hair.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedHair(hair.id)}
                      className={cn(
                        "relative p-6 rounded-2xl border-2 transition-all duration-300",
                        selectedHair === hair.id
                          ? "border-accent shadow-lg shadow-accent/20"
                          : "border-border hover:border-accent/50"
                      )}
                    >
                      <motion.div
                        animate={{
                          scale: selectedHair === hair.id ? [1, 1.1, 1] : 1
                        }}
                        transition={{ duration: 0.5 }}
                        className="w-20 h-20 rounded-full mx-auto mb-4 shadow-lg"
                        style={{ backgroundColor: hair.color }}
                      />
                      <p className="font-semibold text-center">
                        {t(hair.nameAr, hair.nameEn)}
                      </p>

                      {selectedHair === hair.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center"
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
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Eye Color Selection */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                    3
                  </div>
                  <h3 className="text-2xl font-bold font-serif">
                    {t("اختر لون عينيك", "Choose Your Eye Color")}
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {eyeColors.map((eye) => (
                    <motion.button
                      key={eye.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedEyes(eye.id)}
                      className={cn(
                        "relative p-6 rounded-2xl border-2 transition-all duration-300",
                        selectedEyes === eye.id
                          ? "border-accent shadow-lg shadow-accent/20"
                          : "border-border hover:border-accent/50"
                      )}
                    >
                      <motion.div
                        animate={{
                          scale: selectedEyes === eye.id ? [1, 1.1, 1] : 1
                        }}
                        transition={{ duration: 0.5 }}
                        className="w-20 h-20 rounded-full mx-auto mb-4 shadow-lg"
                        style={{ backgroundColor: eye.color }}
                      />
                      <p className="font-semibold text-center">
                        {t(eye.nameAr, eye.nameEn)}
                      </p>

                      {selectedEyes === eye.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center"
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
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Color Recommendations */}
          <AnimatePresence mode="wait">
            {isComplete && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-8 w-8 text-accent" />
                      <h3 className="text-3xl font-bold font-serif">
                        {t("ألوانك المثالية", "Your Perfect Colors")}
                      </h3>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveColors}
                        disabled={savedColors}
                        className={cn(
                          "rounded-full",
                          savedColors ? "bg-green-500 hover:bg-green-600" : ""
                        )}
                      >
                        <Save className="h-4 w-4 me-2" />
                        {savedColors
                          ? t("تم الحفظ", "Saved")
                          : t("حفظ الألوان", "Save Colors")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleReset}
                        className="rounded-full bg-transparent"
                      >
                        <RotateCcw className="h-4 w-4 me-2" />
                        {t("إعادة", "Reset")}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {getRecommendedColors().map((color, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.1,
                          type: "spring"
                        }}
                        whileHover={{ scale: 1.05, rotateZ: 3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedColor(color.nameEn)}
                        className={cn(
                          "relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden",
                          selectedColor === color.nameEn
                            ? "border-accent shadow-2xl"
                            : "border-border hover:border-accent/50"
                        )}
                      >
                        {/* Color Display */}
                        <motion.div
                          animate={{
                            rotate: selectedColor === color.nameEn ? 360 : 0
                          }}
                          transition={{ duration: 0.6 }}
                          className={cn(
                            "w-24 h-24 rounded-2xl mx-auto mb-4 shadow-lg bg-gradient-to-br",
                            color.gradient
                          )}
                        />

                        {/* Color Name */}
                        <p className="font-bold text-center mb-2">
                          {t(color.nameAr, color.nameEn)}
                        </p>

                        {/* Products Count */}
                        <Badge variant="secondary" className="w-full">
                          {color.products} {t("منتج", "products")}
                        </Badge>

                        {/* Shimmer Effect */}
                        <motion.div
                          animate={{
                            x: selectedColor === color.nameEn ? ["-100%", "100%"] : "-100%"
                          }}
                          transition={{
                            duration: 1,
                            repeat: selectedColor === color.nameEn ? Infinity : 0,
                            repeatDelay: 0.5
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                        />
                      </motion.button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
