"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { doc, getDoc, setDoc, collection, getDocs, where, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"
import { Sparkles, Save, Loader2, Package, Star, Plus, X } from "lucide-react"

interface FeaturedProductData {
  productId: string
  titleAr: string
  titleEn: string
  descriptionAr: string
  descriptionEn: string
  badges: string[]
  isActive: boolean
}

export function AdminFeaturedTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [newBadge, setNewBadge] = useState("")
  const [formData, setFormData] = useState<FeaturedProductData>({
    productId: "",
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    badges: [],
    isActive: true,
  })

  const { t, language } = useLanguage()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all active products
        const productsQuery = query(collection(db, "products"), where("isActive", "==", true))
        const productsSnap = await getDocs(productsQuery)
        const productsData = productsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]
        setProducts(productsData)

        // Fetch current featured product settings
        const settingsRef = doc(db, "settings", "featuredProduct")
        const settingsSnap = await getDoc(settingsRef)

        if (settingsSnap.exists()) {
          const data = settingsSnap.data() as FeaturedProductData
          setFormData(data)

          // Find selected product
          if (data.productId) {
            const product = productsData.find((p) => p.id === data.productId)
            setSelectedProduct(product || null)
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching featured data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    setSelectedProduct(product || null)
    setFormData((prev) => ({
      ...prev,
      productId,
      titleAr: product?.nameAr || "",
      titleEn: product?.nameEn || "",
      descriptionAr: product?.descriptionAr || "",
      descriptionEn: product?.descriptionEn || "",
    }))
  }

  const handleAddBadge = () => {
    if (newBadge.trim() && !formData.badges.includes(newBadge.trim())) {
      setFormData((prev) => ({
        ...prev,
        badges: [...prev.badges, newBadge.trim()],
      }))
      setNewBadge("")
    }
  }

  const handleRemoveBadge = (badge: string) => {
    setFormData((prev) => ({
      ...prev,
      badges: prev.badges.filter((b) => b !== badge),
    }))
  }

  const handleSave = async () => {
    if (!formData.productId) {
      toast({
        title: t("خطأ", "Error"),
        description: t("يرجى اختيار منتج", "Please select a product"),
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      await setDoc(doc(db, "settings", "featuredProduct"), formData)
      toast({
        title: t("تم الحفظ", "Saved"),
        description: t("تم حفظ إعدادات المنتج المميز", "Featured product settings saved"),
      })
    } catch (error) {
      console.error("[v0] Error saving:", error)
      toast({
        title: t("خطأ", "Error"),
        description: t("حدث خطأ أثناء الحفظ", "Error saving settings"),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-background rounded-2xl border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{t("المنتج المميز", "Featured Product")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("إدارة المنتج المميز في الصفحة الرئيسية", "Manage the featured product on homepage")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
            />
            <span className="text-sm font-medium">
              {formData.isActive ? t("نشط", "Active") : t("متوقف", "Inactive")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Product Selection */}
        <div className="bg-background rounded-2xl border p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {t("اختيار المنتج", "Select Product")}
          </h3>

          <Select value={formData.productId} onValueChange={handleProductSelect}>
            <SelectTrigger>
              <SelectValue placeholder={t("اختر منتج...", "Select a product...")} />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded overflow-hidden bg-muted">
                      {product.mainImage && (
                        <Image
                          src={product.mainImage || "/placeholder.svg"}
                          alt=""
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <span>{language === "ar" ? product.nameAr : product.nameEn}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Selected Product Preview */}
          {selectedProduct && (
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={selectedProduct.mainImage || "/placeholder.svg?height=96&width=96&query=product"}
                    alt=""
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">
                    {language === "ar" ? selectedProduct.nameAr : selectedProduct.nameEn}
                  </h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {language === "ar" ? selectedProduct.descriptionAr : selectedProduct.descriptionEn}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-primary">
                      {selectedProduct.salePrice} {t("ج.م", "EGP")}
                    </span>
                    {selectedProduct.discount > 0 && (
                      <Badge className="bg-red-100 text-red-600">-{selectedProduct.discount}%</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Custom Content */}
        <div className="bg-background rounded-2xl border p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            {t("المحتوى المخصص", "Custom Content")}
          </h3>

          <div className="space-y-4">
            <div>
              <Label>{t("العنوان (عربي)", "Title (Arabic)")}</Label>
              <Input
                value={formData.titleAr}
                onChange={(e) => setFormData((prev) => ({ ...prev, titleAr: e.target.value }))}
                placeholder={t("عنوان جذاب للمنتج", "Attractive product title")}
              />
            </div>

            <div>
              <Label>{t("العنوان (إنجليزي)", "Title (English)")}</Label>
              <Input
                value={formData.titleEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, titleEn: e.target.value }))}
                placeholder="Attractive product title"
              />
            </div>

            <div>
              <Label>{t("الوصف (عربي)", "Description (Arabic)")}</Label>
              <Textarea
                value={formData.descriptionAr}
                onChange={(e) => setFormData((prev) => ({ ...prev, descriptionAr: e.target.value }))}
                placeholder={t("وصف تسويقي جذاب...", "Attractive marketing description...")}
                rows={3}
              />
            </div>

            <div>
              <Label>{t("الوصف (إنجليزي)", "Description (English)")}</Label>
              <Textarea
                value={formData.descriptionEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, descriptionEn: e.target.value }))}
                placeholder="Attractive marketing description..."
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-background rounded-2xl border p-6 space-y-4">
        <h3 className="font-semibold text-lg">{t("الشارات", "Badges")}</h3>

        <div className="flex flex-wrap gap-2">
          {formData.badges.map((badge) => (
            <Badge key={badge} className="bg-amber-100 text-amber-800 gap-1 px-3 py-1">
              {badge}
              <button onClick={() => handleRemoveBadge(badge)} className="hover:bg-amber-200 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newBadge}
            onChange={(e) => setNewBadge(e.target.value)}
            placeholder={t("شارة جديدة (مثل: مميز، ترشيحنا)", "New badge (e.g., Featured, Our Pick)")}
            onKeyDown={(e) => e.key === "Enter" && handleAddBadge()}
          />
          <Button onClick={handleAddBadge} variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2 px-8">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t("حفظ التغييرات", "Save Changes")}
        </Button>
      </div>
    </div>
  )
}
