"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import { Shirt, Briefcase, PartyPopper, Dumbbell, Check, Loader2, Palette } from "lucide-react"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"

type Mood = "casual" | "formal" | "party" | "sport"

const moods = [
  {
    id: "casual",
    nameAr: "كاجوال",
    nameEn: "Casual",
    icon: Shirt,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "formal",
    nameAr: "رسمي",
    nameEn: "Formal",
    icon: Briefcase,
    color: "from-gray-700 to-gray-900",
  },
  {
    id: "party",
    nameAr: "حفلات",
    nameEn: "Party",
    icon: PartyPopper,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "sport",
    nameAr: "رياضي",
    nameEn: "Sport",
    icon: Dumbbell,
    color: "from-emerald-500 to-green-500",
  },
]

export function AdminMoodBoardTab() {
  const { t, language } = useLanguage()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [selectedMood, setSelectedMood] = useState<Mood>("casual")
  const [moodProducts, setMoodProducts] = useState<Record<Mood, string[]>>({
    casual: [],
    formal: [],
    party: [],
    sport: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch all products
      const productsSnap = await getDocs(collection(db, "products"))
      const productsData = productsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[]
      setProducts(productsData.filter((p) => p.isActive))

      // Fetch current mood board selections from settings
      const settingsDoc = await getDoc(doc(db, "settings", "mood_board"))
      if (settingsDoc.exists()) {
        const data = settingsDoc.data()
        setMoodProducts({
          casual: data.casual || [],
          formal: data.formal || [],
          party: data.party || [],
          sport: data.sport || [],
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل تحميل البيانات", "Failed to load data"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProduct = (productId: string) => {
    const currentSelection = moodProducts[selectedMood]

    if (currentSelection.includes(productId)) {
      setMoodProducts({
        ...moodProducts,
        [selectedMood]: currentSelection.filter((id) => id !== productId),
      })
    } else {
      if (currentSelection.length >= 3) {
        toast({
          title: t("تنبيه", "Warning"),
          description: t("يمكنك اختيار 3 منتجات فقط لكل مزاج", "You can only select 3 products per mood"),
          variant: "destructive",
        })
        return
      }
      setMoodProducts({
        ...moodProducts,
        [selectedMood]: [...currentSelection, productId],
      })
    }
  }

  const handleSaveAll = async () => {
    // Validate all moods have 3 products
    const allMoodsValid = Object.values(moodProducts).every((products) => products.length === 3)

    if (!allMoodsValid) {
      toast({
        title: t("تنبيه", "Warning"),
        description: t("يجب اختيار 3 منتجات لكل مزاج", "You must select 3 products for each mood"),
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await setDoc(doc(db, "settings", "mood_board"), {
        ...moodProducts,
        updatedAt: new Date(),
      })

      toast({
        title: t("تم الحفظ", "Saved"),
        description: t("تم حفظ لوحة المزاج بنجاح", "Mood board saved successfully"),
      })
    } catch (error) {
      console.error("[v0] Error saving:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("فشل حفظ البيانات", "Failed to save data"),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const currentMoodSelection = moodProducts[selectedMood]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-background rounded-2xl border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-serif">
              {t("إدارة لوحة المزاج", "Manage Mood Board")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("اختر 3 منتجات لكل مزاج", "Select 3 products for each mood")}
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="grid grid-cols-4 gap-2">
          {moods.map((mood) => {
            const Icon = mood.icon
            const count = moodProducts[mood.id as Mood].length
            const isComplete = count === 3

            return (
              <div key={mood.id} className="text-center">
                <div className={cn(
                  "w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br flex items-center justify-center",
                  mood.color,
                  isComplete ? "ring-4 ring-green-500" : ""
                )}>
                  {isComplete ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <Icon className="h-6 w-6 text-white" />
                  )}
                </div>
                <p className="text-xs font-medium">{t(mood.nameAr, mood.nameEn)}</p>
                <p className="text-xs text-muted-foreground">{count}/3</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mood Tabs */}
      <Tabs value={selectedMood} onValueChange={(value) => setSelectedMood(value as Mood)}>
        <div className="bg-background rounded-xl border p-2 mb-6">
          <TabsList className="grid grid-cols-4 gap-2 bg-transparent">
            {moods.map((mood) => {
              const Icon = mood.icon
              const count = moodProducts[mood.id as Mood].length

              return (
                <TabsTrigger
                  key={mood.id}
                  value={mood.id}
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{t(mood.nameAr, mood.nameEn)}</span>
                  <Badge variant="secondary" className="text-xs">{count}/3</Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {moods.map((mood) => (
          <TabsContent key={mood.id} value={mood.id} className="space-y-4">
            {/* Mood Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center", mood.color)}>
                  <mood.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{t(mood.nameAr, mood.nameEn)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`اختر 3 منتجات لمزاج ${mood.nameAr}`, `Select 3 products for ${mood.nameEn} mood`)}
                  </p>
                </div>
              </div>
              <Badge variant={currentMoodSelection.length === 3 ? "default" : "secondary"}>
                {currentMoodSelection.length} / 3
              </Badge>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const isSelected = currentMoodSelection.includes(product.id)
                const selectionIndex = currentMoodSelection.indexOf(product.id)

                return (
                  <Card
                    key={product.id}
                    onClick={() => handleToggleProduct(product.id)}
                    className={cn(
                      "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg",
                      isSelected ? "ring-4 ring-primary shadow-xl" : ""
                    )}
                  >
                    {/* Selection Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold">{selectionIndex + 1}</span>
                      </div>
                    )}

                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={product.mainImage || "/placeholder.svg"}
                        alt={language === "ar" ? product.nameAr : product.nameEn}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Check Icon */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h4 className="font-bold mb-2 line-clamp-1">
                        {language === "ar" ? product.nameAr : product.nameEn}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {product.discountedPrice || product.salePrice} {t("ج.م", "EGP")}
                        </span>
                        {product.discount > 0 && (
                          <Badge variant="destructive">-{product.discount}%</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Save All Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSaveAll}
          disabled={saving}
          size="lg"
          className="gap-2"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Check className="h-5 w-5" />
          )}
          {t("حفظ جميع المزاجات", "Save All Moods")}
        </Button>
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-xl text-muted-foreground">
            {t("لا توجد منتجات نشطة", "No active products available")}
          </p>
        </div>
      )}
    </div>
  )
}
